/**
 * O tutorial "Fazer uma OC" da tela Nova OC (CTO-D763, piloto).
 *
 * A pessoa faz de verdade: o balão acende um campo, e o passo segue quando ela
 * age — escolheu o fornecedor, vai para a obra. O tutorial nunca emite: o
 * último passo acende o "Emitir OC + Gerar PDF" e explica, e quem aperta é a
 * pessoa. Nada aqui grava; esta lógica só lê a OC que está na tela.
 *
 * Uma fonte só para o texto (D763 §1.6): a frase que a tela já mostra num
 * campo mora aqui, e a tela a lê daqui — mudou, os dois mudam juntos.
 */

import type { OrdemCompra } from './types';
import { O_QUE_E_ECR } from './ecr';

// ── As frases que a tela e o tutorial dividem ─────────────────────────────────

/** A dica embaixo de "Entrega prevista". */
export const DICA_DA_ENTREGA = 'O dia combinado com o fornecedor. É o que o mestre vê na obra.';
/** O vazio da tabela de itens. */
export const VAZIO_DOS_ITENS = 'Clique em "+ Adicionar Item" ou importe um pedido via IA.';
/** A dica do "Importar Pedido (IA)". */
export const DICA_DA_IMPORTACAO = 'Importar os itens de um pedido (PDF, foto ou print) pela IA';

// ── Os passos ─────────────────────────────────────────────────────────────────

/** Onde o balão acende: o `data-tutorial` do elemento na tela. */
export type AlvoDoTutorial = 'fornecedor' | 'obra' | 'entrega' | 'itens' | 'tabela' | 'totais' | 'emitir';

export interface PassoDoTutorial {
  alvo: AlvoDoTutorial;
  titulo: string;
  texto: string;
  /**
   * O que a pessoa faz para o passo seguir sozinho. Sem isto, o passo é de
   * leitura e segue no "Próximo".
   */
  fazer?: string;
  /**
   * O retrato da OC que este passo olha. O passo segue sozinho quando o
   * retrato MUDA e fica cumprido — por isso quem volta a um passo já feito
   * não é empurrado para a frente na hora.
   */
  retrato?: (oc: OrdemCompra) => string;
  cumprido?: (oc: OrdemCompra) => boolean;
}

export const PASSOS_DA_NOVA_OC: readonly PassoDoTutorial[] = [
  {
    alvo: 'fornecedor',
    titulo: 'Escolha o fornecedor',
    texto:
      'Digite parte do nome e escolha a empresa na lista. Embaixo do campo aparece o nome que vai na OC, ' +
      'e ao lado o selo diz se a empresa está qualificada para material.',
    fazer: 'Escolha um fornecedor para seguir.',
    retrato: (oc) => oc.fornecedor_id,
    cumprido: (oc) => oc.fornecedor_id !== '',
  },
  {
    alvo: 'obra',
    titulo: 'Escolha a obra',
    texto:
      'A obra diz para quem a nota fiscal é faturada (aparece embaixo do campo) e em que pasta o PDF da OC ' +
      'fica guardado.',
    fazer: 'Escolha a obra para seguir.',
    retrato: (oc) => oc.obra_id,
    cumprido: (oc) => oc.obra_id !== '',
  },
  {
    alvo: 'entrega',
    titulo: 'Quando chega',
    texto: `${DICA_DA_ENTREGA} Não é obrigatório.`,
  },
  {
    alvo: 'itens',
    titulo: 'Ponha os itens',
    texto: `${VAZIO_DOS_ITENS} A IA lê o pedido do fornecedor em PDF, foto ou print, e os itens entram na tabela.`,
    fazer: 'Ponha o primeiro item para seguir.',
    retrato: (oc) => String(oc.itens.length),
    cumprido: (oc) => oc.itens.length > 0,
  },
  {
    alvo: 'tabela',
    titulo: 'Confira cada item',
    texto:
      'Descrição, quantidade, unidade e preço de cada linha. Item sem quantidade não emite. Na coluna ECR, ' +
      `marque a do material controlado. ${O_QUE_E_ECR}`,
  },
  {
    alvo: 'totais',
    titulo: 'Frete e descontos',
    texto: 'Frete, outras despesas e desconto do material entram aqui, e o total geral se refaz sozinho.',
  },
  {
    alvo: 'emitir',
    titulo: 'Emitir a OC',
    texto:
      'Quando estiver tudo certo, é este botão que emite: a OC ganha o número, o PDF é gerado e vai para a ' +
      'pasta da obra. Quem aperta é você — o tutorial não aperta, e sair dele não grava nada. Ainda não ' +
      'terminou? "Salvar Rascunho" guarda a OC sem número.',
  },
];

/** O passo seguiu sozinho? Só quando a pessoa AGIU: o retrato mudou e o passo ficou cumprido. */
export function passoSeguiu(passo: PassoDoTutorial, naEntrada: string, oc: OrdemCompra): boolean {
  if (!passo.retrato || !passo.cumprido) return false;
  return passo.retrato(oc) !== naEntrada && passo.cumprido(oc);
}

/** O nome do botão que vai para a frente. */
export function rotuloDoAvancar(indice: number, total: number, passo: PassoDoTutorial): string {
  if (indice === total - 1) return 'Terminar';
  return passo.fazer ? 'Pular' : 'Próximo';
}

// ── A oferta, uma vez só ──────────────────────────────────────────────────────

export const OFERTA_DO_TUTORIAL = {
  titulo: 'Quer ver como funciona?',
  texto: 'Um tutorial curto mostra como fazer uma OC, campo por campo. Você faz de verdade, e ele não emite nada.',
} as const;
