-- =========================================================================
-- SUPABASE SCHEMA - MEDITAILOR APP
-- Keep this file safe for future reference or if you need to recreate the DB
-- =========================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT NOT NULL,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS medical_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  medical_condition TEXT NOT NULL,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS search_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 2. Security Configuration: Row Level Security (RLS)
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous form submissions (INSERT)
CREATE POLICY "Enable insert for anonymous users" ON contacts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable insert for anonymous users" ON medical_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable insert for anonymous users" ON search_logs FOR INSERT TO anon WITH CHECK (true);

-- Allow frontend to read back the generated ID right after insertion (SELECT)
CREATE POLICY "Enable select for anonymous users" ON contacts FOR SELECT TO anon USING (true);
CREATE POLICY "Enable select for anonymous users" ON medical_requests FOR SELECT TO anon USING (true);
CREATE POLICY "Enable select for anonymous users" ON search_logs FOR SELECT TO anon USING (true);

-- =========================================================================
-- 3. File Storage Configuration (For Medical Documents)
-- =========================================================================

-- Create the storage bucket and make it public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical_documents', 'medical_documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous users to upload document files
CREATE POLICY "Allow public uploads" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'medical_documents');

-- Allow anonymous users to read uploaded document files
CREATE POLICY "Allow public read" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'medical_documents');
