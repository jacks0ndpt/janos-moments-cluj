import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import contactImage from '@/assets/fotograf-nunta-cluj-emotii-miri-contact.jpg';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContactFormProps {
  isFullPage?: boolean;
}

const ContactForm = ({ isFullPage = false }: ContactFormProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventType, setEventType] = useState<string>('');
  const sectionRef = useRef<HTMLElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const showForm = false;
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const { scrollYProgress: infoScrollProgress } = useScroll({
    target: infoRef,
    offset: isMobile ? ['start 0.95', 'start 0.6'] : ['start end', 'center center'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

  // Reduce horizontal offset on mobile to prevent content being cut off
  const infoX = useSpring(
    useTransform(infoScrollProgress, [0, 1], [isMobile ? -20 : -60, 0]),
    springConfig
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const formValues = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      eventType: eventType,
      date: formData.get('date') as string,
      location: formData.get('location') as string,
      message: formData.get('message') as string,
      language: language,
    };

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formValues,
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      if (!data?.success) {
        const errorMessage = data?.details?.join(', ') || data?.error || 'Failed to send message';
        throw new Error(errorMessage);
      }

      toast({
        title: language === 'en' ? 'Message sent!' : 'Mesaj trimis!',
        description: t('contact.success'),
      });
      
      (e.target as HTMLFormElement).reset();
      setEventType('');
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' 
          ? 'Failed to send your message. Please try again or contact us directly.'
          : 'Mesajul nu a putut fi trimis. Vă rugăm încercați din nou sau contactați-ne direct.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@janoshada.com',
      href: 'mailto:janos.hada2@gmail.com',
    },
    {
      icon: Phone,
      label: language === 'en' ? 'Phone' : 'Telefon',
      value: '+40 747 447 701',
      href: 'tel:+40747447701',
    },
    {
      icon: MapPin,
      label: language === 'en' ? 'Based in' : 'Locație',
      value: 'Cluj-Napoca, Romania',
      href: null,
    },
  ];

  return (
    <section ref={sectionRef} className={`section-padding ${isFullPage ? 'pt-32' : 'bg-card'} overflow-hidden`}>
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Info */}
          <motion.div
            ref={infoRef}
            style={{ x: infoX }}
          >
            <motion.h2 
              className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6"
              initial={{ opacity: 0, y: isMobile ? 15 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: isMobile ? "0px 0px -50px 0px" : "0px" }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {t('contact.title')}
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-lg mb-8 leading-relaxed"
              initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: isMobile ? "0px 0px -50px 0px" : "0px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t('contact.intro')}
            </motion.p>

            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: isMobile ? -10 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: isMobile ? "0px 0px -30px 0px" : "0px" }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-secondary rounded-sm flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: 'hsl(var(--primary) / 0.1)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <item.icon className="text-primary" size={20} />
                  </motion.div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-foreground hover:text-primary transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-foreground">{item.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Form / Image */}
          {showForm ? (
          <motion.div
            style={{ x: infoX }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div 
                className="grid sm:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="name">{t('contact.form.name')}</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    className="bg-background transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.form.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="bg-background transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
              </motion.div>

              <motion.div 
                className="grid sm:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="bg-background transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">{t('contact.form.eventType')}</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder={t('contact.form.eventType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">{t('contact.form.eventType.wedding')}</SelectItem>
                      <SelectItem value="event">{t('contact.form.eventType.event')}</SelectItem>
                      <SelectItem value="couples">{t('contact.form.eventType.couples')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              <motion.div 
                className="grid sm:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="date">{t('contact.form.date')}</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    className="bg-background transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t('contact.form.location')}</Label>
                  <Input
                    id="location"
                    name="location"
                    className="bg-background transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Label htmlFor="message">{t('contact.form.message')}</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="bg-background resize-none transition-all duration-300 focus:scale-[1.01]"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (language === 'en' ? 'Sending...' : 'Se trimite...') 
                    : t('contact.form.submit')
                  }
                </Button>
              </motion.div>
            </form>
          </motion.div>
          ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-full min-h-[500px] lg:min-h-[600px] rounded-lg overflow-hidden"
          >
            <img
              src={contactImage}
              alt={t('contact.imageAlt')}
              className="w-full h-full object-cover"
              style={{ opacity: 0.8 }}
            />
          </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
