import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import { t } from '../utils/i18n';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full bg-surface rounded-2xl border border-border p-8 text-center shadow-lg">
            <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-text-primary mb-2">{t('errorBoundary.title')}</h1>
            <p className="text-text-muted text-sm mb-6">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-95"
            >
              {t('errorBoundary.reload')}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
