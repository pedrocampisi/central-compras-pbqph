/**
 * A ECR — Especificação de Compra e Recebimento — como o documento dela
 * (CTO-D586, emendada pela D588: a ECR do sistema é a que vale; os
 * documentos do Word se aposentaram). Lógica pura, sem tela.
 *
 * O texto de partida é o dos 20 `.docx` do SGQ, palavra por palavra: o Banco
 * carregou (`compras.ecrs.secoes`, `revisao`, `emitida_em`) e conferiu linha
 * por linha. A tela e o PDF não resumem, não consertam e não escondem linha.
 *
 * Cada item: o `rotulo` é o que vem antes do primeiro ":" (até 4 palavras),
 * ou `null`; `numerado` é a linha estar na lista do documento (marcada com um
 * quadradinho). Fora da lista são as notas, como o "Atenção:" do fim da
 * inspeção — e toda nota sai em destaque, como no documento (negrito e
 * vermelho em 17 das 18 notas medidas nos `.docx`).
 */

import type { Ecr, EcrItem, EcrRevisao, EcrSecao } from './types';
import { formatDate } from './format';

/** Os cinco títulos, na ordem do documento. */
export const TITULOS_DA_ECR = [
  'REFERÊNCIA',
  'ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO',
  'REGISTRO DO FORNECEDOR',
  'INSPEÇÃO DO RECEBIMENTO',
  'MANUSEIO, ARMAZENAMENTO E IDENTIFICAÇÃO',
] as const;

/**
 * O que a página diz que é (a regra da D475: cada tela diz o que é). A ECR
 * daqui é a que vale (D588) — a frase não fala de cópia nem de outro
 * documento.
 */
export const O_QUE_E_O_CATALOGO =
  'O texto em vigor de cada ECR, com o histórico de revisões no fim.';

/** Para a ECR que ainda não tem texto: a tela diz, numa linha, e não quebra. */
export const SEM_TEXTO = 'O texto desta ECR ainda não foi carregado.';

/** O título dos materiais (D588 §4.3: um título simples). */
export const MATERIAIS = 'Materiais';

/** O título do histórico, e as colunas, como a tabela do rodapé do documento. */
export const HISTORICO = 'Histórico de revisões';
export const COLUNAS_DO_HISTORICO = [
  'Revisão',
  'Data',
  'Descrição',
  'Revisado por',
  'Aprovado por',
] as const;

/** Quando o sistema não leu o histórico: diz isso, e não mostra tabela vazia. */
export const SEM_HISTORICO = 'O histórico de revisões desta ECR ainda não foi carregado.';

/** Quando o histórico foi lido e não tem linha nenhuma. */
export const NENHUMA_REVISAO = 'Nenhuma revisão registrada.';

/** O cabeçalho do PDF, como o do documento. */
export const CABECALHO_DO_PDF = 'ECR – ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO';

/**
 * As seções como vieram do banco, ou `null` se não vieram (ECR ainda não
 * carregada). Aceita só a forma do contrato; o que não for texto vira texto
 * vazio, e nada é reescrito.
 */
export function secoesDoBanco(v: unknown): EcrSecao[] | null {
  if (!Array.isArray(v)) return null;
  return v.map((s) => {
    const o = (s ?? {}) as Record<string, unknown>;
    const itens = Array.isArray(o['itens']) ? (o['itens'] as unknown[]) : [];
    return {
      titulo: typeof o['titulo'] === 'string' ? o['titulo'] : '',
      itens: itens.map((i): EcrItem => {
        const it = (i ?? {}) as Record<string, unknown>;
        return {
          rotulo: typeof it['rotulo'] === 'string' ? it['rotulo'] : null,
          texto: typeof it['texto'] === 'string' ? it['texto'] : '',
          numerado: it['numerado'] === true,
        };
      }),
    };
  });
}

function textoOuVazio(v: unknown): string {
  return v == null ? '' : String(v);
}

/**
 * O histórico como veio de `compras.ecr_revisoes` (contrato do Banco,
 * D588/D589 §1), ou `null` se não veio. A ordem é a do contrato: a data da
 * revisão (`emitida_em`) e, no empate, a chave (`id`). Os nomes vêm das
 * colunas `_nome` — nas revisões do sistema, a função do banco grava ali o
 * nome do perfil na hora.
 */
export function revisoesDoBanco(v: unknown): EcrRevisao[] | null {
  if (!Array.isArray(v)) return null;
  const linhas = v.map((r) => (r ?? {}) as Record<string, unknown>);
  const data = (o: Record<string, unknown>) => (o['emitida_em'] == null ? '' : String(o['emitida_em']));
  return [...linhas]
    .sort((a, b) => data(a).localeCompare(data(b)) || Number(a['id'] ?? 0) - Number(b['id'] ?? 0))
    .map(
      (o): EcrRevisao => ({
        revisao: textoOuVazio(o['revisao']),
        data: o['emitida_em'] == null ? null : String(o['emitida_em']),
        descricao: textoOuVazio(o['descricao']),
        revisado_por: textoOuVazio(o['revisado_por_nome']),
        aprovado_por: textoOuVazio(o['aprovado_por_nome']),
      }),
    );
}

