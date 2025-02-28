-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for common statuses and units
CREATE TYPE test_status AS ENUM ('normal', 'low', 'high', 'critical_low', 'critical_high');
CREATE TYPE report_status AS ENUM ('pending', 'processing', 'completed', 'error');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');

-- Create tables for the lab results schema
CREATE TABLE IF NOT EXISTS public.lab_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.biomarker_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS public.biomarker_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES biomarker_categories(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  decimal_places INTEGER DEFAULT 1,
  min_value NUMERIC,
  max_value NUMERIC,
  critical_low NUMERIC,
  critical_high NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(code)
);

CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES lab_providers(id),
  report_number TEXT,
  patient_id TEXT,
  specimen_id TEXT,
  test_date TIMESTAMP WITH TIME ZONE NOT NULL,
  report_date TIMESTAMP WITH TIME ZONE NOT NULL,
  fasting BOOLEAN,
  status report_status DEFAULT 'pending',
  error_message TEXT,
  pdf_url TEXT,
  file_path TEXT,
  raw_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.test_panels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS public.panel_biomarkers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID REFERENCES test_panels(id) ON DELETE CASCADE NOT NULL,
  biomarker_id UUID REFERENCES biomarker_definitions(id) ON DELETE CASCADE NOT NULL,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(panel_id, biomarker_id)
);

CREATE TABLE IF NOT EXISTS public.biomarker_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES lab_reports(id) ON DELETE CASCADE NOT NULL,
  biomarker_id UUID REFERENCES biomarker_definitions(id) NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  status test_status,
  reference_range_min NUMERIC,
  reference_range_max NUMERIC,
  previous_value NUMERIC,
  previous_date TIMESTAMP WITH TIME ZONE,
  flag TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(report_id, biomarker_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_lab_reports_user_id ON lab_reports(user_id);
CREATE INDEX idx_lab_reports_test_date ON lab_reports(test_date);
CREATE INDEX idx_biomarker_results_report_id ON biomarker_results(report_id);
CREATE INDEX idx_biomarker_results_biomarker_id ON biomarker_results(biomarker_id);

-- Set up Row Level Security (RLS)
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own lab reports"
  ON lab_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab reports"
  ON lab_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own biomarker results"
  ON biomarker_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM lab_reports
    WHERE lab_reports.id = biomarker_results.report_id
    AND lab_reports.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own biomarker results"
  ON biomarker_results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM lab_reports
    WHERE lab_reports.id = biomarker_results.report_id
    AND lab_reports.user_id = auth.uid()
  ));

