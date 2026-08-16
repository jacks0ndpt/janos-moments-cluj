CREATE TABLE public.same_day_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_names text NOT NULL,
  wedding_date date NOT NULL,
  message text,
  slug text NOT NULL UNIQUE,
  cover_image_id uuid,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.same_day_previews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.same_day_previews TO authenticated;
GRANT ALL ON public.same_day_previews TO service_role;

ALTER TABLE public.same_day_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published previews" ON public.same_day_previews
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins read all previews" ON public.same_day_previews
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write previews" ON public.same_day_previews
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER same_day_previews_set_updated_at
  BEFORE UPDATE ON public.same_day_previews
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.same_day_preview_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preview_id uuid NOT NULL REFERENCES public.same_day_previews(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  original_filename text,
  width integer,
  height integer,
  orientation public.image_orientation,
  file_size integer,
  position double precision NOT NULL DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX same_day_preview_images_preview_idx
  ON public.same_day_preview_images (preview_id, position);

GRANT SELECT ON public.same_day_preview_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.same_day_preview_images TO authenticated;
GRANT ALL ON public.same_day_preview_images TO service_role;

ALTER TABLE public.same_day_preview_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads images of published previews" ON public.same_day_preview_images
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.same_day_previews p
    WHERE p.id = same_day_preview_images.preview_id AND p.is_published = true
  ));
CREATE POLICY "Admins read all preview images" ON public.same_day_preview_images
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write preview images" ON public.same_day_preview_images
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.same_day_previews
  ADD CONSTRAINT same_day_previews_cover_image_fk
  FOREIGN KEY (cover_image_id) REFERENCES public.same_day_preview_images(id) ON DELETE SET NULL;