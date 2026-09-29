/**
 * A trava da qualificação nas duas portas de emissão (CTO-D605), ao lado da
 * `travaDaFilial`: a Nova OC e a "emitida" do Histórico leem daqui, e o teste
 * de comportamento conta a gravação nas duas.
 *
 * Lê o store das qualificações na hora — não uma cópia de quando a tela
 * abriu —, para que o "Qualificar agora" valha no clique seguinte. Sem o store
 * carregado, a trava fecha (`travaDaQualificacao` com selo `null`).
 *
 * O banco confere a mesma regra ao fechar a transação (as travas da D609); a
 * tela antecipa para não gastar a ida e para abrir o "Qualificar agora".
 */

import type { Fornecedor, OrdemCompra } from '../../domain/types';
import { ecrsDaOc, seloDaFilial, travaDaQualificacao, type Selo } from '../../domain/qualificacao';
import { qualificacoesDoDia, useQualificacaoStore } from '../../stores/useQualificacaoStore';
import { hojeEmSaoPaulo } from '../../domain/ecr';

export interface QualificacaoParaEmitir {
  /** '' = pode emitir; senão, a frase para a pessoa, que termina mandando à ficha da empresa. */
  trava: string;
  /** A mesma recusa, para dentro do "Qualificar agora": termina em "qualifique aqui" (CTO-D614 §2.4). */
  porqueDoQualificarAgora: string;
  /** O selo de material da filial; `null` quando não se sabe (store sem carga, ou filial fora da lista). */
  selo: Selo | null;
  /** As ECRs da OC. */
  ecrs: number[];
}

export function qualificacaoParaEmitir(
  oc: Pick<OrdemCompra, 'fornecedor_id' | 'itens'>,
  fornecedores: readonly Fornecedor[],
): QualificacaoParaEmitir {
  const ecrs = ecrsDaOc(oc.itens);
  // A situação de agora, e não a da carga: a meia-noite pode ter passado (B3).
  const guardados = useQualificacaoStore.getState().dados;
  const dados = guardados && qualificacoesDoDia(guardados, hojeEmSaoPaulo());
  const filial = fornecedores.find((f) => f.id === oc.fornecedor_id);
  const selo = dados && filial ? seloDaFilial(filial, dados.linhas) : null;
  return {
    trava: travaDaQualificacao(selo, ecrs),
    porqueDoQualificarAgora: travaDaQualificacao(selo, ecrs, 'aqui'),
    selo,
    ecrs,
  };
}