/** "Rev. 00 · emitida em 15/04/2026" — ou o pedaço que houver, ou `null`. */
export function revisaoDaEcr(ecr: Pick<Ecr, 'revisao' | 'emitida_em'>): string | null {
  const partes: string[] = [];
  if (ecr.revisao) partes.push(`Rev. ${ecr.revisao}`);
  if (ecr.emitida_em) partes.push(`emitida em ${formatDate(ecr.emitida_em)}`);
  return partes.length ? partes.join(' · ') : null;
}

/** O número da seção como o documento o escreve: "01.", "02."… */
export function numeroDaSecao(indice: number): string {
  return `${String(indice + 1).padStart(2, '0')}.`;
}

/** O número da seção dentro de uma frase, sem o ponto do documento: "Seção 02, …". */
export function numeroNaFrase(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}

/** A linha do histórico como a tabela a mostra: a data em dd/mm/aaaa, "—" sem data. */
export function linhaDoHistorico(r: EcrRevisao): string[] {
  return [r.revisao, r.data ? formatDate(r.data) : '—', r.descricao, r.revisado_por, r.aprovado_por];
}

export type BlocoDaSecao =
  | { tipo: 'lista'; itens: EcrItem[] }
  | { tipo: 'nota'; item: EcrItem };

/**
 * Os itens de uma seção em blocos, na ordem do documento: as linhas seguidas
 * da lista ficam numa lista só; cada linha fora da lista é uma nota.
 */
export function blocosDaSecao(itens: readonly EcrItem[]): BlocoDaSecao[] {
  const blocos: BlocoDaSecao[] = [];
  for (const item of itens) {
    const ultimo = blocos[blocos.length - 1];
    if (!item.numerado) blocos.push({ tipo: 'nota', item });
    else if (ultimo?.tipo === 'lista') ultimo.itens.push(item);
    else blocos.push({ tipo: 'lista', itens: [item] });
  }
  return blocos;
}

/** A linha como o documento a escreve: "Rótulo: texto", ou só o texto. */
export function linhaDoDocumento(item: EcrItem): string {
  return item.rotulo ? `${item.rotulo}: ${item.texto}` : item.texto;
}

