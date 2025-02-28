#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read SQL files
const tableAndDataSQL = fs.readFileSync(path.join(__dirname, '../supabase/migrations/create_biomarker_definitions.sql'), 'utf8');
const functionsSQL = fs.readFileSync(path.join(__dirname, '../supabase/migrations/create_biomarker_functions.sql'), 'utf8');

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using Supabase Key:', supabaseKey.substring(0, 5) + '...' + supabaseKey.substring(supabaseKey.length - 5));

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Execute SQL directly
async function executeSQL(sql, description) {
  console.log(`Executing ${description}...`);
  
  try {
    const { data, error } = await supabase
      .rpc('', {}, { head: true })
      .sql(sql);
    
    if (error) {
      console.error(`Error executing ${description}:`, error.message);
      return false;
    }
    
    console.log(`✅ ${description} executed successfully`);
    return true;
  } catch (error) {
    console.error(`Error executing ${description}:`, error.message);
    return false;
  }
}

// Check if table exists
async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .rpc('', {}, { head: true })
      .sql(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'biomarker_definitions'
        );
      `);
    
    if (error) {
      console.error('Error checking if biomarker_definitions table exists:', error.message);
      return false;
    }
    
    // Parse the response to get the existence status
    const exists = data && data.length > 0 && data[0] && data[0].exists === true;
    console.log(`Table biomarker_definitions exists: ${exists ? 'Yes' : 'No'}`);
    return exists;
  } catch (error) {
    console.error('Error checking if biomarker_definitions table exists:', error.message);
    return false;
  }
}

// Count biomarkers in the table
async function countBiomarkers() {
  try {
    const { data, error } = await supabase
      .rpc('', {}, { head: true })
      .sql(`SELECT COUNT(*) FROM biomarker_definitions;`);
    
    if (error) {
      console.error('Error counting biomarkers:', error.message);
      return 0;
    }
    
    const count = data && data.length > 0 && data[0] && data[0].count ? parseInt(data[0].count) : 0;
    console.log(`Found ${count} biomarkers in the database`);
    return count;
  } catch (error) {
    console.error('Error counting biomarkers:', error.message);
    return 0;
  }
}

// Main function
async function applyMigration() {
  console.log('Starting biomarker migration process...');
  
  // Step 1: Check if table exists
  const tableExists = await checkTableExists();
  let biomarkerCount = 0;
  
  if (tableExists) {
    biomarkerCount = await countBiomarkers();
  }
  
  // Step 2: Apply the table creation and data insertion SQL
  if (!tableExists || biomarkerCount < 76) {
    const success = await executeSQL(tableAndDataSQL, 'biomarker_definitions table creation and data insertion');
    if (!success) {
      console.error('Failed to create biomarker_definitions table and insert data.');
      console.log('You may need to run the SQL manually. See supabase/migrations/create_biomarker_definitions.sql');
      return;
    }
  } else {
    console.log('✅ biomarker_definitions table already exists with all required biomarkers');
  }
  
  // Step 3: Apply the functions SQL
  const functionsSuccess = await executeSQL(functionsSQL, 'biomarker validation functions');
  if (!functionsSuccess) {
    console.error('Failed to create biomarker validation functions.');
    console.log('You may need to run the SQL manually. See supabase/migrations/create_biomarker_functions.sql');
    return;
  }
  
  // Step 4: Verify the final state
  if (await checkTableExists()) {
    const finalCount = await countBiomarkers();
    if (finalCount >= 76) {
      console.log('✅ Biomarker migration complete! Your database now has all the required biomarkers and validation functions.');
    } else {
      console.warn(`⚠️ Migration partially complete. Only ${finalCount} of 76 biomarkers were found in the database.`);
    }
  } else {
    console.error('❌ Migration failed. The biomarker_definitions table could not be verified.');
  }
}

// Run the main function
applyMigration()
  .then(() => {
    console.log('Migration script execution completed');
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 