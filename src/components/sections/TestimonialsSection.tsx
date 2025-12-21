import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const testimonials = {
  en: [
    {
      id: 1,
      text: "Janos captured our wedding so naturally. Looking at the photos, we relive every emotion. He was invisible yet everywhere. We couldn't be happier.",
      author: "Maria & Andrei",
      location: "Cluj-Napoca",
    },
    {
      id: 2,
      text: "The photos feel like a film about our day. No awkward poses, just real moments. Janos has a gift for seeing the beauty in authentic emotions.",
      author: "Elena & Mihai",
      location: "Bran, Transylvania",
    },
    {
      id: 3,
      text: "We were nervous about having a photographer follow us around, but Janos made us forget he was there. The results speak for themselves.",
      author: "Ana & Cristian",
      location: "Sibiu",
    },
  ],
  ro: [
    {
      id: 1,
      text: "Janos a surprins nunta noastră atât de natural. Privind fotografiile, retrăim fiecare emoție. A fost invizibil și totuși pretutindeni. Nu puteam fi mai fericiți.",
      author: "Maria & Andrei",
      location: "Cluj-Napoca",
    },
    {
      id: 2,
      text: "Fotografiile par un film despre ziua noastră. Fără poze stângace, doar momente reale. Janos are darul de a vedea frumusețea în emoțiile autentice.",
      author: "Elena & Mihai",
      location: "Bran, Transilvania",
    },
    {
      id: 3,
      text: "Eram nervoși la ideea de a avea un fotograf care să ne urmărească, dar Janos ne-a făcut să uităm că e acolo. Rezultatele vorbesc de la sine.",
      author: "Ana & Cristian",
      location: "Sibiu",
    },
  ],
};

// Individual testimonial card with scroll animation
const TestimonialCard = ({ 
  testimonial, 
  index 
}: { 
  testimonial: { id: number; text: string; author: string; location: string }; 
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  
  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [60, 0]),
    springConfig
  );
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  
  const rotate = useSpring(
    useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? 3 : -3, 0]),
    springConfig
  );

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, rotateZ: rotate }}
      className="relative bg-background p-8 rounded-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
      >
        <Quote className="text-primary/20 absolute top-6 right-6" size={40} />
      </motion.div>
      <blockquote className="text-foreground leading-relaxed mb-6">
        "{testimonial.text}"
      </blockquote>
      <footer>
        <cite className="not-italic">
          <p className="font-medium text-foreground">{testimonial.author}</p>
          <p className="text-sm text-muted-foreground">{testimonial.location}</p>
        </cite>
      </footer>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const { t, language } = useLanguage();
  const currentTestimonials = testimonials[language];
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const headerY = useSpring(
    useTransform(scrollYProgress, [0, 0.5], [40, 0]),
    { stiffness: 100, damping: 30 }
  );

  return (
    <section ref={sectionRef} className="section-padding bg-card overflow-hidden">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          style={{ y: headerY }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="font-heading text-4xl md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('testimonials.title')}
          </motion.h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {currentTestimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
