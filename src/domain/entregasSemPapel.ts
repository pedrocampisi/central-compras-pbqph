/**
 * As entregas sem o papel do fornecedor, e a cobertura de cada entrega
 * (CTO-D840 §2.4 a §2.6; o contrato do Banco, D840):
 *
 * - **A lista do escritório:** uma linha por entrega e ECR que pede o papel e
 *   está sem ele (`compras.entregas_sem_papel`), da mais antiga para a mais
 *   nova, com as palavras da ECR e o porquê do banco. De lá, o comprador anexa o
 *   papel, ou marca "não se aplica a esta entrega", com o motivo. A marca não se
 *   desfaz.
 * - **A cobertura, para o auditor:** por entrega e ECR, o papel que a cobre, a
 *   marca de que não se aplica, ou que falta (`compras.cobertura_das_entregas`).
 *
 * Quem diz se a entrega pede o papel, e se ele a cobre, é o banco; aqui nada
 * decide isso. Lógica pura, sem tela.
 */

import { formatDate } from './format';
import { textoDoAlcance, type Alcance, type LinhaDoRegistro } from './registroDoFornecedor';
import { codigoDaEcr } from './registrosGuardados';

/** Uma linha da `compras.entregas_sem_papel`: uma entrega, e uma ECR dela sem o papel. */
export interface EntregaSemPapel {
  avaliacaoId: number;
  ocId: string;
  /** O número da OC. */
  numero: string;
  obra: string;
  fornecedor: string;
  /** O fornecedor da OC, para o papel entrar com a empresa certa; '' quando o banco não mandou. */
  fornecedorId: string;
  /** AAAA-MM-DD */
  recebidoEm: string;
  notaFiscal: string;
  avaliadoPorNome: string;
  ecrId: number;
  /** "ECR 02" */
  ecr: string;
  /** "Madeira" */
  nome: string;
  /** As posições, na OC, dos itens desta ECR. */
  posicoes: number[];
  /** A regra do banco que pediu, na frase dele. */
  porque: string;
  /** O que a ECR pede, linha por linha, como está; vazio quando a revisão não tem o texto no sistema. */
  linhas: LinhaDoRegistro[];
  /** A observação da entrega: onde fica o que a obra escreveu. */
  observacao: string;
  /** A marca "a cada entrega" (ECRs 01, 02, 17): o papel só vale para o lote que ele nomeia. */
  aCadaEntrega: boolean;
}

/** A chave de uma linha: a entrega e a ECR. */
export const chaveDaLinha = (l: Pick<EntregaSemPapel, 'avaliacaoId' | 'ecrId'>) => `${l.avaliacaoId}-${l.ecrId}`;

/** Da mais antiga para a mais nova; na mesma entrega, pela ECR. O banco já manda assim: aqui é a segunda trava. */
export function emOrdem(linhas: readonly EntregaSemPapel[]): EntregaSemPapel[] {
  return [...linhas].sort(
    (a, b) => a.recebidoEm.localeCompare(b.recebidoEm) || a.avaliacaoId - b.avaliacaoId || a.ecrId - b.ecrId,
  );
}

/**
 * A máscara de uma obra: só as linhas das OCs dela. A obra vai na busca; isto é
 * a segunda trava, e a linha de uma OC que a tela não conhece fica de fora.
 */
export function daObra(
  linhas: readonly EntregaSemPapel[],
  mascara: string | null,
  obraDaOc: (ocId: string) => string | undefined,
): EntregaSemPapel[] {
  return mascara ? linhas.filter((l) => obraDaOc(l.ocId) === mascara) : [...linhas];
}

/** "ECR 02 — Madeira" */
export const rotuloDaLinha = (l: Pick<EntregaSemPapel, 'ecr' | 'ecrId' | 'nome'>) =>
  `${l.ecr || codigoDaEcr(l.ecrId)}${l.nome ? ` — ${l.nome}` : ''}`;

/** "OC 2026/101 · Fornecedor · entrega de 14/10/2026": quem é a entrega, numa linha. */
export const quemEhAEntrega = (l: Pick<EntregaSemPapel, 'numero' | 'fornecedor' | 'recebidoEm'>) =>
  [`OC ${l.numero || '(sem número)'}`, l.fornecedor, `entrega de ${formatDate(l.recebidoEm)}`].filter(Boolean).join(' · ');

/** O aviso antes de gravar o "não se aplica" (Banco-D840, escolha 4). */
export const NAO_SE_DESFAZ =
  'A marca não se desfaz: depois de gravada, esta entrega fica como "não se aplica" para esta ECR, com o motivo, quem marcou e quando.';

/** O que falta para gravar o "não se aplica"; '' quando pode. */
export function problemaDoNaoSeAplica(motivo: string): string {
  return motivo.trim() ? '' : 'Escreva o motivo: ele fica no registro da entrega.';
}

/** A situação de uma ECR numa entrega, como a `cobertura_das_entregas` diz. */
export type SituacaoDaCobertura = 'nao_exige' | 'coberta' | 'nao_se_aplica' | 'sem_papel';

/** Uma linha da `compras.cobertura_das_entregas`. */
export interface CoberturaDaEntrega {
  avaliacaoId: number;
  ecrId: number;
  situacao: SituacaoDaCobertura;
  /** O papel que cobre (na `coberta`); '' nos outros. */
  documentoId: string;
  alcance: Alcance | null;
  validoAte: string;
  /** O porquê do "não se aplica". */
  motivo: string;
}

/**
 * A linha curta do auditor, por ECR: "ECR 02: deste lote", "ECR 19: sem papel",
 * "ECR 06: não se aplica — é compensado". A ECR que não exige não aparece ('').
 */
export function textoDaCobertura(c: Pick<CoberturaDaEntrega, 'ecrId' | 'situacao' | 'alcance' | 'validoAte' | 'motivo'>): string {
  const ecr = codigoDaEcr(c.ecrId);
  if (c.situacao === 'coberta') return `${ecr}: ${textoDoAlcance(c.alcance ?? 'lote', c.validoAte).toLowerCase()}`;
  if (c.situacao === 'nao_se_aplica') return `${ecr}: não se aplica${c.motivo.trim() ? ` — ${c.motivo.trim()}` : ''}`;
  if (c.situacao === 'sem_papel') return `${ecr}: sem papel`;
  return '';
}

/** A cobertura de cada entrega, pela ECR, sem as que não exigem. */
export function coberturaPorEntrega(linhas: readonly CoberturaDaEntrega[]): Map<number, CoberturaDaEntrega[]> {
  const m = new Map<number, CoberturaDaEntrega[]>();
  for (const c of linhas) {
    if (c.situacao === 'nao_exige') continue;
    m.set(c.avaliacaoId, [...(m.get(c.avaliacaoId) ?? []), c]);
  }
  for (const v of m.values()) v.sort((a, b) => a.ecrId - b.ecrId);
  return m;
}

/** A coluna do PDF: as linhas curtas da entrega, uma por ECR; '—' quando nenhuma ECR dela pede o papel. */
export function colunaDoRegistro(cobertura: readonly CoberturaDaEntrega[] | undefined): string {
  const linhas = (cobertura ?? []).map(textoDaCobertura).filter(Boolean);
  return linhas.length ? linhas.join('\n') : '—';
}
