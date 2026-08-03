revoke all on function public.set_image_positions(uuid[], double precision[]) from anon;
revoke all on function public.ensure_default_story(uuid) from anon;
grant execute on function public.set_image_positions(uuid[], double precision[]) to authenticated;
grant execute on function public.ensure_default_story(uuid) to authenticated;