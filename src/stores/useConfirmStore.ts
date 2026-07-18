/**
 * Confirmação global baseada em Promise — substitui window.confirm.
 *
 * Uso em qualquer handler:
 *   if (!(await confirmAsync({ title: 'Excluir OC', message: '…', tone: 'danger' }))) return;
 *
 * O <GlobalConfirmDialog /> (montado uma vez no App) renderiza o pedido
 * pendente usando o ConfirmDialog padrão do sistema.
 */

import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
  resolve: ((ok: boolean) => void) | null;

  ask: (options: ConfirmOptions) => Promise<boolean>;
  settle: (ok: boolean) => void;
}

const EMPTY_OPTIONS: ConfirmOptions = { title: '', message: '' };

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: EMPTY_OPTIONS,
  resolve: null,

  ask(options) {
    // Se já houver um pedido pendente, resolve como cancelado antes de abrir outro.
    get().resolve?.(false);
    return new Promise<boolean>((resolve) => {
      set({ open: true, options, resolve });
    });
  },

  settle(ok) {
    const { resolve } = get();
    set({ open: false, resolve: null });
    resolve?.(ok);
  },
}));

/** Atalho fora de componentes React. */
export function confirmAsync(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().ask(options);
}
