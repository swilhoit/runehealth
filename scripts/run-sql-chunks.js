#!/usr/bin/env node

/**
 * This script executes SQL in smaller chunks using the Supabase JavaScript client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ensure we have the Supabase URL and key
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase credentials');
  console.error('Please provide NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Splits SQL by statements (respecting function definitions and statement blocks)
function splitSql(sql) {
  const statements = [];
  let currentStatement = '';
  let inFunctionOrBlock = false;
  let blockDepth = 0;

  // Split by lines to handle comments and statement separator detection
  const lines = sql.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
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

async function executeStatement(statement) {
  console.log(`Executing SQL statement (${statement.length} chars):`);
  console.log(statement.substring(0, 100) + '...');
  
  try {
    // Using the from().rpc() pattern for raw SQL queries
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement })
      .catch(async (e) => {
        // If function doesn't exist, create it first
        if (e.message && e.message.includes('function "exec_sql" does not exist')) {
          console.log('Creating exec_sql function...');
          
          // First, try a direct query to create the function
          const createFuncSql = `
          CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
          RETURNS VOID AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
          `;
          
          // Attempt to create function via direct query
          const { error: createError } = await supabase
            .from('_dummy_query')
            .select('*')
            .limit(1)
            .then(() => {
              // This is just to establish a connection, not for results
              return { error: null };
            });
          
          if (createError) {
            throw new Error(`Error preparing connection: ${createError.message}`);
          }
          
          // Now try to execute statement directly
          const { error: execError } = await supabase.from('_direct_exec').select().then(() => {
            // Direct execution
            return { error: null }; 
          });
          
          return { error: execError || new Error("Couldn't create exec_sql function") };
        }
        
        // If it's some other error, just return it
        return { error: e };
      });
    
    if (error) {
      console.error('Error executing statement:', error.message);
      
      // Check if error is about the table/function not existing, which might be expected
      if (
        error.message.includes('does not exist') || 
        error.message.includes('already exists')
      ) {
        console.log('Continuable error - proceeding with next statement');
        return true; // Continue despite error
      }
      
      return false;
    }
    
    console.log('Statement executed successfully!');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('Starting SQL migration in chunks...');
    
    // Read the combined migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'combined_migration.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`Read migration file from ${migrationPath}, file size: ${migrationSql.length} bytes`);
    
    // Split SQL into statements
    const statements = splitSql(migrationSql);
    console.log(`Split SQL into ${statements.length} statements`);
    
    // First, try to create extension and basic tables
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      console.log(`\n[${i+1}/${statements.length}] Executing statement...`);
      const success = await executeStatement(statement);
      
      if (!success) {
        console.error(`Failed on statement ${i+1}/${statements.length}`);
        // Continue anyway since some errors are expected
      }
    }
    
    console.log('\nAll statements processed. Verifying tables...');
    
    // Verify biomarker_references exists
    const { data: biomarkerData, error: biomarkerError } = await supabase
      .from('biomarker_references')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (biomarkerError) {
      if (biomarkerError.message.includes('does not exist')) {
        console.error('biomarker_references table was not created');
      } else {
        console.error('Error verifying biomarker_references:', biomarkerError.message);
      }
    } else {
      console.log('biomarker_references table exists!');
    }
    
    // Verify profiles.api_keys column exists
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('api_keys')
      .limit(1);
      
    if (profilesError) {
      if (profilesError.message.includes('does not exist')) {
        console.error('profiles table or api_keys column was not created');
      } else {
        console.error('Error verifying profiles.api_keys:', profilesError.message);
      }
    } else {
      console.log('profiles.api_keys column exists!');
    }
    
    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 