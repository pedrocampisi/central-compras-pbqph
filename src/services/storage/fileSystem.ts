/**
 * Operações de arquivo: conectar, salvar, recarregar.
 * Portado de CentralCompras-PBQPH.html linhas 1054-1198.
 *
 * Design: funções puras que recebem o estado por parâmetro e retornam resultados.
 * Os Zustand stores chamam estas funções e aplicam os resultados.
 */

import type { Data } from '../../domain/types';
import { runMigrations } from '../../domain/migrations';
import { normalizeData } from '../../domain/normalize';
import { nowIso } from '../../domain/format';
import { saveFileHandle, getFileHandle } from './handles';
import { verifyHandlePermission } from './permissions';
import { checkConcurrency } from './concurrency';
import { writeRotatingBackup } from './backups';
import { saveCache } from './cache';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LoadResult {
  data: Data;
  sourceName: string;
  fileHandle: FileSystemFileHandle;
  lastSavedAt: string;
}

export type SaveResult =
  | { ok: true; data: Data; lastSavedAt: string; fileHandle?: FileSystemFileHandle; sourceName?: string }
  | { ok: false; reason: 'conflict'; remoteTs: string; knownTs: string }
  | { ok: false; reason: 'aborted' }
  | { ok: false; reason: 'download'; data: Data; lastSavedAt: string };

// ── Load helpers ──────────────────────────────────────────────────────────────

export async function loadFromFileHandle(handle: FileSystemFileHandle): Promise<LoadResult> {
  const file = await handle.getFile();
  const text = await file.text();
  const raw = JSON.parse(text) as unknown;
  const migrated = runMigrations(raw);
  const data = normalizeData(migrated);
  return {
    data,
    sourceName: file.name || 'central-compras-data.json',
    fileHandle: handle,
    lastSavedAt: data.last_saved,
  };
}

/**
 * Abre o file picker e conecta ao JSON.
 * Retorna null se o usuário cancelou ou se showOpenFilePicker não está disponível
 * (neste caso, o chamador deve recorrer a <input type="file">).
 */
export async function connectFile(): Promise<LoadResult | null> {
  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'JSON Central de Compras',
            accept: { 'application/json': ['.json'] },
          },
        ],
        multiple: false,
      });
      if (!handle) return null;
      await saveFileHandle(handle);
      return loadFromFileHandle(handle);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return null;
      throw err;
    }
  }
  return null;
}

export async function reloadFromHandle(handle: FileSystemFileHandle): Promise<LoadResult> {
  const ok = await verifyHandlePermission(handle, false);
  if (!ok) throw new Error('Sem permissão de leitura.');
  return loadFromFileHandle(handle);
}

/** Tenta restaurar o handle persistido no IndexedDB da sessão anterior. */
export async function tryRestoreFileHandle(): Promise<FileSystemFileHandle | null> {
  return getFileHandle();
}

// ── Save ──────────────────────────────────────────────────────────────────────

function downloadBlob(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface SaveOptions {
  data: Data;
  fileHandle: FileSystemFileHandle | null;
  sourceName: string;
  lastKnownSavedAt: string;
}

/**
 * Pipeline de save:
 * 1. Checa concorrência (se fileHandle existir)
 * 2. Tenta gravar no handle existente
 * 3. Fallback: showSaveFilePicker
 * 4. Último recurso: download blob
 */
export async function saveData(opts: SaveOptions): Promise<SaveResult> {
  const { data, fileHandle, sourceName, lastKnownSavedAt } = opts;

  // 1. Concurrency check
  if (fileHandle) {
    const { conflict, remoteTs } = await checkConcurrency(fileHandle, lastKnownSavedAt);
    if (conflict) {
      return { ok: false, reason: 'conflict', remoteTs, knownTs: lastKnownSavedAt };
    }
  }

  // 2. Build payload
  const snap = structuredClone(data);
  snap.last_saved = nowIso();
  const payload = JSON.stringify(snap, null, 2);

  // 3a. Escreve no handle existente
  if (fileHandle) {
    try {
      const ok = await verifyHandlePermission(fileHandle, true);
      if (ok) {
        const w = await fileHandle.createWritable();
        await w.write(payload);
        await w.close();
        const savedData = normalizeData(snap);
        saveCache(savedData, sourceName);
        void writeRotatingBackup(payload);
        return { ok: true, data: savedData, lastSavedAt: snap.last_saved };
      }
    } catch {
      /* cai para showSaveFilePicker */
    }
  }

  // 3b. Picker de novo arquivo
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: data.shared_file_name || 'central-compras-data.json',
        types: [
          {
            description: 'JSON Central de Compras',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const w = await handle.createWritable();
      await w.write(payload);
      await w.close();
      await saveFileHandle(handle);
      const savedData = normalizeData(snap);
      const newSourceName = handle.name || sourceName;
      saveCache(savedData, newSourceName);
      void writeRotatingBackup(payload);
      return {
        ok: true,
        data: savedData,
        lastSavedAt: snap.last_saved,
        fileHandle: handle,
        sourceName: newSourceName,
      };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { ok: false, reason: 'aborted' };
      }
      /* cai para download blob */
    }
  }

  // 3c. Último recurso: download blob
  downloadBlob(payload, data.shared_file_name || 'central-compras-data.json');
  const savedData = normalizeData(snap);
  saveCache(savedData, sourceName);
  return { ok: false, reason: 'download', data: savedData, lastSavedAt: snap.last_saved };
}
