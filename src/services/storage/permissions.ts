/**
 * Verifica e solicita permissões de leitura/escrita em FileSystemHandle.
 * Portado de CentralCompras-PBQPH.html linhas 1046-1053.
 */

export async function verifyHandlePermission(
  handle: FileSystemHandle,
  write: boolean,
): Promise<boolean> {
  if (!handle || typeof handle.queryPermission !== 'function') return false;
  const mode: FileSystemPermissionMode = write ? 'readwrite' : 'read';
  const cur = await handle.queryPermission({ mode });
  if (cur === 'granted') return true;
  if (typeof handle.requestPermission !== 'function') return false;
  return (await handle.requestPermission({ mode })) === 'granted';
}
