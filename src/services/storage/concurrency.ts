/**
 * Detecção de conflito de concorrência: compara o last_saved do arquivo no
 * disco com o timestamp que carregamos, para evitar sobrescrever alterações
 * feitas por outra sessão (ex: segunda aba ou outro computador).
 * Portado de CentralCompras-PBQPH.html linhas 1092-1114.
 */

import { verifyHandlePermission } from './permissions';

export interface ConcurrencyCheckResult {
  conflict: boolean;
  remoteTs: string;
}

/**
 * Lê o last_saved do arquivo remoto e compara com o timestamp local.
 * Retorna conflict=true se o arquivo foi salvo por outra sessão após o load.
 */
export async function checkConcurrency(
  fileHandle: FileSystemFileHandle,
  knownSavedAt: string,
): Promise<ConcurrencyCheckResult> {
  try {
    const ok = await verifyHandlePermission(fileHandle, false);
    if (!ok) return { conflict: false, remoteTs: '' };

    const file = await fileHandle.getFile();
    const text = await file.text();
    const remote = JSON.parse(text) as Record<string, unknown>;
    const remoteTs = typeof remote['last_saved'] === 'string' ? remote['last_saved'] : '';
    const conflict = !!(remoteTs && knownSavedAt && remoteTs > knownSavedAt);

    return { conflict, remoteTs };
  } catch {
    // Falha na leitura — assume sem conflito para não bloquear o save
    return { conflict: false, remoteTs: '' };
  }
}
