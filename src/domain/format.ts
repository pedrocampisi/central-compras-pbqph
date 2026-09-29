/**
 * Helpers de formatação BR.
 */

export function formatBrl(n: number): string {
  if (!Number.isFinite(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatTimestamp(iso: string): string {
  if (!iso) return '—';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleString('pt-BR');
}

/**
 * O dia de hoje (AAAA-MM-DD) é o de Brasília, qualquer que seja o relógio do
 * computador: a casa tem um "hoje" só, e é este (CTO-D621 §2). A conta mora
 * aqui, no utilitário, e o domínio usa ele; nunca o contrário (CTO-D622 §2.1).
 */
export function todayIso(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);
}

export function nowIso(): string {
  return new Date().toISOString();
}
