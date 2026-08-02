CREATE TABLE public.experience_page (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton boolean NOT NULL DEFAULT true,
  is_enabled boolean NOT NULL DEFAULT true,
  teaser_enabled boolean NOT NULL DEFAULT true,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  slots jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT experience_page_singleton_true CHECK (singleton = true),
  CONSTRAINT experience_page_singleton_unique UNIQUE (singleton)
);

GRANT SELECT ON public.experience_page TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experience_page TO authenticated;
GRANT ALL ON public.experience_page TO service_role;

ALTER TABLE public.experience_page ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads experience page settings"
  ON public.experience_page FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins write experience page settings"
  ON public.experience_page FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER experience_page_set_updated_at
  BEFORE UPDATE ON public.experience_page
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();