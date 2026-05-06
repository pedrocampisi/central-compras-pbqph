/**
 * Atalhos de teclado globais.
 * Portado de CentralCompras-PBQPH.html linha 2583+.
 */

import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onNewOC?: () => void;
  onEsc?: () => void;
}

export function useKeyboardShortcuts({ onSave, onNewOC, onEsc }: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignora quando está em campo de texto
      const tag = (e.target as HTMLElement)?.tagName;
      const inInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag);

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          onSave?.();
        }
        if (e.key === 'n' && !inInput) {
          e.preventDefault();
          onNewOC?.();
        }
      }

      if (e.key === 'Escape') {
        onEsc?.();
      }
    },
    [onSave, onNewOC, onEsc],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
