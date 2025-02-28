-- Create UUID extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create biomarker_definitions table if it doesn't exist
CREATE TABLE IF NOT EXISTS biomarker_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert biomarkers (Complete Blood Count)
INSERT INTO biomarker_definitions (code, name, category) 
VALUES 
  ('wbc', 'WBC', 'Complete Blood Count (CBC)'),
  ('rbc', 'RBC', 'Complete Blood Count (CBC)'),
  ('hemoglobin', 'Hemoglobin', 'Complete Blood Count (CBC)'),
  ('hematocrit', 'Hematocrit', 'Complete Blood Count (CBC)'),
  ('mcv', 'MCV', 'Complete Blood Count (CBC)'),
  ('mch', 'MCH', 'Complete Blood Count (CBC)'),
  ('mchc', 'MCHC', 'Complete Blood Count (CBC)'),
  ('rdw', 'RDW', 'Complete Blood Count (CBC)'),
  ('platelets', 'Platelets', 'Complete Blood Count (CBC)'),
  ('neutrophils', 'Neutrophils', 'Complete Blood Count (CBC)'),
  ('lymphs', 'Lymphs', 'Complete Blood Count (CBC)'),
  ('monocytes', 'Monocytes', 'Complete Blood Count (CBC)'),
  ('eos', 'Eos', 'Complete Blood Count (CBC)'),
  ('basos', 'Basos', 'Complete Blood Count (CBC)'),
  ('neutrophilsabsolute', 'Neutrophils (Absolute)', 'Complete Blood Count (CBC)'),
  ('lymphsabsolute', 'Lymphs (Absolute)', 'Complete Blood Count (CBC)'),
  ('monocytesabsolute', 'Monocytes (Absolute)', 'Complete Blood Count (CBC)'),
  ('eosabsolute', 'Eos (Absolute)', 'Complete Blood Count (CBC)'),
  ('basoabsolute', 'Baso (Absolute)', 'Complete Blood Count (CBC)'),
  ('immaturegranulocytes', 'Immature Granulocytes', 'Complete Blood Count (CBC)'),
  ('immaturegransabs', 'Immature Grans (Abs)', 'Complete Blood Count (CBC)')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- Insert biomarkers (Comprehensive Metabolic Panel)
INSERT INTO biomarker_definitions (code, name, category) 
VALUES 
  ('glucose', 'Glucose', 'Comprehensive Metabolic Panel (CMP)'),
  ('bun', 'BUN', 'Comprehensive Metabolic Panel (CMP)'),
  ('creatinine', 'Creatinine', 'Comprehensive Metabolic Panel (CMP)'),
  ('egfr', 'eGFR', 'Comprehensive Metabolic Panel (CMP)'),
  ('buncreatinineratio', 'BUN/Creatinine Ratio', 'Comprehensive Metabolic Panel (CMP)'),
  ('sodium', 'Sodium', 'Comprehensive Metabolic Panel (CMP)'),
  ('potassium', 'Potassium', 'Comprehensive Metabolic Panel (CMP)'),
  ('chloride', 'Chloride', 'Comprehensive Metabolic Panel (CMP)'),
  ('carbondioxide', 'Carbon Dioxide, Total', 'Comprehensive Metabolic Panel (CMP)'),
  ('calcium', 'Calcium', 'Comprehensive Metabolic Panel (CMP)'),
  ('proteintotal', 'Protein, Total', 'Comprehensive Metabolic Panel (CMP)'),
  ('albumin', 'Albumin', 'Comprehensive Metabolic Panel (CMP)'),
  ('globulintotal', 'Globulin, Total', 'Comprehensive Metabolic Panel (CMP)'),
  ('agratio', 'A/G Ratio', 'Comprehensive Metabolic Panel (CMP)'),
  ('bilirubintotal', 'Bilirubin, Total', 'Comprehensive Metabolic Panel (CMP)'),
  ('alkalinephosphatase', 'Alkaline Phosphatase', 'Comprehensive Metabolic Panel (CMP)'),
  ('astsgot', 'AST (SGOT)', 'Comprehensive Metabolic Panel (CMP)'),
  ('altsgpt', 'ALT (SGPT)', 'Comprehensive Metabolic Panel (CMP)'),
  ('ggt', 'GGT', 'Comprehensive Metabolic Panel (CMP)')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- Insert biomarkers (Lipid Panel)
