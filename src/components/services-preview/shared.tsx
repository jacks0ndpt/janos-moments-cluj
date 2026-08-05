import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CTA, type Lang } from '@/content/servicesPreview';

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
};

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <motion.p
    {...fadeUp}
    className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4"
  >
    {children}
  </motion.p>
);

interface CtaGroupProps {
  lang: Lang;
  showSecondary?: boolean;
  className?: string;
}

/** All CTA wording lives in src/content/servicesPreview.ts (CTA). */
export const CtaGroup = ({ lang, showSecondary = true, className }: CtaGroupProps) => {
  const cta = CTA[lang];
  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className ?? ''}`}>
      <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
        <Link to={cta.primaryHref}>{cta.primary}</Link>
      </Button>
      {showSecondary && (
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link to={cta.secondaryHref}>{cta.secondary}</Link>
        </Button>
      )}
    </div>
  );
};
