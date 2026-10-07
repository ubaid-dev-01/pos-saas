import { Search } from 'lucide-react';
import { useTranslation } from '../../context/LocaleContext';

export default function SearchInput({ value, onChange, placeholder, inputRef }) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('ui.search.defaultPlaceholder')}
        className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </div>
  );
}
