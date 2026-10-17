ALTER TABLE public.gallery_stories
  ADD COLUMN IF NOT EXISTS venue text,
  ADD COLUMN IF NOT EXISTS intro_ro text,
  ADD COLUMN IF NOT EXISTS intro_en text;