import { useLanguage } from '@/contexts/LanguageContext';

const LocalTrustSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 px-6 md:px-12 lg:px-20 bg-background">
      <div className="container-wide text-center">
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
