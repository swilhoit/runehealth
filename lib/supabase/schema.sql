-- RuneHealth Lab Report Analysis Schema
-- This file defines the database schema for the RuneHealth application
-- Run this in the Supabase SQL Editor to set up the necessary tables

-- Note: The original schema had a line to set anon.selected_schemas but this requires superuser privileges
-- and is not necessary for the core functionality. It has been removed.
-- Original line was: ALTER DATABASE postgres SET anon.selected_schemas = '{"public"}';

-- Drop existing tables if they exist (uncomment if needed for clean setup)
-- DROP TABLE IF EXISTS biomarkers;
-- DROP TABLE IF EXISTS lab_reports;

-- Create the lab_reports table
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,  -- 'processing', 'completed', 'failed'
    report_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    summary TEXT,
    health_score NUMERIC(3,1),
    doctor_name VARCHAR(100),
    patient_name VARCHAR(100),
    patient_dob DATE,
    lab_name VARCHAR(100),
    collection_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS lab_reports_user_id_idx ON lab_reports(user_id);

-- Create the biomarkers table
CREATE TABLE IF NOT EXISTS biomarkers (
    id SERIAL PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    unit VARCHAR(50),
    reference_range VARCHAR(100),
    category VARCHAR(100),
    flag VARCHAR(50),  -- 'High', 'Low', 'Normal', etc.
    in_range BOOLEAN,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS biomarkers_report_id_idx ON biomarkers(report_id);

-- Enable Row Level Security (RLS) for each table
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;

-- Create policies to control access to lab_reports table
-- Users can only see their own reports
CREATE POLICY lab_reports_select_policy ON lab_reports
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own reports
CREATE POLICY lab_reports_insert_policy ON lab_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own reports
CREATE POLICY lab_reports_update_policy ON lab_reports
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own reports
CREATE POLICY lab_reports_delete_policy ON lab_reports
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies to control access to biomarkers table
-- Users can only see biomarkers from their own reports
CREATE POLICY biomarkers_select_policy ON biomarkers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lab_reports
            WHERE lab_reports.id = biomarkers.report_id
            AND lab_reports.user_id = auth.uid()
        )
    );

-- Users can only insert biomarkers for their own reports
CREATE POLICY biomarkers_insert_policy ON biomarkers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM lab_reports
            WHERE lab_reports.id = biomarkers.report_id
            AND lab_reports.user_id = auth.uid()
        )
    );

-- Users can only update biomarkers from their own reports
CREATE POLICY biomarkers_update_policy ON biomarkers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM lab_reports
            WHERE lab_reports.id = biomarkers.report_id
            AND lab_reports.user_id = auth.uid()
        )
    );

-- Users can only delete biomarkers from their own reports
CREATE POLICY biomarkers_delete_policy ON biomarkers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM lab_reports
            WHERE lab_reports.id = biomarkers.report_id
            AND lab_reports.user_id = auth.uid()
        )
    );

-- Add a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_lab_reports_modtime
BEFORE UPDATE ON lab_reports
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 