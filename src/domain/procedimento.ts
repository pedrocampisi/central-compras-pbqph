/**
 * O procedimento de compras (CTO-D730, palavra do Pedro: "trazer a PS.02 para
 * o sistema... Para ela servir como um Manual"). Lógica pura, sem tela.
 *
 * O caminho é o das ECRs (D586, D588, D589): o texto de partida é o do HTML do
 * SGQ, palavra por palavra; o sistema passa a ser o que vale, com o histórico;
 * e só o Pedro revisa. A tela e o PDF não resumem, não consertam e não escondem
 * nada — nem o "item 6" da tabela do item 2, que é coisa da Rev. 01.
 *
 * A forma segue a estrutura do documento:
 * - o cabeçalho (código, revisão, data, responsável, referência, escopo);
 * - o "Como usar" e o fluxo didático (os cinco cartões e a sequência mínima);
 * - as seções, cada uma com o número, o título, o selo ("SiAC 8.4"), o "?"
 *   (o texto dele é conteúdo) e os blocos, na ordem do documento;
 * - o histórico de revisões, que no documento é a tabela da seção 7.
 *
 * Toda parte que se aponta tem âncora estável: a seção, o bloco, a linha de
 * tabela, o quadro e o item de lista. As âncoras que o documento já tem
 * (`qualificacao`, `materiais`, `projetos`…) são as mesmas, para os cartões do
 * fluxo levarem ao mesmo lugar.
 */

import { formatDate } from './format';

/** Um pedaço de frase, com o negrito do documento. */
export interface Trecho {
  texto: string;
  negrito: boolean;
}

/** Uma frase com os pedaços em negrito do documento. */
export type TextoRico = Trecho[];

/** Os destaques de parágrafo do documento: o aviso, a informação e a letra miúda. */
export type Destaque = 'aviso' | 'informacao' | 'miudo';

export type Bloco =
  | { tipo: 'paragrafo'; ancora: string; texto: TextoRico; destaque: Destaque | null }
  /** Os quadros lado a lado: o título em destaque e o texto (papéis, registros). */
  | { tipo: 'quadros'; ancora: string; quadros: { ancora: string; titulo: string; texto: string }[] }
  /** A lista numerada do documento (as alíneas dos laboratórios). */
  | { tipo: 'lista'; ancora: string; itens: { ancora: string; texto: string }[] }
  | { tipo: 'tabela'; ancora: string; colunas: string[]; linhas: { ancora: string; celulas: TextoRico[] }[] }
  /** Onde o histórico de revisões entra, dentro da seção (no documento, a seção 7). */
  | { tipo: 'historico'; ancora: string };

export interface Secao {
  numero: number;
  ancora: string;
  titulo: string;
  /** O selo do canto: "SiAC 8.4", "Controle documental"… */
  selo: string;
  /** O texto do "?" da seção, como o documento o tem. */
  ajuda: string;
  blocos: Bloco[];
}

export interface CartaoDoFluxo {
  /** O título como o documento o tem, com o emoji; a tela mostra sem (D730, resposta (a)). */
  titulo: string;
  texto: string;
  /** Para onde o cartão leva, a âncora do próprio documento; `null` se não leva. */
  destino: string | null;
}

export interface PassoDaSequencia {
  titulo: string;
  texto: string;
}

export interface RevisaoDoProcedimento {
  revisao: string;
  /** A data em `aaaa-mm-dd`, ou `null`. */
  data: string | null;
  descricao: string;
  revisado_por: string;
  aprovado_por: string;
}

export interface Procedimento {
  codigo: string;
  titulo: string;
  subtitulo: string;
  /** A linha de cima do título: "CAMPISI ENGENHARIA LTDA · SGQ PBQP-H SIAC NÍVEL A". */
  sobretitulo: string;
  revisao: string;
  /** O que o documento diz da revisão vigente: "Emissão inicial formal". */
  situacao: string;
  /** A data da revisão vigente, `aaaa-mm-dd`. */
  data: string;
  responsavel: string;
  referencia: string;
  escopo: string;
  comoUsar: TextoRico;
  fluxo: {
    titulo: string;
    introducao: string;
    cartoes: CartaoDoFluxo[];
    tituloDaSequencia: string;
    sequencia: PassoDaSequencia[];
  };
  secoes: Secao[];
  /** A primeira parte do rodapé do documento (a segunda fala da ferramenta do navegador e não entra). */
  rodape: { titulo: string; texto: string } | null;
  /** O histórico, ou `null` se não foi lido. */
  revisoes: RevisaoDoProcedimento[] | null;
}

// ── O que a página diz ───────────────────────────────────────────────────────

