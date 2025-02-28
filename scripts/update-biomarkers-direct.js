#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
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

// List of missing biomarkers to add
const missingBiomarkers = [
  { code: 'wbc', name: 'White Blood Cell Count', category: 'Complete Blood Count', unit: '10^3/μL', min_range: 3.5, max_range: 10.5 },
  { code: 'rbc', name: 'Red Blood Cell Count', category: 'Complete Blood Count', unit: '10^6/μL', min_range: 4.2, max_range: 6.1 },
  { code: 'hgb', name: 'Hemoglobin', category: 'Complete Blood Count', unit: 'g/dL', min_range: 12.0, max_range: 17.0 },
  { code: 'hct', name: 'Hematocrit', category: 'Complete Blood Count', unit: '%', min_range: 36.0, max_range: 51.0 },
  { code: 'mcv', name: 'Mean Corpuscular Volume', category: 'Complete Blood Count', unit: 'fL', min_range: 80.0, max_range: 100.0 },
  { code: 'mch', name: 'Mean Corpuscular Hemoglobin', category: 'Complete Blood Count', unit: 'pg', min_range: 27.0, max_range: 33.0 },
  { code: 'mchc', name: 'Mean Corpuscular Hemoglobin Concentration', category: 'Complete Blood Count', unit: 'g/dL', min_range: 32.0, max_range: 36.0 },
  { code: 'plt', name: 'Platelet Count', category: 'Complete Blood Count', unit: '10^3/μL', min_range: 150.0, max_range: 450.0 },
  { code: 'rdw', name: 'Red Cell Distribution Width', category: 'Complete Blood Count', unit: '%', min_range: 11.5, max_range: 14.5 },
  { code: 'neutrophils', name: 'Neutrophils', category: 'Complete Blood Count', unit: '%', min_range: 40.0, max_range: 70.0 },
  { code: 'lymphocytes', name: 'Lymphocytes', category: 'Complete Blood Count', unit: '%', min_range: 20.0, max_range: 40.0 },
  { code: 'monocytes', name: 'Monocytes', category: 'Complete Blood Count', unit: '%', min_range: 2.0, max_range: 10.0 },
  { code: 'eosinophils', name: 'Eosinophils', category: 'Complete Blood Count', unit: '%', min_range: 1.0, max_range: 6.0 },
  { code: 'basophils', name: 'Basophils', category: 'Complete Blood Count', unit: '%', min_range: 0.0, max_range: 2.0 },
  { code: 'abs_neutrophils', name: 'Absolute Neutrophils', category: 'Complete Blood Count', unit: '10^3/μL', min_range: 1.7, max_range: 7.0 },
  { code: 'abs_lymphocytes', name: 'Absolute Lymphocytes', category: 'Complete Blood Count', unit: '10^3/μL', min_range: 0.9, max_range: 2.9 },
  { code: 'abs_monocytes', name: 'Absolute Monocytes', category: 'Complete Blood Count', unit: '10^3/μL', min_range: 0.3, max_range: 0.9 },
  { code: 'abs_eosinophils', name: 'Absolute Eosinophils', category: 'Complete Blood Count', unit: '10^3/μL', min_range: 0.0, max_range: 0.5 },
  { code: 'abs_basophils', name: 'Absolute Basophils', category: 'Complete Blood Count', unit: '10^3/μL', min_range: 0.0, max_range: 0.2 },
  { code: 'glucose', name: 'Glucose', category: 'Comprehensive Metabolic Panel', unit: 'mg/dL', min_range: 70.0, max_range: 99.0 },
  { code: 'bun', name: 'Blood Urea Nitrogen', category: 'Comprehensive Metabolic Panel', unit: 'mg/dL', min_range: 7.0, max_range: 20.0 },
  { code: 'creatinine', name: 'Creatinine', category: 'Comprehensive Metabolic Panel', unit: 'mg/dL', min_range: 0.6, max_range: 1.3 },
  { code: 'egfr', name: 'Estimated Glomerular Filtration Rate', category: 'Comprehensive Metabolic Panel', unit: 'mL/min/1.73m²', min_range: 90.0, max_range: 120.0 },
  { code: 'bun_creatinine_ratio', name: 'BUN/Creatinine Ratio', category: 'Comprehensive Metabolic Panel', unit: '', min_range: 10.0, max_range: 20.0 },
  { code: 'sodium', name: 'Sodium', category: 'Comprehensive Metabolic Panel', unit: 'mmol/L', min_range: 135.0, max_range: 145.0 },
  { code: 'potassium', name: 'Potassium', category: 'Comprehensive Metabolic Panel', unit: 'mmol/L', min_range: 3.5, max_range: 5.0 },
  { code: 'chloride', name: 'Chloride', category: 'Comprehensive Metabolic Panel', unit: 'mmol/L', min_range: 98.0, max_range: 107.0 },
  { code: 'co2', name: 'Carbon Dioxide', category: 'Comprehensive Metabolic Panel', unit: 'mmol/L', min_range: 23.0, max_range: 29.0 },
  { code: 'calcium', name: 'Calcium', category: 'Comprehensive Metabolic Panel', unit: 'mg/dL', min_range: 8.6, max_range: 10.3 },
  { code: 'protein', name: 'Total Protein', category: 'Comprehensive Metabolic Panel', unit: 'g/dL', min_range: 6.0, max_range: 8.3 },
  { code: 'albumin', name: 'Albumin', category: 'Comprehensive Metabolic Panel', unit: 'g/dL', min_range: 3.5, max_range: 5.0 },
  { code: 'globulin', name: 'Globulin', category: 'Comprehensive Metabolic Panel', unit: 'g/dL', min_range: 2.0, max_range: 3.5 },
  { code: 'ag_ratio', name: 'Albumin/Globulin Ratio', category: 'Comprehensive Metabolic Panel', unit: '', min_range: 1.1, max_range: 2.5 },
  { code: 'bilirubin', name: 'Total Bilirubin', category: 'Comprehensive Metabolic Panel', unit: 'mg/dL', min_range: 0.1, max_range: 1.2 },
  { code: 'alt', name: 'Alanine Aminotransferase', category: 'Comprehensive Metabolic Panel', unit: 'U/L', min_range: 7.0, max_range: 55.0 },
  { code: 'ast', name: 'Aspartate Aminotransferase', category: 'Comprehensive Metabolic Panel', unit: 'U/L', min_range: 8.0, max_range: 48.0 },
  { code: 'alp', name: 'Alkaline Phosphatase', category: 'Comprehensive Metabolic Panel', unit: 'U/L', min_range: 40.0, max_range: 129.0 },
  { code: 'cholesterol', name: 'Total Cholesterol', category: 'Lipid Panel', unit: 'mg/dL', min_range: 0.0, max_range: 200.0 },
  { code: 'triglycerides', name: 'Triglycerides', category: 'Lipid Panel', unit: 'mg/dL', min_range: 0.0, max_range: 150.0 },
  { code: 'hdl', name: 'HDL Cholesterol', category: 'Lipid Panel', unit: 'mg/dL', min_range: 40.0, max_range: 60.0 },
  { code: 'ldl', name: 'LDL Cholesterol', category: 'Lipid Panel', unit: 'mg/dL', min_range: 0.0, max_range: 100.0 },
  { code: 'cholesterol_hdl_ratio', name: 'Total Cholesterol/HDL Ratio', category: 'Lipid Panel', unit: '', min_range: 0.0, max_range: 5.0 },
  { code: 'non_hdl_cholesterol', name: 'Non-HDL Cholesterol', category: 'Lipid Panel', unit: 'mg/dL', min_range: 0.0, max_range: 130.0 },
  { code: 'tsh', name: 'Thyroid Stimulating Hormone', category: 'Thyroid Panel', unit: 'mIU/L', min_range: 0.4, max_range: 4.0 },
  { code: 't4_free', name: 'Free T4', category: 'Thyroid Panel', unit: 'ng/dL', min_range: 0.8, max_range: 1.8 },
  { code: 't3_free', name: 'Free T3', category: 'Thyroid Panel', unit: 'pg/mL', min_range: 2.3, max_range: 4.2 },
  { code: 'testosterone', name: 'Testosterone', category: 'Hormones', unit: 'ng/dL', min_range: 280.0, max_range: 1100.0 },
  { code: 'free_testosterone', name: 'Free Testosterone', category: 'Hormones', unit: 'pg/mL', min_range: 5.0, max_range: 21.0 },
  { code: 'estradiol', name: 'Estradiol', category: 'Hormones', unit: 'pg/mL', min_range: 10.0, max_range: 40.0 },
  { code: 'dhea_s', name: 'DHEA-S', category: 'Hormones', unit: 'μg/dL', min_range: 100.0, max_range: 500.0 },
  { code: 'cortisol', name: 'Cortisol', category: 'Hormones', unit: 'μg/dL', min_range: 6.0, max_range: 18.0 },
  { code: 'hba1c', name: 'Hemoglobin A1c', category: 'Diabetes', unit: '%', min_range: 4.0, max_range: 5.6 },
  { code: 'insulin', name: 'Insulin', category: 'Diabetes', unit: 'μIU/mL', min_range: 2.6, max_range: 24.9 },
  { code: 'vitamin_d', name: 'Vitamin D', category: 'Vitamins and Nutrients', unit: 'ng/mL', min_range: 30.0, max_range: 100.0 },
  { code: 'vitamin_b12', name: 'Vitamin B12', category: 'Vitamins and Nutrients', unit: 'pg/mL', min_range: 200.0, max_range: 900.0 },
  { code: 'folate', name: 'Folate', category: 'Vitamins and Nutrients', unit: 'ng/mL', min_range: 3.0, max_range: 20.0 },
  { code: 'iron', name: 'Iron', category: 'Vitamins and Nutrients', unit: 'μg/dL', min_range: 50.0, max_range: 170.0 },
  { code: 'ferritin', name: 'Ferritin', category: 'Vitamins and Nutrients', unit: 'ng/mL', min_range: 30.0, max_range: 400.0 },
  { code: 'tibc', name: 'Total Iron Binding Capacity', category: 'Vitamins and Nutrients', unit: 'μg/dL', min_range: 250.0, max_range: 450.0 },
  { code: 'transferrin_saturation', name: 'Transferrin Saturation', category: 'Vitamins and Nutrients', unit: '%', min_range: 16.0, max_range: 45.0 },
  { code: 'magnesium', name: 'Magnesium', category: 'Vitamins and Nutrients', unit: 'mg/dL', min_range: 1.7, max_range: 2.4 },
  { code: 'zinc', name: 'Zinc', category: 'Vitamins and Nutrients', unit: 'μg/dL', min_range: 70.0, max_range: 120.0 }
];

