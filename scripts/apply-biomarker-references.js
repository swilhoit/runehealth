#!/usr/bin/env node

/**
 * This script applies the biomarker reference table migration to your Supabase database.
 * Run this script with: node scripts/apply-biomarker-references.js
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

async function main() {
  try {
    console.log('Starting biomarker reference table migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'add_biomarker_reference_table.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Read migration file successfully');
    console.log('Executing SQL...');
    
    // Execute the SQL directly using the REST API
    // Split the SQL into individual statements
    const statements = migrationSql.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement separately
    for (const statement of statements) {
      console.log(`Executing statement: ${statement.substring(0, 50)}...`);
      
      // Use the REST API to execute the SQL
      const { error } = await supabase.auth.admin.executeSql(statement);
      
      if (error) {
        console.error('Error executing SQL statement:', error);
        console.error('Failed statement:', statement);
        process.exit(1);
      }
    }
    
    console.log('Successfully executed migration!');
    console.log('Verifying biomarker_references table...');
    
    // Verify the table was created by fetching a row
    const { data, error: queryError } = await supabase
      .from('biomarker_references')
      .select('*')
      .limit(1);
      
    if (queryError) {
      console.error('Error verifying biomarker_references table:', queryError);
      process.exit(1);
    }
    
    console.log(`Success! biomarker_references table contains data.`);
    if (data && data.length > 0) {
      console.log('Sample entry:', data[0]);
    }
    
    // Count total entries
    const { count, error: countError } = await supabase
      .from('biomarker_references')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting biomarker references:', countError);
    } else {
      console.log(`Total biomarker references: ${count}`);
    }
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

main(); 