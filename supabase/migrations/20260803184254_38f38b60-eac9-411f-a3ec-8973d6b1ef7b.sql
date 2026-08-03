-- 1. Remove trigger/function that deletes directly from storage.objects
drop trigger if exists delete_gallery_object on public.gallery_images;
drop function if exists public.tg_delete_gallery_object();

-- 2. Bulk position update (admin only)
create or replace function public.set_image_positions(_ids uuid[], _positions double precision[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not authorized';
  end if;
  if array_length(_ids, 1) is distinct from array_length(_positions, 1) then
    raise exception 'ids and positions length mismatch';
  end if;
  update public.gallery_images gi
     set position = v.pos
    from (
      select unnest(_ids) as id, unnest(_positions) as pos
    ) v
   where gi.id = v.id;
end;
$$;

-- 3. Ensure a default/system story exists for a category (admin only)
create or replace function public.ensure_default_story(_category_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _story_id uuid;
  _slug text;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not authorized';
  end if;

  select id into _story_id
    from public.gallery_stories
   where category_id = _category_id and is_system
   order by position
   limit 1;

  if _story_id is not null then
    return _story_id;
  end if;

  select slug into _slug from public.gallery_categories where id = _category_id;
  if _slug is null then
    raise exception 'category not found';
  end if;

  insert into public.gallery_stories
    (category_id, slug, title_ro, title_en, status, is_system, position)
  values
    (_category_id, _slug || '-default', 'Implicit', 'Default', 'published', true, 0)
  returning id into _story_id;

  return _story_id;
end;
$$;