ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS mime_type text;
UPDATE public.gallery_images SET mime_type = 'image/jpeg' WHERE mime_type IS NULL;