/**
 * As entregas sem o papel do fornecedor, no contrato do Banco (CTO-D840; o
 * plano do Banco, D840, e os quatro pedidos da D845):
 *
 *   a lista ........ compras.entregas_sem_papel(p_obra), só para quem emite OC
 *   não se aplica .. compras.marcar_nao_se_aplica: o motivo é obrigatório, e a marca não se desfaz
 *   a cobertura .... compras.cobertura_das_entregas(p_obra): por entrega e ECR, para o auditor
 *
 * O papel anexado pela lista entra pela guardar_registro_do_fornecedor, com o
 * `avaliacao_id` (`registrosDoFornecedor.ts`). A obra da máscara vai na busca.
 * A recusa do banco já vem em frase de gente, e sobe como veio.
 */

import { compras } from './client';
import { linhasDoOQuePede, posicoesDaLinha } from './recebimento';
import { obraDaMascara } from '../storage/umaObra';
import { ALCANCES, type Alcance } from '../../domain/registroDoFornecedor';
import type { CoberturaDaEntrega, EntregaSemPapel, SituacaoDaCobertura } from '../../domain/entregasSemPapel';

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const txt = (v: unknown) => (v === null || v === undefined ? '' : String(v));
const dia = (v: unknown) => txt(v).slice(0, 10);
const SITUACOES: readonly SituacaoDaCobertura[] = ['nao_exige', 'coberta', 'nao_se_aplica', 'sem_papel'];

/** Uma linha da `entregas_sem_papel` → a linha da tela. */
export function entregaDaLinha(l: Record<string, unknown>): EntregaSemPapel {
  return {
    avaliacaoId: num(l['avaliacao_id']),
    ocId: txt(l['oc_id']),
    numero: txt(l['numero']),
    obra: txt(l['obra']),
    fornecedor: txt(l['fornecedor']),
    fornecedorId: txt(l['fornecedor_id']),
    recebidoEm: dia(l['recebido_em']),
    notaFiscal: txt(l['nota_fiscal']),
    avaliadoPorNome: txt(l['avaliado_por_nome']),
    ecrId: num(l['ecr_id']),
    ecr: txt(l['ecr']),
    nome: txt(l['nome']),
    posicoes: posicoesDaLinha(l['posicoes']),
    porque: txt(l['porque']),
    linhas: linhasDoOQuePede(l['o_que_pede']),
    observacao: txt(l['observacao']),
    aCadaEntrega: l['a_cada_entrega'] === true,
  };
}

/** A lista das entregas sem papel; com a máscara, só as da obra dela. Falha sobe: quem chama decide. */
export async function lerEntregasSemPapel(obra: string | null = obraDaMascara()): Promise<EntregaSemPapel[]> {
  const { data, error } = await compras().rpc('entregas_sem_papel', { p_obra: obra });
  if (error) throw new Error(`Falha ao ler as entregas sem papel: ${error.message}`);
  return ((data ?? []) as Record<string, unknown>[]).map(entregaDaLinha).filter((l) => l.avaliacaoId > 0 && l.ecrId > 0);
}

/** "Não se aplica a esta entrega", com o motivo. A marca não se desfaz. */
export async function marcarNaoSeAplica(avaliacaoId: number, ecrId: number, motivo: string): Promise<void> {
  const { error } = await compras().rpc('marcar_nao_se_aplica', {
    p_avaliacao_id: avaliacaoId,
    p_ecr_id: ecrId,
    p_motivo: motivo.trim(),
  });
  if (error) throw new Error(error.message);
}

/** Uma linha da `cobertura_das_entregas` → a cobertura da tela. */
export function coberturaDaLinha(l: Record<string, unknown>): CoberturaDaEntrega {
  const situacao = txt(l['situacao']) as SituacaoDaCobertura;
  const alcance = txt(l['alcance']) as Alcance;
  return {
    avaliacaoId: num(l['avaliacao_id']),
    ecrId: num(l['ecr_id']),
    // A situação que a tela não conhece conta como falta: nunca como coberta.
    situacao: SITUACOES.includes(situacao) ? situacao : 'sem_papel',
    documentoId: txt(l['documento_id']),
    alcance: ALCANCES.includes(alcance) ? alcance : null,
    validoAte: dia(l['valido_ate']),
    motivo: txt(l['motivo']),
  };
}

/** A cobertura de todas as entregas, numa chamada só; com a máscara, só as da obra dela. */
export async function lerCoberturaDasEntregas(obra: string | null = obraDaMascara()): Promise<CoberturaDaEntrega[]> {
  const { data, error } = await compras().rpc('cobertura_das_entregas', { p_obra: obra });
  if (error) throw new Error(`Falha ao ler o papel das entregas: ${error.message}`);
  return ((data ?? []) as Record<string, unknown>[]).map(coberturaDaLinha).filter((c) => c.avaliacaoId > 0 && c.ecrId > 0);
}
