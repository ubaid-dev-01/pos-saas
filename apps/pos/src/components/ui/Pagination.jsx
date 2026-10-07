import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../context/LocaleContext';

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const { t } = useTranslation();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < pages;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap text-sm text-text-muted">
      <span>
        {t('ui.pagination.showing', { from, to, total })}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(page - 1)}
          className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-background"
          aria-label={t('ui.pagination.prev')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-text-primary font-medium">
          {page} / {pages}
        </span>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => canNext && onPageChange(page + 1)}
          className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-background"
          aria-label={t('ui.pagination.next')}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
