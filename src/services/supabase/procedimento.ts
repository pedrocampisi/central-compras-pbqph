/**
 * A leitura do procedimento (CTO-D730 §2.4: "quem entra na OC lê. É o manual
 * da equipe"). Só leitura: revisar é da Rev. 01 em diante, por outra carta.
 *
 * As colunas e a forma do jsonb são o contrato do Banco (carta de 06/10, §3;
 * D733): Código, Revisão e Data são colunas, o resto mora em `documento`.
 */

import { core } from './client';
import type { Procedimento } from '../../domain/procedimento';
import { procedimentoDoBanco } from '../../domain/procedimentoDoBanco';

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
