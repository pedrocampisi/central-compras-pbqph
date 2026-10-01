/**
 * Store de estado da UI: aba ativa, filtros de lista, fila de toasts.
 * Equivale aos campos activeTab, histFilter, fornFilter, obraFilter, catalogoFilter no legado.
 */

import { create } from 'zustand';
import type { StatusOc } from '../domain/constants';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export const ABAS = ['dashboard', 'nova-oc', 'historico', 'fornecedores', 'qualificacao', 'obras', 'catalogo', 'config'] as const;
export type TabId = (typeof ABAS)[number];

/** A tela inicial: onde a OC abre, e para onde vai quem pede uma aba que não existe. */
export const ABA_INICIAL: TabId = 'dashboard';

/**
 * A aba pedida, se ela existe; senão, a tela inicial. A aba "Prestadores" saiu
 * (CTO-D585, palavra do Pedro): quem ainda pedir por ela — uma versão velha,
 * um atalho antigo — cai na tela inicial, e nunca numa tela em branco.
 */
export function abaQueExiste(tab: unknown): TabId {
  return (ABAS as readonly unknown[]).includes(tab) ? (tab as TabId) : ABA_INICIAL;
}

export type ToastTone = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
  /** Mensagens da mesma chave são uma só: a nova tira a velha (CTO-D570). */
  chave?: string;
}

export interface HistFilter {
  search: string;
  status: StatusOc | '';
  fornecedor: string;
  obra: string;
}

/** Toggle de status usado nas listas de cadastro. */
export type AtivoFilter = 'todos' | 'ativos' | 'inativos';
export type AtivaFilter = 'todas' | 'ativas' | 'inativas';

export interface FornFilter {
  search: string;
  status: AtivoFilter;
}

export interface ObraFilter {
  search: string;
  status: AtivaFilter;
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
  showToast: (message: string, tone?: ToastTone, chave?: string) => void;
  dismissToast: (id: string) => void;
}

let toastSeq = 0;

export const useUiStore = create<UiState>((set) => ({
  activeTab: ABA_INICIAL,
  histFilter: { search: '', status: '', fornecedor: '', obra: '' },
  fornFilter: { search: '', status: 'todos' },
  obraFilter: { search: '', status: 'todas' },
  catalogoFilter: { search: '' },
  toasts: [],

  setActiveTab(tab) {
    set({ activeTab: abaQueExiste(tab) });
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

  showToast(message, tone = 'info', chave) {
    const id = `toast-${++toastSeq}`;
    // Com chave, a mensagem nova tira a velha da mesma chave: duas iguais
    // empilhadas cobriam o rodapé da Nova OC a 375px (D570, foto 05).
    set((s) => ({
      toasts: [...s.toasts.filter((t) => chave === undefined || t.chave !== chave), { id, message, tone, chave }],
    }));
    // Auto-dismiss após 3.4s
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3400);
  },

  dismissToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
