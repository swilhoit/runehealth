-- Add missing biomarkers to the biomarker_definitions table
BEGIN;

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('wbc', 'WBC', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'WBC', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('rbc', 'RBC', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'RBC', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('mcv', 'MCV', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'MCV', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('mch', 'MCH', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'MCH', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('mchc', 'MCHC', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'MCHC', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('rdw', 'RDW', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'RDW', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('platelets', 'Platelets', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Platelets', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('neutrophils', 'Neutrophils', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Neutrophils', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('lymphs', 'Lymphs', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Lymphs', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('monocytes', 'Monocytes', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Monocytes', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('eos', 'Eos', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Eos', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('basos', 'Basos', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Basos', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('neutrophilsabsolute', 'Neutrophils (Absolute)', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Neutrophils (Absolute)', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('lymphsabsolute', 'Lymphs (Absolute)', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Lymphs (Absolute)', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('monocytesabsolute', 'Monocytes (Absolute)', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Monocytes (Absolute)', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('eosabsolute', 'Eos (Absolute)', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Eos (Absolute)', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('basoabsolute', 'Baso (Absolute)', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Baso (Absolute)', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('immaturegranulocytes', 'Immature Granulocytes', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Immature Granulocytes', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('immaturegransabs', 'Immature Grans (Abs)', 'Complete Blood Count (CBC)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Immature Grans (Abs)', category = 'Complete Blood Count (CBC)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('bun', 'BUN', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'BUN', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('egfr', 'eGFR', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'eGFR', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('buncreatinineratio', 'BUN/Creatinine Ratio', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'BUN/Creatinine Ratio', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('sodium', 'Sodium', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Sodium', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('potassium', 'Potassium', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Potassium', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('chloride', 'Chloride', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Chloride', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('carbondioxide', 'Carbon Dioxide, Total', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Carbon Dioxide, Total', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('calcium', 'Calcium', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Calcium', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('proteintotal', 'Protein, Total', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Protein, Total', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('albumin', 'Albumin', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Albumin', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('globulintotal', 'Globulin, Total', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Globulin, Total', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('agratio', 'A/G Ratio', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'A/G Ratio', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('bilirubintotal', 'Bilirubin, Total', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Bilirubin, Total', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('alkalinephosphatase', 'Alkaline Phosphatase', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Alkaline Phosphatase', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('astsgot', 'AST (SGOT)', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'AST (SGOT)', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('altsgpt', 'ALT (SGPT)', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'ALT (SGPT)', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('cholesteroltotal', 'Cholesterol, Total', 'Lipid Panel', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Cholesterol, Total', category = 'Lipid Panel';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('vldlcholesterolcal', 'VLDL Cholesterol Cal', 'Lipid Panel', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'VLDL Cholesterol Cal', category = 'Lipid Panel';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('ldlcholcalcnih', 'LDL Chol Calc (NIH)', 'Lipid Panel', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'LDL Chol Calc (NIH)', category = 'Lipid Panel';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('testosterone', 'Testosterone', 'Hormones', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Testosterone', category = 'Hormones';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('freetestosteronedirect', 'Free Testosterone (Direct)', 'Hormones', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Free Testosterone (Direct)', category = 'Hormones';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('t4freedirect', 'T4, Free (Direct)', 'Thyroid Panel', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'T4, Free (Direct)', category = 'Thyroid Panel';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('folatefoicacidserum', 'Folate (Folic Acid), Serum', 'Vitamins and Nutrients', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Folate (Folic Acid), Serum', category = 'Vitamins and Nutrients';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('dheasulfate', 'DHEA-Sulfate', 'Hormones', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'DHEA-Sulfate', category = 'Hormones';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('cortisol', 'Cortisol', 'Hormones', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Cortisol', category = 'Hormones';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('tsh', 'TSH', 'Thyroid Panel', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'TSH', category = 'Thyroid Panel';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('vitamind25hydroxy', 'Vitamin D, 25-Hydroxy', 'Vitamins and Nutrients', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Vitamin D, 25-Hydroxy', category = 'Vitamins and Nutrients';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('creactiveproteincardiac', 'C-Reactive Protein, Cardiac', 'Inflammation Markers', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'C-Reactive Protein, Cardiac', category = 'Inflammation Markers';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('homocysteine', 'Homocyst(e)ine', 'Inflammation Markers', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Homocyst(e)ine', category = 'Inflammation Markers';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('ggt', 'GGT', 'Comprehensive Metabolic Panel (CMP)', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'GGT', category = 'Comprehensive Metabolic Panel (CMP)';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('iron', 'Iron', 'Iron Studies', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Iron', category = 'Iron Studies';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('triiodothyroninet3', 'Triiodothyronine (T3)', 'Thyroid Panel', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Triiodothyronine (T3)', category = 'Thyroid Panel';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('thyroglobulinantibody', 'Thyroglobulin Antibody', 'Thyroid Panel', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Thyroglobulin Antibody', category = 'Thyroid Panel';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('magnesium', 'Magnesium', 'Vitamins and Nutrients', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Magnesium', category = 'Vitamins and Nutrients';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('insulin', 'Insulin', 'Hormones', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Insulin', category = 'Hormones';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('ferritin', 'Ferritin', 'Iron Studies', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Ferritin', category = 'Iron Studies';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('thyroidperoxidasetpoab', 'Thyroid Peroxidase (TPO) Ab', 'Thyroid Panel', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Thyroid Peroxidase (TPO) Ab', category = 'Thyroid Panel';

INSERT INTO biomarker_definitions (code, name, category, created_at)
VALUES ('apolipoproteinb', 'Apolipoprotein B', 'Lipid Panel', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Apolipoprotein B', category = 'Lipid Panel';

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

COMMIT; 