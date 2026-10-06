/**
 * O procedimento no banco (CTO-D730 §2.4: "quem entra na OC lê. É o manual
 * da equipe").
 * - A leitura: quem entra na OC lê.
 * - A revisão: só pela porta `core.revisar_procedimento`, só o Pedro (a mesma
 *   regra de revisar ECR), pela mão dele na página (CTO-D739 §4).
 *
 * As colunas e a forma do jsonb são o contrato do Banco (carta de 06/10, §3;
 * D733): Código, Revisão e Data são colunas, o resto mora em `documento`.
 */

import { core } from './client';
import type { Procedimento } from '../../domain/procedimento';
import { procedimentoDoBanco } from '../../domain/procedimentoDoBanco';
import { fraseDaRecusaDoProcedimento } from '../../domain/revisaoDoProcedimento';

/** O procedimento em vigor, com o histórico; `null` se o banco ainda não o tem. */
export async function lerProcedimento(codigo: string): Promise<Procedimento | null> {
  const { data, error } = await core()
    .from('procedimentos')
    // Uma frase só: o supabase-js lê o tipo da resposta no texto do select.
    .select(
      'codigo, titulo, revisao, emitida_em, documento, revisoes:procedimento_revisoes(id, revisao, emitida_em, descricao, revisado_por_nome, aprovado_por_nome)',
    )
    .eq('codigo', codigo)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const linha = data as Record<string, unknown>;
  return procedimentoDoBanco(linha, linha['revisoes']);
}

export interface RevisaoDoProcedimentoGravada {
  revisao_anterior: string;
  revisao: string;
  emitida_em: string;
}

/**
 * Grava a revisão: a porta sobe o número, põe a data de hoje, troca o
 * documento e escreve a linha do histórico com quem está na sessão. A recusa
 * do banco sobe como uma frase para a pessoa.
 *
 * `revisaoDe` é a revisão de onde o rascunho partiu: se a vigente já for outra,
 * o banco recusa (40001) em vez de gravar por cima.
 */
export async function revisarProcedimento(
  codigo: string,
  revisaoDe: string,
  documento: unknown,
  descricao: string,
): Promise<RevisaoDoProcedimentoGravada> {
  const { data, error } = await core().rpc('revisar_procedimento', {
    p_codigo: codigo,
    p_revisao_de: revisaoDe,
    p_documento: documento,
    p_descricao: descricao,
  });
  if (error) throw new Error(fraseDaRecusaDoProcedimento(error.code, error.message));
  const r = (data ?? {}) as Record<string, unknown>;
  return {
    revisao_anterior: String(r['revisao_anterior'] ?? ''),
    revisao: String(r['revisao'] ?? ''),
    emitida_em: String(r['emitida_em'] ?? ''),
  };
}
