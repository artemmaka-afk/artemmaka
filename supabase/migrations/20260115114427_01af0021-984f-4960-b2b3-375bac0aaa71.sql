-- Create public bucket for AI tool logos
insert into storage.buckets (id, name, public)
values ('ai-logos', 'ai-logos', true)
on conflict (id) do nothing;

-- Public read access for AI logos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'AI logos are publicly readable'
  ) THEN
    CREATE POLICY "AI logos are publicly readable"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'ai-logos');
  END IF;
END $$;

-- Admin write access for AI logos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can upload AI logos'
  ) THEN
    CREATE POLICY "Admins can upload AI logos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'ai-logos' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can update AI logos'
  ) THEN
    CREATE POLICY "Admins can update AI logos"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'ai-logos' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can delete AI logos'
  ) THEN
    CREATE POLICY "Admins can delete AI logos"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'ai-logos' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;