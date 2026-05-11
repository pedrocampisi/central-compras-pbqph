/**
 * Store principal: dados do JSON, estado de sincronização e dirty tracking.
 * Equivale ao objeto `state` legado (campos: data, dirty, dirtySince, lastKnownSavedAt).
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

export const useDataStore = create<DataState>((set, get) => ({
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

  updateOrdemCompra(oc) {
    const { data } = get();
    if (!data) return;
    const idx = data.ordens_compra.findIndex((x) => x.id === oc.id);
    const ordens_compra =
      idx >= 0
        ? data.ordens_compra.map((x) => (x.id === oc.id ? oc : x))
        : [...data.ordens_compra, oc];
    set({ data: { ...data, ordens_compra }, dirty: true, dirtySince: get().dirtySince ?? Date.now() });
  },

  removeOrdemCompra(id) {
    const { data } = get();
    if (!data) return;
    set({
      data: { ...data, ordens_compra: data.ordens_compra.filter((x) => x.id !== id) },
      dirty: true,
      dirtySince: get().dirtySince ?? Date.now(),
    });
  },

  upsertFornecedor(f) {
    const { data } = get();
    if (!data) return;
    const idx = data.fornecedores.findIndex((x) => x.id === f.id);
    const fornecedores =
      idx >= 0
        ? data.fornecedores.map((x) => (x.id === f.id ? f : x))
        : [...data.fornecedores, f];
    set({ data: { ...data, fornecedores }, dirty: true, dirtySince: get().dirtySince ?? Date.now() });
  },

  removeFornecedor(id) {
    const { data } = get();
    if (!data) return;
    set({
      data: { ...data, fornecedores: data.fornecedores.filter((x) => x.id !== id) },
      dirty: true,
      dirtySince: get().dirtySince ?? Date.now(),
    });
  },

  upsertObra(o) {
    const { data } = get();
    if (!data) return;
    const idx = data.obras.findIndex((x) => x.id === o.id);
    const obras =
      idx >= 0
        ? data.obras.map((x) => (x.id === o.id ? o : x))
        : [...data.obras, o];
    set({ data: { ...data, obras }, dirty: true, dirtySince: get().dirtySince ?? Date.now() });
  },

  removeObra(id) {
    const { data } = get();
    if (!data) return;
    set({
      data: { ...data, obras: data.obras.filter((x) => x.id !== id) },
      dirty: true,
      dirtySince: get().dirtySince ?? Date.now(),
    });
  },

  upsertPrestador(p) {
    const { data } = get();
    if (!data) return;
    const idx = data.prestadores_servico.findIndex((x) => x.id === p.id);
    const prestadores_servico =
      idx >= 0
        ? data.prestadores_servico.map((x) => (x.id === p.id ? p : x))
        : [...data.prestadores_servico, p];
    set({ data: { ...data, prestadores_servico }, dirty: true, dirtySince: get().dirtySince ?? Date.now() });
  },

  removePrestador(id) {
    const { data } = get();
    if (!data) return;
    // Remove o prestador e todas as avaliações vinculadas a ele.
    set({
      data: {
        ...data,
        prestadores_servico: data.prestadores_servico.filter((x) => x.id !== id),
        avaliacoes_prestadores: data.avaliacoes_prestadores.filter((a) => a.prestador_id !== id),
      },
      dirty: true,
      dirtySince: get().dirtySince ?? Date.now(),
    });
  },

  upsertAvaliacao(a) {
    const { data } = get();
    if (!data) return;
    const idx = data.avaliacoes_prestadores.findIndex((x) => x.id === a.id);
    const avaliacoes_prestadores =
      idx >= 0
        ? data.avaliacoes_prestadores.map((x) => (x.id === a.id ? a : x))
        : [...data.avaliacoes_prestadores, a];
    set({ data: { ...data, avaliacoes_prestadores }, dirty: true, dirtySince: get().dirtySince ?? Date.now() });
  },

  removeAvaliacao(id) {
    const { data } = get();
    if (!data) return;
    set({
      data: { ...data, avaliacoes_prestadores: data.avaliacoes_prestadores.filter((x) => x.id !== id) },
      dirty: true,
      dirtySince: get().dirtySince ?? Date.now(),
    });
  },

  updateConfig(partial) {
    const { data } = get();
    if (!data) return;
    set({
      data: { ...data, config: { ...data.config, ...partial } },
      dirty: true,
      dirtySince: get().dirtySince ?? Date.now(),
    });
  },
}));
