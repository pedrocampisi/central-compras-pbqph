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
 *   Veio o material certo?              confere com a OC e a ECR
 *   Veio a quantidade toda? / Só uma parte   entrega parcial
 *     └ Só uma parte: quanto veio de cada um    a quantidade por item (D794)
 *   O que aconteceu?                    observação, ou tratativa com 2+ "Não"
 *
 * Nenhuma das palavras da direita aparece para ele. Lógica pura, sem tela.
 *
 * As duas do meio diziam "Chegou o que foi pedido?" e "Chegou tudo?", e o
 * Pedro leu as duas como a mesma pergunta (CTO-D792 §3). Uma é o material
 * certo (o tipo, a marca, a medida); a outra, a quantidade toda. O banco
 * guarda o mesmo de antes.
 */

import { pedeTratativa, type Avaliacao } from './qualificacao';
import type { RegistroPedido } from './registroDoFornecedor';

export interface RespostasDoMestre {
  noDia: boolean | null;
  semEstrago: boolean | null;
  oQueFoiPedido: boolean | null;
  /** `true` = chegou tudo; `false` = só uma parte. */
  tudo: boolean | null;
}

export const SEM_RESPOSTA: RespostasDoMestre = { noDia: null, semEstrago: null, oQueFoiPedido: null, tudo: null };

/** As perguntas, na ordem da tela, com os dois botões de cada uma e, nas duas que se confundiam, a dica. */
export const PERGUNTAS_DO_MESTRE = [
  { chave: 'noDia', texto: 'Chegou no dia combinado?', sim: 'Sim', nao: 'Não', dica: '' },
  { chave: 'semEstrago', texto: 'Chegou sem estrago?', sim: 'Sim', nao: 'Não', dica: '' },
  { chave: 'oQueFoiPedido', texto: 'Veio o material certo?', sim: 'Sim', nao: 'Não', dica: 'O tipo, a marca e a medida do pedido.' },
  { chave: 'tudo', texto: 'Veio a quantidade toda?', sim: 'Sim', nao: 'Só uma parte', dica: 'Se faltou alguma coisa, é só uma parte.' },
] as const satisfies readonly { chave: keyof RespostasDoMestre; texto: string; sim: string; nao: string; dica: string }[];

/**
 * O número da nota só com os dígitos (CTO-D792 §4, a D768): a Central casa a
 * nota com a OC por ele. A leitura da foto pode trazer "NF 1.234", e o campo
 * aceita o que o teclado der. Os zeros da frente ficam: quem compara já os tira.
 */
export function numeroDaNotaEmDigitos(numero: string): string {
  return numero.replace(/\D/g, '');
}

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

/**
 * O que falta para o "Pronto", na fala do canteiro, na ordem da tela; vazio
 * quando pode. `problemaDosItens` é o da lista do "Só uma parte", que vem logo
 * depois das perguntas (`problemaDaContagem`).
 */
export function oQueFalta(r: RespostasDoMestre, numeroDaNota: string, oQueAconteceu: string, problemaDosItens = ''): string {
  const semResposta = PERGUNTAS_DO_MESTRE.find((p) => r[p.chave] === null);
  if (semResposta) return `Falta responder: ${semResposta.texto}`;
  if (r.tudo === false && problemaDosItens) return problemaDosItens;
  if (!numeroDaNotaEmDigitos(numeroDaNota)) return 'Tire a foto da nota, ou escreva o número dela.';
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
    notaFiscal: numeroDaNotaEmDigitos(numeroDaNota),
    recebidoEm,
    ...paraAvaliar(r),
    observacao: tratativa ? '' : texto,
    tratativa: tratativa ? texto : '',
  };
}

/** Sem acento e sem maiúscula: "Cerâmica" e "ceramica" são a mesma busca. */
const semAcento = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/**
 * A busca da lista do mestre (CTO-D793 §2.3, D795 §2): a empresa em que o que
 * ele digitou COMEÇA uma palavra do nome — "beta" acha "Cerâmica Beta" —, sem
 * acento e sem maiúscula. Pelo meio da palavra não acha ("eta" não acha "Beta").
 * Busca vazia acha todas.
 */
