import { Package } from 'lucide-react';

export default function EmptyState({ title, description, icon: Icon = Package }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-text-muted text-sm max-w-sm">{description}</p>}
    </div>
  );
}
