#!/usr/bin/env node

/**
 * This script checks if the biomarker_definitions table exists
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check for environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env or .env.local file');
  process.exit(1);
}

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5) + '...');

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  try {
    console.log('Checking biomarker_definitions table...');
    
    // Check if table exists by querying it
    const { data, error } = await supabase
      .from('biomarker_definitions')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('Error querying biomarker_definitions:', error.message);
      
      // Check if the table exists in the database
      console.log('\nChecking database metadata for tables...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        console.error('Error querying information schema:', tablesError.message);
      } else {
        console.log('\nFound tables in the database:');
        tables.forEach(t => console.log(`- ${t.table_name}`));
      }
      
      return;
    }
    
    console.log(`Success! Found ${data.length} biomarkers in the table.`);
    console.log('\nSample biomarkers:');
    data.forEach(b => console.log(`- ${b.name} (${b.code}) [${b.category}]`));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
}); 