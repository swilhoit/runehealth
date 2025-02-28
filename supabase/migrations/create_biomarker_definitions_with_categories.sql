-- Create the biomarker_definitions table if it doesn't exist
CREATE TABLE IF NOT EXISTS biomarker_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  category_id INT,
  unit TEXT,
  min_range DOUBLE PRECISION,
  max_range DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all required biomarkers with category IDs
INSERT INTO biomarker_definitions (code, name, category, category_id, unit, min_range, max_range)
VALUES 
  -- Complete Blood Count (category_id: 67)
  ('wbc', 'White Blood Cell Count', 'Complete Blood Count', 67, '10^3/μL', 3.5, 10.5),
  ('rbc', 'Red Blood Cell Count', 'Complete Blood Count', 67, '10^6/μL', 4.2, 6.1),
  ('hgb', 'Hemoglobin', 'Complete Blood Count', 67, 'g/dL', 12.0, 17.0),
  ('hct', 'Hematocrit', 'Complete Blood Count', 67, '%', 36.0, 51.0),
  ('mcv', 'Mean Corpuscular Volume', 'Complete Blood Count', 67, 'fL', 80.0, 100.0),
  ('mch', 'Mean Corpuscular Hemoglobin', 'Complete Blood Count', 67, 'pg', 27.0, 33.0),
  ('mchc', 'Mean Corpuscular Hemoglobin Concentration', 'Complete Blood Count', 67, 'g/dL', 32.0, 36.0),
  ('plt', 'Platelet Count', 'Complete Blood Count', 67, '10^3/μL', 150.0, 450.0),
  ('rdw', 'Red Cell Distribution Width', 'Complete Blood Count', 67, '%', 11.5, 14.5),
  ('neutrophils', 'Neutrophils', 'Complete Blood Count', 67, '%', 40.0, 70.0),
  ('lymphocytes', 'Lymphocytes', 'Complete Blood Count', 67, '%', 20.0, 40.0),
  ('monocytes', 'Monocytes', 'Complete Blood Count', 67, '%', 2.0, 10.0),
  ('eosinophils', 'Eosinophils', 'Complete Blood Count', 67, '%', 1.0, 6.0),
  ('basophils', 'Basophils', 'Complete Blood Count', 67, '%', 0.0, 2.0),
  ('abs_neutrophils', 'Absolute Neutrophils', 'Complete Blood Count', 67, '10^3/μL', 1.7, 7.0),
  ('abs_lymphocytes', 'Absolute Lymphocytes', 'Complete Blood Count', 67, '10^3/μL', 0.9, 2.9),
  ('abs_monocytes', 'Absolute Monocytes', 'Complete Blood Count', 67, '10^3/μL', 0.3, 0.9),
  ('abs_eosinophils', 'Absolute Eosinophils', 'Complete Blood Count', 67, '10^3/μL', 0.0, 0.5),
  ('abs_basophils', 'Absolute Basophils', 'Complete Blood Count', 67, '10^3/μL', 0.0, 0.2),
  
  -- Metabolic Panel (category_id: 68)
  ('glucose', 'Glucose', 'Comprehensive Metabolic Panel', 68, 'mg/dL', 70.0, 99.0),
  ('bun', 'Blood Urea Nitrogen', 'Comprehensive Metabolic Panel', 74, 'mg/dL', 7.0, 20.0), -- Kidney panel
  ('creatinine', 'Creatinine', 'Comprehensive Metabolic Panel', 74, 'mg/dL', 0.6, 1.3), -- Kidney panel
  ('egfr', 'Estimated Glomerular Filtration Rate', 'Comprehensive Metabolic Panel', 74, 'mL/min/1.73m²', 90.0, 120.0), -- Kidney panel
  ('bun_creatinine_ratio', 'BUN/Creatinine Ratio', 'Comprehensive Metabolic Panel', 74, '', 10.0, 20.0), -- Kidney panel
  ('sodium', 'Sodium', 'Comprehensive Metabolic Panel', 68, 'mmol/L', 135.0, 145.0),
  ('potassium', 'Potassium', 'Comprehensive Metabolic Panel', 68, 'mmol/L', 3.5, 5.0),
  ('chloride', 'Chloride', 'Comprehensive Metabolic Panel', 68, 'mmol/L', 98.0, 107.0),
  ('co2', 'Carbon Dioxide', 'Comprehensive Metabolic Panel', 68, 'mmol/L', 23.0, 29.0),
  ('calcium', 'Calcium', 'Comprehensive Metabolic Panel', 68, 'mg/dL', 8.6, 10.3),
  ('protein', 'Total Protein', 'Comprehensive Metabolic Panel', 68, 'g/dL', 6.0, 8.3),
  ('albumin', 'Albumin', 'Comprehensive Metabolic Panel', 68, 'g/dL', 3.5, 5.0),
  ('globulin', 'Globulin', 'Comprehensive Metabolic Panel', 68, 'g/dL', 2.0, 3.5),
  ('ag_ratio', 'Albumin/Globulin Ratio', 'Comprehensive Metabolic Panel', 68, '', 1.1, 2.5),
  ('bilirubin', 'Total Bilirubin', 'Comprehensive Metabolic Panel', 73, 'mg/dL', 0.1, 1.2), -- Liver panel
  ('alt', 'Alanine Aminotransferase', 'Comprehensive Metabolic Panel', 73, 'U/L', 7.0, 55.0), -- Liver panel
  ('ast', 'Aspartate Aminotransferase', 'Comprehensive Metabolic Panel', 73, 'U/L', 8.0, 48.0), -- Liver panel
  ('alp', 'Alkaline Phosphatase', 'Comprehensive Metabolic Panel', 73, 'U/L', 40.0, 129.0), -- Liver panel
  
  -- Lipid Panel (category_id: 69)
  ('cholesterol', 'Total Cholesterol', 'Lipid Panel', 69, 'mg/dL', 0.0, 200.0),
  ('triglycerides', 'Triglycerides', 'Lipid Panel', 69, 'mg/dL', 0.0, 150.0),
  ('hdl', 'HDL Cholesterol', 'Lipid Panel', 69, 'mg/dL', 40.0, 60.0),
  ('ldl', 'LDL Cholesterol', 'Lipid Panel', 69, 'mg/dL', 0.0, 100.0),
  ('cholesterol_hdl_ratio', 'Total Cholesterol/HDL Ratio', 'Lipid Panel', 69, '', 0.0, 5.0),
  ('non_hdl_cholesterol', 'Non-HDL Cholesterol', 'Lipid Panel', 69, 'mg/dL', 0.0, 130.0),
  
  -- Thyroid Panel (category_id: 70)
  ('tsh', 'Thyroid Stimulating Hormone', 'Thyroid Panel', 70, 'mIU/L', 0.4, 4.0),
  ('t4_free', 'Free T4', 'Thyroid Panel', 70, 'ng/dL', 0.8, 1.8),
  ('t3_free', 'Free T3', 'Thyroid Panel', 70, 'pg/mL', 2.3, 4.2),
  
  -- Hormones (category_id: 72)
  ('testosterone', 'Testosterone', 'Hormones', 72, 'ng/dL', 280.0, 1100.0),
  ('free_testosterone', 'Free Testosterone', 'Hormones', 72, 'pg/mL', 5.0, 21.0),
  ('estradiol', 'Estradiol', 'Hormones', 72, 'pg/mL', 10.0, 40.0),
  ('dhea_s', 'DHEA-S', 'Hormones', 72, 'μg/dL', 100.0, 500.0),
  ('cortisol', 'Cortisol', 'Hormones', 72, 'μg/dL', 6.0, 18.0),
  
  -- Other metrics (category_id: 75)
  ('hba1c', 'Hemoglobin A1c', 'Diabetes', 75, '%', 4.0, 5.6),
  ('insulin', 'Insulin', 'Diabetes', 75, 'μIU/mL', 2.6, 24.9),
  
  -- Vitamins and Nutrients (category_id: 71)
  ('vitamin_d', 'Vitamin D', 'Vitamins and Nutrients', 71, 'ng/mL', 30.0, 100.0),
  ('vitamin_b12', 'Vitamin B12', 'Vitamins and Nutrients', 71, 'pg/mL', 200.0, 900.0),
  ('folate', 'Folate', 'Vitamins and Nutrients', 71, 'ng/mL', 3.0, 20.0),
  ('iron', 'Iron', 'Vitamins and Nutrients', 71, 'μg/dL', 50.0, 170.0),
  ('ferritin', 'Ferritin', 'Vitamins and Nutrients', 71, 'ng/mL', 30.0, 400.0),
  ('tibc', 'Total Iron Binding Capacity', 'Vitamins and Nutrients', 71, 'μg/dL', 250.0, 450.0),
  ('transferrin_saturation', 'Transferrin Saturation', 'Vitamins and Nutrients', 71, '%', 16.0, 45.0),
  ('magnesium', 'Magnesium', 'Vitamins and Nutrients', 71, 'mg/dL', 1.7, 2.4),
  ('zinc', 'Zinc', 'Vitamins and Nutrients', 71, 'μg/dL', 70.0, 120.0)
ON CONFLICT (code) DO UPDATE
SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  min_range = EXCLUDED.min_range,
  max_range = EXCLUDED.max_range; 