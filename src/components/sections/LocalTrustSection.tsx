import { useLanguage } from '@/contexts/LanguageContext';

const LocalTrustSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-background">
      <div className="container-wide px-6 lg:px-12 text-center">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t('footer.location.based')}
          <br />
          {t('footer.location.available')}
        </p>
      </div>
    </section>
  );
};

export default LocalTrustSection;
