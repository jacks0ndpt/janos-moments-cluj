import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { GalleryImagePicker } from '@/components/admin/GalleryImagePicker';
import { objectPosition, resolveImages, type ResolvedImage } from '@/lib/experiencePage';
import {
  defaultServicesConfig,
  loadServicesConfig,
  saveServicesConfig,
  type ServicesConfig,
} from '@/lib/servicesPage';
import {
  REVIEWS,
  SECTION_LABELS,
  SERVICES_SLOTS,
  SLOT_LABELS,
  type Lang,
  type ServicesContent,
  type ServicesSectionKey,
  type ServicesSlot,
  type ServicesSlotKey,
} from '@/content/servicesPage';

type Target = { slot: ServicesSlotKey; variant: 'desktop' | 'mobile' } | null;

const LANGS: Lang[] = ['ro', 'en'];

export default function AdminServices() {
  const [config, setConfig] = useState<ServicesConfig>(() => defaultServicesConfig());
  const [resolved, setResolved] = useState<Map<string, ResolvedImage>>(new Map());
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [target, setTarget] = useState<Target>(null);

  useEffect(() => {
    (async () => {
      const cfg = await loadServicesConfig();
      setConfig(cfg);
      const ids = Object.values(cfg.media).flatMap((s) => [s.imageId, s.mobileImageId]);
      setResolved(await resolveImages(ids));
      setLoading(false);
    })();
  }, []);

  const updateSlot = (key: ServicesSlotKey, patch: Partial<ServicesSlot>) =>
    setConfig((c) => ({ ...c, media: { ...c.media, [key]: { ...c.media[key], ...patch } } }));

  const updateContent = (lang: Lang, mutate: (draft: ServicesContent) => void) =>
    setConfig((c) => {
      const next = JSON.parse(JSON.stringify(c.content[lang])) as ServicesContent;
      mutate(next);
      return { ...c, content: { ...c.content, [lang]: next } };
    });

  /** Apply the same structural change (add/remove/move) to both languages. */
  const updateBoth = (mutate: (draft: ServicesContent) => void) =>
    setConfig((c) => {
      const next = JSON.parse(JSON.stringify(c.content)) as Record<Lang, ServicesContent>;
      LANGS.forEach((l) => mutate(next[l]));
      return { ...c, content: next };
    });

  const save = async () => {
    setStatus('saving');
    try {
      const saved = await saveServicesConfig(config);
      setConfig(saved);
      setStatus('saved');
      toast.success('Services page saved');
    } catch (e) {
      setStatus('error');
      toast.error(e instanceof Error ? e.message : 'Could not save');
    }
  };

  // ------------------------------------------------------------------ fields
  const Pair = ({
    label,
    multiline = true,
    get,
    set,
  }: {
    label: string;
    multiline?: boolean;
    get: (c: ServicesContent) => string;
    set: (c: ServicesContent, v: string) => void;
  }) => {
    const Field = multiline ? Textarea : Input;
    const id = label.replace(/\W+/g, '-').toLowerCase();
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LANGS.map((lang) => (
          <div key={lang} className="space-y-1">
            <Label htmlFor={`${id}-${lang}`} className="text-xs">
              {label} ({lang.toUpperCase()})
            </Label>
            <Field
              id={`${id}-${lang}`}
              value={get(config.content[lang])}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                updateContent(lang, (d) => set(d, e.target.value))
              }
            />
          </div>
        ))}
      </div>
    );
  };

  const ListEditor = ({
    label,
    get,
    blank = '',
  }: {
    label: string;
    get: (c: ServicesContent) => string[];
    blank?: string;
  }) => {
    const items = get(config.content.ro);
    const move = (i: number, dir: -1 | 1) => {
      const j = i + dir;
      if (j < 0 || j >= items.length) return;
      updateBoth((d) => {
        const arr = get(d);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      });
    };
    return (
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        {items.map((_, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <Pair
                label={`${label} ${i + 1}`}
                multiline={false}
                get={(c) => get(c)[i] ?? ''}
                set={(c, v) => {
                  get(c)[i] = v;
                }}
              />
            </div>
            <div className="flex gap-1 pb-0.5">
              <Button size="icon" variant="ghost" aria-label="Move up" onClick={() => move(i, -1)}>
                <ArrowUp size={14} />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Move down" onClick={() => move(i, 1)}>
                <ArrowDown size={14} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Remove"
                onClick={() => updateBoth((d) => get(d).splice(i, 1))}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateBoth((d) => get(d).push(blank))}
        >
          <Plus size={14} className="mr-1" /> Add item
        </Button>
      </div>
    );
  };

  const ImageSlotEditor = ({ slotKey }: { slotKey: ServicesSlotKey }) => {
    const slot = config.media[slotKey];
    const desktop = slot.imageId ? resolved.get(slot.imageId) : undefined;
    const mobile = slot.mobileImageId ? resolved.get(slot.mobileImageId) : undefined;
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
      </div>
    );
  };

  const SectionToggle = ({ sectionKey }: { sectionKey: ServicesSectionKey }) => (
    <div className="flex items-center gap-3">
      <Switch
        id={`enable-${sectionKey}`}
        checked={config.sectionsEnabled[sectionKey] !== false}
        onCheckedChange={(v) =>
          setConfig((c) => ({ ...c, sectionsEnabled: { ...c.sectionsEnabled, [sectionKey]: v } }))
        }
      />
      <Label htmlFor={`enable-${sectionKey}`} className="text-xs">Section visible on the page</Label>
    </div>
  );

  const moveSection = (i: number, dir: -1 | 1) =>
    setConfig((c) => {
      const order = [...c.sectionOrder];
      const j = i + dir;
      if (j < 0 || j >= order.length) return c;
      [order[i], order[j]] = [order[j], order[i]];
      return { ...c, sectionOrder: order };
    });

  const toggleReview = (id: string) =>
    updateBoth((d) => {
      const list = d.reviews.featured;
      const idx = list.indexOf(id);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(id);
    });

  const moveReview = (i: number, dir: -1 | 1) =>
    updateBoth((d) => {
      const list = d.reviews.featured;
      const j = i + dir;
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
    });

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  const featured = config.content.ro.reviews.featured;

  return (
    <div className="max-w-5xl space-y-10 pb-24">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Services Page</h1>
          <p className="text-sm text-muted-foreground">Pagina Servicii — content, images, order and SEO.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/services" target="_blank" rel="noreferrer">Preview page</a>
          </Button>
          <Button size="sm" onClick={save} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </header>

      {status === 'saved' && <p className="text-xs text-muted-foreground">Saved.</p>}
      {status === 'error' && <p className="text-xs text-destructive">Could not save. Try again.</p>}

      {/* Section order */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Section order</h2>
        <ul className="space-y-2">
          {config.sectionOrder.map((key, i) => (
            <li key={key} className="flex items-center gap-3 border rounded-md px-3 py-2">
              <span className="text-sm flex-1">{SECTION_LABELS[key]}</span>
              <span className="text-xs text-muted-foreground">
                {config.sectionsEnabled[key] === false ? 'Hidden' : 'Visible'}
              </span>
              <Button size="icon" variant="ghost" aria-label="Move up" onClick={() => moveSection(i, -1)}>
                <ArrowUp size={14} />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Move down" onClick={() => moveSection(i, 1)}>
                <ArrowDown size={14} />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      {/* Navigation labels */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">In-page navigation labels</h2>
        <Pair label="Service anchor" multiline={false} get={(c) => c.nav.service} set={(c, v) => (c.nav.service = v)} />
        <Pair label="Pricing anchor" multiline={false} get={(c) => c.nav.pricing} set={(c, v) => (c.nav.pricing = v)} />
        <Pair label="Process anchor" multiline={false} get={(c) => c.nav.process} set={(c, v) => (c.nav.process = v)} />
        <Pair label="Reviews anchor" multiline={false} get={(c) => c.nav.reviews} set={(c, v) => (c.nav.reviews = v)} />
        <Pair label="Questions anchor" multiline={false} get={(c) => c.nav.faq} set={(c, v) => (c.nav.faq = v)} />
      </section>

      <Separator />

      {/* 1. Hero */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">1. Hero</h2>
        <SectionToggle sectionKey="hero" />
        <ImageSlotEditor slotKey="hero" />
        <Pair label="Eyebrow" multiline={false} get={(c) => c.hero.label} set={(c, v) => (c.hero.label = v)} />
        <Pair label="Headline" get={(c) => c.hero.title} set={(c, v) => (c.hero.title = v)} />
        <Pair label="Supporting paragraph" get={(c) => c.hero.body} set={(c, v) => (c.hero.body = v)} />
        <Pair label="Price line" multiline={false} get={(c) => c.hero.price} set={(c, v) => (c.hero.price = v)} />
        <Pair label="Availability line" get={(c) => c.hero.availability} set={(c, v) => (c.hero.availability = v)} />
        <Pair label="Primary CTA label" multiline={false} get={(c) => c.hero.ctaLabel} set={(c, v) => (c.hero.ctaLabel = v)} />
        <Pair label="Primary CTA destination" multiline={false} get={(c) => c.hero.ctaHref} set={(c, v) => (c.hero.ctaHref = v)} />
        <Pair label="Secondary CTA label" multiline={false} get={(c) => c.hero.secondaryLabel} set={(c, v) => (c.hero.secondaryLabel = v)} />
        <Pair label="Secondary CTA destination" multiline={false} get={(c) => c.hero.secondaryHref} set={(c, v) => (c.hero.secondaryHref = v)} />
      </section>

      <Separator />

      {/* 2. Main service + deliverables */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">2. Main service</h2>
        <SectionToggle sectionKey="service" />
        <ImageSlotEditor slotKey="service" />
        <Pair label="Section label" multiline={false} get={(c) => c.service.label} set={(c, v) => (c.service.label = v)} />
        <Pair label="Title" multiline={false} get={(c) => c.service.title} set={(c, v) => (c.service.title = v)} />
        <Pair label="Introduction" get={(c) => c.service.intro} set={(c, v) => (c.service.intro = v)} />
        <ListEditor label="Service benefit" get={(c) => c.service.benefits} />
        <Separator />
        <h3 className="text-sm font-medium">3. Deliverables</h3>
        <Pair label="Deliverables title" multiline={false} get={(c) => c.service.deliverablesTitle} set={(c, v) => (c.service.deliverablesTitle = v)} />
        <ListEditor label="Visible deliverable" get={(c) => c.service.deliverables} />
        <Pair label="Expand button label" multiline={false} get={(c) => c.service.moreLabel} set={(c, v) => (c.service.moreLabel = v)} />
        <ListEditor label="Secondary detail" get={(c) => c.service.moreItems} />
      </section>

      <Separator />

      {/* 4. Pricing */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">4. Pricing</h2>
        <SectionToggle sectionKey="pricing" />
        <Pair label="Section label" multiline={false} get={(c) => c.pricing.label} set={(c, v) => (c.pricing.label = v)} />
        <Pair label="Title" multiline={false} get={(c) => c.pricing.title} set={(c, v) => (c.pricing.title = v)} />
        <Pair label="Starting price line" multiline={false} get={(c) => c.pricing.price} set={(c, v) => (c.pricing.price = v)} />
        <Pair label="Body" get={(c) => c.pricing.body} set={(c, v) => (c.pricing.body = v)} />
        <ListEditor label="Pricing factor" get={(c) => c.pricing.factors} />
        <Pair label="Note" get={(c) => c.pricing.note} set={(c, v) => (c.pricing.note = v)} />
        <Pair label="CTA label" multiline={false} get={(c) => c.pricing.ctaLabel} set={(c, v) => (c.pricing.ctaLabel = v)} />
        <Pair label="CTA destination" multiline={false} get={(c) => c.pricing.ctaHref} set={(c, v) => (c.pricing.ctaHref = v)} />
      </section>

      <Separator />

      {/* 5. Process */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">5. How we work together</h2>
        <SectionToggle sectionKey="process" />
        <Pair label="Section label" multiline={false} get={(c) => c.process.label} set={(c, v) => (c.process.label = v)} />
        <Pair label="Title" multiline={false} get={(c) => c.process.title} set={(c, v) => (c.process.title = v)} />
        {config.content.ro.process.steps.map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Step {i + 1}</p>
            <Pair label={`Step ${i + 1} number`} multiline={false} get={(c) => c.process.steps[i]?.step ?? ''} set={(c, v) => (c.process.steps[i].step = v)} />
            <Pair label={`Step ${i + 1} title`} multiline={false} get={(c) => c.process.steps[i]?.title ?? ''} set={(c, v) => (c.process.steps[i].title = v)} />
            <Pair label={`Step ${i + 1} text`} get={(c) => c.process.steps[i]?.body ?? ''} set={(c, v) => (c.process.steps[i].body = v)} />
          </div>
        ))}
        <Pair label="Expandable label" multiline={false} get={(c) => c.process.detailsLabel} set={(c, v) => (c.process.detailsLabel = v)} />
        <ListEditor label="Planning detail" get={(c) => c.process.detailsItems} />
      </section>

      <Separator />

      {/* 6. Reviews */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">6. Reviews</h2>
        <SectionToggle sectionKey="reviews" />
        <Pair label="Section label" multiline={false} get={(c) => c.reviews.label} set={(c, v) => (c.reviews.label = v)} />
        <Pair label="Title" multiline={false} get={(c) => c.reviews.title} set={(c, v) => (c.reviews.title = v)} />
        <Pair label="Review badge label" multiline={false} get={(c) => c.reviews.reviewLabel} set={(c, v) => (c.reviews.reviewLabel = v)} />
        <Pair label="All reviews link label" multiline={false} get={(c) => c.reviews.allReviews} set={(c, v) => (c.reviews.allReviews = v)} />

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Featured reviews (order matters)</p>
          {featured.map((id, i) => (
            <div key={id} className="flex items-center gap-3 border rounded-md px-3 py-2">
              <span className="text-sm flex-1">{REVIEWS.find((r) => r.id === id)?.name ?? id}</span>
              <Button size="icon" variant="ghost" aria-label="Move up" onClick={() => moveReview(i, -1)}>
                <ArrowUp size={14} />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Move down" onClick={() => moveReview(i, 1)}>
                <ArrowDown size={14} />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => toggleReview(id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-1">
            {REVIEWS.filter((r) => !featured.includes(r.id)).map((r) => (
              <Button key={r.id} size="sm" variant="outline" onClick={() => toggleReview(r.id)}>
                <Plus size={14} className="mr-1" /> {r.name}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Review wording comes from the real Google reviews and is not editable here.
          </p>
        </div>
      </section>

      <Separator />

      {/* 7. Additional services + 8. FAQ */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">7. Additional services &amp; FAQ</h2>
        <SectionToggle sectionKey="extras" />
        <Pair label="Section label" multiline={false} get={(c) => c.extras.label} set={(c, v) => (c.extras.label = v)} />
        <Pair label="Title" multiline={false} get={(c) => c.extras.title} set={(c, v) => (c.extras.title = v)} />
        <Pair label="Intro" get={(c) => c.extras.intro} set={(c, v) => (c.extras.intro = v)} />
        <ListEditor label="Additional service" get={(c) => c.extras.items} />
        <Pair label="Collaborating team note" get={(c) => c.extras.partnerNote} set={(c, v) => (c.extras.partnerNote = v)} />

        <Separator />
        <h3 className="text-sm font-medium">8. FAQ</h3>
        <Pair label="FAQ label" multiline={false} get={(c) => c.faq.label} set={(c, v) => (c.faq.label = v)} />
        <Pair label="FAQ title" multiline={false} get={(c) => c.faq.title} set={(c, v) => (c.faq.title = v)} />
        {config.content.ro.faq.items.map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Question {i + 1}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateBoth((d) => d.faq.items.splice(i, 1))}
              >
                <Trash2 size={14} className="mr-1" /> Remove
              </Button>
            </div>
            <Pair label={`Question ${i + 1}`} multiline={false} get={(c) => c.faq.items[i]?.q ?? ''} set={(c, v) => (c.faq.items[i].q = v)} />
            <Pair label={`Answer ${i + 1}`} get={(c) => c.faq.items[i]?.a ?? ''} set={(c, v) => (c.faq.items[i].a = v)} />
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateBoth((d) => d.faq.items.push({ q: '', a: '' }))}
        >
          <Plus size={14} className="mr-1" /> Add question
        </Button>
      </section>

      <Separator />

      {/* 9. Final CTA */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">9. Final CTA</h2>
        <SectionToggle sectionKey="finalCta" />
        <Pair label="Eyebrow" multiline={false} get={(c) => c.finalCta.label} set={(c, v) => (c.finalCta.label = v)} />
        <Pair label="Headline" get={(c) => c.finalCta.title} set={(c, v) => (c.finalCta.title = v)} />
        <Pair label="Body" get={(c) => c.finalCta.body} set={(c, v) => (c.finalCta.body = v)} />
        <Pair label="Primary CTA label" multiline={false} get={(c) => c.finalCta.ctaLabel} set={(c, v) => (c.finalCta.ctaLabel = v)} />
        <Pair label="Primary CTA destination" multiline={false} get={(c) => c.finalCta.ctaHref} set={(c, v) => (c.finalCta.ctaHref = v)} />
        <Pair label="Secondary link label" multiline={false} get={(c) => c.finalCta.secondaryLabel} set={(c, v) => (c.finalCta.secondaryLabel = v)} />
        <Pair label="Secondary link destination" multiline={false} get={(c) => c.finalCta.secondaryHref} set={(c, v) => (c.finalCta.secondaryHref = v)} />
      </section>

      <Separator />

      {/* 10. SEO */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">10. SEO metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LANGS.map((lang) => (
            <div key={lang} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor={`seo-title-${lang}`} className="text-xs">Title ({lang.toUpperCase()})</Label>
                <Input
                  id={`seo-title-${lang}`}
                  value={config.seo[lang].title}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, seo: { ...c.seo, [lang]: { ...c.seo[lang], title: e.target.value } } }))
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
          const slot = config.media[target.slot];
          if (target.variant === 'desktop') {
            updateSlot(target.slot, {
              imageId: img.id,
              altRo: slot.altRo || img.altRo,
              altEn: slot.altEn || img.altEn,
            });
          } else {
            updateSlot(target.slot, { mobileImageId: img.id });
          }
          setResolved((m) => {
            const next = new Map(m);
            next.set(img.id, {
              id: img.id,
              src: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/gallery/${img.storagePath}`,
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
