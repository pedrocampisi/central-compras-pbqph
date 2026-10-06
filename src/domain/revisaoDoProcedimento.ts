/**
 * A revisão do procedimento pela mão do Pedro (CTO-D739 §4, a D730 §4.4).
 * Lógica pura, sem tela.
 *
 * - Quem revisa ECR lê o rascunho desenhado como a página, com os trechos que
 *   mudaram marcados. A marca sai da comparação por âncora com a revisão
 *   vigente: o que o rascunho tem e a vigente não tem, ou tem diferente.
 * - O motivo de cada mudança vem do script que gera o rascunho
 *   (`scripts/rascunho-rev01-ps02.py`), pela âncora que a página marca.
 * - "Gravar" chama a porta do Banco, `core.revisar_procedimento`, com a
 *   revisão de onde o rascunho partiu: se a vigente já for outra, ela recusa.
 */

import type { Bloco, Procedimento } from './procedimento';

/** Uma mudança como o script a escreve: o que é, onde a página marca e por quê. */
export interface MudancaDoRascunho {
  id: string;
  item: string;
  ancora: string;
  motivo: string;
}

/** O que acompanha o rascunho: de que revisão ele parte, a descrição do histórico e as mudanças. */
export interface MudancasDoRascunho {
  revisao_de: string;
  descricao: string;
  mudancas: MudancaDoRascunho[];
}

/** As âncoras que não são de bloco: o cabeçalho, o "Como usar", o fluxo e o rodapé. */
export const ANCORA_DO_CABECALHO = 'cabecalho';
export const ANCORA_DA_SITUACAO = 'cabecalho.revisao';
export const ANCORA_DO_COMO_USAR = 'como_usar';
export const ANCORA_DO_FLUXO = 'fluxo';
export const ANCORA_DO_RODAPE = 'rodape';

/** A revisão seguinte, como a porta a numera: "00" → "01". */
export function revisaoSeguinte(revisao: string): string {
  return String(Number(revisao) + 1).padStart(2, '0');
}

const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** As partes que se marcam dentro de um bloco: os quadros, as linhas e os itens. */
function partes(b: Bloco): { ancora: string }[] {
  if (b.tipo === 'quadros') return b.quadros;
  if (b.tipo === 'tabela') return b.linhas;
  if (b.tipo === 'lista') return b.itens;
  return [];
}

/** O bloco sem as partes: o que muda nele mesmo (a coluna da tabela, o texto do parágrafo). */
function casca(b: Bloco): unknown {
  if (b.tipo === 'quadros') return { tipo: b.tipo };
  if (b.tipo === 'tabela') return { tipo: b.tipo, colunas: b.colunas };
  if (b.tipo === 'lista') return { tipo: b.tipo };
  return b;
}

function porAncora<T extends { ancora: string }>(itens: readonly T[]): Map<string, T> {
  return new Map(itens.map((x) => [x.ancora, x]));
}

/** Todas as âncoras que a comparação conhece, para saber o que saiu. */
function todas(p: Procedimento): string[] {
  const out = [...p.fluxo.cartoes.map((c) => c.ancora), ...p.fluxo.sequencia.map((s) => s.ancora)];
  for (const s of p.secoes) {
    out.push(s.ancora);
    for (const b of s.blocos) out.push(b.ancora, ...partes(b).map((x) => x.ancora));
  }
  return out;
}

/**
 * O que o rascunho muda em relação à vigente, por âncora e na ordem da página:
 * - `mudaram`: o que é novo ou diferente no rascunho, no menor pedaço que tem
 *   âncora (o quadro, a linha da tabela, o item; o bloco, se mudou ele mesmo);
 * - `sairam`: o que a vigente tem e o rascunho não.
 */
