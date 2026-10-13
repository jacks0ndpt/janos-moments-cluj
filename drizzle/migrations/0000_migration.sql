ALTER TABLE public.same_day_previews
  ADD COLUMN post_download_cta text NOT NULL DEFAULT 'off' CHECK (post_download_cta IN ('off','google_review','instagram')),
  ADD COLUMN post_download_message text;