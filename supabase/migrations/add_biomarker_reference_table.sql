-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create biomarker reference table
CREATE TABLE IF NOT EXISTS biomarker_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_biomarker_references_code ON biomarker_references(code);

-- Insert the standard biomarkers
INSERT INTO biomarker_references (code, name, category, description)
VALUES
  ('WBC', 'White Blood Cell Count', 'CBC With Differential/Platelet', 'Measures the total number of white blood cells, which fight infection'),
  ('RBC', 'Red Blood Cell Count', 'CBC With Differential/Platelet', 'Measures the total number of red blood cells, which carry oxygen'),
  ('HGB', 'Hemoglobin', 'CBC With Differential/Platelet', 'Protein in red blood cells that carries oxygen'),
  ('HCT', 'Hematocrit', 'CBC With Differential/Platelet', 'Percentage of blood volume that is composed of red blood cells'),
  ('MCV', 'Mean Corpuscular Volume', 'CBC With Differential/Platelet', 'Average size of red blood cells'),
  ('MCH', 'Mean Corpuscular Hemoglobin', 'CBC With Differential/Platelet', 'Average amount of hemoglobin in red blood cells'),
  ('MCHC', 'Mean Corpuscular Hemoglobin Concentration', 'CBC With Differential/Platelet', 'Average concentration of hemoglobin in red blood cells'),
  ('RDW', 'Red Cell Distribution Width', 'CBC With Differential/Platelet', 'Measurement of variation in red blood cell size'),
  ('PLT', 'Platelets', 'CBC With Differential/Platelet', 'Cell fragments that help with blood clotting'),
  ('NEUT', 'Neutrophils', 'CBC With Differential/Platelet', 'Type of white blood cell that fights bacterial infections'),
  ('LYMPHS', 'Lymphocytes', 'CBC With Differential/Platelet', 'Type of white blood cell that fights viral infections'),
  ('MONO', 'Monocytes', 'CBC With Differential/Platelet', 'Type of white blood cell that fights infections and helps with healing'),
  ('EOS', 'Eosinophils', 'CBC With Differential/Platelet', 'Type of white blood cell that fights parasitic infections and allergies'),
  ('BASO', 'Basophils', 'CBC With Differential/Platelet', 'Type of white blood cell involved in allergic reactions'),
  ('NEUT-ABS', 'Neutrophils (Absolute)', 'CBC With Differential/Platelet', 'Absolute count of neutrophils'),
  ('LYMPHS-ABS', 'Lymphocytes (Absolute)', 'CBC With Differential/Platelet', 'Absolute count of lymphocytes'),
  ('MONO-ABS', 'Monocytes (Absolute)', 'CBC With Differential/Platelet', 'Absolute count of monocytes'),
  ('EOS-ABS', 'Eosinophils (Absolute)', 'CBC With Differential/Platelet', 'Absolute count of eosinophils'),
  ('BASO-ABS', 'Basophils (Absolute)', 'CBC With Differential/Platelet', 'Absolute count of basophils'),
  ('IG', 'Immature Granulocytes', 'CBC With Differential/Platelet', 'Immature white blood cells'),
  ('IG-ABS', 'Immature Granulocytes (Absolute)', 'CBC With Differential/Platelet', 'Absolute count of immature granulocytes'),
  ('GLUCOSE', 'Glucose', 'Metabolic Panel', 'Blood sugar level'),
  ('BUN', 'Blood Urea Nitrogen', 'Metabolic Panel', 'Waste product filtered by kidneys'),
  ('CREAT', 'Creatinine', 'Metabolic Panel', 'Waste product filtered by kidneys'),
  ('EGFR', 'Estimated Glomerular Filtration Rate', 'Metabolic Panel', 'Measure of kidney function'),
  ('BUN-CREAT', 'BUN/Creatinine Ratio', 'Metabolic Panel', 'Ratio used to evaluate kidney function'),
  ('NA', 'Sodium', 'Metabolic Panel', 'Electrolyte that helps maintain fluid balance'),
  ('K', 'Potassium', 'Metabolic Panel', 'Electrolyte important for heart and muscle function'),
  ('CL', 'Chloride', 'Metabolic Panel', 'Electrolyte that helps maintain fluid balance'),
  ('CO2', 'Carbon Dioxide, Total', 'Metabolic Panel', 'Measure of carbon dioxide in blood'),
  ('CA', 'Calcium', 'Metabolic Panel', 'Mineral important for bone health and muscle function'),
  ('TP', 'Protein, Total', 'Metabolic Panel', 'Total amount of protein in blood'),
  ('ALB', 'Albumin', 'Metabolic Panel', 'Protein made by the liver'),
  ('GLOB', 'Globulin, Total', 'Metabolic Panel', 'Group of proteins in blood'),
  ('AG-RATIO', 'A/G Ratio', 'Metabolic Panel', 'Ratio of albumin to globulin'),
  ('TBIL', 'Bilirubin, Total', 'Liver Function', 'Waste product processed by the liver'),
  ('ALP', 'Alkaline Phosphatase', 'Liver Function', 'Enzyme found in liver and bone'),
  ('AST', 'AST (SGOT)', 'Liver Function', 'Enzyme found in the liver and other tissues'),
  ('ALT', 'ALT (SGPT)', 'Liver Function', 'Enzyme primarily found in the liver'),
  ('CHOL', 'Cholesterol, Total', 'Lipid Panel', 'Fatty substance in blood'),
  ('TRIG', 'Triglycerides', 'Lipid Panel', 'Type of fat in blood'),
  ('HDL', 'HDL Cholesterol', 'Lipid Panel', 'High-density lipoprotein, "good" cholesterol'),
  ('VLDL', 'VLDL Cholesterol', 'Lipid Panel', 'Very low-density lipoprotein'),
  ('LDL', 'LDL Cholesterol', 'Lipid Panel', 'Low-density lipoprotein, "bad" cholesterol'),
  ('TESTO', 'Testosterone', 'Hormones', 'Male sex hormone'),
  ('FREE-TESTO', 'Free Testosterone', 'Hormones', 'Testosterone not bound to proteins'),
  ('HBA1C', 'Hemoglobin A1c', 'Diabetes', 'Average blood sugar over past 3 months'),
  ('FT4', 'T4, Free (Direct)', 'Thyroid', 'Thyroid hormone'),
  ('FOLATE', 'Folate (Folic Acid)', 'Vitamins', 'B vitamin important for cell growth'),
  ('DHEAS', 'DHEA-Sulfate', 'Hormones', 'Hormone produced by adrenal glands'),
  ('CORTISOL', 'Cortisol', 'Hormones', 'Stress hormone'),
  ('TSH', 'TSH', 'Thyroid', 'Hormone that regulates thyroid function'),
  ('VIT-D', 'Vitamin D, 25-Hydroxy', 'Vitamins', 'Vitamin important for bone health'),
  ('CRP', 'C-Reactive Protein, Cardiac', 'Inflammation', 'Protein that increases with inflammation'),
  ('HOMOCYS', 'Homocyst(e)ine', 'Cardiac Risk', 'Amino acid linked to heart disease'),
  ('GGT', 'GGT', 'Liver Function', 'Enzyme found in liver and bile ducts'),
  ('IRON', 'Iron', 'Hematology', 'Mineral necessary for red blood cell production'),
  ('T3', 'Triiodothyronine (T3)', 'Thyroid', 'Thyroid hormone'),
  ('TG-AB', 'Thyroglobulin Antibody', 'Thyroid', 'Antibody that can indicate thyroid disease'),
  ('VIT-B12', 'Vitamin B12', 'Vitamins', 'Vitamin important for nerve function and blood cells'),
  ('MG', 'Magnesium', 'Minerals', 'Mineral important for many bodily functions'),
  ('INSULIN', 'Insulin', 'Diabetes', 'Hormone that regulates blood sugar'),
  ('FERRITIN', 'Ferritin', 'Hematology', 'Protein that stores iron'),
  ('TPO-AB', 'Thyroid Peroxidase Antibody', 'Thyroid', 'Antibody that can indicate thyroid disease'),
  ('APO-B', 'Apolipoprotein B', 'Lipid Panel', 'Protein component of LDL cholesterol')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description;

