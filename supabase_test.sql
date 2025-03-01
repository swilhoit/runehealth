-- Query to check biomarker definitions
SELECT 
  id, 
  name,
  code,
  category_id,
  unit,
  min_value,
  max_value
FROM biomarker_definitions
LIMIT 10; 