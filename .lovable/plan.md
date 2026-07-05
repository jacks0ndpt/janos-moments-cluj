# Gallery Admin System — Final MVP Plan (v3, frozen)

Long-term data model stays **Categories → Stories → Images**, but the MVP admin workflow is **image-first by category**. Stories exist in the schema for future story pages; they're managed automatically behind the scenes.

## 1. Storage

Single public Supabase Storage bucket `gallery`. Flat paths: `<uuid>.<ext>`. DB stores only `storage_path`; public URLs built at read time. Wraps in `useImageUrl(path)` for future CDN swaps.

## 2. Database schema

### Enums
```sql
create type gallery_status as enum ('draft','published','archived');
create type image_orientation as enum ('landscape','portrait','square');
```

### `gallery_categories`
`id, slug, name_ro, name_en, position (double), status, created_at, updated_at`
Seeded: weddings, baptisms, couples.

### `gallery_stories`
`id, category_id (fk), slug, title_ro, title_en, location, event_date, cover_image_id (fk, nullable), position (double), is_featured, status, created_at, updated_at`

**Story handling for MVP (recommended):** `story_id` is **NOT NULL**. Every category has a single hidden `__default` story (title "Uncategorized", status='published', slug like `weddings-default`). Uploads without an explicit story are auto-assigned to that category's default story. This keeps queries uniform (no NULL branch), preserves the future story architecture, and never forces the admin to think about stories. Later, images can be moved from the default story into a real named story (e.g. "Ana & Mihai") from the admin — no schema change.

Rejected alternative: nullable `story_id`. It's simpler now but forces every future query to handle two paths (image with story / image without) and blocks story pages from covering all images uniformly.

### `gallery_images`
```text
id                uuid pk
story_id          uuid NOT NULL fk -> gallery_stories(id) on delete restrict
storage_path      text unique
original_filename text
width             int
height            int
orientation       image_orientation      -- auto: landscape/portrait/square
file_size         int
position          double precision       -- sparse: 1000, 2000, ...
status            gallery_status default 'draft'
is_favorite       boolean default false
alt_ro            text
alt_en            text
uploaded_by       uuid
created_at        timestamptz
updated_at        timestamptz
```
No captions in MVP.

### `homepage_featured`
`id, image_id (unique fk), position (double), created_at`. Independent ordering, unbounded size.

### `alt_templates` (new, small)
```text
id uuid pk
key text unique         -- 'wedding_ro', 'wedding_en', 'baptism_ro', ...
label text              -- shown in dropdown
language text           -- 'ro' | 'en'
category_id uuid fk nullable
body text
```
Seeded with:
- `wedding_ro` → "Fotografie de nuntă în Cluj-Napoca – moment autentic surprins natural"
- `baptism_ro` → "Fotografie de botez în Cluj-Napoca – moment de familie surprins natural"
- `wedding_en` → "Wedding photography in Cluj-Napoca – natural, real moments"
- `baptism_en` → "Baptism photography in Cluj-Napoca – natural family moments"
- `couples_ro`, `couples_en` → similar defaults

Editable from admin so wording can evolve without a deploy.

### `user_roles`
Separate table + `app_role` enum + `has_role(uid, role)` SECURITY DEFINER function. Your account bootstrapped as admin.

### Grants + RLS (summary)
All public tables: `SELECT` to `anon`/`authenticated`, `ALL` to `service_role`, write to `authenticated` guarded by `has_role('admin')`. Public SELECT policies restricted to `status='published'` rows. Storage bucket: public SELECT; write restricted to admin.

### Indexes
`categories(status, position)`, `stories(category_id, status, position)`, `images(story_id, status, position)`, `images(status)`, `images(is_favorite) where is_favorite`, `homepage_featured(position)`.

## 3. Ordering — sparse fractional positions

`double precision`, initial spacing 1000. Midpoint insertion via `move_image / move_story / move_category` RPCs. Automatic rebalance for a story when neighbour gap < 1e-4.

## 4. Public visibility rule

An image is publicly visible only when: **category.status='published' AND story.status='published' AND image.status='published'**. A SQL view `published_images_v` encapsulates this join so all public queries stay short.

## 5. Admin UI (`/admin`)

Protected by `has_role('admin')`. Structure:

```text
/admin
  /upload              category-first upload flow with defaults panel
  /gallery             flat image manager (main daily view) — filters + bulk
  /homepage            homepage featured manager
  /stories             stories list (secondary — for future named stories)
  /categories          rare — add/rename/reorder categories
  /alt-templates       edit alt templates
```

### /admin/upload — the primary workflow

**Step 1: Defaults panel** (top of screen, shown before drop):
- **Category** (required): Weddings / Baptisms / Couples / …
- **Story**: `Auto (default story for this category)` [default] · `Create new story…` · `Existing story…`
- **Status**: Draft [default] · Published · Archived
- **Alt RO template**: dropdown (populated from `alt_templates` filtered to lang=ro + optional category match) · or "None"
- **Alt EN template**: same for `en`
- **Add to homepage featured**: off [default]

**Step 2: Drop zone** — multi-file drop. For each file: upload to Storage, detect width/height/orientation client-side, insert row with all defaults applied. Alt fields get the template body verbatim (per-image edits allowed after upload).

**Step 3: Post-upload batch view** — grid of just-uploaded images with:
- Inline edit alt RO / alt EN, favorite toggle, remove-from-batch
- Batch actions: **Publish all in this batch**, Archive all, Apply different alt template, Add all to homepage featured, Assign to a real story
- "Missing alt" warning badge if any published image has empty alt_ro or alt_en

Batch is tracked client-side (the set of image ids created in this session) — no `upload_batch` DB column needed.

### /admin/gallery — daily management

