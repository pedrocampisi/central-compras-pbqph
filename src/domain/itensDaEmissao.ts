/**
 * Os itens com que uma OC emite (CTO-D680).
 *
 * A OC 2026/010 saiu com o item 1 em quantidade 0 e preço 0: a emissão
 * aceitava. Agora ela recusa, e a mensagem diz qual linha é. A linha em
 * branco de verdade (sem descrição, quantidade nem preço) é a que sobrou de
 * um "+ item" sem uso: na Nova OC ela some sozinha na emissão.
 *
 * Lógica pura, sem tela.
 */

import type { Item } from './types';

type Linha = Pick<Item, 'descricao' | 'quantidade' | 'preco_unit'>;

/** Sem descrição, sem quantidade e sem preço: a linha que ninguém usou. */
export function linhaEmBranco(i: Linha): boolean {
  return i.descricao.trim() === '' && !i.quantidade && !i.preco_unit;
}

/** A descrição curta, para a mensagem apontar a linha sem ficar comprida. */
function curta(descricao: string): string {
  const d = descricao.trim().replace(/\s+/g, ' ');
  return d.length > 40 ? `${d.slice(0, 39)}…` : d;
}

/**
 * A primeira linha com quantidade que não serve (0, negativa ou vazia), pelo
 * número que ela tem na tela, ou '' quando todas servem.
 *
 * `pularEmBranco`: na Nova OC a linha em branco não conta (ela some na
 * emissão); no Histórico, que só troca o status, ela conta, porque continuaria
 * gravada na OC emitida.
 */
export function travaDaQuantidade(itens: readonly Linha[], onde: 'nova-oc' | 'historico'): string {
  const i = itens.findIndex((it) => !(onde === 'nova-oc' && linhaEmBranco(it)) && !(it.quantidade > 0));
  if (i < 0) return '';
  const d = curta(itens[i]!.descricao);
  const qual = `O item ${i + 1}${d ? ` (${d})` : ''} está com quantidade 0.`;
  return onde === 'nova-oc'
    ? `${qual} Informe a quantidade ou apague a linha, e emita de novo.`
    : `${qual} Abra a OC em Editar, informe a quantidade ou apague a linha, e emita de novo.`;
}

/** Os itens que vão para a OC emitida: os mesmos, menos as linhas em branco. */
export function semLinhasEmBranco<T extends Linha>(itens: readonly T[]): T[] {
  return itens.filter((it) => !linhaEmBranco(it));
}
