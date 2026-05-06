/**
 * Slug simples — usado em nomes de arquivo PDF.
 * Migrado de CentralCompras-PBQPH.html.
 */
export function slugify(s: string): string {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}
