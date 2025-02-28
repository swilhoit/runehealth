

-- Insert biomarkers (Diabetes Markers)
INSERT INTO biomarker_references (code, name, category) 
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
    SELECT 1 FROM biomarker_references 
    WHERE code = normalize_biomarker_code(name)
       OR name ILIKE name
  );


END;


$$ LANGUAGE plpgsql SECURITY DEFINER;