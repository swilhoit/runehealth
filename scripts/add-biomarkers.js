#!/usr/bin/env node

/**
 * This script creates the biomarker_definitions table (if it doesn't exist)
 * and adds the required biomarkers
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Ensure we have the Supabase URL and key
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase credentials');
  console.error('Please provide NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client with service role key (admin access)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

async function createBiomarkerTable() {
  // Create the biomarker_definitions table using SQL RPC
  const { error } = await supabase.rpc('create_biomarker_table', {});
  
  if (error) {
    // Table might already exist, or we need to create manually
    console.error('Error creating table via RPC:', error.message);
    
    // Try creating the table directly via SQL
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS biomarker_definitions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`;
    
    const { error: sqlError } = await supabase.from('_sql').select('*', { count: 'exact' }).limit(1).execute(createTableSQL);
    
    if (sqlError) {
      console.error('Failed to create table directly:', sqlError.message);
      throw new Error('Could not create biomarker_definitions table');
    }
  }
  
  console.log('✅ Biomarker definitions table is ready');
}

async function addBiomarkers() {
  console.log('Starting to add biomarkers...');
  let addedCount = 0;
  let errorCount = 0;
  
  for (const name of requiredBiomarkers) {
    const biomarker = {
      code: normalizeBiomarkerCode(name),
      name,
      category: categorizeBiomarker(name),
      created_at: new Date().toISOString()
    };
    
    console.log(`Adding ${name} (${biomarker.code}) in category ${biomarker.category}...`);
    
    // First try to check if it exists
    const { data: existing, error: checkError } = await supabase
      .from('biomarker_definitions')
      .select('id')
      .eq('code', biomarker.code)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Error checking if ${name} exists:`, checkError.message);
      errorCount++;
      continue;
    }
    
    // If it exists, skip it
    if (existing) {
      console.log(`  - ${name} already exists, skipping`);
      continue;
    }
    
    // Otherwise, add it
    const { error: insertError } = await supabase
      .from('biomarker_definitions')
      .insert(biomarker);
    
    if (insertError) {
      console.error(`Error adding ${name}:`, insertError.message);
      errorCount++;
    } else {
      console.log(`  - Added ${name} successfully`);
      addedCount++;
    }
  }
  
  console.log(`\nCompleted adding biomarkers:`);
  console.log(`- Added: ${addedCount}`);
  console.log(`- Errors: ${errorCount}`);
}

async function main() {
  try {
    console.log('Ensuring biomarker_definitions table exists...');
    await createBiomarkerTable();
    
    console.log('\nAdding biomarkers to the database...');
    await addBiomarkers();
    
    console.log('\nDone!');
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

main(); 