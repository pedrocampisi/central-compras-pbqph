/**
 * O recebimento pelo mestre de obra (CTO-D693, palavra do Pedro de 04/10):
 * "quem irá receber o material é um mestre de obra, que não possui um bom
 * domínio de tecnologia". A tela fala como ele fala; esta lógica traduz para
 * o que o PS.02 guarda — as mesmas três perguntas da avaliação do escritório
 * (`Avaliacao`, D604), mais o "chegou tudo".
 *
 *   tela do mestre                      o que o banco guarda
 *   ─────────────────────────────       ─────────────────────────
 *   Chegou no dia combinado?            prazo conforme
 *   Chegou sem estrago?                 integridade conforme
 *   Chegou o que foi pedido?            confere com a OC e a ECR
 *   Chegou tudo? / Só uma parte         entrega parcial
 *   O que aconteceu?                    observação, ou tratativa com 2+ "Não"
 *
 * Nenhuma das palavras da direita aparece para ele. Lógica pura, sem tela.
 */

import { pedeTratativa, type Avaliacao } from './qualificacao';

export interface RespostasDoMestre {
  noDia: boolean | null;
  semEstrago: boolean | null;
  oQueFoiPedido: boolean | null;
  /** `true` = chegou tudo; `false` = só uma parte. */
  tudo: boolean | null;
}

export const SEM_RESPOSTA: RespostasDoMestre = { noDia: null, semEstrago: null, oQueFoiPedido: null, tudo: null };

/** As perguntas, na ordem da tela, com os dois botões de cada uma. */
export const PERGUNTAS_DO_MESTRE = [
  { chave: 'noDia', texto: 'Chegou no dia combinado?', sim: 'Sim', nao: 'Não' },
  { chave: 'semEstrago', texto: 'Chegou sem estrago?', sim: 'Sim', nao: 'Não' },
  { chave: 'oQueFoiPedido', texto: 'Chegou o que foi pedido?', sim: 'Sim', nao: 'Não' },
  { chave: 'tudo', texto: 'Chegou tudo?', sim: 'Sim', nao: 'Só uma parte' },
] as const satisfies readonly { chave: keyof RespostasDoMestre; texto: string; sim: string; nao: string }[];

const paraAvaliar = (r: RespostasDoMestre) => ({
  prazoConforme: r.noDia,
  integridadeConforme: r.semEstrago,
  ocEcrConforme: r.oQueFoiPedido,
});

/** Quantos "Não" nas três perguntas do PS.02 ("Só uma parte" não é defeito: é entrega parcial). */
export function naosDoMestre(r: RespostasDoMestre): number {
  return [r.noDia, r.semEstrago, r.oQueFoiPedido].filter((x) => x === false).length;
}

/** A caixa "O que aconteceu?" aparece com qualquer "Não" ou com "Só uma parte". */
export function perguntaOQueAconteceu(r: RespostasDoMestre): boolean {
  return naosDoMestre(r) > 0 || r.tudo === false;
}

/** E é obrigatória com dois ou mais "Não" — a regra do PS.02, a mesma do escritório. */
export function oQueAconteceuObrigatorio(r: RespostasDoMestre): boolean {
  return pedeTratativa(paraAvaliar(r));
}

/** O que falta para o "Pronto", na fala do canteiro; vazio quando pode. */
export function oQueFalta(r: RespostasDoMestre, numeroDaNota: string, oQueAconteceu: string): string {
  const semResposta = PERGUNTAS_DO_MESTRE.find((p) => r[p.chave] === null);
  if (semResposta) return `Falta responder: ${semResposta.texto}`;
  if (!numeroDaNota.trim()) return 'Tire a foto da nota, ou escreva o número dela.';
  if (oQueAconteceuObrigatorio(r) && !oQueAconteceu.trim()) {
    return 'Conte o que aconteceu: tem mais de um "Não".';
  }
  return '';
}

/**
 * O que o mestre respondeu → a avaliação do PS.02. O texto dele vai como
 * tratativa quando ela é obrigatória, e como observação nos outros casos — a
 * mesma separação do escritório (`avaliacaoParaGravar`).
 */
