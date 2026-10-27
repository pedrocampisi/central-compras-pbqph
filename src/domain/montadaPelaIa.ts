/**
 * O aviso do rascunho que a IA montou pelo MCP da Central (CTO-D953, D954).
 *
 * A IA grava só rascunho novo, e nunca emite: quem confere e emite é a pessoa,
 * na tela. Por isso o aviso pede a conferência enquanto a OC é rascunho; depois
 * da emissão, fica só dizendo de onde ela veio. Lógica pura, sem React.
 */
import type { OrdemCompra } from './types';

/** O nome que o banco guardou é o do aplicativo da IA; comprido, corta. */
const NOME_ATE = 40;

export function avisoDaIa(oc: Pick<OrdemCompra, 'status' | 'montada_pela_ia'>): string {
  if (oc.montada_pela_ia === undefined) return '';
  const nome = oc.montada_pela_ia.trim();
  const curto = nome.length > NOME_ATE ? `${nome.slice(0, NOME_ATE - 1)}…` : nome;
  const quem = curto ? `Montado pela IA (${curto}).` : 'Montado pela IA.';
  return oc.status === 'rascunho' ? `${quem} Confira antes de emitir.` : quem;
}
