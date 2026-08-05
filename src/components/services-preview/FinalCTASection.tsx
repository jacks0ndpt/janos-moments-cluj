import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CtaGroup, fadeUp } from './shared';
import type { ServicesCopy, Lang } from '@/content/servicesPreview';

interface Props {
  copy: ServicesCopy['finalCta'];
  links: ServicesCopy['links'];
  lang: Lang;
}

const FinalCTASection = ({ copy, links, lang }: Props) => (
  <section className="section-padding overflow-hidden">
    <div className="container-narrow text-center">
      <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl lg:text-5xl mb-5">
        {copy.title}
      </motion.h2>
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8"
      >
        {copy.body}
      </motion.p>
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.18 }}>
        <CtaGroup lang={lang} className="justify-center" />
      </motion.div>

      <nav aria-label={links.label} className="mt-12 pt-8 border-t border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
          {links.label}
        </p>
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.items.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="text-sm underline underline-offset-4 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </section>
);

export default FinalCTASection;
