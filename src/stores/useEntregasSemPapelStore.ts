/**
 * As entregas sem o papel do fornecedor (CTO-D840 §2.5): a lista em
 * Recebimentos e o número no menu leem daqui, e a lista lê de novo depois de
 * cada ação.
 *
 * `linhas === null` quer dizer "não se sabe": ainda não chegou, ou falhou. A
 * falha nunca vira lista vazia.
 *
 * Vale só a busca mais nova, e só se a máscara de obra não virou enquanto ela
 * ia; na virada, a outra obra sai daqui na hora (perícia de 16/10, achado 2).
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
  /** A máscara ligou nesta obra: as linhas das outras saem já. A busca que estava a caminho, sem a máscara, não grava ao chegar. */
  soDaObra: (obra: string) => void;
}

/** A obra de cada OC, pelos dados que a tela tem agora. */
function obraDaOc(id: string): string | undefined {
  return useDataStore.getState().data?.ordens_compra.find((o) => o.id === id)?.obra_id;
}

/** A vez da busca: a resposta de uma busca que não é a mais nova chega tarde e não grava. */
let vez = 0;

export const useEntregasSemPapelStore = create<EntregasSemPapelState>((set, get) => ({
  linhas: null,
  erro: '',
  carregando: false,
  carregar: async () => {
    const minha = ++vez;
    const mascara = obraDaMascara();
    set({ carregando: true });
    // Chegou tarde (outra busca saiu depois, ou a máscara virou no meio): não grava nada.
    const valeAinda = () => minha === vez && obraDaMascara() === mascara;
    try {
      const lidas = await lerEntregasSemPapel(mascara);
      if (!valeAinda()) return;
      set({ linhas: emOrdem(daObra(lidas, mascara, obraDaOc)), erro: '', carregando: false });
    } catch (e) {
      if (!valeAinda()) return;
      set({
        linhas: null,
        erro: e instanceof Error ? e.message : 'Falha ao ler as entregas sem papel.',
        carregando: false,
      });
    }
  },
  soDaObra: (obra) => {
    const { linhas } = get();
    set({ linhas: linhas && daObra(linhas, obra, obraDaOc), carregando: false });
  },
}));
