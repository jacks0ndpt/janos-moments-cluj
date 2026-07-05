
-- =========================================================
-- Gallery Admin System v3 — Phase 1 backend
-- =========================================================

-- ---------- ENUMS ----------
create type public.gallery_status as enum ('draft','published','archived');
create type public.image_orientation as enum ('landscape','portrait','square');
create type public.app_role as enum ('admin','user');

-- ---------- updated_at helper ----------
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- USER ROLES ----------
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users read own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create policy "Admins read all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------- CATEGORIES ----------
create table public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ro text not null,
  name_en text not null,
  position double precision not null default 1000,
  status public.gallery_status not null default 'published',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.gallery_categories to anon, authenticated;
grant all on public.gallery_categories to service_role;
grant insert, update, delete on public.gallery_categories to authenticated;

alter table public.gallery_categories enable row level security;

create policy "Public reads published categories"
  on public.gallery_categories for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins read all categories"
  on public.gallery_categories for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins write categories"
  on public.gallery_categories for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger set_updated_at_categories
  before update on public.gallery_categories
  for each row execute function public.tg_set_updated_at();

create index gallery_categories_status_position_idx
  on public.gallery_categories (status, position);

-- ---------- STORIES ----------
create table public.gallery_stories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.gallery_categories(id) on delete restrict,
  slug text not null unique,
  title_ro text not null,
  title_en text not null,
  location text,
  event_date date,
  cover_image_id uuid,
  position double precision not null default 1000,
  is_featured boolean not null default false,
  status public.gallery_status not null default 'draft',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.gallery_stories to anon, authenticated;
grant all on public.gallery_stories to service_role;
grant insert, update, delete on public.gallery_stories to authenticated;

alter table public.gallery_stories enable row level security;

create policy "Public reads published stories"
  on public.gallery_stories for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins read all stories"
  on public.gallery_stories for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins write stories"
  on public.gallery_stories for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger set_updated_at_stories
  before update on public.gallery_stories
  for each row execute function public.tg_set_updated_at();

create index gallery_stories_category_status_position_idx
  on public.gallery_stories (category_id, status, position);

-- ---------- IMAGES ----------
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.gallery_stories(id) on delete restrict,
  storage_path text not null unique,
  original_filename text,
  width integer,
  height integer,
  orientation public.image_orientation,
  file_size integer,
  position double precision not null default 1000,
  status public.gallery_status not null default 'draft',
  is_favorite boolean not null default false,
  alt_ro text,
  alt_en text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.gallery_images to anon, authenticated;
grant all on public.gallery_images to service_role;
grant insert, update, delete on public.gallery_images to authenticated;

alter table public.gallery_images enable row level security;

-- public visibility: image published AND parent story published AND parent category published
create policy "Public reads visible images"
  on public.gallery_images for select
  to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.gallery_stories s
      join public.gallery_categories c on c.id = s.category_id
      where s.id = gallery_images.story_id
        and s.status = 'published'
        and c.status = 'published'
    )
  );

create policy "Admins read all images"
  on public.gallery_images for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins write images"
  on public.gallery_images for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger set_updated_at_images
  before update on public.gallery_images
  for each row execute function public.tg_set_updated_at();

create index gallery_images_story_status_position_idx
  on public.gallery_images (story_id, status, position);
create index gallery_images_status_idx on public.gallery_images (status);
create index gallery_images_favorite_idx on public.gallery_images (is_favorite) where is_favorite;

-- add fk from stories.cover_image_id -> images.id (deferred because of circular reference)
alter table public.gallery_stories
  add constraint gallery_stories_cover_image_fk
  foreign key (cover_image_id) references public.gallery_images(id) on delete set null;

-- ---------- HOMEPAGE FEATURED ----------
create table public.homepage_featured (
  id uuid primary key default gen_random_uuid(),
  image_id uuid not null unique references public.gallery_images(id) on delete cascade,
  position double precision not null default 1000,
  created_at timestamptz not null default now()
);

