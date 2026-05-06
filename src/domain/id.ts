/**
 * Geração de IDs locais. Suficiente para escala single-user.
 * Migrado de CentralCompras-PBQPH.html.
 */
export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
