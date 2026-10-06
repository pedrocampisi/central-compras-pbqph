/**
 * O rascunho da Rev. 01 do PS.02 (CTO-D738, D739). Os dois arquivos ao lado
 * saem de `scripts/rascunho-rev01-ps02.py` e ninguém os edita à mão:
 * - `documento.json`: o `documento` na forma do contrato do Banco, o que a
 *   porta grava;
 * - `mudancas.json`: a revisão de partida, a descrição do histórico e o motivo
 *   de cada mudança.
 *
 * Vêm por import dinâmico: só quem revisa baixa o rascunho. Depois de gravada a
 * Rev. 01, esta pasta sai na publicação seguinte (D739 §4.3).
 */

import type { MudancasDoRascunho } from '../../../domain/revisaoDoProcedimento';

export interface RascunhoDoProcedimento {
  documento: unknown;
  mudancas: MudancasDoRascunho;
}

export async function carregarRascunho(): Promise<RascunhoDoProcedimento> {
  const [documento, mudancas] = await Promise.all([
    import('./documento.json'),
    import('./mudancas.json'),
  ]);
  return { documento: documento.default, mudancas: mudancas.default as MudancasDoRascunho };
}
