-- Add missing columns to biomarker_results if they don't exist
ALTER TABLE biomarker_results
ADD COLUMN IF NOT EXISTS reference_range_min NUMERIC,
ADD COLUMN IF NOT EXISTS reference_range_max NUMERIC,
ADD COLUMN IF NOT EXISTS optimal_min NUMERIC,
ADD COLUMN IF NOT EXISTS optimal_max NUMERIC;

-- Create a function to safely insert biomarker results
CREATE OR REPLACE FUNCTION insert_biomarker_result(
  p_report_id UUID,
  p_biomarker_id UUID,
  p_value NUMERIC,
  p_unit TEXT,
  p_min NUMERIC DEFAULT NULL,
  p_max NUMERIC DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO biomarker_results (
    report_id,
    biomarker_id,
    value,
    unit,
    reference_range_min,
    reference_range_max
  ) VALUES (
    p_report_id,
    p_biomarker_id,
    p_value,
    p_unit,
    p_min,
    p_max
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't raise exception
    RAISE NOTICE 'Error inserting biomarker result: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

