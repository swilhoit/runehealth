#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read SQL files
const tableAndDataSQL = fs.readFileSync(path.join(__dirname, '../supabase/migrations/create_biomarker_definitions_with_categories.sql'), 'utf8');
const functionsSQL = fs.readFileSync(path.join(__dirname, '../supabase/migrations/create_biomarker_functions.sql'), 'utf8');
const updateCategoriesSQL = fs.readFileSync(path.join(__dirname, '../supabase/migrations/update_biomarker_definitions.sql'), 'utf8');

console.log('\n=================================================');
console.log('RUNEHEALTH BIOMARKER MIGRATION GUIDE (WITH CATEGORIES)');
console.log('=================================================\n');

console.log('Your application needs the biomarker_definitions table and functions');
console.log('to validate biomarker names from lab reports.\n');

console.log('This updated version properly links biomarkers to your existing category IDs:\n');
console.log('- 67: complete_blood_count');
console.log('- 68: metabolic_panel');
console.log('- 69: lipid_panel');
console.log('- 70: thyroid_panel');
console.log('- 71: vitamin_panel');
console.log('- 72: hormone_panel');
console.log('- 73: liver_panel');
console.log('- 74: kidney_panel');
console.log('- 75: other\n');

console.log('Follow these steps to set up your biomarker database:\n');

console.log('1. Go to your Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/renqczffpovkvkelvjvv/sql\n');

console.log('2. Copy and paste the following SQL to create the table and add biomarkers with category IDs:');
console.log('------------------------------------------------------------------');
console.log(tableAndDataSQL);
console.log('------------------------------------------------------------------\n');

console.log('3. Execute the SQL by clicking the "Run" button\n');

console.log('4. Copy and paste the following SQL to create the validation functions:');
console.log('------------------------------------------------------------------');
console.log(functionsSQL);
console.log('------------------------------------------------------------------\n');

console.log('5. Execute the SQL by clicking the "Run" button\n');

console.log('6. If you already had a biomarker_definitions table without category_id, run this update script:');
console.log('------------------------------------------------------------------');
console.log(updateCategoriesSQL);
console.log('------------------------------------------------------------------\n');

console.log('7. Verify the migration was successful by running this query:');
console.log('------------------------------------------------------------------');
console.log('SELECT COUNT(*), category_id FROM biomarker_definitions GROUP BY category_id;');
console.log('------------------------------------------------------------------\n');

console.log('You should see a count of 76 total biomarkers across all categories.\n');

console.log('8. Test the validation function with:');
console.log('------------------------------------------------------------------');
console.log('SELECT is_valid_biomarker_name(\'Hemoglobin\');');
console.log('------------------------------------------------------------------\n');

console.log('This should return TRUE.\n');

console.log('=================================================');
console.log('IMPORTANT: This setup is required for proper biomarker validation');
console.log('in your application. Without it, you will see errors when');
console.log('processing lab reports with biomarker names.');
console.log('=================================================\n'); 