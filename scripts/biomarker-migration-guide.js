#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read SQL files
const tableAndDataSQL = fs.readFileSync(path.join(__dirname, '../supabase/migrations/create_biomarker_definitions.sql'), 'utf8');
const functionsSQL = fs.readFileSync(path.join(__dirname, '../supabase/migrations/create_biomarker_functions.sql'), 'utf8');

console.log('\n=================================================');
console.log('RUNEHEALTH BIOMARKER MIGRATION GUIDE');
console.log('=================================================\n');

console.log('Your application needs the biomarker_definitions table and functions');
console.log('to validate biomarker names from lab reports.\n');

console.log('Follow these steps to set up your biomarker database:\n');

console.log('1. Go to your Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/renqczffpovkvkelvjvv/sql\n');

console.log('2. Copy and paste the following SQL to create the table and add biomarkers:');
console.log('------------------------------------------------------------------');
console.log(tableAndDataSQL);
console.log('------------------------------------------------------------------\n');

console.log('3. Execute the SQL by clicking the "Run" button\n');

console.log('4. Copy and paste the following SQL to create the validation functions:');
console.log('------------------------------------------------------------------');
console.log(functionsSQL);
console.log('------------------------------------------------------------------\n');

console.log('5. Execute the SQL by clicking the "Run" button\n');

console.log('6. Verify the migration was successful by running this query:');
console.log('------------------------------------------------------------------');
console.log('SELECT COUNT(*) FROM biomarker_definitions;');
console.log('------------------------------------------------------------------\n');

console.log('You should see a count of 76 biomarkers.\n');

console.log('7. Test the validation function with:');
console.log('------------------------------------------------------------------');
console.log('SELECT is_valid_biomarker_name(\'Hemoglobin\');');
console.log('------------------------------------------------------------------\n');

console.log('This should return TRUE.\n');

console.log('=================================================');
console.log('IMPORTANT: This setup is required for proper biomarker validation');
console.log('in your application. Without it, you will see errors when');
console.log('processing lab reports with biomarker names.');
console.log('=================================================\n'); 