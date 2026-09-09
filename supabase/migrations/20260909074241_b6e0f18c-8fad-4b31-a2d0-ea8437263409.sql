CREATE TYPE public.project_type AS ENUM ('wedding','baptism','event','portrait','other');
CREATE TYPE public.delivery_mode AS ENUM ('preview','full','both');

ALTER TABLE public.same_day_previews
  ADD COLUMN project_type public.project_type NOT NULL DEFAULT 'wedding',
  ADD COLUMN delivery_mode public.delivery_mode NOT NULL DEFAULT 'preview',
  ADD COLUMN full_gallery_url text,
  ADD COLUMN cta_label text,
  ADD COLUMN available_until date;