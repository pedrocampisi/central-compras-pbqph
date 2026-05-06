/**
 * Store do FileSystemFileHandle: persistência de conexão entre reloads.
 * Gerencia a conexão ao arquivo JSON no OneDrive.
 */

import { create } from 'zustand';

interface FileHandleState {
  fileHandle: FileSystemFileHandle | null;
  sourceName: string;

  // Actions
  setFileHandle: (handle: FileSystemFileHandle | null, sourceName?: string) => void;
  clearFileHandle: () => void;
}

export const useFileHandleStore = create<FileHandleState>((set) => ({
  fileHandle: null,
  sourceName: '—',

  setFileHandle(handle, sourceName) {
    set({
      fileHandle: handle,
      sourceName: sourceName ?? handle?.name ?? '—',
    });
  },

  clearFileHandle() {
    set({ fileHandle: null, sourceName: '—' });
  },
}));
