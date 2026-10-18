# Project architecture

- Stories editing uses the existing `gallery_stories` records and a nested admin editor route; this preserves category, image and publishing relationships instead of introducing a parallel content system.
- Story covers reference existing `gallery_images` IDs from the same story; selecting a cover never uploads or copies storage objects.
- Editorial Story text retains separate Romanian and English values to match the site's bilingual content model.
- The public Stories overview reads published existing gallery_stories and resolves covers through gallery_images IDs and the existing public URL helper; this preserves the single content and storage system.