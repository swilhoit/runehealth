#!/usr/bin/env node

/**
 * This script executes SQL migrations directly using the Supabase Management API.
 * Run this script with: node scripts/run-migration.js
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

// Ensure we have the Supabase URL and key
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase credentials');
  console.error('Please provide NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Extract project reference from Supabase URL
// e.g., https://renqczffpovkvkelvjvv.supabase.co -> renqczffpovkvkelvjvv
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/)[1];
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSQLViaAPI(sql) {
  try {
    console.log(`Executing SQL via Supabase Management API for project ${projectRef}...`);
    
    // Using the Supabase Management API to execute SQL
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        query: sql
      })
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`SQL execution failed: ${responseText}`);
    }

    console.log('Response:', responseText);
    return responseText;
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    throw error;
  }
}

async function runMigration(filePath) {
  try {
    console.log(`Running migration from ${filePath}...`);
    
    // Read the migration SQL file
    const migrationSql = fs.readFileSync(filePath, 'utf8');
    
    console.log('Read migration file successfully. File content length:', migrationSql.length);
    
    // Run the SQL via the API
    const result = await executeSQLViaAPI(migrationSql);
    
    console.log('Migration successfully executed!');
    return result;
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function main() {
  // Path to the migration files
  const biomarkerMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'add_biomarker_reference_table.sql');
  const apiKeysMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'add_api_keys_to_profiles.sql');
  
  // Run the migrations
  console.log('Starting migrations...');
  
  try {
    // Run biomarker references migration
    await runMigration(biomarkerMigrationPath);
    
    // Run API keys migration
    await runMigration(apiKeysMigrationPath);
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

main(); 