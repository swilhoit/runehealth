-- Add reference range columns to biomarker_results if they don't exist
DO $$ 
BEGIN
    -- First check if columns exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'biomarker_results' 
        AND column_name = 'reference_range_min'
    ) THEN
        ALTER TABLE biomarker_results 
        ADD COLUMN reference_range_min NUMERIC;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'biomarker_results' 
        AND column_name = 'reference_range_max'
    ) THEN
        ALTER TABLE biomarker_results 
        ADD COLUMN reference_range_max NUMERIC;
    END IF;

    -- Add optimal range columns as well
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'biomarker_results' 
        AND column_name = 'optimal_range_min'
    ) THEN
        ALTER TABLE biomarker_results 
        ADD COLUMN optimal_range_min NUMERIC;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'biomarker_results' 
        AND column_name = 'optimal_range_max'
    ) THEN
        ALTER TABLE biomarker_results 
        ADD COLUMN optimal_range_max NUMERIC;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'biomarker_results' 
        AND column_name = 'status'
    ) THEN
        -- Create enum type if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_type 
            WHERE typname = 'biomarker_status'
        ) THEN
            CREATE TYPE biomarker_status AS ENUM ('normal', 'low', 'high', 'critical_low', 'critical_high');
        END IF;

        ALTER TABLE biomarker_results 
        ADD COLUMN status biomarker_status;
    END IF;

    -- Add computed status column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'biomarker_results' 
        AND column_name = 'computed_status'
    ) THEN
        ALTER TABLE biomarker_results 
        ADD COLUMN computed_status TEXT 
        GENERATED ALWAYS AS (
            CASE
                WHEN value < reference_range_min THEN 'low'
                WHEN value > reference_range_max THEN 'high'
                ELSE 'normal'
            END
        ) STORED;
    END IF;

EXCEPTION
    WHEN duplicate_column THEN 
        RAISE NOTICE 'Column already exists, skipping...';
END $$;

-- Create an index on the computed status if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_biomarker_results_status 
ON biomarker_results(computed_status);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

