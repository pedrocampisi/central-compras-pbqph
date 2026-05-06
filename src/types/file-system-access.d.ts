/**
 * Declarações de tipos para a File System Access API.
 * O lib DOM do TypeScript ainda não inclui queryPermission / requestPermission
 * nem os tipos completos de picker.
 *
 * Ref: https://wicg.github.io/file-system-access/
 */

// ── Permission descriptors ────────────────────────────────────────────────────

type FileSystemPermissionMode = 'read' | 'readwrite';

interface FileSystemPermissionDescriptor {
  mode: FileSystemPermissionMode;
}

type PermissionState = 'granted' | 'denied' | 'prompt';

// ── Extend FileSystemHandle with permission methods ───────────────────────────

interface FileSystemHandle {
  queryPermission(descriptor: FileSystemPermissionDescriptor): Promise<PermissionState>;
  requestPermission(descriptor: FileSystemPermissionDescriptor): Promise<PermissionState>;
}

// ── Picker options ────────────────────────────────────────────────────────────

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: FilePickerAcceptType[];
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  excludeAcceptAllOption?: boolean;
  types?: FilePickerAcceptType[];
}

interface DirectoryPickerOptions {
  id?: string;
  mode?: 'read' | 'readwrite';
  startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
}

// ── Extend Window with picker methods ─────────────────────────────────────────

interface Window {
  showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
  showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
  showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
}