// Function to create the normalize_biomarker_code function
async function createNormalizeBiomarkerCodeFunction() {
  console.log('Creating normalize_biomarker_code function...');
  
  try {
    const { data, error } = await supabase
      .rpc('', {}, { head: true })
      .sql(`
        CREATE OR REPLACE FUNCTION normalize_biomarker_code(code text) RETURNS text
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN lower(regexp_replace(code, '[^a-zA-Z0-9]', '', 'g'));
        END;
        $$;
      `);
    
    if (error) {
      console.error('Error creating normalize_biomarker_code function:', error.message);
      return false;
    }
    
    console.log('✅ normalize_biomarker_code function created successfully');
    return true;
  } catch (error) {
    console.error('Error creating normalize_biomarker_code function:', error.message);
    return false;
  }
}

// Function to create the is_valid_biomarker_name function
async function createIsValidBiomarkerNameFunction() {
  console.log('Creating is_valid_biomarker_name function...');
  
  try {
    const { data, error } = await supabase
      .rpc('', {}, { head: true })
      .sql(`
        CREATE OR REPLACE FUNCTION is_valid_biomarker_name(name text) RETURNS boolean
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM biomarker_definitions 
            WHERE normalize_biomarker_code(name) = normalize_biomarker_code(code)
               OR normalize_biomarker_code(name) = normalize_biomarker_code(biomarker_definitions.name)
          );
        END;
        $$;
      `);
    
    if (error) {
      console.error('Error creating is_valid_biomarker_name function:', error.message);
      return false;
    }
    
    console.log('✅ is_valid_biomarker_name function created successfully');
    return true;
  } catch (error) {
    console.error('Error creating is_valid_biomarker_name function:', error.message);
    return false;
  }
}

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .rpc('', {}, { head: true })
      .sql(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = '${tableName}'
        );
      `);
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error.message);
      return false;
    }
    
    // Parse the response to get the existence status
    const exists = data && data.length > 0 && data[0] && data[0].exists === true;
    console.log(`Table ${tableName} exists: ${exists ? 'Yes' : 'No'}`);
    return exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error.message);
    return false;
  }
}

// Function to create biomarker_definitions table if it doesn't exist
async function createBiomarkerDefinitionsTable() {
  console.log('Creating biomarker_definitions table...');
  
  try {
    const { data, error } = await supabase
      .rpc('', {}, { head: true })
      .sql(`
        CREATE TABLE IF NOT EXISTS biomarker_definitions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          category TEXT,
          unit TEXT,
          min_range DOUBLE PRECISION,
          max_range DOUBLE PRECISION,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    
    if (error) {
      console.error('Error creating biomarker_definitions table:', error.message);
      return false;
    }
    
    console.log('✅ biomarker_definitions table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating biomarker_definitions table:', error.message);
    return false;
  }
}

