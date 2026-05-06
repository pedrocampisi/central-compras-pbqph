/**
 * Auto-save com debounce: grava no cache localStorage 800ms após última mudança.
 * Não salva no arquivo JSON — esse save é explícito via botão Salvar.
 */

import { useEffect, useRef } from 'react';
import { useDataStore } from '../stores/useDataStore';
import { useFileHandleStore } from '../stores/useFileHandleStore';
import { saveCache } from '../services/storage/cache';

const DEBOUNCE_MS = 800;

export function useAutoSave() {
  const dirty = useDataStore((s) => s.dirty);
  const data = useDataStore((s) => s.data);
  const sourceName = useFileHandleStore((s) => s.sourceName);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!dirty || !data) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveCache(data, sourceName);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dirty, data, sourceName]);
}
