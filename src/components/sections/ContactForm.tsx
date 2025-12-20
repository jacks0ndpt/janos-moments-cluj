import { useState } from 'react';
import { motion } from 'framer-motion';
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

interface ContactFormProps {
  isFullPage?: boolean;
}

const ContactForm = ({ isFullPage = false }: ContactFormProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: language === 'en' ? 'Message sent!' : 'Mesaj trimis!',
      description: t('contact.success'),
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section className={`section-padding ${isFullPage ? 'pt-32' : 'bg-card'}`}>
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
              {t('contact.title')}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {t('contact.intro')}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-sm flex items-center justify-center">
                  <Mail className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href="mailto:hello@janoshada.com" className="text-foreground hover:text-primary transition-colors">
                    hello@janoshada.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-sm flex items-center justify-center">
                  <Phone className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{language === 'en' ? 'Phone' : 'Telefon'}</p>
                  <a href="tel:+40722123456" className="text-foreground hover:text-primary transition-colors">
                    +40 722 123 456
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-sm flex items-center justify-center">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{language === 'en' ? 'Based in' : 'Locație'}</p>
                  <p className="text-foreground">Cluj-Napoca, Romania</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('contact.form.name')}</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.form.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">{t('contact.form.eventType')}</Label>
                  <Select name="eventType">
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
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t('contact.form.date')}</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t('contact.form.location')}</Label>
                  <Input
                    id="location"
                    name="location"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t('contact.form.message')}</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="bg-background resize-none"
                />
              </div>

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
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
