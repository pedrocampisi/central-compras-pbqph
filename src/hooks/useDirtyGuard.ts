/**
 * Exibe aviso no beforeunload se há alterações não salvas.
 */

import { useEffect } from 'react';
import { useDataStore } from '../stores/useDataStore';

export function useDirtyGuard() {
  const dirty = useDataStore((s) => s.dirty);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
