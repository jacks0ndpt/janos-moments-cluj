import { useEffect, useState } from 'react';
import type { ServicesContent } from '@/content/servicesPage';

type Item = { id: string; label: string };

/**
 * Subtle sticky in-page anchor navigation. Scrolls smoothly, offsets the
 * sticky site header and highlights the section currently in view.
 * Mobile: single horizontally scrollable row (never a sidebar).
 */
const SectionNav = ({ nav, available }: { nav: ServicesContent['nav']; available: string[] }) => {
  const items: Item[] = [
    { id: 'service', label: nav.service },
    { id: 'pricing', label: nav.pricing },
    { id: 'process', label: nav.process },
    { id: 'reviews', label: nav.reviews },
    { id: 'faq', label: nav.faq },
  ].filter((i) => available.includes(i.id));

  const [active, setActive] = useState<string>('');

  useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.id).join(',')]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-[72px] md:top-[80px] z-30 bg-background/90 backdrop-blur-sm border-y border-border/60"
    >
      <div className="container-wide px-6 md:px-12 lg:px-20">
        <ul className="flex gap-6 md:gap-8 overflow-x-auto whitespace-nowrap py-3 scrollbar-none">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => go(e, item.id)}
                aria-current={active === item.id ? 'true' : undefined}
                className={`text-xs uppercase tracking-[0.16em] transition-colors ${
                  active === item.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default SectionNav;
