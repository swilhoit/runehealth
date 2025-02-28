#!/usr/bin/env node

/**
 * This script checks if all required biomarkers exist in the biomarker_definitions table
 * and provides SQL commands to add any missing ones
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Ensure we have the Supabase URL and key
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase credentials');
  console.error('Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// List of required biomarkers
const requiredBiomarkers = [
  'WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'MCV', 'MCH', 'MCHC', 'RDW', 'Platelets',
  'Neutrophils', 'Lymphs', 'Monocytes', 'Eos', 'Basos', 'Neutrophils (Absolute)',
  'Lymphs (Absolute)', 'Monocytes (Absolute)', 'Eos (Absolute)', 'Baso (Absolute)',
  'Immature Granulocytes', 'Immature Grans (Abs)', 'Glucose', 'BUN', 'Creatinine',
  'eGFR', 'BUN/Creatinine Ratio', 'Sodium', 'Potassium', 'Chloride', 'Carbon Dioxide, Total',
  'Calcium', 'Protein, Total', 'Albumin', 'Globulin, Total', 'A/G Ratio', 'Bilirubin, Total',
  'Alkaline Phosphatase', 'AST (SGOT)', 'ALT (SGPT)', 'Cholesterol, Total', 'Triglycerides',
  'HDL Cholesterol', 'VLDL Cholesterol Cal', 'LDL Chol Calc (NIH)', 'Testosterone',
  'Free Testosterone (Direct)', 'Hemoglobin A1c', 'T4, Free (Direct)', 'Folate (Folic Acid), Serum',
  'DHEA-Sulfate', 'Cortisol', 'TSH', 'Vitamin D, 25-Hydroxy', 'C-Reactive Protein, Cardiac',
  'Homocyst(e)ine', 'GGT', 'Iron', 'Triiodothyronine (T3)', 'Thyroglobulin Antibody',
  'Vitamin B12', 'Magnesium', 'Insulin', 'Ferritin', 'Thyroid Peroxidase (TPO) Ab',
  'Apolipoprotein B'
];

// Map standard name to normalized code (lowercase, no spaces)
function normalizeBiomarkerCode(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
    .replace(/\s+/g, '');      // Remove spaces
}

// Function to categorize biomarkers
function categorizeBiomarker(name) {
  const lowerName = name.toLowerCase();
  
  if (/wbc|rbc|hemoglobin|hematocrit|mcv|mch|mchc|rdw|platelets|neutrophils|lymphs|monocytes|eos|basos|granulocytes/.test(lowerName)) {
    return 'Complete Blood Count (CBC)';
  }
  
  if (/glucose|bun|creatinine|egfr|sodium|potassium|chloride|carbon dioxide|calcium|protein|albumin|globulin|bilirubin|phosphatase|ast|alt|ggt/.test(lowerName)) {
    return 'Comprehensive Metabolic Panel (CMP)';
  }
  
  if (/cholesterol|triglycerides|hdl|vldl|ldl|apolipoprotein/.test(lowerName)) {
    return 'Lipid Panel';
  }
  
  if (/testosterone|dhea|cortisol/.test(lowerName)) {
    return 'Hormones';
  }
  
  if (/tsh|t3|t4|thyroid|tpo/.test(lowerName)) {
    return 'Thyroid Panel';
  }
  
  if (/vitamin|folate|b12/.test(lowerName)) {
    return 'Vitamins and Nutrients';
  }
  
  if (/iron|ferritin/.test(lowerName)) {
    return 'Iron Studies';
  }
  
  if (/c-reactive|crp|homocyst/.test(lowerName)) {
    return 'Inflammation Markers';
  }
  
  if (/insulin|a1c/.test(lowerName)) {
    return 'Diabetes Markers';
  }
  
  return 'Other';
}

async function main() {
  console.log('Checking biomarker_definitions table...');
  
  // Get all existing biomarkers
  const { data: existingBiomarkers, error } = await supabase
    .from('biomarker_definitions')
    .select('code, name');
    
  if (error) {
    console.error('Error fetching biomarkers:', error.message);
    process.exit(1);
  }
  
  console.log(`Found ${existingBiomarkers.length} biomarkers in the database.`);
  
  // Create map of existing biomarkers for easy lookup
  const existingBiomarkerMap = {};
  existingBiomarkers.forEach(b => {
    existingBiomarkerMap[b.name.toLowerCase()] = true;
  });
  
  // Check which required biomarkers are missing
  const missingBiomarkers = [];
  for (const biomarker of requiredBiomarkers) {
    if (!existingBiomarkerMap[biomarker.toLowerCase()]) {
      missingBiomarkers.push(biomarker);
    }
  }
  
  if (missingBiomarkers.length === 0) {
    console.log('✅ All required biomarkers exist in the database.');
    return;
  }
  
  console.log(`\n❌ Found ${missingBiomarkers.length} missing biomarkers:`);
  missingBiomarkers.forEach(b => console.log(`  - ${b}`));
  
  // Generate SQL to add missing biomarkers
  console.log('\nSQL to add missing biomarkers:');
  console.log('BEGIN;');
  
  for (const biomarker of missingBiomarkers) {
    const code = normalizeBiomarkerCode(biomarker);
    const category = categorizeBiomarker(biomarker);
    
    console.log(`
INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('${code}', '${biomarker}', '${category}', NOW());`);
  }
  
  console.log('COMMIT;');
  
  // Generate JavaScript to add missing biomarkers programmatically
  console.log('\nOr use the following JavaScript with Supabase client:');
  console.log(`
const biomarkersToAdd = ${JSON.stringify(missingBiomarkers.map(name => ({
    code: normalizeBiomarkerCode(name),
    name,
    category: categorizeBiomarker(name),
    created_at: new Date().toISOString()
  })), null, 2)};

for (const biomarker of biomarkersToAdd) {
  const { error } = await supabase.from('biomarker_definitions').insert(biomarker);
  if (error) console.error(\`Error adding \${biomarker.name}:\`, error.message);
  else console.log(\`Added \${biomarker.name}\`);
}`);
}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 