- Filters (chips): **Category**, **Status** (draft/published/archived), **Favorites only**, **On homepage**, **Missing alt**
- No text search in MVP (postponed unless trivial; a filename `ILIKE` filter can be added in one line later)
- Multi-select (shift-range, cmd-toggle, select-all-visible)
- Per-card: favorite toggle (star icon), status pill, "on homepage" badge, drag handle, alt inline edit
- **Bulk action bar** (on selection):
  - Publish / Draft / **Archive**
  - Mark favorite / Unmark favorite
  - Add to homepage / Remove from homepage
  - Apply Alt RO template (dropdown) · Apply Alt EN template (dropdown)
  - Move to story (existing or new)
  - Change category (moves to the target category's default story unless a specific story is chosen)
  - **Delete permanently…** (see §6)

### /admin/stories — secondary

List of stories (default hidden ones dimmed). Click into a story to see its images, rename it, set cover, change position, **Publish story / Archive story** (one click flips story.status; combined with image statuses this cleanly hides/shows an entire shoot).

### /admin/homepage

Two columns: available published images (filtered / searchable by category) → featured set (drag-sortable). No hard cap.

### /admin/alt-templates

Simple CRUD list. Language + optional category + body. Used by upload defaults and bulk actions.

## 6. Delete UX

Delete button on an image (or in bulk bar) opens a two-option dialog:

- **Archive** [primary, default focused] — sets `status='archived'`. Hidden from public, visible in admin, storage file untouched.
- **Delete permanently** [destructive, requires typing "DELETE" to confirm] — removes the DB row and, via a Postgres trigger on `AFTER DELETE`, removes the object from `storage.objects`. Also removes any `homepage_featured` row (cascade).

Bulk delete goes through the same dialog with count shown.

## 7. Publish flows

- **Per image**: status dropdown on the card.
- **Batch publish** (right after upload): "Publish all N images in this batch" button on the post-upload screen — one UPDATE against the batch id set.
- **Story publish**: from `/admin/stories/:id`, one click sets `story.status='published'` **and** offers "Also publish all draft images in this story?" checkbox (default on). Same for archive.
- **Category publish**: rarely used; available on `/admin/categories`.

Public visibility still requires the three-level rule (category + story + image all published). Because default stories ship as `published`, the practical rule for daily use is: publish the image and it's live.

## 8. Migration from JSON

Phase A (backend up, site still on JSON):
1. Single migration: enums, four tables + `alt_templates`, RLS, grants, `user_roles`, `has_role`, triggers (updated_at, storage cleanup), seed 3 categories, 3 default stories (`status=published`, hidden from stories list via a `is_system` flag or slug convention `*-default`), seed 6 alt templates, bootstrap admin.
2. Bucket `gallery` (public) + storage.objects RLS.
3. Reordering RPCs.
4. Auth (email/password + Google) + `/admin` guard.
5. Admin UI: upload, gallery, homepage, stories, categories, alt-templates.
6. Seed script (local Node w/ service role): reads `public/portfolio/images.json`, uploads each file to `gallery/<uuid>.<ext>`, inserts into the matching category's default story with `status='published'`, `orientation` derived from dimensions, `alt_ro` = existing `alt`, `alt_en` = English template body, `position` = (index+1)*1000. Seed `homepage_featured` with the current 4.

Phase B (flip public reads):
- Rewrite `PortfolioSection`, `PortfolioCategorySection`, and homepage query to hit Cloud via `published_images_v`.
- Keep `public/portfolio/` for one release as rollback. Delete after a stable week.

`/portfolio/events` URL kept for SEO; resolved to DB slug `baptisms` in one place.

## 9. Final MVP phases (frozen scope)

**Phase 1 — Backend + Auth** (single approval)
- Migration (enums, tables, RLS, grants, RPCs, triggers, seeds, bootstrap admin)
- Storage bucket + policies
- Email/password + Google auth + `/admin` route guard

**Phase 2 — Admin UI**
- `/admin/upload` (category-first + defaults panel + alt templates + post-upload batch view)
- `/admin/gallery` (filters + bulk actions + archive-first delete)
- `/admin/homepage` (drag-order featured)
- `/admin/stories` (list, publish/archive whole story, move images between stories)
- `/admin/categories` and `/admin/alt-templates` (simple CRUD)

**Phase 3 — Public swap + JSON migration**
- Seed script imports JSON → DB
- Replace public gallery data source with Cloud queries via `published_images_v`
- Keep JSON as rollback for one release, then retire

**Phase 4 — Post-MVP (deferred, not built now)**
Search by filename/alt, named story pages (`/portfolio/weddings/ana-mihai`), tags, collections, WebP/responsive `srcset`, EXIF capture, analytics.

## 10. Confirmation of frozen decisions

- Data model: Categories → Stories → Images, with default stories per category (`story_id` NOT NULL).
- Statuses: `draft` / `published` / `archived` on categories, stories, images.
- Ordering: sparse `double precision` with midpoint insertion + auto rebalance.
- Public URL: never stored; always derived from `storage_path`.
- Orientation: enum auto-detected (`landscape` / `portrait` / `square`).
- Favorites: `is_favorite` boolean on images, separate from homepage featured.
- Alt: `alt_ro` + `alt_en` only; template-driven at upload; missing-alt warnings on published images.
- Delete: archive-first; permanent delete requires typed confirmation and removes the storage file.
- Batch publish: post-upload button + story-level publish/archive.
- No search, no captions, no tags, no collections in MVP.

Ready to implement once you approve.

## Open questions (only two remain)

1. **Admin login** — Google only, or Google + email/password? (Recommend both — email/password is a safety net if Google is unavailable.)
2. **Default status for newly uploaded images** — `draft` (safer; requires an explicit Publish action) or `published` (fastest workflow, batch is live immediately)? Recommend **draft**.