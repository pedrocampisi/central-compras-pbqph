/**
 * Cola entre a camada de dados (Supabase) e o store da interface.
 *
 * Depois de qualquer gravação — ou quando o realtime avisa que outra pessoa
 * gravou — as telas chamam isto para puxar o estado novo do banco. É de
 * propósito que fica fora de dados.ts: a camada de dados não conhece stores.
 *
 * As qualificações (CTO-D604) vêm junto, mas por fora: se elas falharem, as
 * OCs carregam do mesmo jeito, e o store da qualificação fica em "não se
 * sabe" — a trava da emissão com ECR fecha, e o resto do sistema segue.
 */

import { carregarDados } from './dados';
import { carregarQualificacoes } from './qualificacao';
import { obraDaMascara } from '../storage/umaObra';
import { useDataStore } from '../../stores/useDataStore';
import { useQualificacaoStore } from '../../stores/useQualificacaoStore';

/**
 * A resposta vale para a máscara em que foi pedida. Se ela virou durante a
 * espera, a resposta é de outro contexto e vai fora, nos dois sentidos
 * (perícia 28/09, A1): a virada já pediu a carga do contexto novo. As
 * qualificações seguem a mesma regra, porque as tratativas são por obra.
 */
export async function recarregarDados(): Promise<void> {
  const obra = obraDaMascara();
  const valeAinda = () => obraDaMascara() === obra;
  const qualificacoes = carregarQualificacoes(obra).then(
    (q) => {
      if (valeAinda()) useQualificacaoStore.getState().definir(q);
    },
    (e: unknown) => {
      if (valeAinda()) useQualificacaoStore.getState().falhou(e instanceof Error ? e.message : String(e));
    },
  );
  const data = await carregarDados(obra);
  if (valeAinda()) useDataStore.getState().setData(data, data.last_saved);
  await qualificacoes;
}
