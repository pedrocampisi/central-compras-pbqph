/**
 * As entregas sem o papel do fornecedor (CTO-D840 §2.5): a lista em
 * Recebimentos e o número no menu leem daqui, e a lista lê de novo depois de
 * cada ação.
 *
 * `linhas === null` quer dizer "não se sabe": ainda não chegou, ou falhou. A
 * falha nunca vira lista vazia.
 */

import { create } from 'zustand';
import { daObra, emOrdem, type EntregaSemPapel } from '../domain/entregasSemPapel';
import { lerEntregasSemPapel } from '../services/supabase/entregasSemPapel';
import { obraDaMascara } from '../services/storage/umaObra';
import { useDataStore } from './useDataStore';

interface EntregasSemPapelState {
  linhas: EntregaSemPapel[] | null;
  erro: string;
  carregando: boolean;
  /** Lê do banco. A falha fica em `erro`, e a lista volta a "não se sabe". */
  carregar: () => Promise<void>;
}

export const useEntregasSemPapelStore = create<EntregasSemPapelState>((set) => ({
  linhas: null,
  erro: '',
  carregando: false,
  carregar: async () => {
    set({ carregando: true });
    try {
      const mascara = obraDaMascara();
      const ocs = useDataStore.getState().data?.ordens_compra ?? [];
      const obraDaOc = (id: string) => ocs.find((o) => o.id === id)?.obra_id;
      const linhas = emOrdem(daObra(await lerEntregasSemPapel(mascara), mascara, obraDaOc));
      set({ linhas, erro: '', carregando: false });
    } catch (e) {
      set({
        linhas: null,
        erro: e instanceof Error ? e.message : 'Falha ao ler as entregas sem papel.',
        carregando: false,
      });
    }
  },
}));
