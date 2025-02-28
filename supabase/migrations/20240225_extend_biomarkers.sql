-- Since we can see the tables already exist, let's just add new columns and data
-- First, let's add any missing columns to existing tables safely

-- Add columns to biomarker_definitions if they don't exist
DO $$ 
BEGIN
    ALTER TABLE biomarker_definitions 
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS decimal_places INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add columns to biomarker_results if they don't exist
DO $$ 
BEGIN
    ALTER TABLE biomarker_results 
        ADD COLUMN IF NOT EXISTS previous_value NUMERIC,
        ADD COLUMN IF NOT EXISTS previous_date TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS flag TEXT,
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add computed status column if it doesn't exist
DO $$ 
BEGIN 
    ALTER TABLE biomarker_results ADD COLUMN IF NOT EXISTS computed_status text
    GENERATED ALWAYS AS (
        CASE
            WHEN value < reference_range_min THEN 'low'
            WHEN value > reference_range_max THEN 'high'
            ELSE 'normal'
        END
    ) STORED;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_biomarker_results_value ON biomarker_results(value);
CREATE INDEX IF NOT EXISTS idx_biomarker_results_status ON biomarker_results(computed_status);
CREATE INDEX IF NOT EXISTS idx_biomarker_definitions_code ON biomarker_definitions(code);

-- Create or replace trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for timestamp updates if they don't exist
DO $$ 
BEGIN
    CREATE TRIGGER update_biomarker_definitions_updated_at
        BEFORE UPDATE ON biomarker_definitions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    CREATE TRIGGER update_biomarker_results_updated_at
        BEFORE UPDATE ON biomarker_results
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert or update reference ranges if they don't exist
INSERT INTO reference_ranges (
    biomarker_code,
    min_value,
    max_value,
    unit,
    gender,
    age_min,
    age_max
) VALUES 
    ('cholesterol', 125, 200, 'mg/dL', null, null, null),
    ('triglycerides', 0, 150, 'mg/dL', null, null, null),
    ('hdl', 40, 60, 'mg/dL', null, null, null),
    ('ldl', 0, 100, 'mg/dL', null, null, null),
    ('glucose', 70, 100, 'mg/dL', null, null, null),
    ('vitaminD', 30, 100, 'ng/mL', null, null, null),
    ('tsh', 0.4, 4.0, 'mIU/L', null, null, null),
    ('free_t4', 0.8, 1.8, 'ng/dL', null, null, null),
    ('free_t3', 2.3, 4.2, 'pg/mL', null, null, null),
    ('creatinine', 0.6, 1.2, 'mg/dL', null, null, null),
    ('alt', 7, 56, 'U/L', null, null, null),
    ('ast', 10, 40, 'U/L', null, null, null)
ON CONFLICT (biomarker_code) 
DO UPDATE SET 
    min_value = EXCLUDED.min_value,
    max_value = EXCLUDED.max_value,
    unit = EXCLUDED.unit;

-- Insert insights categories if they don't exist
INSERT INTO insights (
    category,
    type,
    description
) VALUES 
    ('lipids', 'observation', 'Cholesterol and triglyceride analysis'),
    ('thyroid', 'observation', 'Thyroid hormone analysis'),
    ('vitamins', 'observation', 'Vitamin level analysis'),
    ('metabolic', 'observation', 'Metabolic health markers'),
    ('liver', 'observation', 'Liver function analysis')
ON CONFLICT (category) DO NOTHING;