export function avaliacaoDoMestre(
  r: RespostasDoMestre,
  numeroDaNota: string,
  oQueAconteceu: string,
  recebidoEm: string,
): Avaliacao {
  const texto = oQueAconteceu.trim();
  const tratativa = oQueAconteceuObrigatorio(r);
  return {
    notaFiscal: numeroDaNota.trim(),
    recebidoEm,
    ...paraAvaliar(r),
    observacao: tratativa ? '' : texto,
    tratativa: tratativa ? texto : '',
  };
}

/** Um pedido que o mestre espera, como o cartão mostra. */
export interface CartaoAChegar {
  ocId: string;
  /** A obra do pedido: é ela que a foto e a entrega levam ao banco. */
  intervencaoId: string;
  obra: string;
  numero: string;
  /** O apelido da empresa (D680), nunca a razão social comprida. */
  fornecedor: string;
  /** O dia combinado, `AAAA-MM-DD`; vazio quando o pedido não tem. */
  combinadoPara: string;
  itens: { descricao: string; quantidade: number; unidade: string }[];
  total: number;
}

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** "hoje", "amanhã", "ontem", ou "terça, 06/10" — como se fala no canteiro; vazio quando o pedido não tem data. */
export function diaCombinado(dia: string, hoje: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return '';
  const d = new Date(`${dia}T12:00:00Z`);
  const h = new Date(`${hoje}T12:00:00Z`);
  const dif = Math.round((d.getTime() - h.getTime()) / 86_400_000);
  if (dif === 0) return 'hoje';
  if (dif === 1) return 'amanhã';
  if (dif === -1) return 'ontem';
  return `${DIAS[d.getUTCDay()]}, ${dia.slice(8, 10)}/${dia.slice(5, 7)}`;
}

/** A quantidade sem zeros à toa: 40, 2,5, 0,75. */
export function quantidadeFalada(q: number): string {
  return Number.isInteger(q) ? String(q) : String(Math.round(q * 1000) / 1000).replace('.', ',');
}

/** Uma obra em que o mestre recebe; o nome pode faltar quando nenhum pedido dela está a caminho. */
export interface ObraDoMestre {
  id: string;
  nome: string;
}

/**
 * As obras do mestre, com o nome que os pedidos trazem: ele não lê o cadastro
 * de obras (o papel dele fica fora das políticas, CTO-D693), e o nome chega
 * pela lista. Obra sem pedido a caminho fica sem nome.
 */
export function obrasDoMestre(ids: readonly string[], cartoes: readonly CartaoAChegar[]): ObraDoMestre[] {
  const nomes = new Map(cartoes.map((c) => [c.intervencaoId, c.obra] as const));
  const todas = [...new Set([...ids, ...cartoes.map((c) => c.intervencaoId)])].filter(Boolean);
  return todas.map((id) => ({ id, nome: nomes.get(id) ?? '' }));
}

/** O banco disse não, e mandar de novo não muda: a fila para de tentar este. */
export class RecusaDefinitiva extends Error {}

/**
 * O que a fila faz com a resposta do banco que não foi sucesso — a tabela da
 * carta da OC (D697 §4), confirmada pelo Banco com dois acréscimos:
 *
 *   sem resposta, 5xx, 40001, 40P01, 57014, conexão (08…), API (PGRST…) → espera
 *   23505 → manda de novo UMA vez: é o mesmo envio chegando duas vezes ao
 *           mesmo tempo, e a segunda recebe "já estava"
 *   qualquer outro código do banco (42501, 55000, 22023, 23514, P0001,
 *   P0002…) → para, e mostra a mensagem como veio
 */
export type OQueFazer = 'espera' | 'de-novo-uma-vez' | 'para';

const ESPERA = new Set(['40001', '40P01', '57014']);

export function oQueFazerComARecusa(codigo: string | null | undefined, status: number): OQueFazer {
  if (status === 0 || status >= 500) return 'espera';
  const c = (codigo ?? '').trim();
  if (!c || ESPERA.has(c) || c.startsWith('08') || c.startsWith('PGRST')) return 'espera';
  if (c === '23505') return 'de-novo-uma-vez';
  return 'para';
}

/** O mesmo, para as funções de borda (a foto): só o status HTTP. */
export function oQueFazerComOStatus(status: number): Exclude<OQueFazer, 'de-novo-uma-vez'> {
  // 401: o crachá venceu no meio do caminho; a biblioteca renova, e a próxima volta passa.
  // 408 e 429: o servidor pediu para esperar.
  if (status === 0 || status >= 500 || status === 401 || status === 408 || status === 429) return 'espera';
  return 'para';
}
