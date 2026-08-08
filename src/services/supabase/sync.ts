/**
 * Cola entre a camada de dados (Supabase) e o store da interface.
 *
 * Depois de qualquer gravação — ou quando o realtime avisa que outra pessoa
 * gravou — as telas chamam isto para puxar o estado novo do banco. É de
 * propósito que fica fora de dados.ts: a camada de dados não conhece stores.
 */

import { carregarDados } from './dados';
import { useDataStore } from '../../stores/useDataStore';

export async function recarregarDados(): Promise<void> {
  const data = await carregarDados();
  useDataStore.getState().setData(data, data.last_saved);
}
