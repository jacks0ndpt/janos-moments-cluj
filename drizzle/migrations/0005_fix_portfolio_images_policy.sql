CREATE OR REPLACE FUNCTION public.is_portfolio_story(_story_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.gallery_stories s JOIN public.gallery_categories c ON c.id = s.category_id
    WHERE s.id = _story_id AND c.status = 'published');
$$;
GRANT EXECUTE ON FUNCTION public.is_portfolio_story(uuid) TO anon, authenticated;
DROP POLICY "Public reads portfolio images" ON public.gallery_images;
CREATE POLICY "Public reads portfolio images" ON public.gallery_images FOR SELECT TO anon, authenticated
USING (status = 'published'::gallery_status AND show_in_portfolio = true AND public.is_portfolio_story(story_id));