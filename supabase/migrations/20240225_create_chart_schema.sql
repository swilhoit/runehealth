-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for chart configurations
CREATE TYPE chart_type AS ENUM ('line', 'bar', 'scatter', 'gauge');
CREATE TYPE chart_period AS ENUM ('day', 'week', 'month', 'year', 'all');

-- Create table for chart configurations
CREATE TABLE IF NOT EXISTS chart_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    biomarker_id UUID REFERENCES biomarker_definitions(id),
    chart_type chart_type DEFAULT 'line',
    time_period chart_period DEFAULT 'month',
    show_reference_range BOOLEAN DEFAULT true,
    show_trend_line BOOLEAN DEFAULT true,
    custom_min_value NUMERIC,
    custom_max_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, biomarker_id)
);

-- Create table for chart data caching
CREATE TABLE IF NOT EXISTS chart_data_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    biomarker_id UUID REFERENCES biomarker_definitions(id),
    time_period chart_period,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(user_id, biomarker_id, time_period)
);

-- Create table for reference ranges if it doesn't exist
CREATE TABLE IF NOT EXISTS reference_ranges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    biomarker_id UUID REFERENCES biomarker_definitions(id),
    min_value NUMERIC NOT NULL,
    max_value NUMERIC NOT NULL,
    optimal_min NUMERIC,
    optimal_max NUMERIC,
    unit TEXT NOT NULL,
    gender TEXT,
    age_min INTEGER,
    age_max INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_chart_config_user ON chart_configurations(user_id);
CREATE INDEX idx_chart_config_biomarker ON chart_configurations(biomarker_id);
CREATE INDEX idx_chart_cache_user ON chart_data_cache(user_id);
CREATE INDEX idx_chart_cache_biomarker ON chart_data_cache(biomarker_id);
CREATE INDEX idx_chart_cache_expires ON chart_data_cache(expires_at);
CREATE INDEX idx_reference_ranges_biomarker ON reference_ranges(biomarker_id);

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_chart_config_timestamp
    BEFORE UPDATE ON chart_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reference_ranges_timestamp
    BEFORE UPDATE ON reference_ranges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE chart_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_ranges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own chart configurations"
    ON chart_configurations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own chart configurations"
    ON chart_configurations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own chart cache"
    ON chart_data_cache FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own chart cache"
    ON chart_data_cache FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow public read access to reference ranges"
    ON reference_ranges FOR SELECT
    TO authenticated
    USING (true);

-- Insert common reference ranges
INSERT INTO reference_ranges (biomarker_id, min_value, max_value, optimal_min, optimal_max, unit) 
SELECT 
    bd.id,
    CASE bd.code
        WHEN 'cholesterol' THEN 125
        WHEN 'triglycerides' THEN 0
        WHEN 'hdl' THEN 40
        WHEN 'ldl' THEN 0
        WHEN 'glucose' THEN 70
        WHEN 'vitaminD' THEN 30
    END as min_value,
    CASE bd.code
        WHEN 'cholesterol' THEN 200
        WHEN 'triglycerides' THEN 150
        WHEN 'hdl' THEN 60
        WHEN 'ldl' THEN 100
        WHEN 'glucose' THEN 100
        WHEN 'vitaminD' THEN 100
    END as max_value,
    CASE bd.code
        WHEN 'cholesterol' THEN 150
        WHEN 'triglycerides' THEN 50
        WHEN 'hdl' THEN 45
        WHEN 'ldl' THEN 50
        WHEN 'glucose' THEN 80
        WHEN 'vitaminD' THEN 40
    END as optimal_min,
    CASE bd.code
        WHEN 'cholesterol' THEN 180
        WHEN 'triglycerides' THEN 100
        WHEN 'hdl' THEN 55
        WHEN 'ldl' THEN 80
        WHEN 'glucose' THEN 90
        WHEN 'vitaminD' THEN 80
    END as optimal_max,
    bd.unit
FROM biomarker_definitions bd
WHERE bd.code IN ('cholesterol', 'triglycerides', 'hdl', 'ldl', 'glucose', 'vitaminD')
ON CONFLICT DO NOTHING;

-- Create a view for chart data
CREATE OR REPLACE VIEW chart_data AS
SELECT 
    br.id,
    br.report_id,
    br.biomarker_id,
    bd.code as biomarker_code,
    bd.name as biomarker_name,
    br.value,
    br.unit,
    br.is_abnormal,
    rr.min_value as reference_min,
    rr.max_value as reference_max,
    rr.optimal_min,
    rr.optimal_max,
    lr.test_date,
    lr.user_id
FROM biomarker_results br
JOIN lab_reports lr ON br.report_id = lr.id
JOIN biomarker_definitions bd ON br.biomarker_id = bd.id
LEFT JOIN reference_ranges rr ON br.biomarker_id = rr.biomarker_id;

-- Grant necessary permissions
GRANT SELECT ON chart_data TO authenticated;

