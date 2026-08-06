import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
};

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <motion.p
    {...fadeUp}
    className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4"
  >
    {children}
  </motion.p>
);

/** Internal links use react-router; anything external falls back to <a>. */
const isInternal = (href: string) => href.startsWith('/');

export const CtaButtons = ({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  className,
}: {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}) => (
  <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${className ?? ''}`}>
    <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
      {isInternal(primaryHref) ? (
        <Link to={primaryHref}>{primaryLabel}</Link>
      ) : (
        <a href={primaryHref}>{primaryLabel}</a>
      )}
    </Button>
    {secondaryLabel && secondaryHref && (
      <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
        {isInternal(secondaryHref) ? (
          <Link to={secondaryHref}>{secondaryLabel}</Link>
        ) : (
          <a href={secondaryHref}>{secondaryLabel}</a>
        )}
      </Button>
    )}
  </div>
);

/**
 * Lightweight accessible disclosure used for secondary details.
 * Uses <details>/<summary> so the content stays reachable without JavaScript.
 */
export const Disclosure = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <details className={`group border-t border-border pt-4 ${className ?? ''}`}>
    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
      <span>{label}</span>
      <span aria-hidden="true" className="transition-transform group-open:rotate-45 text-base leading-none">
        +
      </span>
    </summary>
    <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-300">{children}</div>
  </details>
);