export function empresaAchada(fornecedor: string, busca: string): boolean {
  const b = semAcento(busca);
  if (!b) return true;
  const nome = semAcento(fornecedor);
  // cada começo de palavra: o início do nome, ou logo depois de algo que não é letra nem número
  for (let i = 0; i < nome.length; i++) {
    if ((i === 0 || !/[\p{L}\p{N}]/u.test(nome[i - 1]!)) && nome.startsWith(b, i)) return true;
  }
  return false;
}

/**
 * A busca aparece a partir de um pedido (CTO-D799, palavra do Pedro: "sempre visível"). Era a partir de 4
 * (D793), e numa obra com 2 pedidos ele procurou a busca e não achou.
 */
export const BUSCA_A_PARTIR_DE = 1;

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
  /**
   * `posicao`: a do item na OC (`material_a_chegar`), que a contagem do "Só uma
   * parte" leva ao banco (D794). Falta no cartão guardado por uma versão antiga.
   */
  itens: { posicao?: number; descricao: string; quantidade: number; unidade: string }[];
  total: number;
  /**
   * O registro do fornecedor de cada ECR da entrega, com o `pede` do banco
   * (D811 §3). Falta no cartão guardado por uma versão antiga, e no banco que
   * ainda não manda: aí o carimbo não pergunta, como antes.
   */
  registros?: RegistroPedido[];
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

// ---------------------------------------------------------------------------
// A quantidade por item (CTO-D794; o envio é o da carta do Banco, §3)
// ---------------------------------------------------------------------------

/** O que ele escreveu em cada item, pela posição na OC; o item que ele não mexeu não está aqui. */
export type ContagemDoMestre = Record<number, string>;

/** Um item no envio: a posição na OC e quanto veio (0 = não veio; pode passar do pedido). */
export interface ItemRecebido {
  posicao: number;
  quantidade: number;
}

/**
 * O número que ele escreveu: "6", "2,5", "1.000". Vazio, negativo ou o que não
 * é número → `null`. O ponto só é milhar quando separa grupos de três ("1.000");
 * sozinho, é a vírgula de quem digitou no teclado de outro jeito ("2.5").
 */
