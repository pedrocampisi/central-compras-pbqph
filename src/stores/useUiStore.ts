/**
 * Store de estado da UI: aba ativa, filtros de lista, fila de toasts.
 * Equivale aos campos activeTab, histFilter, fornFilter, obraFilter, catalogoFilter no legado.
 */

import { create } from 'zustand';
import type { StatusOc } from '../domain/constants';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type TabId =
  | 'dashboard'
  | 'nova-oc'
  | 'historico'
  | 'fornecedores'
  | 'obras'
  | 'catalogo'
  | 'config';

export type ToastTone = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

export interface HistFilter {
  search: string;
  status: StatusOc | '';
  fornecedor: string;
  obra: string;
}

export interface FornFilter {
  search: string;
  ecr: string;
}

export interface ObraFilter {
  search: string;
}

export interface CatalogoFilter {
  search: string;
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface UiState {
  activeTab: TabId;
  histFilter: HistFilter;
  fornFilter: FornFilter;
  obraFilter: ObraFilter;
  catalogoFilter: CatalogoFilter;
  toasts: Toast[];

  // Actions
  setActiveTab: (tab: TabId) => void;
  setHistFilter: (partial: Partial<HistFilter>) => void;
  setFornFilter: (partial: Partial<FornFilter>) => void;
  setObraFilter: (partial: Partial<ObraFilter>) => void;
  setCatalogoFilter: (partial: Partial<CatalogoFilter>) => void;
  showToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
}

let toastSeq = 0;

export const useUiStore = create<UiState>((set) => ({
  activeTab: 'dashboard',
  histFilter: { search: '', status: '', fornecedor: '', obra: '' },
  fornFilter: { search: '', ecr: '' },
  obraFilter: { search: '' },
  catalogoFilter: { search: '' },
  toasts: [],

  setActiveTab(tab) {
    set({ activeTab: tab });
  },

  setHistFilter(partial) {
    set((s) => ({ histFilter: { ...s.histFilter, ...partial } }));
  },

  setFornFilter(partial) {
    set((s) => ({ fornFilter: { ...s.fornFilter, ...partial } }));
  },

  setObraFilter(partial) {
    set((s) => ({ obraFilter: { ...s.obraFilter, ...partial } }));
  },

  setCatalogoFilter(partial) {
    set((s) => ({ catalogoFilter: { ...s.catalogoFilter, ...partial } }));
  },

  showToast(message, tone = 'info') {
    const id = `toast-${++toastSeq}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    // Auto-dismiss após 3.4s
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3400);
  },

  dismissToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
