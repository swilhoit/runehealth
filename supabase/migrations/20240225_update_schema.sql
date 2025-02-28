-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE test_status AS ENUM ('normal', 'low', 'high', 'critical_low', 'critical_high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update biomarker_definitions table
DO $$ BEGIN
    ALTER TABLE biomarker_definitions
        ADD COLUMN IF NOT EXISTS category_id UUID,
        ADD COLUMN IF NOT EXISTS code TEXT,
        ADD COLUMN IF NOT EXISTS name TEXT,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS unit TEXT,
        ADD COLUMN IF NOT EXISTS decimal_places INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS min_value NUMERIC,
        ADD COLUMN IF NOT EXISTS max_value NUMERIC,
        ADD COLUMN IF NOT EXISTS critical_low NUMERIC,
        ADD COLUMN IF NOT EXISTS critical_high NUMERIC,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

    -- Add constraints if they don't exist
    ALTER TABLE biomarker_definitions 
        ADD CONSTRAINT IF NOT EXISTS biomarker_definitions_code_key UNIQUE (code);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Update biomarker_results table
DO $$ BEGIN
    ALTER TABLE biomarker_results
        ADD COLUMN IF NOT EXISTS report_id UUID,
        ADD COLUMN IF NOT EXISTS biomarker_id UUID,
        ADD COLUMN IF NOT EXISTS value NUMERIC,
        ADD COLUMN IF NOT EXISTS unit TEXT,
        ADD COLUMN IF NOT EXISTS status test_status,
        ADD COLUMN IF NOT EXISTS reference_range_min NUMERIC,
        ADD COLUMN IF NOT EXISTS reference_range_max NUMERIC,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

    -- Add foreign key constraints if they don't exist
    ALTER TABLE biomarker_results 
        ADD CONSTRAINT IF NOT EXISTS biomarker_results_report_id_fkey 
        FOREIGN KEY (report_id) REFERENCES lab_reports(id) ON DELETE CASCADE;

    ALTER TABLE biomarker_results 
        ADD CONSTRAINT IF NOT EXISTS biomarker_results_biomarker_id_fkey 
        FOREIGN KEY (biomarker_id) REFERENCES biomarker_definitions(id);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Update lab_reports table
DO $$ BEGIN
    ALTER TABLE lab_reports
        ADD COLUMN IF NOT EXISTS user_id UUID,
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS report_date TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS test_date TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS error_message TEXT,
        ADD COLUMN IF NOT EXISTS pdf_url TEXT,
        ADD COLUMN IF NOT EXISTS file_path TEXT,
        ADD COLUMN IF NOT EXISTS raw_data JSONB,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

    -- Add foreign key constraint if it doesn't exist
    ALTER TABLE lab_reports 
        ADD CONSTRAINT IF NOT EXISTS lab_reports_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_lab_reports_user_id ON lab_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_status ON lab_reports(status);
CREATE INDEX IF NOT EXISTS idx_biomarker_results_report_id ON biomarker_results(report_id);
CREATE INDEX IF NOT EXISTS idx_biomarker_results_biomarker_id ON biomarker_results(biomarker_id);
CREATE INDEX IF NOT EXISTS idx_biomarker_definitions_code ON biomarker_definitions(code);

-- Update or create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for timestamp updates
DO $$ BEGIN
    CREATE TRIGGER update_lab_reports_updated_at
        BEFORE UPDATE ON lab_reports
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_biomarker_results_updated_at
        BEFORE UPDATE ON biomarker_results
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_biomarker_definitions_updated_at
        BEFORE UPDATE ON biomarker_definitions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable Row Level Security
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_definitions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own lab reports"
    ON lab_reports FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab reports"
    ON lab_reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own biomarker results"
    ON biomarker_results FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM lab_reports
        WHERE lab_reports.id = biomarker_results.report_id
        AND lab_reports.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own biomarker results"
    ON biomarker_results FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM lab_reports
        WHERE lab_reports.id = biomarker_results.report_id
        AND lab_reports.user_id = auth.uid()
    ));

CREATE POLICY "Allow public read access to biomarker definitions"
    ON biomarker_definitions FOR SELECT
    TO authenticated
    USING (true);

