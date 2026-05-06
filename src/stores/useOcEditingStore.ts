/**
 * Store de edição de OC: clone da OC em edição com mutações isoladas.
 * O dado é commitado no useDataStore apenas ao salvar.
 * Equivale ao campo `state.ocEditing` legado.
 */

import { create } from 'zustand';
import type { Item, OrdemCompra } from '../domain/types';
import { uid } from '../domain/id';
import { normalizeItem } from '../domain/normalize';

interface OcEditingState {
  ocEditing: OrdemCompra | null;

  // Lifecycle
  startEditing: (oc: OrdemCompra) => void;
  stopEditing: () => void;

  // Field mutations
  updateField: <K extends keyof OrdemCompra>(field: K, value: OrdemCompra[K]) => void;

  // Item mutations
  addItem: () => void;
  updateItem: (id: string, partial: Partial<Item>) => void;
  removeItem: (id: string) => void;
  replaceItems: (items: Item[]) => void;
  appendItems: (items: Item[]) => void;
}

export const useOcEditingStore = create<OcEditingState>((set, get) => ({
  ocEditing: null,

  startEditing(oc) {
    set({ ocEditing: structuredClone(oc) });
  },

  stopEditing() {
    set({ ocEditing: null });
  },

  updateField(field, value) {
    const { ocEditing } = get();
    if (!ocEditing) return;
    set({ ocEditing: { ...ocEditing, [field]: value } });
  },

  addItem() {
    const { ocEditing } = get();
    if (!ocEditing) return;
    const newItem = normalizeItem({ id: uid('item') });
    set({ ocEditing: { ...ocEditing, itens: [...ocEditing.itens, newItem] } });
  },

  updateItem(id, partial) {
    const { ocEditing } = get();
    if (!ocEditing) return;
    set({
      ocEditing: {
        ...ocEditing,
        itens: ocEditing.itens.map((it) => (it.id === id ? { ...it, ...partial } : it)),
      },
    });
  },

  removeItem(id) {
    const { ocEditing } = get();
    if (!ocEditing) return;
    set({ ocEditing: { ...ocEditing, itens: ocEditing.itens.filter((it) => it.id !== id) } });
  },

  replaceItems(items) {
    const { ocEditing } = get();
    if (!ocEditing) return;
    set({ ocEditing: { ...ocEditing, itens: items } });
  },

  appendItems(items) {
    const { ocEditing } = get();
    if (!ocEditing) return;
    set({ ocEditing: { ...ocEditing, itens: [...ocEditing.itens, ...items] } });
  },
}));
