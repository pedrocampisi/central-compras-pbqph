/**
 * O que falta para emitir a OC (D1034h item 3): o "Emitir" fica ligado e diz,
 * ao lado dele, o que falta, em vez de abrir um aviso depois do clique. São os
 * três campos que a pessoa ainda não pôs: fornecedor, obra e pelo menos um
 * item. As outras travas da emissão (filial bloqueada, qualificação, data,
 * quantidade, destinatário da obra) não mudam e continuam no clique.
 */

import type { OrdemCompra } from './types';
import { semLinhasEmBranco } from './itensDaEmissao';

export type CampoQueFalta = 'fornecedor' | 'obra' | 'itens';

/** Na ordem da tela: o primeiro é o que recebe o foco. */
export function oQueFaltaParaEmitir(oc: Pick<OrdemCompra, 'fornecedor_id' | 'obra_id' | 'itens'>): CampoQueFalta[] {
  const falta: CampoQueFalta[] = [];
  if (!oc.fornecedor_id) falta.push('fornecedor');
  if (!oc.obra_id) falta.push('obra');
  if (semLinhasEmBranco(oc.itens).length === 0) falta.push('itens');
  return falta;
}

const NOME: Record<CampoQueFalta, string> = {
  fornecedor: 'o fornecedor',
  obra: 'a obra',
  itens: 'pelo menos 1 item',
};

/** "Falta a obra e pelo menos 1 item"; vazio quando nada falta. */
export function fraseDoQueFalta(falta: readonly CampoQueFalta[]): string {
  if (falta.length === 0) return '';
  const nomes = falta.map((c) => NOME[c]);
  const lista = nomes.length === 1 ? nomes[0]! : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]!}`;
  return `Falta ${lista}`;
}
