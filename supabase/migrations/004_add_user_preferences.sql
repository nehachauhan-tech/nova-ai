-- Migration: Add JSONB preferences column to profiles

-- Add preferences column with a default empty object
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