-- Add additional common biomarker name variations for better recognition
INSERT INTO biomarker_references (code, name, category, description)
VALUES
  ('HB', 'Hemoglobin', 'CBC With Differential/Platelet', 'Alternate code for Hemoglobin'),
  ('LYMPH', 'Lymphocytes', 'CBC With Differential/Platelet', 'Alternative code for Lymphocytes'),
  ('FBS', 'Fasting Blood Sugar', 'Metabolic Panel', 'Glucose level after fasting'),
  ('GLUC', 'Glucose', 'Metabolic Panel', 'Alternative code for blood sugar'),
  ('CREATININE', 'Creatinine', 'Metabolic Panel', 'Alternative spelling for Creatinine'),
  ('SODIUM', 'Sodium', 'Metabolic Panel', 'Full name for Na'),
  ('POTASSIUM', 'Potassium', 'Metabolic Panel', 'Full name for K'),
  ('TOTAL-CHOL', 'Total Cholesterol', 'Lipid Panel', 'Alternative code for total cholesterol'),
  ('FREE-T4', 'Free T4', 'Thyroid', 'Alternative code for Free T4'),
  ('25-OH-D', 'Vitamin D, 25-Hydroxy', 'Vitamins', 'Alternative code for Vitamin D'),
  ('25-OH-VIT-D', 'Vitamin D, 25-Hydroxy', 'Vitamins', 'Alternative code for Vitamin D')
ON CONFLICT (code) DO NOTHING;

-- Drop the existing function first if it exists
DROP FUNCTION IF EXISTS normalize_biomarker_code(TEXT);

-- Create a function to normalize biomarker codes for comparison
CREATE OR REPLACE FUNCTION normalize_biomarker_code(input_code TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convert to uppercase, remove spaces, dashes, underscores, periods
  RETURN UPPER(REGEXP_REPLACE(input_code, '[\\s\\-_\\.\\(\\)\\,]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE; 