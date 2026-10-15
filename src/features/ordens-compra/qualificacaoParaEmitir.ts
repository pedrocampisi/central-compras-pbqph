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
import { ecrsDaOc, fraseDaTravaDaData, seloDaFilial, travaDaQualificacao, type Selo } from '../../domain/qualificacao';
import { qualificacoesDoDia, useQualificacaoStore } from '../../stores/useQualificacaoStore';
import { hojeEmSaoPaulo } from '../../domain/ecr';
import { qualificacaoNaData } from '../../services/supabase/qualificacao';

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

/**
 * A segunda pergunta, feita ao banco: a qualificação valia na Data da OC
 * (CTO-D808, D810)? A regra mora na `compras.qualificacao_na_data`; a tela só
 * mostra o motivo dela, na moldura da recusa da emissão. '' = pode emitir.
 *
 * - Sem ECR, sem fornecedor ou sem Data, não pergunta: não há o que conferir,
 *   ou a outra validação da tela recusa antes.
 * - A de hoje já recusou e a Data é hoje ou adiante: não pergunta. Quem decide
 *   é o "Qualificar agora", que resolve as duas.
 * - A Data é passada: pergunta mesmo com a de hoje recusada. Uma qualificação
 *   de hoje não vale para ela, e o "Qualificar agora" não pode ser a saída.
 * - A pergunta falhou (sem rede, sessão caída): segue. O banco confere a mesma
 *   regra ao gravar, e recusa com a mesma frase.
 */
export async function travaDaDataParaEmitir(
  oc: Pick<OrdemCompra, 'numero' | 'status' | 'fornecedor_id' | 'data'>,
  q: Pick<QualificacaoParaEmitir, 'trava' | 'ecrs'>,
): Promise<string> {
  if (q.ecrs.length === 0 || !oc.fornecedor_id || !oc.data) return '';
  if (q.trava && oc.data >= hojeEmSaoPaulo()) return '';
  let r;
  try {
    r = await qualificacaoNaData(oc.fornecedor_id, q.ecrs, oc.data);
  } catch {
    return '';
  }
  if (r.emite) return '';
  // Sai do rascunho (ou da cancelada) = emissão; a OC que já estava emitida só muda a Data.
  const ocasiao = oc.status === 'rascunho' || oc.status === 'cancelada' ? 'emissao' : 'data_mudou';
  return fraseDaTravaDaData(oc.numero, r.motivo, ocasiao);
}
