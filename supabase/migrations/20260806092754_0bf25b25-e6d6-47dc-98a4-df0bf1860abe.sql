CREATE TABLE public.services_page (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton boolean NOT NULL DEFAULT true,
  is_enabled boolean NOT NULL DEFAULT true,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  media jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  section_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX services_page_singleton_key ON public.services_page (singleton);

GRANT SELECT ON public.services_page TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services_page TO authenticated;
GRANT ALL ON public.services_page TO service_role;

ALTER TABLE public.services_page ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads services page settings"
  ON public.services_page FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins write services page settings"
  ON public.services_page FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER services_page_set_updated_at
  BEFORE UPDATE ON public.services_page
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.services_page (singleton) VALUES (true);