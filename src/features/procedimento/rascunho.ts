/**
 * O rascunho da próxima revisão do PS.02, para quem revisa ler e gravar
 * (CTO-D738, D739 §4).
 *
 * Hoje não há rascunho: a Rev. 01 foi gravada pelo Pedro em 23/10/2026
 * (CTO-D887), e a pasta dela saiu do código na publicação seguinte (D739 §4.3).
 * Os dois JSON dela ficam em `tests/fixtures/ps02Rev01/`, como a amostra que
 * prova o quadro, a leitura e o "Gravar".
 *
 * A Rev. 02 segue o mesmo caminho (D739 §4): os dois arquivos entram ao lado,
 * por import dinâmico (só quem revisa baixa o rascunho), e esta função passa
 * a devolvê-los.
 */

import type { MudancasDoRascunho } from '../../domain/revisaoDoProcedimento';

export interface RascunhoDoProcedimento {
  documento: unknown;
  mudancas: MudancasDoRascunho;
}

/** Sem rascunho no código: `null`, e a página mostra só a vigente. */
export async function carregarRascunho(): Promise<RascunhoDoProcedimento | null> {
  return null;
}
