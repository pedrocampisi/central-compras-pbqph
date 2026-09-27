/**
 * Os dois leitores da IA (CTO-D567, palavra do Pedro em 26/09/2026): a pessoa
 * escolhe qual lê, e nada escolhe sozinho. Lógica pura, sem tela.
 *
 * O que o parecer mediu (Pesquisador, D556–D565), para a tela dizer a verdade:
 *
 *   papel limpo (PDF do fornecedor) ...... os dois acertaram tudo
 *   foto, escaneado, de lado, miúdo ...... o rápido errou preço em 7 de 16;
 *                                          o certeiro, em nenhuma
 *   espera ............................... rápido uns 7 s; certeiro uns 16 s,
 *                                          até 50 s em 5 páginas fotografadas
 *
 * Em 6 dos 7 erros o total lido não batia com o do papel — por isso a tela
 * mostra o total em destaque e pede a conferência.
 */

import { computeItemTotal } from './compute';
import type { Item } from './types';

export type Leitor = 'rapido' | 'certeiro';

/**
 * A tela começa no rápido; a pessoa troca com um clique. O rápido é o padrão e
 * o certeiro, a exceção (CTO-D582, palavra do Pedro em 27/09/2026: "a
 * prioridade é o rápido").
 */
export const LEITOR_PADRAO: Leitor = 'rapido';

export const LEITORES: Record<Leitor, { nome: string; paraQue: string; espera: string }> = {
  rapido: {
    nome: 'Rápido',
    paraQue: 'Use primeiro. Serve para quase todo pedido.',
    espera: 'Leva uns segundos.',
  },
  certeiro: {
    nome: 'Certeiro',
    paraQue: 'Só para papel escaneado, ou quando o rápido não der conta.',
    espera: 'Leva até 1 minuto.',
  },
};

export const DICA_DO_LEITOR = 'Comece sempre pelo rápido.';

/**
 * Quem leu, pelo `_meta.leitor` da resposta. A função de hoje (v4) não diz —
 * e lê sempre pelo rápido. Sem a palavra, `null`: a tela não presume.
 */
export function leitorDaResposta(meta: unknown): Leitor | null {
  const l = (meta as { leitor?: unknown } | null | undefined)?.leitor;
  return l === 'rapido' || l === 'certeiro' ? l : null;
}

/**
 * A trava contra o engano: quem escolheu o certeiro só recebe leitura que o
 * servidor diz ser do certeiro. Qualquer outra (inclusive a da v4, que ignora
 * o pedido e lê pelo rápido) é recusada — nunca aparece como se fosse dele.
 */
export function leituraServe(escolhido: Leitor, respondeu: Leitor | null): boolean {
  return escolhido !== 'certeiro' || respondeu === 'certeiro';
}

/** Quem a tela diz que leu. Sem a palavra do servidor, só pode ter sido o rápido. */
export function quemLeu(respondeu: Leitor | null): Leitor {
  return respondeu ?? 'rapido';
}

export const CERTEIRO_INDISPONIVEL = {
  titulo: 'O leitor certeiro não está disponível agora',
  texto:
    'A resposta veio de outro leitor e não foi usada: nada entrou na OC. ' +
    'Tente de novo daqui a pouco, ou escolha o rápido.',
};

/** O total do que a IA leu: a soma das linhas, como a OC calcula. */
export function totalLido(itens: readonly Item[]): number {
  return itens.reduce((s, it) => s + computeItemTotal(it).total, 0);
}

/**
 * Quantos itens de uma leitura a pessoa já mexeu (mudou ou tirou), comparando
 * com a fotografia de quando entraram. Os que ela pôs à mão não contam: não
 * são da leitura, e a troca não os toca.
 */
export function itensMexidos(daLeitura: readonly Item[], agora: readonly Item[]): number {
  const atual = new Map(agora.map((i) => [i.id, i]));
  return daLeitura.filter((i) => {
    const a = atual.get(i.id);
    return !a || JSON.stringify(a) !== JSON.stringify(i);
  }).length;
}

/**
 * A troca: os itens da leitura antiga saem, e os novos entram NO LUGAR deles
 * (onde estava o primeiro). O resto da OC fica onde está.
 */
export function trocarItensDaLeitura(
  agora: readonly Item[],
  idsAntigos: readonly string[],
  novos: readonly Item[],
): Item[] {
  const saem = new Set(idsAntigos);
  const onde = agora.findIndex((i) => saem.has(i.id));
  const ficam = agora.filter((i) => !saem.has(i.id));
  if (onde < 0) return [...ficam, ...novos];
  const antes = agora.slice(0, onde).filter((i) => !saem.has(i.id)).length;
  return [...ficam.slice(0, antes), ...novos, ...ficam.slice(antes)];
}

/**
 * Quando a leitura falha, o outro leitor pode ajudar? Só quando a falha foi
 * DA LEITURA: resposta cortada ou ilegível (422) e serviço fora (5xx, menos o
 * 503 de "não configurado"). Tipo errado, página demais, texto grande demais
 * (400) e sessão (401/403) o certeiro também não resolve.
 */
export function outroLeitorPodeAjudar(status: number | null): boolean {
  if (status == null) return false;
  return status === 422 || (status >= 500 && status !== 503);
}
