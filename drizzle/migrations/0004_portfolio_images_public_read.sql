CREATE POLICY "Public reads portfolio images" ON public.gallery_images FOR SELECT TO anon, authenticated
USING (status = 'published'::gallery_status AND show_in_portfolio = true AND EXISTS (
  SELECT 1 FROM public.gallery_stories s JOIN public.gallery_categories c ON c.id = s.category_id
  WHERE s.id = gallery_images.story_id AND c.status = 'published'::gallery_status));
CREATE OR REPLACE FUNCTION public.portfolio_story_categories()
RETURNS TABLE(story_id uuid, story_position double precision, category_slug text, category_position double precision)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id, s.position, c.slug, c.position FROM public.gallery_stories s JOIN public.gallery_categories c ON c.id = s.category_id
  WHERE c.status = 'published' AND EXISTS (SELECT 1 FROM public.gallery_images i WHERE i.story_id = s.id AND i.status = 'published' AND i.show_in_portfolio);
$$;
GRANT EXECUTE ON FUNCTION public.portfolio_story_categories() TO anon, authenticated;