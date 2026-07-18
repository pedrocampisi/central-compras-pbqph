/**
 * Store principal: dados do JSON, estado de sincronização e dirty tracking.
 * Equivale ao objeto `state` legado (campos: data, dirty, dirtySince, lastKnownSavedAt).
 *
 * As mutações de coleção (upsert/remove) passam pelos helpers genéricos
 * `upsertIn`/`removeIn` — toda mutação marca dirty automaticamente.
 */

import { create } from 'zustand';
import type {
  AvaliacaoPrestador,
  Config,
  Data,
  Fornecedor,
  Obra,
  OrdemCompra,
  PrestadorServico,
} from '../domain/types';

/** Chaves de Data que são coleções de registros com `id: string`. */
type CollectionKey =
  | 'ordens_compra'
  | 'fornecedores'
  | 'obras'
  | 'prestadores_servico'
  | 'avaliacoes_prestadores';

interface DataState {
  data: Data | null;
  dirty: boolean;
  dirtySince: number | null;      // Date.now() timestamp
  lastKnownSavedAt: string;       // ISO string do último save confirmado

  // Actions
  setData: (data: Data, lastSavedAt?: string) => void;
  markDirty: () => void;
  clearDirty: (lastSavedAt?: string) => void;
  updateOrdemCompra: (oc: OrdemCompra) => void;
  removeOrdemCompra: (id: string) => void;
  upsertFornecedor: (f: Fornecedor) => void;
  removeFornecedor: (id: string) => void;
  upsertObra: (o: Obra) => void;
  removeObra: (id: string) => void;
  upsertPrestador: (p: PrestadorServico) => void;
  removePrestador: (id: string) => void;
  upsertAvaliacao: (a: AvaliacaoPrestador) => void;
  removeAvaliacao: (id: string) => void;
  updateConfig: (partial: Partial<Config>) => void;
}

export const useDataStore = create<DataState>((set, get) => {
  /** Aplica uma mutação em `data` marcando dirty (preserva dirtySince original). */
  function commit(data: Data): void {
    set((s) => ({ data, dirty: true, dirtySince: s.dirtySince ?? Date.now() }));
  }

  /** Insere ou substitui (por id) um registro na coleção indicada. */
  function upsertIn<K extends CollectionKey>(key: K, item: Data[K][number]): void {
    const { data } = get();
    if (!data) return;
    const list: { id: string }[] = data[key];
    const exists = list.some((x) => x.id === item.id);
    const next = exists ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
    commit({ ...data, [key]: next });
  }

  /** Remove (por id) um registro da coleção indicada. */
  function removeIn(key: CollectionKey, id: string): void {
    const { data } = get();
    if (!data) return;
    const list: { id: string }[] = data[key];
    commit({ ...data, [key]: list.filter((x) => x.id !== id) });
  }

  return {
    data: null,
    dirty: false,
    dirtySince: null,
    lastKnownSavedAt: '',

    setData(data, lastSavedAt) {
      set({
        data,
        dirty: false,
        dirtySince: null,
        lastKnownSavedAt: lastSavedAt ?? data.last_saved ?? '',
      });
    },

    markDirty() {
      set((s) => ({
        dirty: true,
        dirtySince: s.dirtySince ?? Date.now(),
      }));
    },

    clearDirty(lastSavedAt) {
      set((s) => ({
        dirty: false,
        dirtySince: null,
        lastKnownSavedAt: lastSavedAt ?? s.lastKnownSavedAt,
      }));
    },

    updateOrdemCompra: (oc) => upsertIn('ordens_compra', oc),
    removeOrdemCompra: (id) => removeIn('ordens_compra', id),

    upsertFornecedor: (f) => upsertIn('fornecedores', f),
    removeFornecedor: (id) => removeIn('fornecedores', id),

    upsertObra: (o) => upsertIn('obras', o),
    removeObra: (id) => removeIn('obras', id),

    upsertPrestador: (p) => upsertIn('prestadores_servico', p),

    removePrestador(id) {
      const { data } = get();
      if (!data) return;
      // Remove o prestador e todas as avaliações vinculadas a ele.
      commit({
        ...data,
        prestadores_servico: data.prestadores_servico.filter((x) => x.id !== id),
        avaliacoes_prestadores: data.avaliacoes_prestadores.filter((a) => a.prestador_id !== id),
      });
    },

    upsertAvaliacao: (a) => upsertIn('avaliacoes_prestadores', a),
    removeAvaliacao: (id) => removeIn('avaliacoes_prestadores', id),

    updateConfig(partial) {
      const { data } = get();
      if (!data) return;
      commit({ ...data, config: { ...data.config, ...partial } });
    },
  };
});
