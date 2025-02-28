-- First, add optimal range columns if they don't exist
ALTER TABLE biomarker_definitions
ADD COLUMN IF NOT EXISTS optimal_min NUMERIC,
ADD COLUMN IF NOT EXISTS optimal_max NUMERIC;

-- Add unique constraint on code if it doesn't exist
DO $$ 
BEGIN
  ALTER TABLE biomarker_definitions ADD CONSTRAINT biomarker_definitions_code_key UNIQUE (code);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create a function to normalize biomarker codes
CREATE OR REPLACE FUNCTION normalize_biomarker_code(code text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE  -- Mark the function as IMMUTABLE
AS $$
BEGIN
  -- Convert to lowercase and remove spaces/special characters
  RETURN LOWER(REGEXP_REPLACE(code, '[^a-zA-Z0-9]', '', 'g'));
END;
$$;

-- Ensure all biomarker codes are lowercase and normalized
UPDATE biomarker_definitions
SET code = normalize_biomarker_code(code)
WHERE code != normalize_biomarker_code(code);

-- Create a trigger to normalize codes on insert/update
CREATE OR REPLACE FUNCTION normalize_biomarker_code_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code = normalize_biomarker_code(NEW.code);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS normalize_biomarker_code_on_change ON biomarker_definitions;
CREATE TRIGGER normalize_biomarker_code_on_change
  BEFORE INSERT OR UPDATE ON biomarker_definitions
  FOR EACH ROW
  EXECUTE FUNCTION normalize_biomarker_code_trigger();

-- Create a regular B-tree index on the normalized code
CREATE INDEX IF NOT EXISTS idx_biomarker_definitions_code_normalized 
ON biomarker_definitions (code text_pattern_ops);

-- Update or insert standard biomarker definitions
INSERT INTO biomarker_definitions (
  code,
  name,
  category,
  unit,
  min_value,
  max_value,
  optimal_min,
  optimal_max,
  description
) VALUES 
  ('cholesterol', 'Total Cholesterol', 'lipid_panel', 'mg/dL', 125, 200, 150, 180, 'Total cholesterol level'),
  ('triglycerides', 'Triglycerides', 'lipid_panel', 'mg/dL', 0, 150, 50, 100, 'Type of fat in blood'),
  ('hdl', 'HDL Cholesterol', 'lipid_panel', 'mg/dL', 40, 60, 45, 55, 'Good cholesterol'),
  ('ldl', 'LDL Cholesterol', 'lipid_panel', 'mg/dL', 0, 100, 50, 80, 'Bad cholesterol'),
  ('glucose', 'Glucose', 'metabolic_panel', 'mg/dL', 70, 100, 80, 90, 'Blood sugar level'),
  ('vitamind', 'Vitamin D', 'vitamin_panel', 'ng/mL', 30, 100, 40, 80, 'Vitamin D level'),
  ('tsh', 'Thyroid Stimulating Hormone', 'thyroid_panel', 'mIU/L', 0.4, 4.0, 1.0, 2.5, 'Thyroid function test')
ON CONFLICT (code) 
DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  min_value = EXCLUDED.min_value,
  max_value = EXCLUDED.max_value,
  optimal_min = EXCLUDED.optimal_min,
  optimal_max = EXCLUDED.optimal_max,
  description = EXCLUDED.description;

-- Remove any duplicate biomarker definitions
WITH duplicates AS (
  SELECT code,
         ROW_NUMBER() OVER (PARTITION BY normalize_biomarker_code(code) ORDER BY created_at) as rn
  FROM biomarker_definitions
)
DELETE FROM biomarker_definitions
WHERE id IN (
  SELECT bd.id
  FROM biomarker_definitions bd
  JOIN duplicates d ON normalize_biomarker_code(bd.code) = normalize_biomarker_code(d.code)
  WHERE d.rn > 1
);

-- Analyze the table to update statistics
ANALYZE biomarker_definitions;

