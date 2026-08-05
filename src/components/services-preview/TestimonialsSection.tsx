import { motion } from 'framer-motion';
import { Quote, Star, ExternalLink } from 'lucide-react';
import { SectionLabel, fadeUp } from './shared';
import {
  TESTIMONIALS,
  GOOGLE_REVIEWS_URL,
  type ServicesCopy,
} from '@/content/servicesPreview';

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5" role="img" aria-label={`${rating}/5`}>
    {Array.from({ length: rating }).map((_, i) => (
      <Star key={i} size={14} className="text-primary fill-current" aria-hidden="true" />
    ))}
  </div>
);

const TestimonialsSection = ({ copy }: { copy: ServicesCopy['testimonials'] }) => (
  <section className="section-padding overflow-hidden">
    <div className="container-wide">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <SectionLabel>{copy.label}</SectionLabel>
        <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl lg:text-5xl">
          {copy.title}
        </motion.h2>
      </div>

      {/* Reviews are shown in their original language and never translated. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
        {TESTIMONIALS.map((item, i) => (
          <motion.figure
            key={item.name}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.08 * i }}
            className="relative bg-card border border-border rounded-sm p-6 md:p-8 flex flex-col"
          >
            <Quote className="text-primary/20 absolute top-5 right-5" size={32} aria-hidden="true" />
            <blockquote className="leading-relaxed mb-6 flex-1">"{item.quote}"</blockquote>
            <figcaption>
              <p className="font-medium">{item.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <Stars rating={item.rating} />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {copy.reviewLabel}
                </span>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.2 }}
        className="text-center mt-10"
      >
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm underline underline-offset-4 hover:text-primary transition-colors"
        >
          {copy.allReviews}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </motion.div>
    </div>
  </section>
);

export default TestimonialsSection;
