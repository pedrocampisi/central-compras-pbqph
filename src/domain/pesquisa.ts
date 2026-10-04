/**
 * A pesquisa das listas de escolha de Obra e de Fornecedor.
 *
 * Nasceu em 26/09/2026 de uma frase do Pedro (CTO-D541): "imagina a gente tem
 * 30 obras aí tem que ficar scrolando até achar uma, a mesma coisa com os
 * fornecedores. Os outros não precisa de pesquisa." Por isso vale SÓ para
 * esses dois — ECR, unidade e condição de pagamento continuam listas simples.
 *
 * A ORDEM do que a busca achou (`notaDaBusca`, `pelaNota`) vale para todas as
 * buscas da OC desde a CTO-D680: as duas listas e as caixas de busca de
 * Fornecedores, Histórico, Qualificação, Catálogo de ECR e Obras.
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
  /** Inativa ou bloqueada: na mesma nota, desce (CTO-D680). */
  desce?: boolean;
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

// ---------------------------------------------------------------------------
// A ordem do que a busca achou (CTO-D680, 04/10/2026)
//
// A palavra do Pedro, com a foto da Nova OC: "queria a comarco e apareceu ABr
// gesso?". Ele digitou "co"; a lista vinha em ordem alfabética, e a ABR Gesso
// casava pelo "co" do meio da razão social. A régua é a da Central
// (`Central/app/busca.js`, D674), para as duas casas acharem do mesmo jeito.
// ---------------------------------------------------------------------------

/** Para comparar na nota: sem acento, sem caixa, pontuação vira espaço ("R-263" e "r 263"). */
function paraNota(s: string): string {
  return normalizarBusca(s).replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * O quanto o nome bate com o que se digitou. Menor é melhor.
 *
 *   0  o nome É o termo ............ "Comarco" para "comarco"
 *   1  o nome COMEÇA pelo termo .... "Comarco" para "co"
 *   2  uma PALAVRA começa por ele .. "Casa do Construtor" para "co"
 *   3  o termo está no MEIO ......... "Ecomix" para "co"
 *   4  casou só em outro nome ....... a razão social, a cidade, os termos
 *
 * `nomes` são os que a lista mostra (o apelido, o nome da obra). O documento
 * (CNPJ, CNO) conta quando o termo tem 3 algarismos ou mais: quem cola um CNPJ
 * quer aquele CNPJ em cima.
 */
export function notaDaBusca(busca: string, nomes: readonly string[], documentos: readonly string[] = []): number {
  const t = paraNota(busca);
  let melhor = 4;
  if (!t) return melhor;
  for (const n of nomes.map(paraNota).filter(Boolean)) {
    const v = n === t ? 0 : n.startsWith(t) ? 1 : ` ${n}`.includes(` ${t}`) ? 2 : n.includes(t) ? 3 : 4;
    if (v < melhor) melhor = v;
  }
  const num = busca.replace(/\D/g, '');
  if (num.length >= 3) {
    for (const d of documentos.map((x) => x.replace(/\D/g, '')).filter(Boolean)) {
      const v = d === num ? 0 : d.startsWith(num) ? 1 : d.includes(num) ? 3 : 4;
      if (v < melhor) melhor = v;
    }
  }
  return melhor;
}

/**
 * A ordem do que casou: pela nota; na mesma nota, o que desce (inativo,
 * bloqueado) vai para baixo; no resto, a ordem que já vinha. O que desce não
 * some — só fica atrás de quem ainda se usa. A ordem que já vinha desempata
 * por último, de propósito: é estável, e a mesma busca acha no mesmo lugar.
 */
export function pelaNota<T>(itens: readonly T[], nota: (x: T) => number, desce: (x: T) => boolean = () => false): T[] {
  return itens
    .map((x, i) => ({ x, i, n: nota(x), d: desce(x) ? 1 : 0 }))
    .sort((a, b) => a.n - b.n || a.d - b.d || a.i - b.i)
    .map(({ x }) => x);
}

/**
 * As opções que casam com o que a pessoa digitou, as que batem melhor no alto.
 *
 * Cada palavra digitada precisa aparecer em algum dos nomes da opção (rótulo,
 * detalhe ou termos), em qualquer ordem: "tintas uberl" acha "Beija Flor
 * Comércio de Tintas · Uberlândia/MG". A nota olha o rótulo, que é o nome que
 * a lista mostra; quem casou só pelo detalhe ou pelos termos vem depois.
 * Pesquisa vazia devolve a lista inteira, na ordem de sempre.
 */
export function filtrarOpcoes<T extends OpcaoPesquisavel>(opcoes: readonly T[], busca: string): T[] {
  const palavras = normalizarBusca(busca).split(' ').filter(Boolean);
  if (palavras.length === 0) return [...opcoes];
  const casadas = opcoes.filter((o) => {
    const palheiro = normalizarBusca([o.rotulo, o.detalhe ?? '', ...(o.termos ?? [])].join(' '));
    return palavras.every((p) => palheiro.includes(p));
  });
  return pelaNota(casadas, (o) => notaDaBusca(busca, [o.rotulo]), (o) => o.desce === true);
}
