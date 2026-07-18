/**
 * Download de arquivo via blob + <a download> — fallback universal quando
 * a File System Access API não está disponível ou a permissão foi negada.
 */

export function downloadBlob(content: Blob | string, filename: string): void {
  const blob =
    typeof content === 'string' ? new Blob([content], { type: 'application/json' }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