/** O nome da página no menu e no título (D730 §3.1). */
export const NOME_DA_PAGINA = 'Procedimento de Compras (PS.02)';

/** O que a página é (régua da D475): o subtítulo, logo abaixo do título. */
export const O_QUE_E_A_PAGINA =
  'O procedimento do SGQ que diz como a Campisi compra e contrata: da necessidade ao fornecedor avaliado. ' +
  'O texto em vigor, com o histórico de revisões no fim.';

/** Os nomes dos seis campos do cabeçalho, como o documento os escreve. */
export const CAMPOS_DO_CABECALHO = {
  codigo: 'Código',
  revisao: 'Revisão vigente',
  data: 'Data da revisão',
  responsavel: 'Responsável pela próxima revisão',
  referencia: 'Referência principal',
  escopo: 'Escopo',
} as const;

/** O título do sumário, como o documento o escreve. */
export const SUMARIO = 'Sumário:';

export const SEM_PROCEDIMENTO ='O texto do procedimento ainda não foi carregado.';
export const FALHA_AO_LER = 'Não foi possível ler o procedimento. Tente de novo.';

/** As colunas do histórico, como a tabela da seção 7 do documento. */
export const COLUNAS_DAS_REVISOES = [
  'Revisão',
  'Data',
  'Descrição',
  'Resp. revisão',
  'Análise crítica / aprovação',
] as const;

export const SEM_REVISOES = 'O histórico de revisões ainda não foi carregado.';
export const NENHUMA_REVISAO = 'Nenhuma revisão registrada.';

// ── Regras pequenas ──────────────────────────────────────────────────────────

/**
 * O título do cartão sem o emoji do começo (D730, resposta (a): o banco guarda
 * o que o arquivo tem; a tela não mostra emoji, regra 6 da casa).
 */
export function semEmoji(texto: string): string {
  return texto
    .replace(/\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}]|\u200D|\uFE0F/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A frase sem o negrito, para quem precisa só das palavras. */
export function textoSimples(t: TextoRico): string {
  return t.map((p) => p.texto).join('');
}

/** "Rev. 00 · 31/08/2026". */
export function revisaoDoProcedimento(p: Pick<Procedimento, 'revisao' | 'data'>): string {
  return `Rev. ${p.revisao} · ${formatDate(p.data)}`;
}

/** A linha do histórico como a tabela a mostra: a data em dd/mm/aaaa, "—" sem data. */
export function linhaDaRevisao(r: RevisaoDoProcedimento): string[] {
  return [r.revisao, r.data ? formatDate(r.data) : '—', r.descricao, r.revisado_por, r.aprovado_por];
}

/** O nome do arquivo do PDF: "PS.02 - Aquisição & Qualificação de Fornecedores - Rev 00.pdf". */
export function nomeDoPdfDoProcedimento(p: Pick<Procedimento, 'titulo' | 'revisao'>): string {
  const nome = p.titulo.replace(/\s+—\s+/, ' - ').replace(/[\\/:*?"<>|]/g, '-').trim();
  return `${nome} - Rev ${p.revisao}.pdf`;
}

/** Todas as âncoras do procedimento, na ordem do documento. */
export function ancorasDe(p: Pick<Procedimento, 'secoes'>): string[] {
  const out: string[] = [];
  for (const s of p.secoes) {
    out.push(s.ancora);
    for (const b of s.blocos) {
      out.push(b.ancora);
      if (b.tipo === 'quadros') out.push(...b.quadros.map((q) => q.ancora));
      if (b.tipo === 'lista') out.push(...b.itens.map((i) => i.ancora));
      if (b.tipo === 'tabela') out.push(...b.linhas.map((l) => l.ancora));
    }
  }
  return out;
}

/** A seção dona da âncora (a própria seção, ou a que tem o bloco, o quadro, a linha ou o item). */
export function secaoDaAncora(p: Pick<Procedimento, 'secoes'>, ancora: string): Secao | null {
  return p.secoes.find((s) => ancorasDe({ secoes: [s] }).includes(ancora)) ?? null;
}

// ── O caminho das telas para o item (D730 §3.3) ──────────────────────────────

/** O código do procedimento que as telas apontam. */
export const PS02 = 'PS.02';

/** As seções que o "?" das telas aponta (D728 §3: material no item 2, laboratório no item 5). */
export const ITEM_DA_QUALIFICACAO = { numero: 2, ancora: 'qualificacao' } as const;
export const ITEM_DOS_LABORATORIOS = { numero: 5, ancora: 'laboratorios' } as const;

/** "ver no PS.02, item 2". */
export function caminhoParaOItem(numero: number): string {
  return `ver no ${PS02}, item ${numero}`;
}
