#!/usr/bin/env node

/**
 * This script checks if the required database schema changes have been applied
 * by using the Supabase JavaScript client
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Ensure we have the Supabase URL and key
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase credentials');
  console.error('Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client with anon key (read-only access)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  console.log('Checking migration status...');
  
  // Check if the biomarker_references table exists and has data
  try {
    const { data: biomarkerCount, error: biomarkerError } = await supabase
      .from('biomarker_references')
      .select('*', { count: 'exact', head: true });
      
    if (biomarkerError) {
      console.error('❌ biomarker_references table check failed:');
      console.error(`   Error: ${biomarkerError.message}`);
      
      if (biomarkerError.message.includes('does not exist')) {
        console.log('\nSuggestion: The biomarker_references table does not exist.');
        console.log('You need to run the migration in the Supabase SQL Editor:');
        console.log('1. Go to https://supabase.com/dashboard/project/renqczffpovkvkelvjvv/sql');
        console.log('2. Copy and paste the SQL from supabase/sql-chunks/chunk-1.sql and chunk-2.sql');
        console.log('3. Run the SQL in the editor');
      }
    } else {
      const count = biomarkerCount?.length || 0;
      console.log(`✅ biomarker_references table exists${count > 0 ? ` and contains data (${count} rows)` : ''}`);
    }
  } catch (error) {
    console.error('❌ Error checking biomarker_references table:', error.message);
  }
  
  // Check if the profiles table exists and has the api_keys column
  try {
    // First, check if user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth check failed:');
      console.error(`   Error: ${authError.message}`);
    } else if (!user) {
      console.log('⚠️ No user is logged in. Cannot check profiles table directly.');
      console.log('Trying to check schema metadata instead...');
      
      // Try to check schema info
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('get_schema_info', { table_name: 'profiles', column_name: 'api_keys' })
        .single();
      
      if (schemaError) {
        if (schemaError.message.includes('function "get_schema_info" does not exist')) {
          console.log('❓ Cannot check profiles.api_keys - function get_schema_info does not exist');
          console.log('You need to create this function first by executing:');
          console.log(`
CREATE OR REPLACE FUNCTION get_schema_info(table_name text, column_name text)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'exists', EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = table_name 
      AND column_name = column_name
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`);
        } else {
          console.error('❌ Schema check failed:');
          console.error(`   Error: ${schemaError.message}`);
        }
      } else if (schemaData && schemaData.exists) {
        console.log('✅ profiles table exists with api_keys column');
      } else {
        console.log('❌ profiles.api_keys column does not exist');
      }
    } else {
      // User is logged in, we can try to access their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('api_keys')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ profiles table check failed:');
        console.error(`   Error: ${profileError.message}`);
        
        if (profileError.message.includes('does not exist')) {
          console.log('\nSuggestion: The profiles table does not exist.');
          console.log('You need to run the migration in the Supabase SQL Editor.');
        } else if (profileError.message.includes('column "api_keys" does not exist')) {
          console.log('\nSuggestion: The api_keys column does not exist in the profiles table.');
          console.log('You need to run the migration in the Supabase SQL Editor.');
        }
      } else {
        console.log('✅ profiles table exists with api_keys column');
        if (profile && profile.api_keys) {
          console.log('   The api_keys column is properly structured.');
        } else {
          console.log('   The api_keys column exists but might be null or empty.');
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking profiles table:', error.message);
  }
  
  // Display instructions for manual migration
  console.log('\n----------------------------------------------------------');
  console.log('To manually apply migrations, follow these steps:');
  console.log('1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/renqczffpovkvkelvjvv/sql');
  console.log('2. Copy the contents of supabase/sql-chunks/chunk-1.sql and execute it');
  console.log('3. Copy the contents of supabase/sql-chunks/chunk-2.sql and execute it');
  console.log('4. Run this check script again to verify the migrations were applied');
  console.log('----------------------------------------------------------');
}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 