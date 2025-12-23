import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-wide px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl mb-4">Janos Hada</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-2 mt-4 text-muted-foreground text-sm">
              <MapPin size={16} />
              <span>Cluj-Napoca, Romania</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mt-4">
              {t('footer.location.based')}
              <br />
              {t('footer.location.available')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4 text-muted-foreground">
              {t('nav.home')}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link to="/portfolio" className="text-sm text-foreground hover:text-primary transition-colors">
                {t('nav.portfolio')}
              </Link>
              <Link to="/about" className="text-sm text-foreground hover:text-primary transition-colors">
                {t('nav.about')}
              </Link>
              <Link to="/services" className="text-sm text-foreground hover:text-primary transition-colors">
                {t('nav.services')}
              </Link>
              <Link to="/contact" className="text-sm text-foreground hover:text-primary transition-colors">
                {t('nav.contact')}
              </Link>
              <Link to="/privacy" className="text-sm text-foreground hover:text-primary transition-colors">
                {t('footer.privacy')}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4 text-muted-foreground">
              {t('nav.contact')}
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:hello@janoshada.com"
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <Mail size={16} />
                hello@janoshada.com
              </a>
              <a
                href="https://instagram.com/janoshadaphoto"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <Instagram size={16} />
                @janoshadaphoto
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