// Function to get existing biomarkers
async function getExistingBiomarkers() {
  try {
    const { data, error } = await supabase
      .rpc('', {}, { head: true })
      .sql(`SELECT code FROM biomarker_definitions;`);
    
    if (error) {
      console.error('Error fetching existing biomarkers:', error.message);
      return [];
    }
    
    if (!data || !Array.isArray(data)) {
      console.error('Unexpected response format when fetching biomarkers');
      return [];
    }
    
    const codes = data.map(row => row.code.toLowerCase());
    console.log(`Found ${codes.length} existing biomarkers in the database`);
    return codes;
  } catch (error) {
    console.error('Error fetching existing biomarkers:', error.message);
    return [];
  }
}

// Function to add a biomarker
async function addBiomarker(biomarker) {
  try {
    const { data, error } = await supabase
      .rpc('', {}, { head: true })
      .sql(`
        INSERT INTO biomarker_definitions (code, name, category, unit, min_range, max_range)
        VALUES (
          '${biomarker.code}',
          '${biomarker.name.replace(/'/g, "''")}',
          '${biomarker.category.replace(/'/g, "''")}',
          '${biomarker.unit.replace(/'/g, "''")}',
          ${biomarker.min_range},
          ${biomarker.max_range}
        )
        ON CONFLICT (code) DO UPDATE
        SET 
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          unit = EXCLUDED.unit,
          min_range = EXCLUDED.min_range,
          max_range = EXCLUDED.max_range;
      `);
    
    if (error) {
      console.error(`Error adding biomarker ${biomarker.code}:`, error.message);
      return false;
    }
    
    console.log(`✅ Added biomarker: ${biomarker.code} (${biomarker.name})`);
    return true;
  } catch (error) {
    console.error(`Error adding biomarker ${biomarker.code}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting biomarker update process...');
  
  // Check if biomarker_definitions table exists, create if not
  const tableExists = await checkTableExists('biomarker_definitions');
  
  if (!tableExists) {
    const tableCreated = await createBiomarkerDefinitionsTable();
    if (!tableCreated) {
      console.error('Failed to create biomarker_definitions table. Exiting...');
      return;
    }
  }
  
  // Get existing biomarkers
  const existingBiomarkerCodes = await getExistingBiomarkers();
  
  // Add missing biomarkers
  let successCount = 0;
  for (const biomarker of missingBiomarkers) {
    if (!existingBiomarkerCodes.includes(biomarker.code.toLowerCase())) {
      const success = await addBiomarker(biomarker);
      if (success) successCount++;
    } else {
      console.log(`Biomarker ${biomarker.code} already exists, skipping...`);
    }
  }
  
  console.log(`Added ${successCount} new biomarkers.`);
  
  // Create database functions
  await createNormalizeBiomarkerCodeFunction();
  await createIsValidBiomarkerNameFunction();
  
  console.log('Biomarker update process completed.');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 