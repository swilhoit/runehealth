-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create biomarker_categories table
CREATE TABLE IF NOT EXISTS biomarker_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create biomarker_definitions table
CREATE TABLE IF NOT EXISTS biomarker_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT REFERENCES biomarker_categories(name),
    unit TEXT,
    decimal_places INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create lab_reports table
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    report_date TIMESTAMP WITH TIME ZONE NOT NULL,
    lab_name TEXT,
    provider_name TEXT,
    notes TEXT,
    pdf_url TEXT,
    file_path TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create biomarker_results table
CREATE TABLE IF NOT EXISTS biomarker_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES lab_reports(id) ON DELETE CASCADE NOT NULL,
    biomarker_id UUID REFERENCES biomarker_definitions(id) NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    is_abnormal BOOLEAN,
    flag TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create reference_ranges table
CREATE TABLE IF NOT EXISTS reference_ranges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    biomarker_id UUID REFERENCES biomarker_definitions(id) NOT NULL,
    min_value NUMERIC,
    max_value NUMERIC,
    optimal_min NUMERIC,
    optimal_max NUMERIC,
    gender TEXT,
    min_age INTEGER,
    max_age INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create insights table
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES lab_reports(id) ON DELETE CASCADE NOT NULL,
    category TEXT,
    insight_type TEXT,
    content TEXT,
    priority INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lab_reports_user_id ON lab_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_biomarker_results_report_id ON biomarker_results(report_id);
CREATE INDEX IF NOT EXISTS idx_biomarker_results_biomarker_id ON biomarker_results(biomarker_id);
CREATE INDEX IF NOT EXISTS idx_reference_ranges_biomarker_id ON reference_ranges(biomarker_id);
CREATE INDEX IF NOT EXISTS idx_insights_report_id ON insights(report_id);

-- Create timestamp update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
DO $$ 
BEGIN
    CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    CREATE TRIGGER update_lab_reports_updated_at
        BEFORE UPDATE ON lab_reports
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

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

CREATE POLICY "Users can view own insights"
    ON insights FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM lab_reports
        WHERE lab_reports.id = insights.report_id
        AND lab_reports.user_id = auth.uid()
    ));

