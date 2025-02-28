#!/usr/bin/env node

/**
 * This script creates a database function to execute SQL scripts and 
 * then uses that function to apply our migrations.
 * Run with: node scripts/run-direct-sql.js
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

// Function to create the SQL execution function in Supabase
async function createExecSqlFunction() {
  try {
    console.log('Creating exec_sql function in the database...');
    
    const createFunctionSQL = `
      -- Create a function to execute arbitrary SQL
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS VOID AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Execute the SQL directly through the client connection
    const { data, error } = await supabase
      .from('profiles') // Use any existing table, we just need a connection
      .select('id')
      .limit(1)
      .then(async () => {
        // Once we have a connection, run our SQL query
        return await supabase.rpc('exec_sql', { sql_query: createFunctionSQL })
          .catch(e => {
            // If function doesn't exist yet, we need to create it
            if (e.message.includes('function "exec_sql" does not exist')) {
              console.log('Function does not exist yet. Creating it using direct query...');
              return supabase.rpc('exec_sql', { sql_query: createFunctionSQL });
            }
            throw e;
          });
      });
    
    if (error) {
      console.error('Error creating exec_sql function:', error);
      throw error;
    }
    
    console.log('Created exec_sql function successfully');
    return true;
  } catch (error) {
    console.error('Failed to create exec_sql function:', error);
    
    // If we get here, we might need to create the function directly using the REST API
    console.log('Attempting alternative approach...');
    
    // Try to create the function through a direct query
    try {
      const { error } = await supabase.rpc('postgrest_rpc', { 
        command: 'CREATE OR REPLACE FUNCTION exec_sql(sql_query text) RETURNS VOID AS $$ BEGIN EXECUTE sql_query; END; $$ LANGUAGE plpgsql SECURITY DEFINER;'
      });
      
      if (error) {
        console.error('Alternative approach failed:', error);
        return false;
      }
      
      console.log('Alternative approach succeeded');
      return true;
    } catch (alternativeError) {
      console.error('Alternative approach failed:', alternativeError);
      return false;
    }
  }
}

// Function to run a migration by executing its SQL
async function runMigration(migrationPath) {
  try {
    console.log(`Running migration from ${migrationPath}...`);
    
    // Read the migration SQL file
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Read migration file successfully');
    
    // Execute the SQL using our exec_sql function
    const { error } = await supabase.rpc('exec_sql', { sql_query: migrationSql });
    
    if (error) {
      console.error('Error executing migration:', error);
      return false;
    }
    
    console.log('Migration executed successfully!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    // First create the exec_sql function if needed
    const functionCreated = await createExecSqlFunction();
    
    if (!functionCreated) {
      console.error('Could not create exec_sql function. Cannot proceed with migrations.');
      process.exit(1);
    }
    
    // Path to the migration files
    const biomarkerMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'add_biomarker_reference_table.sql');
    const apiKeysMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'add_api_keys_to_profiles.sql');
    
    // Run the migrations
    console.log('Starting migrations...');
    
    const biomarkerMigrationSuccess = await runMigration(biomarkerMigrationPath);
    if (!biomarkerMigrationSuccess) {
      console.error('Biomarker migration failed.');
      process.exit(1);
    }
    
    const apiKeysMigrationSuccess = await runMigration(apiKeysMigrationPath);
    if (!apiKeysMigrationSuccess) {
      console.error('API keys migration failed.');
      process.exit(1);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

main(); 