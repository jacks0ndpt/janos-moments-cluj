import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { GalleryImagePicker } from '@/components/admin/GalleryImagePicker';
import { publicUrl } from '@/lib/portfolioSource';
import {
  defaultConfig,
  loadExperienceConfig,
  objectPosition,
  resolveImages,
  saveExperienceConfig,
  type ExperienceConfig,
  type ResolvedImage,
} from '@/lib/experiencePage';
import {
  SLOT_LABELS,
  type ExperienceContent,
  type ExperienceSlot,
  type ExperienceSlotKey,
  type Lang,
} from '@/content/experience';

const PAGE_SLOTS: ExperienceSlotKey[] = ['hero', 'intro', 'before', 'during', 'plansChange', 'present', 'closing'];

type Target = { slot: ExperienceSlotKey; variant: 'desktop' | 'mobile' } | null;

export default function AdminExperience() {
  const [config, setConfig] = useState<ExperienceConfig>(() => defaultConfig());
  const [resolved, setResolved] = useState<Map<string, ResolvedImage>>(new Map());
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [target, setTarget] = useState<Target>(null);

  useEffect(() => {
    (async () => {
      const cfg = await loadExperienceConfig();
      setConfig(cfg);
      const ids = Object.values(cfg.slots).flatMap((s) => [s.imageId, s.mobileImageId]);
      setResolved(await resolveImages(ids));
      setLoading(false);
    })();
  }, []);

  const updateSlot = (key: ExperienceSlotKey, patch: Partial<ExperienceSlot>) =>
    setConfig((c) => ({ ...c, slots: { ...c.slots, [key]: { ...c.slots[key], ...patch } } }));

  const updateContent = (lang: Lang, mutate: (draft: ExperienceContent) => void) =>
    setConfig((c) => {
      const next = JSON.parse(JSON.stringify(c.content[lang])) as ExperienceContent;
      mutate(next);
      return { ...c, content: { ...c.content, [lang]: next } };
    });

  const save = async () => {
    setStatus('saving');
    try {
      const saved = await saveExperienceConfig(config);
      setConfig(saved);
      setStatus('saved');
      toast.success('Experience page saved');
    } catch (e) {
      setStatus('error');
      toast.error(e instanceof Error ? e.message : 'Could not save');
    }
  };

  const srcOf = (id: string | null) => (id ? resolved.get(id) : undefined);

  const ImageSlotEditor = ({ slotKey }: { slotKey: ExperienceSlotKey }) => {
    const slot = config.slots[slotKey];
    const desktop = srcOf(slot.imageId);
    const mobile = srcOf(slot.mobileImageId);
    return (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-sm">{SLOT_LABELS[slotKey].en}</h3>
            <p className="text-xs text-muted-foreground">{SLOT_LABELS[slotKey].ro}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setTarget({ slot: slotKey, variant: 'desktop' })}>
              {slot.imageId ? 'Replace image' : 'Choose image'}
            </Button>
            {slot.imageId && (
              <Button size="sm" variant="ghost" onClick={() => updateSlot(slotKey, { imageId: null })}>
                Remove
              </Button>
            )}
          </div>
        </div>

        {slot.imageId && !desktop?.available && (
          <p className="text-xs text-destructive">
            This image is no longer published or has been deleted — the page falls back to a featured image. Pick a new one.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Desktop */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Desktop</p>
            <div className="aspect-[4/5] max-h-56 overflow-hidden rounded-md bg-muted">
              {desktop?.src && (
                <img
                  src={desktop.src}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ objectPosition: objectPosition(slot.focal) }}
                />
              )}
            </div>
            <FocalControls
              idPrefix={`${slotKey}-desktop`}
              value={slot.focal}
              onChange={(focal) => updateSlot(slotKey, { focal })}
            />
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Mobile</p>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setTarget({ slot: slotKey, variant: 'mobile' })}>
                  {slot.mobileImageId ? 'Replace' : 'Optional image'}
                </Button>
                {slot.mobileImageId && (
                  <Button size="sm" variant="ghost" onClick={() => updateSlot(slotKey, { mobileImageId: null })}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div className="aspect-[4/5] max-h-56 overflow-hidden rounded-md bg-muted">
              {(mobile?.src ?? desktop?.src) && (
                <img
                  src={mobile?.src ?? desktop?.src}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ objectPosition: objectPosition(slot.mobileFocal) }}
                />
              )}
            </div>
            <FocalControls
              idPrefix={`${slotKey}-mobile`}
              value={slot.mobileFocal}
              onChange={(mobileFocal) => updateSlot(slotKey, { mobileFocal })}
            />
            {!slot.mobileImageId && (
              <p className="text-xs text-muted-foreground">
                No mobile image selected — the desktop image is reused with this mobile focal point.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${slotKey}-alt-ro`} className="text-xs">Alt text (RO)</Label>
            <Input
              id={`${slotKey}-alt-ro`}
              value={slot.altRo}
              onChange={(e) => updateSlot(slotKey, { altRo: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${slotKey}-alt-en`} className="text-xs">Alt text (EN)</Label>
            <Input
              id={`${slotKey}-alt-en`}
              value={slot.altEn}
              onChange={(e) => updateSlot(slotKey, { altEn: e.target.value })}
            />
          </div>
        </div>
        {(!slot.altRo || !slot.altEn) && !slot.decorative && (
          <p className="text-xs text-amber-600">Add alt text in both languages for accessibility.</p>
        )}
      </div>
    );
  };

  const Pair = ({
    label,
    multiline = true,
    get,
    set,
  }: {
    label: string;
    multiline?: boolean;
    get: (c: ExperienceContent) => string;
    set: (c: ExperienceContent, v: string) => void;
  }) => {
    const Field = multiline ? Textarea : Input;
    const id = label.replace(/\W+/g, '-').toLowerCase();
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor={`${id}-ro`} className="text-xs">{label} (RO)</Label>
          <Field
            id={`${id}-ro`}
            value={get(config.content.ro)}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              updateContent('ro', (d) => set(d, e.target.value))
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${id}-en`} className="text-xs">{label} (EN)</Label>
          <Field
            id={`${id}-en`}
            value={get(config.content.en)}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              updateContent('en', (d) => set(d, e.target.value))
            }
          />
        </div>
      </div>
    );
  };

  const blockKeys = useMemo(
    () => [
      { key: 'before' as const, title: 'Before the wedding' },
      { key: 'during' as const, title: 'During the wedding' },
      { key: 'plansChange' as const, title: 'When plans change' },
      { key: 'present' as const, title: 'Remain present' },
    ],
    []
  );

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-5xl space-y-10 pb-24">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Experience Page</h1>
          <p className="text-sm text-muted-foreground">Pagina Experiența — content, images and SEO.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/experience" target="_blank" rel="noreferrer">Preview page</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/ro/experience" target="_blank" rel="noreferrer">Preview RO</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/en/experience" target="_blank" rel="noreferrer">Preview EN</a>
          </Button>
          <Button size="sm" onClick={save} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </header>

      {status === 'saved' && <p className="text-xs text-muted-foreground">Saved.</p>}
      {status === 'error' && <p className="text-xs text-destructive">Could not save. Try again.</p>}

      {/* Publication */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Publication</h2>
        <div className="flex items-center gap-3">
          <Switch
            id="page-enabled"
            checked={config.isEnabled}
            onCheckedChange={(v) => setConfig((c) => ({ ...c, isEnabled: v }))}
          />
          <Label htmlFor="page-enabled">Experience page enabled</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="teaser-enabled"
            checked={config.teaserEnabled}
            onCheckedChange={(v) => setConfig((c) => ({ ...c, teaserEnabled: v }))}
          />
          <Label htmlFor="teaser-enabled">Homepage teaser enabled</Label>
        </div>
      </section>

      <Separator />

      {/* Images */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Page images</h2>
        <div className="space-y-4">
          {PAGE_SLOTS.map((key) => (
            <ImageSlotEditor key={key} slotKey={key} />
          ))}
        </div>
      </section>

      <Separator />

      {/* Copy */}
      <section className="space-y-8">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Page copy</h2>

        <div className="space-y-4">
          <h3 className="font-medium text-sm">1. Hero</h3>
          <Pair label="Hero label" multiline={false} get={(c) => c.hero.label} set={(c, v) => (c.hero.label = v)} />
          <Pair label="Hero heading" get={(c) => c.hero.heading} set={(c, v) => (c.hero.heading = v)} />
          <Pair label="Hero body" get={(c) => c.hero.body} set={(c, v) => (c.hero.body = v)} />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm">2. Introduction</h3>
          <Pair label="Intro paragraph 1" get={(c) => c.intro.p1} set={(c, v) => (c.intro.p1 = v)} />
          <Pair label="Intro paragraph 2" get={(c) => c.intro.p2} set={(c, v) => (c.intro.p2 = v)} />
          <Pair label="Intro paragraph 3" get={(c) => c.intro.p3} set={(c, v) => (c.intro.p3 = v)} />
          <Pair label="Intro paragraph 4" get={(c) => c.intro.p4} set={(c, v) => (c.intro.p4 = v)} />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm">3–6. What experience changes</h3>
          <Pair
            label="Section heading"
            multiline={false}
            get={(c) => c.blocksHeading}
            set={(c, v) => (c.blocksHeading = v)}
          />
          {blockKeys.map(({ key, title }) => (
            <div key={key} className="space-y-3 border rounded-lg p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
              <Pair
                label={`${title} heading`}
                multiline={false}
                get={(c) => c.blocks[key].h}
                set={(c, v) => (c.blocks[key].h = v)}
              />
              <Pair label={`${title} body`} get={(c) => c.blocks[key].b} set={(c, v) => (c.blocks[key].b = v)} />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm">7. Practical value</h3>
          <Pair
            label="Practical heading"
            multiline={false}
            get={(c) => c.practical.heading}
            set={(c, v) => (c.practical.heading = v)}
          />
          {config.content.ro.practical.items.map((_, i) => (
            <Pair
              key={i}
              label={`Practical item ${i + 1}`}
              multiline={false}
              get={(c) => c.practical.items[i] ?? ''}
              set={(c, v) => {
                c.practical.items[i] = v;
              }}
            />
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm">8. Guidance without taking over</h3>
          <Pair
            label="Boundaries heading"
            multiline={false}
            get={(c) => c.boundaries.heading}
            set={(c, v) => (c.boundaries.heading = v)}
          />
          <Pair label="Boundaries body" get={(c) => c.boundaries.body} set={(c, v) => (c.boundaries.body = v)} />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm">9. Closing CTA</h3>
          <Pair label="Closing line 1" get={(c) => c.closing.line1} set={(c, v) => (c.closing.line1 = v)} />
          <Pair label="Closing line 2" get={(c) => c.closing.line2} set={(c, v) => (c.closing.line2 = v)} />
          <Pair label="Closing line 3" get={(c) => c.closing.line3} set={(c, v) => (c.closing.line3 = v)} />
          <Pair label="Closing CTA" multiline={false} get={(c) => c.closing.cta} set={(c, v) => (c.closing.cta = v)} />
        </div>
      </section>

      <Separator />

      {/* Homepage teaser */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">10. Homepage teaser</h2>
        <ImageSlotEditor slotKey="teaser" />
        <Pair label="Teaser label" multiline={false} get={(c) => c.teaser.label} set={(c, v) => (c.teaser.label = v)} />
        <Pair label="Teaser heading" get={(c) => c.teaser.heading} set={(c, v) => (c.teaser.heading = v)} />
        <Pair label="Teaser body" get={(c) => c.teaser.body} set={(c, v) => (c.teaser.body = v)} />
        <Pair label="Teaser CTA" multiline={false} get={(c) => c.teaser.cta} set={(c, v) => (c.teaser.cta = v)} />
      </section>

      <Separator />

      {/* SEO */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">11. SEO metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['ro', 'en'] as Lang[]).map((lang) => (
            <div key={lang} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor={`seo-title-${lang}`} className="text-xs">Title ({lang.toUpperCase()})</Label>
                <Input
                  id={`seo-title-${lang}`}
                  value={config.seo[lang].title}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      seo: { ...c.seo, [lang]: { ...c.seo[lang], title: e.target.value } },
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`seo-desc-${lang}`} className="text-xs">Description ({lang.toUpperCase()})</Label>
                <Textarea
                  id={`seo-desc-${lang}`}
                  value={config.seo[lang].description}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      seo: { ...c.seo, [lang]: { ...c.seo[lang], description: e.target.value } },
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 bg-background/95 border-t py-4 flex justify-end">
        <Button onClick={save} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <GalleryImagePicker
        open={!!target}
        onOpenChange={(v) => !v && setTarget(null)}
        onSelect={(img) => {
          if (!target) return;
          const slot = config.slots[target.slot];
          if (target.variant === 'desktop') {
            updateSlot(target.slot, {
              imageId: img.id,
              altRo: slot.altRo || img.altRo,
              altEn: slot.altEn || img.altEn,
            });
          } else {
            updateSlot(target.slot, { mobileImageId: img.id });
          }
          setResolved((prev) => {
            const next = new Map(prev);
            next.set(img.id, {
              id: img.id,
              src: publicUrl(img.storagePath),
              width: null,
              height: null,
              available: true,
            });
            return next;
          });
          setTarget(null);
        }}
      />
    </div>
  );
}

function FocalControls({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: { x: number; y: number };
  onChange: (v: { x: number; y: number }) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-x`} className="text-xs">Horizontal {value.x}%</Label>
        <input
          id={`${idPrefix}-x`}
          type="range"
          min={0}
          max={100}
          value={value.x}
          onChange={(e) => onChange({ ...value, x: Number(e.target.value) })}
          className="w-full"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-y`} className="text-xs">Vertical {value.y}%</Label>
        <input
          id={`${idPrefix}-y`}
          type="range"
          min={0}
          max={100}
          value={value.y}
          onChange={(e) => onChange({ ...value, y: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}
