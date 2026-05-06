/**
 * IndexedDB helpers para persistência de FileSystemHandle entre sessões.
 * O browser não permite salvar handles em localStorage — apenas IndexedDB.
 * Portado de CentralCompras-PBQPH.html linhas 1017-1045.
 */

const DB_NAME = 'central-compras-db';
const STORE = 'handles';
const FILE_KEY = 'shared-json';

async function openDb(): Promise<IDBDatabase | null> {
  if (!('indexedDB' in window)) return null;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGet<T>(key: string): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise<T | null>((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => resolve(null);
  });
}

export async function saveFileHandle(handle: FileSystemFileHandle): Promise<void> {
  try {
    await dbPut(FILE_KEY, handle);
  } catch {
    /* ignore */
  }
}

export async function getFileHandle(): Promise<FileSystemFileHandle | null> {
  try {
    return await dbGet<FileSystemFileHandle>(FILE_KEY);
  } catch {
    return null;
  }
}

export async function saveHandleByKey(
  key: string,
  handle: FileSystemHandle,
): Promise<void> {
  try {
    await dbPut(key, handle);
  } catch {
    /* ignore */
  }
}

export async function getHandleByKey<T extends FileSystemHandle>(
  key: string,
): Promise<T | null> {
  try {
    return await dbGet<T>(key);
  } catch {
    return null;
  }
}

export { FILE_KEY };
