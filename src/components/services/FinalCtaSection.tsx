import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SectionLabel, fadeUp } from './shared';
import type { ServicesContent } from '@/content/servicesPage';

const FinalCtaSection = ({ copy }: { copy: ServicesContent['finalCta'] }) => (
  <section className="section-padding bg-card overflow-hidden">
    <div className="container-narrow text-center">
      {copy.label && <SectionLabel>{copy.label}</SectionLabel>}
      <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl mb-5">
        {copy.title}
      </motion.h2>
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.08 }}
        className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8"
      >
        {copy.body}
      </motion.p>
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.14 }}
        className="flex flex-col items-center gap-4"
      >
        <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
          <Link to={copy.ctaHref}>{copy.ctaLabel}</Link>
        </Button>
        {copy.secondaryLabel && copy.secondaryHref && (
          <Link
            to={copy.secondaryHref}
            className="text-sm underline underline-offset-4 text-muted-foreground hover:text-primary transition-colors"
          >
            {copy.secondaryLabel}
          </Link>
        )}
      </motion.div>
    </div>
  </section>
);

export default FinalCtaSection;
