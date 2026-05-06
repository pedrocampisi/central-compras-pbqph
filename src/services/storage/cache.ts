/**
 * Cache localStorage — snapshot rápido do estado para restaurar entre sessões.
 * NÃO é o arquivo JSON definitivo (esse fica no OneDrive via File System Access).
 * Portado de CentralCompras-PBQPH.html linhas 1000-1016.
 */

import type { Data } from '../../domain/types';
import { nowIso } from '../../domain/format';

// v2 (2026-05-06): seed-data.json passou a embarcar 33 fornecedores reais (antes
// só 1). Bump da versão invalida caches antigos para que o usuário receba o
// seed atualizado automaticamente. Caches futuros continuam compatíveis.
const CACHE_KEY = 'central-compras-cache-v2';
const UI_KEY = 'central-compras-ui-v1';

export interface CacheEntry {
  data: Data;
  sourceName: string;
  cachedAt: string;
}

export interface UiPrefs {
  activeTab?: string;
  histFilter?: Record<string, string>;
}

export function loadCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    return parsed?.data ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCache(data: Data, sourceName: string): void {
  try {
    const entry: CacheEntry = { data, sourceName, cachedAt: nowIso() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* localStorage pode estar cheio — ignorar */
  }
}

export function loadUiPrefs(): UiPrefs {
  try {
    const raw = localStorage.getItem(UI_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UiPrefs;
  } catch {
    return {};
  }
}

export function saveUiPrefs(prefs: UiPrefs): void {
  try {
    localStorage.setItem(UI_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Remove caches de versões antigas (após bump do CACHE_KEY).
 * Idempotente: ignora chaves inexistentes. Chamar uma vez no boot.
 */
export function purgeLegacyCaches(): void {
  const legacy = ['central-compras-cache-v1'];
  for (const key of legacy) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
