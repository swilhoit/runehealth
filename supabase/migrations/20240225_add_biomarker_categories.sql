-- First, create the enum type for biomarker categories if it doesn't exist
DO $$ 
BEGIN
    CREATE TYPE biomarker_category AS ENUM (
        'complete_blood_count',
        'metabolic_panel',
        'lipid_panel',
        'thyroid_panel',
        'vitamin_panel',
        'hormone_panel',
        'liver_panel',
        'kidney_panel',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the biomarker_definitions table has the correct column type
DO $$ 
BEGIN
    -- First, drop the category column if it exists
    ALTER TABLE biomarker_definitions DROP COLUMN IF EXISTS category;
    
    -- Then add it back with the correct enum type
    ALTER TABLE biomarker_definitions 
        ADD COLUMN category biomarker_category DEFAULT 'other';
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- Create biomarker categories if they don't exist
INSERT INTO biomarker_categories (name, description) 
VALUES 
    ('complete_blood_count', 'Complete Blood Count measurements'),
    ('metabolic_panel', 'Basic and Comprehensive Metabolic Panel tests'),
    ('lipid_panel', 'Cholesterol and lipid measurements'),
    ('thyroid_panel', 'Thyroid function tests'),
    ('vitamin_panel', 'Vitamin level measurements'),
    ('hormone_panel', 'Hormone level tests'),
    ('liver_panel', 'Liver function tests'),
    ('kidney_panel', 'Kidney function tests'),
    ('other', 'Other biomarkers')
ON CONFLICT (name) DO NOTHING;

-- Insert common biomarker definitions with their categories
DO $$
DECLARE
    complete_blood_count_id UUID;
    metabolic_panel_id UUID;
    lipid_panel_id UUID;
    thyroid_panel_id UUID;
    vitamin_panel_id UUID;
    liver_panel_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO complete_blood_count_id FROM biomarker_categories WHERE name = 'complete_blood_count';
    SELECT id INTO metabolic_panel_id FROM biomarker_categories WHERE name = 'metabolic_panel';
    SELECT id INTO lipid_panel_id FROM biomarker_categories WHERE name = 'lipid_panel';
    SELECT id INTO thyroid_panel_id FROM biomarker_categories WHERE name = 'thyroid_panel';
    SELECT id INTO vitamin_panel_id FROM biomarker_categories WHERE name = 'vitamin_panel';
    SELECT id INTO liver_panel_id FROM biomarker_categories WHERE name = 'liver_panel';

    -- Insert biomarker definitions
    INSERT INTO biomarker_definitions 
        (code, name, category, category_id, unit, min_value, max_value, description)
    VALUES 
        -- Complete Blood Count
        ('wbc', 'White Blood Cell Count', 'complete_blood_count', complete_blood_count_id, 
            'K/uL', 4.5, 11.0, 'White blood cells help fight infection'),
        ('rbc', 'Red Blood Cell Count', 'complete_blood_count', complete_blood_count_id,
            'M/uL', 4.2, 5.8, 'Red blood cells carry oxygen'),
        ('hgb', 'Hemoglobin', 'complete_blood_count', complete_blood_count_id,
            'g/dL', 13.5, 17.5, 'Protein in red blood cells that carries oxygen'),
        ('hct', 'Hematocrit', 'complete_blood_count', complete_blood_count_id,
            '%', 38.8, 50.0, 'Percentage of blood volume that is red blood cells'),
        
        -- Metabolic Panel
        ('glucose', 'Glucose', 'metabolic_panel', metabolic_panel_id,
            'mg/dL', 70, 100, 'Blood sugar level'),
        ('bun', 'Blood Urea Nitrogen', 'metabolic_panel', metabolic_panel_id,
            'mg/dL', 7, 20, 'Kidney function test'),
        ('creatinine', 'Creatinine', 'metabolic_panel', metabolic_panel_id,
            'mg/dL', 0.6, 1.2, 'Kidney function test'),
        
        -- Lipid Panel
        ('cholesterol', 'Total Cholesterol', 'lipid_panel', lipid_panel_id,
            'mg/dL', 125, 200, 'Total cholesterol level'),
        ('triglycerides', 'Triglycerides', 'lipid_panel', lipid_panel_id,
            'mg/dL', 0, 150, 'Type of fat in blood'),
        ('hdl', 'HDL Cholesterol', 'lipid_panel', lipid_panel_id,
            'mg/dL', 40, 60, 'Good cholesterol'),
        ('ldl', 'LDL Cholesterol', 'lipid_panel', lipid_panel_id,
            'mg/dL', 0, 100, 'Bad cholesterol'),
        
        -- Thyroid Panel
        ('tsh', 'Thyroid Stimulating Hormone', 'thyroid_panel', thyroid_panel_id,
            'mIU/L', 0.4, 4.0, 'Thyroid function test'),
        ('t4', 'Thyroxine', 'thyroid_panel', thyroid_panel_id,
            'ug/dL', 4.5, 12.0, 'Thyroid hormone'),
        ('t3', 'Triiodothyronine', 'thyroid_panel', thyroid_panel_id,
            'ng/dL', 80, 200, 'Thyroid hormone'),
        
        -- Vitamin Panel
        ('vitaminD', 'Vitamin D', 'vitamin_panel', vitamin_panel_id,
            'ng/mL', 30, 100, 'Vitamin D level'),
        ('vitaminB12', 'Vitamin B12', 'vitamin_panel', vitamin_panel_id,
            'pg/mL', 200, 900, 'Vitamin B12 level'),
        
        -- Liver Panel
        ('alt', 'Alanine Aminotransferase', 'liver_panel', liver_panel_id,
            'U/L', 7, 56, 'Liver enzyme'),
        ('ast', 'Aspartate Aminotransferase', 'liver_panel', liver_panel_id,
            'U/L', 10, 40, 'Liver enzyme')
    ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        category_id = EXCLUDED.category_id,
        unit = EXCLUDED.unit,
        min_value = EXCLUDED.min_value,
        max_value = EXCLUDED.max_value,
        description = EXCLUDED.description;
END $$;

-- Create an index on the code column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_biomarker_definitions_code ON biomarker_definitions(code);

