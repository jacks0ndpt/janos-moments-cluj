
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.move_image(uuid, double precision) from public, anon, authenticated;
revoke execute on function public.tg_delete_gallery_object() from public, anon, authenticated;
revoke execute on function public.tg_set_updated_at() from public, anon, authenticated;

grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.move_image(uuid, double precision) to authenticated, service_role;
