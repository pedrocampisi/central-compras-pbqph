/**
 * As linhas da tela Qualificação (CTO-D661): a FO 8.4.1.1 na tela, uma aba por
 * categoria, uma linha por EMPRESA com a qualificação que vale.
 *
 * Lógica pura, sem tela: a mesma fonte da ficha da empresa (as linhas de
 * `useQualificacoesDoDia`, já com a situação do dia) e as mesmas funções de
 * `qualificacao.ts`. Nada de segunda conta da situação, do vencimento ou da
 * nota — o banco calcula, a tela mostra.
 *
 * - A empresa com várias filiais é uma linha só: a qualificação é da empresa.
 * - O fornecedor sem empresa cadastrada tem linha própria, como na ficha.
 * - O histórico não vira linha: só a que vale (a `vigente`). Quem ganhou
 *   empresa depois e ainda tem a linha antiga dele vale pela mais recente das
 *   duas, como o `seloDaFilial`.
 * - A qualificação de quem não está no cadastro da OC (a raiz sem filial
 *   carregada) aparece também, com o nome que a folha do auditor usa, e sem
 *   botão: não há filial para abrir o diálogo.
 */

import { agruparPorEmpresa, chaveDaEmpresa } from './fornecedores';
import {
  emiteComASituacao,
  type Categoria,
  type LinhaDeQualificacao,
  type NumerosDoDesempenho,
  type Situacao,
} from './qualificacao';
import type { Fornecedor } from './types';

/** O nome da folha do auditor para quem não está no cadastro (`folhasDoAuditor.ts`). */
export const FORA_DO_CADASTRO = 'Empresa fora do cadastro da OC';

export interface LinhaDaTela {
  /** A chave da empresa (`chaveDaEmpresa`), ou a do sujeito da linha quando ele não está no cadastro. */
  chave: string;
  nome: string;
  /** A filial que abre o diálogo e a ficha (a primeira ativa da empresa); `null` fora do cadastro. */
  filial: Fornecedor | null;
  /** A qualificação que vale, com a situação do dia. */
  vale: LinhaDeQualificacao;
  /**
   * "Permissão para compra" (só a aba Materiais a mostra): a OC com ECR emite
   * com esta empresa? A mesma regra da trava — a situação que emite — e pelo
   * menos uma ECR, porque a trava pede as ECRs da OC na qualificação.
   */
  podeComprar: boolean;
  /** Vencida, vencendo em 30 dias ou desqualificada: pede a mão de alguém. */
  pedeAcao: boolean;
}

const PEDE_ACAO: readonly Situacao[] = ['vencida', 'vence_em_30_dias', 'desqualificada'];

/** O que pede ação primeiro, o mais urgente no alto; o resto, pelo nome. */
const ORDEM: Record<Situacao, number> = {
  vencida: 0,
  desqualificada: 1,
  vence_em_30_dias: 2,
  qualificada: 3,
  sem_qualificacao: 4,
};

/** A permissão para compra de uma qualificação de material, pela regra da trava. */
export function podeComprarCom(l: Pick<LinhaDeQualificacao, 'situacao' | 'ecrs'>): boolean {
  return emiteComASituacao(l.situacao) && l.ecrs.length > 0;
}

/** A mais recente primeiro (a mesma ordem do `seloDaFilial`). */
function maisRecente(a: LinhaDeQualificacao, b: LinhaDeQualificacao): number {
  return b.qualificadaEm.localeCompare(a.qualificadaEm) || b.id - a.id;
}

export function linhasDaTela(
  linhas: readonly LinhaDeQualificacao[],
  categoria: Categoria,
  fornecedores: readonly Fornecedor[],
): LinhaDaTela[] {
  const grupos = agruparPorEmpresa([...fornecedores]);
  const grupoPorChave = new Map(grupos.map((g) => [g.chave, g]));
  // O fornecedor que ganhou empresa depois: a linha antiga dele vai para a empresa.
  const chavePorFornecedor = new Map(fornecedores.map((f) => [f.id, chaveDaEmpresa(f)]));

  const porChave = new Map<string, LinhaDeQualificacao>();
  for (const l of linhas) {
    if (!l.vigente || l.categoria !== categoria) continue;
    const chave = l.empresaRaizId
      ? l.empresaRaizId
      : (chavePorFornecedor.get(l.fornecedorId ?? '') ?? `filial:${l.fornecedorId}`);
    const antes = porChave.get(chave);
    if (!antes || maisRecente(l, antes) < 0) porChave.set(chave, l);
  }

  return [...porChave.entries()]
    .map(([chave, vale]): LinhaDaTela => {
      const g = grupoPorChave.get(chave);
      return {
        chave,
        nome: g?.apelido || FORA_DO_CADASTRO,
        filial: g ? (g.filiais.find((f) => f.ativo) ?? g.filiais[0] ?? null) : null,
        vale,
        podeComprar: podeComprarCom(vale),
        pedeAcao: PEDE_ACAO.includes(vale.situacao),
      };
    })
    .sort(
      (a, b) =>
        ORDEM[a.vale.situacao] - ORDEM[b.vale.situacao] ||
        a.nome.localeCompare(b.nome, 'pt-BR') ||
        a.chave.localeCompare(b.chave),
    );
}

/** O desempenho dos últimos 12 meses em uma linha curta, para a coluna da tabela. */
export function desempenhoCurto(d: NumerosDoDesempenho | undefined): string {
  if (!d || d.entregas === 0) return 'Sem entregas';
  return `${d.entregas} ${d.entregas === 1 ? 'entrega' : 'entregas'}: ${d.noPrazo} no prazo, ${d.conformes} ${d.conformes === 1 ? 'conforme' : 'conformes'}`;
}
