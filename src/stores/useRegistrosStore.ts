/**
 * Os registros do fornecedor carregados do banco (CTO-D812, parte C), fora da
 * carga da qualificação de propósito: a qualificação trava a emissão quando
 * falha (falha fechada), e um registro que não chegou não pode travar OC.
 *
 * `dados === null` quer dizer "não se sabe": ainda não chegou, ou falhou.
 */

import { create } from 'zustand';
import type { RegistrosDoFornecedor } from '../domain/registrosGuardados';
import { carregarRegistrosDoFornecedor } from '../services/supabase/registrosDoFornecedor';

interface RegistrosState {
  dados: RegistrosDoFornecedor | null;
  erro: string;
  carregando: boolean;
  /**
   * Lê do banco. Sem `deNovo`, só quando ainda não leu e ninguém está lendo
   * (duas linhas abertas não leem duas vezes); com ele, depois de gravar.
   * A falha fica em `erro`.
   */
  carregar: (deNovo?: boolean) => Promise<void>;
}

export const useRegistrosStore = create<RegistrosState>((set, get) => ({
  dados: null,
  erro: '',
  carregando: false,
  carregar: async (deNovo = false) => {
    const agora = get();
    if (!deNovo && (agora.carregando || agora.dados || agora.erro)) return;
    set({ carregando: true });
    try {
      set({ dados: await carregarRegistrosDoFornecedor(), erro: '', carregando: false });
    } catch (e) {
      set({
        dados: null,
        erro: e instanceof Error ? e.message : 'Falha ao carregar os registros do fornecedor.',
        carregando: false,
      });
    }
  },
}));
