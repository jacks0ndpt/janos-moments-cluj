import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
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

const TestimonialsSection = () => {
  const { t, language } = useLanguage();
  const currentTestimonials = testimonials[language];

  return (
    <section className="section-padding bg-card">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl">
            {t('testimonials.title')}
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {currentTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative bg-background p-8 rounded-sm"
            >
              <Quote className="text-primary/20 absolute top-6 right-6" size={40} />
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
