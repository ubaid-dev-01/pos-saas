import { useTranslation } from '../../context/LocaleContext';

export default function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div
        className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin"
        aria-hidden
      />
      <p className="text-text-muted text-sm">{t('ui.loadingApp')}</p>
    </div>
  );
}
