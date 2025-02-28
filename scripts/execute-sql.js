#!/usr/bin/env node

/**
 * This script executes SQL directly on your Supabase database
 * using the Supabase Management API.
 * 
 * Usage: node execute-sql.js
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

// Extract project reference from the Supabase URL
// e.g., https://renqczffpovkvkelvjvv.supabase.co -> renqczffpovkvkelvjvv
const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(.*?)\.supabase\.co/)[1];
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql(sql) {
  try {
    console.log(`Executing SQL on project ${projectRef}...`);
    
    // Create empty database if it doesn't exist
    const response = await fetch(`https://api.supabase.com/v1/sql/${projectRef}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to execute SQL: ${errorData}`);
    }
    
    const result = await response.json();
    console.log('SQL executed successfully!');
    return result;
  } catch (error) {
    console.error(`Error executing SQL: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    // Read the combined migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'combined_migration.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`Read migration file from ${migrationPath}, file size: ${migrationSql.length} bytes`);
    
    // Execute the SQL
    const result = await executeSql(migrationSql);
    
    console.log('Migration completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Verify the tables were created
    console.log('Verifying tables...');
    
    const verifyBiomarkersSQL = 'SELECT COUNT(*) FROM biomarker_references;';
    const verifyProfilesSQL = 'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'profiles\' AND column_name = \'api_keys\';';
    
    console.log('Verifying biomarker_references table...');
    await executeSql(verifyBiomarkersSQL);
    
    console.log('Verifying profiles.api_keys column...');
    await executeSql(verifyProfilesSQL);
    
    console.log('All verifications passed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 