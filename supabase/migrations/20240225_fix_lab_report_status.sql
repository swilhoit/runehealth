-- Create enum for lab report status if it doesn't exist
DO $$ 
BEGIN
    CREATE TYPE lab_report_status AS ENUM (
        'pending',
        'processing',
        'analyzing',
        'completed',
        'error'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Modify the lab_reports table to use the enum
ALTER TABLE lab_reports 
    ALTER COLUMN status TYPE lab_report_status 
    USING status::lab_report_status;

-- Add check constraint
ALTER TABLE lab_reports
    DROP CONSTRAINT IF EXISTS lab_reports_status_check;

ALTER TABLE lab_reports
    ADD CONSTRAINT lab_reports_status_check 
    CHECK (status IN ('pending', 'processing', 'analyzing', 'completed', 'error'));

-- Set default value
ALTER TABLE lab_reports
    ALTER COLUMN status SET DEFAULT 'pending'::lab_report_status;

