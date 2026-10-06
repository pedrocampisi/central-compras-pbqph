/**
 * A leitura do procedimento (CTO-D730 §2.4: "quem entra na OC lê. É o manual
 * da equipe"). Só leitura: revisar é da Rev. 01 em diante, por outra carta.
 *
 * ⚠️ Os nomes das tabelas são os do plano do Banco (06/10); as colunas e a
 * forma do jsonb vêm da carta de fecho dele, e só `domain/procedimentoDoBanco`
 * muda junto.
 */

import { core } from './client';
import type { Procedimento } from '../../domain/procedimento';
import { procedimentoDoBanco } from '../../domain/procedimentoDoBanco';

/** O procedimento em vigor, com o histórico; `null` se o banco ainda não o tem. */
export async function lerProcedimento(codigo: string): Promise<Procedimento | null> {
  const { data, error } = await core()
    .from('procedimentos')
    .select('*, revisoes:procedimento_revisoes(id, revisao, emitida_em, descricao, revisado_por_nome, aprovado_por_nome)')
    .eq('codigo', codigo)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const linha = data as Record<string, unknown>;
  return procedimentoDoBanco(linha, linha['revisoes']);
}
