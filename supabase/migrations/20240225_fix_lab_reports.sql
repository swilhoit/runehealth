-- Add missing columns to lab_reports table
ALTER TABLE IF EXISTS lab_reports
  ADD COLUMN IF NOT EXISTS test_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS lab_name TEXT,
  ADD COLUMN IF NOT EXISTS provider_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update existing records to have a test_date if they don't have one
UPDATE lab_reports 
SET test_date = report_date 
WHERE test_date IS NULL;

-- Make test_date required for future records
ALTER TABLE lab_reports 
  ALTER COLUMN test_date SET NOT NULL;

