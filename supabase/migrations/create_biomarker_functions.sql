-- Function to normalize biomarker codes by converting to lowercase and removing non-alphanumeric characters
CREATE OR REPLACE FUNCTION normalize_biomarker_code(code text) RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(regexp_replace(code, '[^a-zA-Z0-9]', '', 'g'));
END;
$$;

-- Function to check if a biomarker name is valid by comparing normalized versions
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