-- First add the optimal range columns if they don't exist
ALTER TABLE biomarker_definitions
ADD COLUMN IF NOT EXISTS optimal_min NUMERIC,
ADD COLUMN IF NOT EXISTS optimal_max NUMERIC;

-- Create type if it doesn't exist
DO $$ 
BEGIN
  CREATE TYPE biomarker_category AS ENUM (
    'lipid_panel',
    'metabolic_panel',
    'thyroid_panel',
    'vitamin_panel',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update existing records with optimal ranges and other fields
WITH biomarker_updates AS (
  SELECT * FROM (
    VALUES
      ('cholesterol', 'Total Cholesterol', 'lipid_panel'::biomarker_category, 125, 200, 'mg/dL', 'Total cholesterol level', 150, 180),
      ('triglycerides', 'Triglycerides', 'lipid_panel'::biomarker_category, 0, 150, 'mg/dL', 'Type of fat in blood', 50, 100),
      ('hdl', 'HDL Cholesterol', 'lipid_panel'::biomarker_category, 40, 60, 'mg/dL', 'Good cholesterol', 45, 55),
      ('ldl', 'LDL Cholesterol', 'lipid_panel'::biomarker_category, 0, 100, 'mg/dL', 'Bad cholesterol', 50, 80),
      ('glucose', 'Glucose', 'metabolic_panel'::biomarker_category, 70, 100, 'mg/dL', 'Blood sugar level', 80, 90),
      ('tsh', 'Thyroid Stimulating Hormone', 'thyroid_panel'::biomarker_category, 0.4, 4.0, 'mIU/L', 'Thyroid function test', 1.0, 2.5),
      ('vitaminD', 'Vitamin D', 'vitamin_panel'::biomarker_category, 30, 100, 'ng/mL', 'Vitamin D level', 40, 80)
  ) AS t(code, name, category, min_value, max_value, unit, description, optimal_min, optimal_max)
)
UPDATE biomarker_definitions bd
SET 
    name = bu.name,
    category = bu.category,
    min_value = bu.min_value,
    max_value = bu.max_value,
    unit = bu.unit,
    description = bu.description,
    optimal_min = bu.optimal_min,
    optimal_max = bu.optimal_max,
    updated_at = CURRENT_TIMESTAMP
FROM biomarker_updates bu
WHERE bd.code = bu.code;

-- Insert any new records that don't exist yet
INSERT INTO biomarker_definitions 
    (code, name, category, min_value, max_value, unit, description, optimal_min, optimal_max)
SELECT 
    bu.code,
    bu.name,
    bu.category,
    bu.min_value,
    bu.max_value,
    bu.unit,
    bu.description,
    bu.optimal_min,
    bu.optimal_max
FROM (
    VALUES
      ('cholesterol', 'Total Cholesterol', 'lipid_panel'::biomarker_category, 125, 200, 'mg/dL', 'Total cholesterol level', 150, 180),
      ('triglycerides', 'Triglycerides', 'lipid_panel'::biomarker_category, 0, 150, 'mg/dL', 'Type of fat in blood', 50, 100),
      ('hdl', 'HDL Cholesterol', 'lipid_panel'::biomarker_category, 40, 60, 'mg/dL', 'Good cholesterol', 45, 55),
      ('ldl', 'LDL Cholesterol', 'lipid_panel'::biomarker_category, 0, 100, 'mg/dL', 'Bad cholesterol', 50, 80),
      ('glucose', 'Glucose', 'metabolic_panel'::biomarker_category, 70, 100, 'mg/dL', 'Blood sugar level', 80, 90),
      ('tsh', 'Thyroid Stimulating Hormone', 'thyroid_panel'::biomarker_category, 0.4, 4.0, 'mIU/L', 'Thyroid function test', 1.0, 2.5),
      ('vitaminD', 'Vitamin D', 'vitamin_panel'::biomarker_category, 30, 100, 'ng/mL', 'Vitamin D level', 40, 80)
) AS bu(code, name, category, min_value, max_value, unit, description, optimal_min, optimal_max)
WHERE NOT EXISTS (
    SELECT 1 
    FROM biomarker_definitions bd 
    WHERE bd.code = bu.code
);

-- Update category_id for all biomarkers based on their category (with proper type casting)
UPDATE biomarker_definitions bd
SET category_id = bc.id
FROM biomarker_categories bc
WHERE bd.category::text = bc.name;

-- Ensure all biomarker codes are consistently lowercase
UPDATE biomarker_definitions
SET code = LOWER(code)
WHERE code != LOWER(code);

-- Add an index on the code column for better performance
CREATE INDEX IF NOT EXISTS idx_biomarker_definitions_code_lower 
ON biomarker_definitions(LOWER(code));

