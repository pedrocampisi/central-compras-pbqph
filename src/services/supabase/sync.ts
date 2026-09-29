/**
 * Cola entre a camada de dados (Supabase) e o store da interface.
 *
 * Depois de qualquer gravação — ou quando o realtime avisa que outra pessoa
 * gravou — as telas chamam isto para puxar o estado novo do banco. É de
 * propósito que fica fora de dados.ts: a camada de dados não conhece stores.
 */

import { carregarDados } from './dados';
import { obraDaMascara } from '../storage/umaObra';
import { useDataStore } from '../../stores/useDataStore';

/**
 * A resposta vale para a máscara em que foi pedida. Se ela virou durante a
 * espera, a resposta é de outro contexto e vai fora, nos dois sentidos
 * (perícia 28/09, A1): a virada já pediu a carga do contexto novo.
 */
export async function recarregarDados(): Promise<void> {
  const obra = obraDaMascara();
  const data = await carregarDados(obra);
  if (obraDaMascara() !== obra) return;
  useDataStore.getState().setData(data, data.last_saved);
}
