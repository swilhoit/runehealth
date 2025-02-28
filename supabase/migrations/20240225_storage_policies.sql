-- First, ensure the storage schema exists
CREATE SCHEMA IF NOT EXISTS storage;

-- Create the labs bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
SELECT 'labs', 'labs'
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'labs');

-- Update bucket configuration
UPDATE storage.buckets
SET public = false,
    file_size_limit = 10485760, -- 10MB
    allowed_mime_types = ARRAY['application/pdf']
WHERE id = 'labs';

-- Enable Row Level Security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create policies for the labs bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'labs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'labs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'labs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'labs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;

-- Ensure the authenticated role has proper permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;