export function quantidadeEscrita(escrito: string): number | null {
  let t = escrito.trim().replace(/\s/g, '');
  if (!t) return null;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

/** Os itens do cartão sabem a posição deles? O cartão guardado por uma versão antiga, não: aí não se conta. */
export function contaPorItem(cartao: CartaoAChegar): boolean {
  return cartao.itens.length > 0 && cartao.itens.every((i) => Number.isInteger(i.posicao) && i.posicao! >= 1);
}

/** O que está no campo do item: o que ele escreveu, ou a quantidade pedida, já escrita. */
export function escritoNoItem(item: CartaoAChegar['itens'][number], contagem: ContagemDoMestre): string {
  return contagem[item.posicao!] ?? quantidadeFalada(item.quantidade);
}

/**
 * O que falta na contagem do "Só uma parte"; '' quando pode. Um item sem número
 * pede o número; e, se tudo continua com o pedido, ele não disse o que faltou.
 */
export function problemaDaContagem(cartao: CartaoAChegar, contagem: ContagemDoMestre): string {
  if (!contaPorItem(cartao)) return '';
  for (const i of cartao.itens) {
    if (quantidadeEscrita(escritoNoItem(i, contagem)) === null) {
      return `Escreva quanto veio de ${i.descricao}. Se não veio, escreva 0.`;
    }
  }
  if (cartao.itens.every((i) => quantidadeEscrita(escritoNoItem(i, contagem))! >= i.quantidade)) {
    return 'Você disse "Só uma parte": mude a quantidade do que veio a menos.';
  }
  return '';
}

/**
 * Os itens do envio (Banco-D794 §3). Com "Sim", a quantidade pedida de cada um;
 * com "Só uma parte", a que ele deixou em cada campo. Sem a posição (o cartão
 * antigo), nenhum: a entrega grava como antes, e o item fica "não informado",
 * nunca zero.
 */
export function itensDoEnvio(cartao: CartaoAChegar, tudo: boolean | null, contagem: ContagemDoMestre): ItemRecebido[] {
  if (tudo === null || !contaPorItem(cartao)) return [];
  return cartao.itens.map((i) => ({
    posicao: i.posicao!,
    quantidade: tudo ? i.quantidade : quantidadeEscrita(escritoNoItem(i, contagem))!,
  }));
}

/** Os tiques do "Conferir item por item": a posição do item → veio tudo dele. */
export type TiquesDoMestre = Record<number, boolean>;

/**
 * O tique de cada item que a resposta de hoje já diz (CTO-D1036 §2.2): "Sim",
 * todos; "Só uma parte", os que estão com o pedido ou mais. Sem resposta ainda,
 * os que ele já ticou, conferindo peça por peça (CTO-D1036e): o tique fica na
 * contagem, com a quantidade pedida, e por isso fica no celular como o resto.
 */
export function tiquesDaResposta(cartao: CartaoAChegar, tudo: boolean | null, contagem: ContagemDoMestre): TiquesDoMestre {
  const t: TiquesDoMestre = {};
  for (const i of cartao.itens) {
    const q = quantidadeEscrita(escritoNoItem(i, contagem));
    const cheio = q !== null && q >= i.quantidade;
    t[i.posicao!] = tudo === true || (tudo === false && cheio) || (tudo === null && contagem[i.posicao!] !== undefined && cheio);
  }
  return t;
}

/**
 * Os tiques viram a resposta de hoje, e nada mais (CTO-D1036 §2.2): o que se
 * guarda não muda. Todos ticados é o "Sim"; um sem tique é o "Só uma parte",
 * com o campo de quanto veio daquele item (D794) — vazio, para ele escrever,
 * a não ser que já tenha escrito menos que o pedido.
 *
 * Antes de responder (`antes` nulo), ele está conferindo peça por peça
 * (CTO-D1036e): o tique só marca a peça que veio inteira, e a resposta fica
 * em aberto até a última peça ticada (o "Sim") ou o "Só uma parte".
 */
export function respostaDosTiques(
  cartao: CartaoAChegar,
  tiques: TiquesDoMestre,
  contagem: ContagemDoMestre,
  antes: boolean | null = false,
): { tudo: boolean | null; contagem: ContagemDoMestre } {
  if (cartao.itens.every((i) => tiques[i.posicao!])) return { tudo: true, contagem: {} };
  if (antes === null) {
    const ticadas: ContagemDoMestre = {};
    for (const i of cartao.itens) if (tiques[i.posicao!]) ticadas[i.posicao!] = quantidadeFalada(i.quantidade);
    return { tudo: null, contagem: ticadas };
  }
  const nova: ContagemDoMestre = {};
  for (const i of cartao.itens) {
    if (tiques[i.posicao!]) continue;
    const ja = contagem[i.posicao!];
    const q = ja === undefined ? null : quantidadeEscrita(ja);
    nova[i.posicao!] = ja !== undefined && (q === null || q < i.quantidade) ? ja : '';
  }
  return { tudo: false, contagem: nova };
}

/**
 * O "Só uma parte" tocado (CTO-D1036e): a peça já ticada continua ticada, e a
 * sem tique abre o campo de quanto veio, vazio. Depois do "Sim", nenhuma fica
 * ticada: ele escreve quanto veio e tica a que veio inteira.
 */
export function contagemDoSoUmaParte(cartao: CartaoAChegar, antes: boolean | null, contagem: ContagemDoMestre): ContagemDoMestre {
  if (antes === false) return contagem;
  const base = antes === null ? contagem : {};
  const nova: ContagemDoMestre = {};
  for (const i of cartao.itens) nova[i.posicao!] = base[i.posicao!] ?? '';
  return nova;
}

/** Uma obra em que o mestre recebe, com o nome que o banco dá (o mesmo da lista). */
export interface ObraDoMestre {
  id: string;
  nome: string;
}

/**
 * As obras do mestre. Ele não lê o cadastro de obras (o papel dele fica fora
 * das políticas, CTO-D693): o nome vem da `obras_do_mestre_com_nome`, na
 * ordem dela (Banco-D710), e, se faltar, do pedido da lista. A obra de um
 * pedido que ainda está na lista entra mesmo que o banco já não a mande.
 */
export function obrasDoMestre(obras: readonly ObraDoMestre[], cartoes: readonly CartaoAChegar[]): ObraDoMestre[] {
  const dosPedidos = new Map(cartoes.map((c) => [c.intervencaoId, c.obra] as const));
  const nomes = new Map<string, string>();
  for (const o of obras) if (o?.id && !nomes.has(o.id)) nomes.set(o.id, o.nome || dosPedidos.get(o.id) || '');
  for (const [id, nome] of dosPedidos) if (id && !nomes.has(id)) nomes.set(id, nome);
  return [...nomes].map(([id, nome]) => ({ id, nome }));
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

// ---------------------------------------------------------------------------
// O escritório liga o "sem pedido" a uma OC (compras.ligar_sem_pedido)
// ---------------------------------------------------------------------------

/** O que o escritório responde ao ligar; a integridade é a que o mestre disse (D693 §7). */
export interface RespostasDaLigacao {
  ocId: string;
  notaFiscal: string;
  prazoConforme: boolean | null;
  ocEcrConforme: boolean | null;
  chegouTudo: boolean | null;
  tratativa: string;
}

export const LIGACAO_VAZIA: RespostasDaLigacao = {
  ocId: '', notaFiscal: '', prazoConforme: null, ocEcrConforme: null, chegouTudo: null, tratativa: '',
};

/** Quantos "Não Conforme", contando o estrago que o mestre viu. */
export function naoConformesDaLigacao(r: RespostasDaLigacao, chegouComEstrago: boolean): number {
  return [r.prazoConforme === false, chegouComEstrago, r.ocEcrConforme === false].filter(Boolean).length;
}

/** O que falta para ligar, na ordem da tela; '' quando pode. */
export function problemaDaLigacao(
  r: RespostasDaLigacao,
  semPedido: { notaFiscal: string; chegouComEstrago: boolean },
): string {
  if (!r.ocId) return 'Escolha a OC.';
  if (!semPedido.notaFiscal.trim() && !r.notaFiscal.trim()) {
    return 'Escreva o número da nota: o encarregado mandou só a foto.';
  }
  if (r.prazoConforme === null) return 'Responda: Prazo de entrega.';
  if (r.ocEcrConforme === null) return 'Responda: Confere com a OC e com a ECR.';
  if (r.chegouTudo === null) return 'Responda: Chegou tudo?';
  if (naoConformesDaLigacao(r, semPedido.chegouComEstrago) >= 2 && !r.tratativa.trim()) {
    return 'Com duas ou mais "Não Conforme", escreva a tratativa (PS.02).';
  }
  return '';
}

/**
 * As OCs a que o recebimento pode ser ligado: da mesma obra, emitidas ou
 * entregues (o banco recusa as outras). A que o mestre informou vem primeiro;
 * depois, as mais novas.
 */
export function ocsParaLigar<T extends { id: string; obra_id: string; status: string; numero: string }>(
  ocs: readonly T[],
  obraId: string,
  informada = '',
): T[] {
  return ocs
    .filter((o) => o.obra_id === obraId && (o.status === 'emitida' || o.status === 'entregue'))
    .sort((a, b) => Number(b.id === informada) - Number(a.id === informada) || b.numero.localeCompare(a.numero));
}

/** A última entrega de cada OC (pelo dia, depois pela ordem em que entrou): é a que o Histórico mostra. */
export function ultimaEntregaPorOc<T extends { id: number; ocId: string; recebidoEm: string }>(
  avaliacoes: readonly T[],
): Map<string, T> {
  const m = new Map<string, T>();
  for (const a of avaliacoes) {
    const antes = m.get(a.ocId);
    if (!antes || a.recebidoEm > antes.recebidoEm || (a.recebidoEm === antes.recebidoEm && a.id > antes.id)) {
      m.set(a.ocId, a);
    }
  }
  return m;
}

// ---------------------------------------------------------------------------
// A entrega pelo escritório, nas palavras do mestre (CTO-D1039)
// ---------------------------------------------------------------------------

/**
 * A OC do Histórico no formato do cartão do mestre, para o escritório usar as
 * mesmas peças do "Veio a quantidade toda?" (o tique e o quanto veio de cada
 * item). O item sem posição (`posicao`) deixa o cartão sem a lista por item,
 * como o cartão antigo do celular: a entrega grava sem os itens.
 */
export function cartaoDoEscritorio(
  oc: { id: string; numero: string; obra_id: string; entrega_prevista?: string; itens: readonly { posicao?: number; descricao: string; quantidade: number; unidade: string }[] },
  obra: string,
  fornecedor: string,
): CartaoAChegar {
  return {
    ocId: oc.id,
    intervencaoId: oc.obra_id,
    obra,
    numero: oc.numero,
    fornecedor,
    combinadoPara: oc.entrega_prevista ?? '',
    itens: oc.itens.map((i) => ({
      ...(i.posicao ? { posicao: i.posicao } : {}),
      descricao: i.descricao,
      quantidade: i.quantidade,
      unidade: i.unidade,
    })),
    total: 0,
  };
}

/**
 * O que falta para o "Registrar entrega" do escritório; '' quando pode. A
 * ordem é a da caixa: a nota e o dia (que o escritório digita, e o mestre não),
 * depois as perguntas do mestre, a contagem do "Só uma parte" e o "O que
 * aconteceu?" das duas ou mais "Não".
 */
export function problemaDaEntregaDoEscritorio(
  r: RespostasDoMestre,
  notaFiscal: string,
  recebidoEm: string,
  hoje: string,
  oQueAconteceu: string,
  problemaDosItens = '',
): string {
  if (!notaFiscal.trim()) return 'Informe o número da nota fiscal.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recebidoEm)) return 'Informe o dia do recebimento.';
  if (recebidoEm > hoje) return 'O dia do recebimento não pode ser depois de hoje.';
  const semResposta = PERGUNTAS_DO_MESTRE.find((p) => r[p.chave] === null);
  if (semResposta) return `Falta responder: ${semResposta.texto}`;
  if (r.tudo === false && problemaDosItens) return problemaDosItens;
  if (oQueAconteceuObrigatorio(r) && !oQueAconteceu.trim()) return 'Conte o que aconteceu: tem mais de um "Não".';
  return '';
}

/**
 * O que o escritório respondeu → a avaliação do PS.02: a mesma tradução do
 * mestre (`avaliacaoDoMestre`), com a nota como foi digitada, porque a caixa
 * do escritório sempre a gravou assim.
 */
export function avaliacaoDoEscritorio(
  r: RespostasDoMestre,
  notaFiscal: string,
  oQueAconteceu: string,
  recebidoEm: string,
): Avaliacao {
  return { ...avaliacaoDoMestre(r, notaFiscal, oQueAconteceu, recebidoEm), notaFiscal: notaFiscal.trim() };
}

/** A nota para comparar: só os dígitos e sem os zeros da frente, porque "NF 001234" e "1234" são a mesma. */
export function notaParaComparar(notaFiscal: string): string {
  return numeroDaNotaEmDigitos(notaFiscal).replace(/^0+(?=\d)/, '');
}

/** Duas ou mais entregas da OC com a mesma nota: pode ser a mesma entrega registrada duas vezes. */
export function temNotaRepetida(entregas: readonly { notaFiscal: string }[]): boolean {
  const vistas = new Set<string>();
  for (const e of entregas) {
    const n = notaParaComparar(e.notaFiscal);
    if (!n) continue;
    if (vistas.has(n)) return true;
    vistas.add(n);
  }
  return false;
}

/** As entregas de cada OC, na ordem em que vieram (o dia, depois a ordem de entrada). */
export function entregasPorOc<T extends { id: number; ocId: string; recebidoEm: string }>(
  avaliacoes: readonly T[],
): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const a of avaliacoes) m.set(a.ocId, [...(m.get(a.ocId) ?? []), a]);
  for (const lista of m.values()) lista.sort((a, b) => a.recebidoEm.localeCompare(b.recebidoEm) || a.id - b.id);
  return m;
}
