/**
 * A revisão da ECR no banco (CTO-D589, contrato do Banco da D588/D589 §1).
 *
 * - `core.pode_revisar_ecr()` diz se quem está na tela é o Pedro (e mais
 *   ninguém: há mais de um admin). A tela só mostra "Editar" quando dá `true`,
 *   e o banco recusa os outros de qualquer jeito.
 * - `compras.revisar_ecr` é a única porta: sobe a revisão, põe a data de hoje,
 *   troca o texto e escreve a linha do histórico, numa gravação só.
 */

import { compras, core } from './client';
import type { EcrSecao } from '../../domain/types';
import { fraseDaRecusaDaRevisao } from '../../domain/ecr';

/** `true` só para o usuário do Pedro. Qualquer falha é `false`: o botão não aparece. */
export async function podeRevisarEcr(): Promise<boolean> {
  const { data, error } = await core().rpc('pode_revisar_ecr');
  if (error) return false;
  return data === true;
}

export interface RevisaoGravada {
  revisao_anterior: string;
  revisao: string;
  emitida_em: string;
}

/** Grava a revisão. A recusa do banco sobe como uma frase para a pessoa. */
export async function revisarEcr(ecrId: number, secoes: EcrSecao[], descricao: string): Promise<RevisaoGravada> {
  const { data, error } = await compras().rpc('revisar_ecr', {
    p_ecr_id: ecrId,
    p_secoes: secoes,
    p_descricao: descricao,
  });
  if (error) throw new Error(fraseDaRecusaDaRevisao(error.code, error.message));
  const r = (data ?? {}) as Record<string, unknown>;
  return {
    revisao_anterior: String(r['revisao_anterior'] ?? ''),
    revisao: String(r['revisao'] ?? ''),
    emitida_em: String(r['emitida_em'] ?? ''),
  };
}
