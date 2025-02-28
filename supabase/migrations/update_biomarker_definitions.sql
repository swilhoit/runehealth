-- Alter biomarker_definitions table to use category_id instead of category text field if needed
ALTER TABLE IF EXISTS biomarker_definitions 
ADD COLUMN IF NOT EXISTS category_id int;

-- Update the complete blood count biomarkers
UPDATE biomarker_definitions
SET category_id = 67  -- complete_blood_count
WHERE category = 'Complete Blood Count';

-- Update the metabolic panel biomarkers
UPDATE biomarker_definitions
SET category_id = 68  -- metabolic_panel
WHERE category = 'Comprehensive Metabolic Panel';

-- Update the lipid panel biomarkers
UPDATE biomarker_definitions
SET category_id = 69  -- lipid_panel 
WHERE category = 'Lipid Panel';

-- Update the thyroid panel biomarkers
UPDATE biomarker_definitions
SET category_id = 70  -- thyroid_panel
WHERE category = 'Thyroid Panel';

-- Update the vitamin biomarkers
UPDATE biomarker_definitions
SET category_id = 71  -- vitamin_panel
WHERE category = 'Vitamins and Nutrients';

-- Update the hormone biomarkers
UPDATE biomarker_definitions
SET category_id = 72  -- hormone_panel
WHERE category = 'Hormones';

-- Update liver biomarkers
UPDATE biomarker_definitions
SET category_id = 73  -- liver_panel
WHERE code IN ('alt', 'ast', 'alp', 'bilirubin');

-- Update kidney biomarkers
UPDATE biomarker_definitions
SET category_id = 74  -- kidney_panel
WHERE code IN ('creatinine', 'bun', 'egfr', 'bun_creatinine_ratio');

-- Update other biomarkers
UPDATE biomarker_definitions
SET category_id = 75  -- other
WHERE category_id IS NULL; 