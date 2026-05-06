/**
 * Backups rotativos: grava snapshot timestampado em diretório configurado.
 * Mantém os últimos 10 arquivos, remove os mais antigos automaticamente.
 * Portado de CentralCompras-PBQPH.html linhas 1151-1179.
 */

import { getHandleByKey } from './handles';
import { verifyHandlePermission } from './permissions';

/** Chave IndexedDB para o handle do diretório de backups. */
export const BACKUP_DIR_KEY = 'dir-backups';

const BACKUP_PATTERN = /^central-compras-data-.*\.json$/;
const MAX_BACKUPS = 10;

/**
 * Grava um snapshot rotativo no diretório de backups.
 * Silencia todos os erros — backup é best-effort e nunca deve bloquear o save principal.
 */
export async function writeRotatingBackup(payload: string): Promise<void> {
  const dh = await getHandleByKey<FileSystemDirectoryHandle>(BACKUP_DIR_KEY);
  if (!dh) return;

  const ok = await verifyHandlePermission(dh, true);
  if (!ok) return;

  // Grava o novo arquivo timestampado
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fname = `central-compras-data-${ts}.json`;
  try {
    const fh = await dh.getFileHandle(fname, { create: true });
    const w = await fh.createWritable();
    await w.write(payload);
    await w.close();
  } catch {
    return; // Falhou ao escrever — sem rotação
  }

  // Rotação: lista todos os backups, ordena, remove os mais antigos além do limite
  try {
    const files: string[] = [];
    for await (const entry of dh.values()) {
      if (entry.kind === 'file' && BACKUP_PATTERN.test(entry.name)) {
        files.push(entry.name);
      }
    }
    files.sort(); // ISO timestamp = ordenação cronológica direta
    if (files.length > MAX_BACKUPS) {
      const toDelete = files.slice(0, files.length - MAX_BACKUPS);
      for (const name of toDelete) {
        try {
          await dh.removeEntry(name);
        } catch {
          /* ignore remoção falha individual */
        }
      }
    }
  } catch {
    /* ignore erros de listagem */
  }
}
