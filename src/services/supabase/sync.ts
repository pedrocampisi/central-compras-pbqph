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
import { useDataStore } from '../../stores/useDataStore';
import { useQualificacaoStore } from '../../stores/useQualificacaoStore';

export async function recarregarDados(): Promise<void> {
  const qualificacoes = carregarQualificacoes().then(
    (q) => useQualificacaoStore.getState().definir(q),
    (e: unknown) => useQualificacaoStore.getState().falhou(e instanceof Error ? e.message : String(e)),
  );
  const data = await carregarDados();
  useDataStore.getState().setData(data, data.last_saved);
  await qualificacoes;
}