grant select on public.homepage_featured to anon, authenticated;
grant all on public.homepage_featured to service_role;
grant insert, update, delete on public.homepage_featured to authenticated;

alter table public.homepage_featured enable row level security;

create policy "Public reads homepage featured"
  on public.homepage_featured for select
  to anon, authenticated
  using (true);

create policy "Admins write homepage featured"
  on public.homepage_featured for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create index homepage_featured_position_idx on public.homepage_featured (position);

-- ---------- ALT TEMPLATES ----------
create table public.alt_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  language text not null check (language in ('ro','en')),
  category_id uuid references public.gallery_categories(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.alt_templates to authenticated;
grant all on public.alt_templates to service_role;
grant insert, update, delete on public.alt_templates to authenticated;

alter table public.alt_templates enable row level security;

create policy "Authenticated read alt templates"
  on public.alt_templates for select
  to authenticated
  using (true);

create policy "Admins write alt templates"
  on public.alt_templates for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger set_updated_at_alt_templates
  before update on public.alt_templates
  for each row execute function public.tg_set_updated_at();

-- ---------- REORDER RPC ----------
create or replace function public.move_image(
  _image_id uuid,
  _new_position double precision
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not authorized';
  end if;
  update public.gallery_images
    set position = _new_position
    where id = _image_id;
end;
$$;

-- ---------- STORAGE OBJECT DELETION TRIGGER ----------
-- When an image row is permanently deleted, remove the underlying storage object.
create or replace function public.tg_delete_gallery_object()
returns trigger
language plpgsql
security definer
set search_path = public, storage
as $$
begin
  delete from storage.objects
    where bucket_id = 'gallery' and name = old.storage_path;
  return old;
end;
$$;

create trigger delete_gallery_object
  after delete on public.gallery_images
  for each row execute function public.tg_delete_gallery_object();

-- ---------- STORAGE OBJECT POLICIES ----------
-- Public read
create policy "Public read gallery objects"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery');

create policy "Admins upload gallery objects"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update gallery objects"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete gallery objects"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));

-- ---------- SEED CATEGORIES ----------
insert into public.gallery_categories (slug, name_ro, name_en, position, status) values
  ('weddings', 'Nunți', 'Weddings', 1000, 'published'),
  ('baptisms', 'Botezuri', 'Baptisms', 2000, 'published'),
  ('couples',  'Cupluri', 'Couples',  3000, 'published');

-- ---------- SEED DEFAULT STORIES (one per category, hidden/system) ----------
insert into public.gallery_stories (category_id, slug, title_ro, title_en, position, status, is_system)
select c.id, c.slug || '-default', 'Necategorizat', 'Uncategorized', 1000, 'published', true
from public.gallery_categories c;

-- ---------- SEED ALT TEMPLATES ----------
insert into public.alt_templates (key, label, language, category_id, body) values
  ('wedding_ro', 'Wedding — RO', 'ro', (select id from public.gallery_categories where slug='weddings'),
   'Fotografie de nuntă în Cluj-Napoca – moment autentic surprins natural'),
  ('wedding_en', 'Wedding — EN', 'en', (select id from public.gallery_categories where slug='weddings'),
   'Wedding photography in Cluj-Napoca – natural, real moments'),
  ('baptism_ro', 'Baptism — RO', 'ro', (select id from public.gallery_categories where slug='baptisms'),
   'Fotografie de botez în Cluj-Napoca – moment de familie surprins natural'),
  ('baptism_en', 'Baptism — EN', 'en', (select id from public.gallery_categories where slug='baptisms'),
   'Baptism photography in Cluj-Napoca – natural family moments'),
  ('couples_ro', 'Couples — RO', 'ro', (select id from public.gallery_categories where slug='couples'),
   'Ședință foto de cuplu în Cluj-Napoca – moment natural surprins autentic'),
  ('couples_en', 'Couples — EN', 'en', (select id from public.gallery_categories where slug='couples'),
   'Couples photography in Cluj-Napoca – natural, authentic moments');
