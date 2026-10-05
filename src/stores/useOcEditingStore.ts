/**
 * Store de edição de OC: clone da OC em edição com mutações isoladas.
 * O dado é commitado no useDataStore apenas ao salvar.
 * Equivale ao campo `state.ocEditing` legado.
 */

import { create } from 'zustand';
import type { Item, OrdemCompra } from '../domain/types';
import { uid } from '../domain/id';
import { normalizeItem } from '../domain/normalize';
import { entregaAoMudarAData, entregaDaOcNova } from '../domain/entregaPrevista';

interface OcEditingState {
  ocEditing: OrdemCompra | null;
  /**
   * A entrega prevista ainda é a que nasceu com a OC (CTO-D728 §2): enquanto
   * for, ela acompanha a Data. Mexer na entrega desliga.
   */
  entregaAcompanha: boolean;

  // Lifecycle
  startEditing: (oc: OrdemCompra) => void;
  /** A OC que nasce agora (a nova e a duplicada): a entrega prevista no dia seguinte ao da Data. */
  startNova: (oc: OrdemCompra) => void;
  stopEditing: () => void;

  // Field mutations
  updateField: <K extends keyof OrdemCompra>(field: K, value: OrdemCompra[K]) => void;
  /** A Data, e a entrega junto enquanto ela acompanha. */
  mudarData: (data: string) => void;

  // Item mutations
  addItem: () => void;
  updateItem: (id: string, partial: Partial<Item>) => void;
  removeItem: (id: string) => void;
  replaceItems: (items: Item[]) => void;
  appendItems: (items: Item[]) => void;
}

export const useOcEditingStore = create<OcEditingState>((set, get) => ({
  ocEditing: null,
  entregaAcompanha: false,

  startEditing(oc) {
    set({ ocEditing: structuredClone(oc), entregaAcompanha: false });
  },

  startNova(oc) {
    set({ ocEditing: { ...structuredClone(oc), entrega_prevista: entregaDaOcNova(oc.data) }, entregaAcompanha: true });
  },

  stopEditing() {
    set({ ocEditing: null, entregaAcompanha: false });
  },

  updateField(field, value) {
    const { ocEditing, entregaAcompanha } = get();
    if (!ocEditing) return;
    set({
      ocEditing: { ...ocEditing, [field]: value },
      entregaAcompanha: field === 'entrega_prevista' ? false : entregaAcompanha,
    });
  },

  mudarData(data) {
    const { ocEditing, entregaAcompanha } = get();
    if (!ocEditing) return;
    const entrega = entregaAoMudarAData(ocEditing.entrega_prevista ?? '', data, entregaAcompanha);
    set({ ocEditing: { ...ocEditing, data, entrega_prevista: entrega } });
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