export function oQueMudou(
  vigente: Procedimento,
  rascunho: Procedimento,
): { mudaram: string[]; sairam: string[] } {
  const mudaram: string[] = [];
  const marca = (ancora: string, de: unknown, para: unknown) => {
    if (!igual(de, para)) mudaram.push(ancora);
  };

  const cabecalho = (p: Procedimento) => [
    p.titulo,
    p.subtitulo,
    p.sobretitulo,
    p.responsavel,
    p.referencia,
    p.escopo,
  ];
  marca(ANCORA_DO_CABECALHO, cabecalho(vigente), cabecalho(rascunho));
  marca(ANCORA_DA_SITUACAO, vigente.situacao, rascunho.situacao);
  marca(ANCORA_DO_COMO_USAR, vigente.comoUsar, rascunho.comoUsar);
  const fluxo = (p: Procedimento) => [
    p.fluxo.titulo,
    p.fluxo.introducao,
    p.fluxo.tituloDaSequencia,
  ];
  marca(ANCORA_DO_FLUXO, fluxo(vigente), fluxo(rascunho));
  const cartoes = porAncora(vigente.fluxo.cartoes);
  for (const c of rascunho.fluxo.cartoes) marca(c.ancora, cartoes.get(c.ancora), c);
  const passos = porAncora(vigente.fluxo.sequencia);
  for (const s of rascunho.fluxo.sequencia) marca(s.ancora, passos.get(s.ancora), s);

  const secoes = porAncora(vigente.secoes);
  const blocos = porAncora(vigente.secoes.flatMap((s) => s.blocos));
  for (const s of rascunho.secoes) {
    const v = secoes.get(s.ancora);
    const cabeca = (x: typeof s) => [x.numero, x.titulo, x.selo, x.ajuda];
    marca(s.ancora, v && cabeca(v), cabeca(s));
    for (const b of s.blocos) {
      const vb = blocos.get(b.ancora);
      if (!vb || vb.tipo !== b.tipo) {
        mudaram.push(b.ancora);
        continue;
      }
      marca(b.ancora, casca(vb), casca(b));
      const antes = porAncora(partes(vb));
      for (const x of partes(b)) marca(x.ancora, antes.get(x.ancora), x);
    }
  }
  marca(ANCORA_DO_RODAPE, vigente.rodape, rascunho.rodape);

  const ficam = new Set(todas(rascunho));
  return { mudaram, sairam: todas(vigente).filter((a) => !ficam.has(a)) };
}

/** Os motivos de cada âncora marcada, na ordem do script (uma âncora pode ter mais de um). */
export function motivosPorAncora(mudancas: readonly MudancaDoRascunho[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const m of mudancas) out.set(m.ancora, [...(out.get(m.ancora) ?? []), m.motivo]);
  return out;
}

// ── O que a página diz ───────────────────────────────────────────────────────

export function tituloDoPainel(nova: string): string {
  return `Rev. ${nova} em rascunho`;
}

export function frasePainelNaVigente(n: number, de: string): string {
  return `${n} ${n === 1 ? 'trecho muda' : 'trechos mudam'} em relação à Rev. ${de}. Só quem revisa vê este quadro.`;
}

export function frasePainelNoRascunho(n: number, nova: string): string {
  return (
    `Você está lendo o rascunho da Rev. ${nova}. ` +
    `${n === 1 ? 'O trecho marcado mudou' : `Os ${n} trechos marcados mudaram`}; o "?" de cada um diz por quê. ` +
    'Ele só passa a valer quando for gravado.'
  );
}

export function fraseDoQueSaiu(sairam: readonly string[]): string {
  return `Saem do texto: ${sairam.join(', ')}.`;
}

/** A pergunta antes de gravar (D739 §4.2). */
export function perguntaDeGravar(nova: string): string {
  return `Gravar a Rev. ${nova}?`;
}
export const O_QUE_GRAVAR_FAZ = 'Ela passa a valer hoje e entra no histórico.';

export const MARCA_DA_MUDANCA = 'Mudou';

/** A recusa da porta como frase para a pessoa (os códigos de `core.revisar_procedimento`). */
export function fraseDaRecusaDoProcedimento(codigo: string | undefined, mensagem: string): string {
  switch (codigo) {
    case '42501':
      return 'Só o Pedro revisa o procedimento. A revisão não foi gravada.';
    case '40001':
      return 'A revisão vigente já não é a de onde este rascunho partiu: alguém gravou antes. Recarregue a página. A revisão não foi gravada.';
    case 'P0002':
      return 'Este procedimento não existe no banco. A revisão não foi gravada.';
    case '55000':
      return 'A revisão vigente não tem o texto guardado no histórico, e revisar agora perderia esse texto. A revisão não foi gravada.';
    case '22023':
      return `O banco recusou a revisão: ${mensagem}`;
    default:
      return `Falha ao gravar a revisão: ${mensagem}`;
  }
}
