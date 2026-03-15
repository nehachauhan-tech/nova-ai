-- Migration: Storage RLS policies for chat-uploads bucket
-- PREREQUISITE: Create the "chat-uploads" bucket in the Supabase Dashboard first (Private, not public)

CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
