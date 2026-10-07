import { useEffect } from 'react';

/**
 * @param {Record<string, () => void>} map key like "ctrl+n" or "f1"
 */
export default function useKeyboardShortcut(map, enabled = true) {
  useEffect(() => {
    if (!enabled || !map) return undefined;
    const norm = (k) => k?.toLowerCase?.() || '';
    const onKey = (e) => {
      const key = norm(e.key);
      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push('ctrl');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');
      parts.push(key === ' ' ? 'space' : key);
      const combo = parts.join('+');
      const altCombo = [
        e.ctrlKey || e.metaKey ? 'ctrl' : null,
        e.shiftKey ? 'shift' : null,
        e.altKey ? 'alt' : null,
        key,
      ].filter(Boolean).join('+');
      const handler = map[combo] || map[altCombo];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [map, enabled]);
}
