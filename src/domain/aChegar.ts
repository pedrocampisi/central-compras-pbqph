/**
 * A vista "A chegar" do Histórico (CTO-D1036 §2.6): quem compra vê o que falta
 * chegar, QUANDO chega, e o que está atrasado no alto.
 *
 * "A chegar" é a OC emitida e ainda não entregue: a mesma régua do filtro
 * "Emitida". A ordem é a da data combinada (`entrega_prevista`): a mais antiga
 * primeiro, e por isso as atrasadas sobem sozinhas; a OC sem data combinada
 * vai para o fim, porque não dá para saber se está atrasada.
 *
 * Lógica pura: o "hoje" vem de fora (o dia de Brasília, `todayIso`).
 */

import { diaCombinado } from './recebimento';
import type { OrdemCompra } from './types';

const DIA = /^\d{4}-\d{2}-\d{2}$/;

/** Dias de `de` até `ate` (negativo: `ate` já passou). */
function diasEntre(de: string, ate: string): number {
  return Math.round((Date.parse(`${ate}T12:00:00Z`) - Date.parse(`${de}T12:00:00Z`)) / 86_400_000);
}

export type SituacaoDaEntrega =
  | { tipo: 'sem-data' }
  | { tipo: 'atrasada'; dias: number }
  | { tipo: 'hoje' }
  | { tipo: 'no-prazo'; dias: number };

/** Onde a entrega combinada está em relação a hoje. */
export function situacaoDaEntrega(entregaPrevista: string | undefined, hoje: string): SituacaoDaEntrega {
  if (!entregaPrevista || !DIA.test(entregaPrevista) || !DIA.test(hoje)) return { tipo: 'sem-data' };
  const dif = diasEntre(hoje, entregaPrevista);
  if (dif < 0) return { tipo: 'atrasada', dias: -dif };
  if (dif === 0) return { tipo: 'hoje' };
  return { tipo: 'no-prazo', dias: dif };
}

/** A frase curta ao lado da data: "Atrasada 3 dias", "Chega hoje", "Chega amanhã", "Chega terça, 17/11". */
export function fraseDaEntrega(entregaPrevista: string | undefined, hoje: string): string {
  const s = situacaoDaEntrega(entregaPrevista, hoje);
  switch (s.tipo) {
    case 'sem-data':
      return 'Sem data combinada';
    case 'atrasada':
      return s.dias === 1 ? 'Atrasada 1 dia' : `Atrasada ${s.dias} dias`;
    case 'hoje':
      return 'Chega hoje';
    case 'no-prazo':
      return `Chega ${diaCombinado(entregaPrevista!, hoje)}`;
  }
}

/** As OCs a chegar: só as emitidas, pela data combinada, a mais antiga primeiro; sem data, no fim. */
export function ocsAChegar(ocs: readonly OrdemCompra[]): OrdemCompra[] {
  const chave = (o: OrdemCompra) => (o.entrega_prevista && DIA.test(o.entrega_prevista) ? o.entrega_prevista : '9999-99-99');
  return ocs
    .filter((o) => o.status === 'emitida')
    .slice()
    .sort((a, b) => (chave(a) < chave(b) ? -1 : chave(a) > chave(b) ? 1 : a.numero < b.numero ? -1 : a.numero > b.numero ? 1 : 0));
}

/** Quantas das OCs a chegar estão atrasadas. */
export function quantasAtrasadas(ocs: readonly OrdemCompra[], hoje: string): number {
  return ocs.filter((o) => situacaoDaEntrega(o.entrega_prevista, hoje).tipo === 'atrasada').length;
}
