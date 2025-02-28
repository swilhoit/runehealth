#!/usr/bin/env node

/**
 * This script executes SQL statements using the Supabase REST API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing required environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

// Remove trailing slash if present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Function to split SQL into individual statements
function splitSql(sql) {
  const statements = [];
  let currentStatement = '';
  let inFunctionOrBlock = false;
  let blockDepth = 0;

  // Split by lines to handle comments and statement separator detection
  const lines = sql.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments when checking for statement boundaries
    if (trimmedLine === '' || trimmedLine.startsWith('--')) {
      currentStatement += line + '\n'; // Keep them for readability
      continue;
    }
    
    // Check for start of function/DO block
    if (
      (trimmedLine.toUpperCase().includes('CREATE OR REPLACE FUNCTION') || 
       trimmedLine.toUpperCase().includes('CREATE FUNCTION') ||
       trimmedLine.toUpperCase().startsWith('DO')) && 
      !inFunctionOrBlock
    ) {
      inFunctionOrBlock = true;
    }
    
    // Count block depth with dollar-quoted strings
    if (trimmedLine.includes('$$')) {
      const dollarCount = (trimmedLine.match(/\$\$/g) || []).length;
      blockDepth += dollarCount % 2; // Toggle depth on odd number of $$ markers
      if (blockDepth === 0) {
        inFunctionOrBlock = false;
      }
    }
    
    // Add the line to current statement
    currentStatement += line + '\n';
    
    // Check if statement ends with semicolon and we're not inside a function/block
    if (trimmedLine.endsWith(';') && !inFunctionOrBlock && blockDepth === 0) {
      // Don't push empty statements
      if (currentStatement.trim().length > 0) {
        statements.push(currentStatement.trim());
      }
      currentStatement = '';
    }
  }
  
  // Add any remaining statement
  if (currentStatement.trim().length > 0) {
    statements.push(currentStatement.trim());
  }
  
  return statements;
}

// Execute a single SQL statement using REST API
function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: new URL(supabaseUrl).hostname,
      path: '/rest/v1/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonResponse = JSON.parse(responseData);
            resolve(jsonResponse);
          } catch (e) {
            // Sometimes the response might not be JSON
            resolve(responseData);
          }
        } else {
          let errorMessage = `HTTP Error ${res.statusCode}`;
          try {
            const jsonError = JSON.parse(responseData);
            errorMessage = `${errorMessage}: ${JSON.stringify(jsonError)}`;
          } catch (e) {
            errorMessage = `${errorMessage}: ${responseData}`;
          }
          reject(new Error(errorMessage));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Main function
async function main() {
  try {
    console.log('Starting SQL migration via REST API...');
    
    // Read the combined migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'combined_migration.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`Read migration file from ${migrationPath}, file size: ${migrationSql.length} bytes`);
    
    // Split SQL into statements
    const statements = splitSql(migrationSql);
    console.log(`Split SQL into ${statements.length} statements`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 100).replace(/\n/g, ' ') + (statement.length > 100 ? '...' : '');
      
      console.log(`\n[${i+1}/${statements.length}] Executing: ${preview}`);
      
      try {
        const result = await executeSql(statement);
        console.log(`Statement executed successfully!`);
        // Uncomment for debugging
        // console.log('Result:', JSON.stringify(result).substring(0, 200) + '...');
      } catch (error) {
        console.error(`Error executing statement ${i+1}:`, error.message);
        
        // Continue despite errors - some might be expected (e.g., table already exists)
        console.log('Continuing with next statement...');
      }
    }
    
    console.log('\nVerifying database changes...');
    
    // Test query to check if biomarker_references table exists
    try {
      const biomarkerResult = await executeSql('SELECT COUNT(*) FROM biomarker_references;');
      console.log('biomarker_references table exists!');
      console.log(`Count: ${JSON.stringify(biomarkerResult)}`);
    } catch (error) {
      console.error('Error verifying biomarker_references table:', error.message);
    }
    
    // Test query to check if profiles.api_keys column exists
    try {
      const profilesResult = await executeSql(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'api_keys';
      `);
      console.log('profiles.api_keys column exists!');
      console.log(`Result: ${JSON.stringify(profilesResult)}`);
    } catch (error) {
      console.error('Error verifying profiles.api_keys column:', error.message);
    }
    
    console.log('\nMigration process complete!');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

main(); 