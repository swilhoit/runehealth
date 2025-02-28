-- Insert biomarker definitions if they don't exist
INSERT INTO biomarker_definitions (code, name, unit, min_value, max_value, description)
VALUES 
  ('cholesterol', 'Total Cholesterol', 'mg/dL', 125, 200, 'Total cholesterol level'),
  ('triglycerides', 'Triglycerides', 'mg/dL', 0, 150, 'Type of fat in blood'),
  ('hdl', 'HDL Cholesterol', 'mg/dL', 40, 60, 'Good cholesterol'),
  ('ldl', 'LDL Cholesterol', 'mg/dL', 0, 100, 'Bad cholesterol'),
  ('glucose', 'Glucose', 'mg/dL', 70, 100, 'Blood sugar level'),
  ('vitaminD', 'Vitamin D', 'ng/mL', 30, 100, 'Vitamin D level')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  unit = EXCLUDED.unit,
  min_value = EXCLUDED.min_value,
  max_value = EXCLUDED.max_value,
  description = EXCLUDED.description;