/** O nome do arquivo do PDF: "ECR 03 - Concreto Usinado - Rev 00.pdf". */
export function nomeDoPdfDaEcr(ecr: Pick<Ecr, 'codigo' | 'nome' | 'revisao'>): string {
  const nome = `${ecr.codigo} - ${ecr.nome}`.replace(/[\\/:*?"<>|]/g, '-').trim();
  return ecr.revisao ? `${nome} - Rev ${ecr.revisao}.pdf` : `${nome}.pdf`;
}

// ── A revisão (CTO-D589 §4.2): só o Pedro edita, e salvar é aprovar ─────────
//
// A tela confere as mesmas regras da `compras.revisar_ecr` ANTES de mandar
// (D593 §1): as mesmas seções, com os mesmos títulos e na mesma ordem; cada
// seção com pelo menos uma linha; o texto com letra; o rótulo em branco ou com
// letra; e o texto diferente do vigente. O banco confere de novo — a tela só
// poupa a pessoa de uma recusa.

const LETRA = /\p{L}/u;

/** Uma linha nova, em branco, na lista. */
export function linhaNova(): EcrItem {
  return { rotulo: null, texto: '', numerado: true };
}

/**
 * O texto como vai ao banco: sem espaço nas pontas do texto e do rótulo, e o
 * rótulo em branco vira `null` (o banco recusa rótulo sem letra). Espaço de
 * dentro fica como está.
 */
export function limparParaGravar(secoes: readonly EcrSecao[]): EcrSecao[] {
  return secoes.map((s) => ({
    titulo: s.titulo,
    itens: s.itens.map((i) => {
      const rotulo = i.rotulo?.trim() ?? '';
      return { rotulo: rotulo === '' ? null : rotulo, texto: i.texto.trim(), numerado: i.numerado };
    }),
  }));
}

/** O mesmo texto, depois de limpo (é o que o banco compara). */
export function mesmoTexto(a: readonly EcrSecao[], b: readonly EcrSecao[]): boolean {
  return JSON.stringify(limparParaGravar(a)) === JSON.stringify(limparParaGravar(b));
}

export interface ProblemaDaRevisao {
  /** O índice da seção, ou `null` quando o problema é do texto inteiro. */
  secao: number | null;
  /** O índice da linha, ou `null` quando o problema é da seção. */
  linha: number | null;
  frase: string;
}

/** O que impede a revisão de ir ao banco. Lista vazia: pode ir. */
export function problemasDaRevisao(
  vigente: readonly EcrSecao[],
  nova: readonly EcrSecao[],
  revisaoVigente: string | null,
): ProblemaDaRevisao[] {
  const limpa = limparParaGravar(nova);
  const problemas: ProblemaDaRevisao[] = [];
  if (limpa.length !== vigente.length || limpa.some((s, i) => s.titulo !== vigente[i]!.titulo)) {
    return [{ secao: null, linha: null, frase: 'As seções têm de ser as mesmas da ECR, com os mesmos títulos e na mesma ordem.' }];
  }
  limpa.forEach((s, i) => {
    const n = numeroNaFrase(i);
    if (s.itens.length === 0) {
      problemas.push({ secao: i, linha: null, frase: `A seção ${n} precisa de pelo menos uma linha.` });
    }
    s.itens.forEach((it, j) => {
      // A linha pelo rótulo, quando tem: é assim que o Pedro a reconhece.
      const qual = it.rotulo && LETRA.test(it.rotulo) ? `a linha "${it.rotulo}"` : `a linha ${j + 1}`;
      if (!LETRA.test(it.texto)) {
        problemas.push({ secao: i, linha: j, frase: `Seção ${n}, ${qual} está sem texto: escreva o texto ou tire a linha.` });
      }
      if (it.rotulo !== null && !LETRA.test(it.rotulo)) {
        problemas.push({ secao: i, linha: j, frase: `Seção ${n}, ${qual}: o rótulo precisa ter uma letra, ou ficar em branco.` });
      }
    });
  });
  if (problemas.length === 0 && mesmoTexto(vigente, limpa)) {
    problemas.push({
      secao: null,
      linha: null,
      frase: `O texto está igual ao da revisão ${revisaoVigente ?? 'vigente'}: não há o que revisar.`,
    });
  }
  return problemas;
}

/** A revisão que o salvar cria: "00" → "01", "09" → "10". */
export function proximaRevisao(revisao: string | null): string {
  const n = Number.parseInt(revisao ?? '', 10);
  return String((Number.isNaN(n) ? -1 : n) + 1).padStart(2, '0');
}

/** Hoje em São Paulo (AAAA-MM-DD): é a data que o banco põe na revisão. */
export function hojeEmSaoPaulo(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);
}

/** O que a tela mostra antes de gravar: "Rev. 00 → 01, emitida hoje (27/09/2026), aprovada por você." */
export function resumoDaRevisao(revisao: string | null, hojeIso: string): string {
  return `Rev. ${revisao ?? '—'} → ${proximaRevisao(revisao)}, emitida hoje (${formatDate(hojeIso)}), aprovada por você.`;
}

/** A frase para a pessoa quando o banco recusa a revisão, pelo código da recusa. */
export function fraseDaRecusaDaRevisao(codigo: string | undefined, mensagem: string): string {
  switch (codigo) {
    case '42501':
      return 'Só o Pedro revisa uma ECR. A revisão não foi gravada.';
    case 'P0002':
      return 'Esta ECR não existe mais no banco. Recarregue a página. A revisão não foi gravada.';
    case '55000':
      return 'A revisão vigente desta ECR não tem o texto guardado no histórico, e revisar agora perderia esse texto. A revisão não foi gravada.';
    case '22023':
      return `O banco recusou a revisão: ${mensagem}`;
    default:
      return `Falha ao gravar a revisão: ${mensagem}`;
  }
}

// As mudanças no rascunho — sempre uma cópia nova, nunca o original.

type Secoes = readonly EcrSecao[];

function naSecao(secoes: Secoes, s: number, f: (itens: EcrItem[]) => EcrItem[]): EcrSecao[] {
  return secoes.map((sec, i) => (i === s ? { ...sec, itens: f([...sec.itens]) } : sec));
}

export function mudaLinha(secoes: Secoes, s: number, l: number, parte: Partial<EcrItem>): EcrSecao[] {
  return naSecao(secoes, s, (itens) => itens.map((it, j) => (j === l ? { ...it, ...parte } : it)));
}

export function poeLinha(secoes: Secoes, s: number): EcrSecao[] {
  return naSecao(secoes, s, (itens) => [...itens, linhaNova()]);
}

export function tiraLinha(secoes: Secoes, s: number, l: number): EcrSecao[] {
  return naSecao(secoes, s, (itens) => itens.filter((_, j) => j !== l));
}

export function moveLinha(secoes: Secoes, s: number, l: number, para: -1 | 1): EcrSecao[] {
  return naSecao(secoes, s, (itens) => {
    const k = l + para;
    if (k < 0 || k >= itens.length) return itens;
    [itens[l], itens[k]] = [itens[k]!, itens[l]!];
    return itens;
  });
}
