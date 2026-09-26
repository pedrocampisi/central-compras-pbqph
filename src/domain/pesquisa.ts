/**
 * A pesquisa das listas de escolha de Obra e de Fornecedor.
 *
 * Nasceu em 26/09/2026 de uma frase do Pedro (CTO-D541): "imagina a gente tem
 * 30 obras aí tem que ficar scrolando até achar uma, a mesma coisa com os
 * fornecedores. Os outros não precisa de pesquisa." Por isso vale SÓ para
 * esses dois — ECR, unidade e condição de pagamento continuam listas simples.
 *
 * Lógica pura: não conhece a tela.
 */

export interface OpcaoPesquisavel {
  /** O que a escolha grava (o id). */
  valor: string;
  /** O que a lista mostra. */
  rotulo: string;
  /** Linha menor embaixo do rótulo (ex.: o apelido da empresa). */
  detalhe?: string;
  /** Outros nomes pelos quais a pessoa pode procurar, sem aparecer na lista. */
  termos?: string[];
}

/** Sem acento, sem caixa, espaços juntos: "Império" e "imperio" são a mesma busca. */
export function normalizarBusca(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * As opções que casam com o que a pessoa digitou.
 *
 * Cada palavra digitada precisa aparecer em algum dos nomes da opção (rótulo,
 * detalhe ou termos), em qualquer ordem: "tintas uberl" acha "Beija Flor
 * Comércio de Tintas · Uberlândia/MG". Pesquisa vazia devolve a lista inteira,
 * como era antes de a pesquisa existir.
 */
export function filtrarOpcoes<T extends OpcaoPesquisavel>(opcoes: readonly T[], busca: string): T[] {
  const palavras = normalizarBusca(busca).split(' ').filter(Boolean);
  if (palavras.length === 0) return [...opcoes];
  return opcoes.filter((o) => {
    const palheiro = normalizarBusca([o.rotulo, o.detalhe ?? '', ...(o.termos ?? [])].join(' '));
    return palavras.every((p) => palheiro.includes(p));
  });
}