INSERT INTO biomarker_definitions (code, name, category) 
VALUES 
  ('cholesteroltotal', 'Cholesterol, Total', 'Lipid Panel'),
  ('triglycerides', 'Triglycerides', 'Lipid Panel'),
  ('hdlcholesterol', 'HDL Cholesterol', 'Lipid Panel'),
  ('vldlcholesterolcal', 'VLDL Cholesterol Cal', 'Lipid Panel'),
  ('ldlcholcalcnih', 'LDL Chol Calc (NIH)', 'Lipid Panel'),
  ('apolipoproteinb', 'Apolipoprotein B', 'Lipid Panel')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- Insert biomarkers (Hormones)
INSERT INTO biomarker_definitions (code, name, category) 
VALUES 
  ('testosterone', 'Testosterone', 'Hormones'),
  ('freetestosteronedirect', 'Free Testosterone (Direct)', 'Hormones'),
  ('dheasulfate', 'DHEA-Sulfate', 'Hormones'),
  ('cortisol', 'Cortisol', 'Hormones'),
  ('insulin', 'Insulin', 'Hormones')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- Insert biomarkers (Thyroid Panel)
INSERT INTO biomarker_definitions (code, name, category) 
VALUES 
  ('t4freedirect', 'T4, Free (Direct)', 'Thyroid Panel'),
  ('tsh', 'TSH', 'Thyroid Panel'),
  ('triiodothyroninet3', 'Triiodothyronine (T3)', 'Thyroid Panel'),
  ('thyroglobulinantibody', 'Thyroglobulin Antibody', 'Thyroid Panel'),
  ('thyroidperoxidasetpoab', 'Thyroid Peroxidase (TPO) Ab', 'Thyroid Panel')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- Insert biomarkers (Vitamins and Nutrients)
INSERT INTO biomarker_definitions (code, name, category) 
VALUES 
  ('folatefoicacidserum', 'Folate (Folic Acid), Serum', 'Vitamins and Nutrients'),
  ('vitamind25hydroxy', 'Vitamin D, 25-Hydroxy', 'Vitamins and Nutrients'),
  ('vitaminb12', 'Vitamin B12', 'Vitamins and Nutrients'),
  ('magnesium', 'Magnesium', 'Vitamins and Nutrients')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- Insert biomarkers (Iron Studies)
INSERT INTO biomarker_definitions (code, name, category) 
VALUES 
  ('iron', 'Iron', 'Iron Studies'),
  ('ferritin', 'Ferritin', 'Iron Studies')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- Insert biomarkers (Inflammation and Cardiac Markers)
INSERT INTO biomarker_definitions (code, name, category) 
VALUES 
  ('creactiveproteincardiac', 'C-Reactive Protein, Cardiac', 'Inflammation Markers'),
  ('homocysteine', 'Homocyst(e)ine', 'Inflammation Markers')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- Insert biomarkers (Diabetes Markers)
INSERT INTO biomarker_definitions (code, name, category) 
VALUES 
  ('hemoglobina1c', 'Hemoglobin A1c', 'Diabetes Markers')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- Function to normalize biomarker codes
CREATE OR REPLACE FUNCTION normalize_biomarker_code(code TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(code, '[^a-zA-Z0-9]', '', 'g'), '\s+', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if a biomarker name is valid
CREATE OR REPLACE FUNCTION is_valid_biomarker_name(name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM biomarker_definitions 
    WHERE code = normalize_biomarker_code(name)
       OR name ILIKE name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 