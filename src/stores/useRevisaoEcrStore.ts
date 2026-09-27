/**
 * O rascunho da revisão de uma ECR (CTO-D589 §4.2). Uma ECR por vez.
 *
 * Mora numa loja, e não na tela, de propósito: trocar de aba e voltar não
 * perde nada. Sair sem salvar só acontece por escolha — o "Cancelar" da tela
 * pergunta, e fechar o navegador com mudanças também (o aviso do próprio
 * navegador).
 */

import { create } from 'zustand';
import type { Ecr, EcrSecao } from '../domain/types';
import { mesmoTexto } from '../domain/ecr';

interface RevisaoEcrState {
  ecrId: number | null;
  /** O texto vigente quando a edição começou. */
  vigente: EcrSecao[] | null;
  rascunho: EcrSecao[] | null;

  abrir: (ecr: Ecr) => void;
  mudar: (f: (secoes: EcrSecao[]) => EcrSecao[]) => void;
  fechar: () => void;
}

export const useRevisaoEcrStore = create<RevisaoEcrState>((set) => ({
  ecrId: null,
  vigente: null,
  rascunho: null,

  abrir(ecr) {
    if (!ecr.secoes) return;
    set({ ecrId: ecr.id, vigente: ecr.secoes, rascunho: ecr.secoes });
  },
  mudar(f) {
    set((s) => (s.rascunho ? { rascunho: f(s.rascunho) } : s));
  },
  fechar() {
    set({ ecrId: null, vigente: null, rascunho: null });
  },
}));

/** Há mudança não gravada no rascunho aberto. */
export function temMudancaNaRevisao(s: Pick<RevisaoEcrState, 'vigente' | 'rascunho'>): boolean {
  return !!s.vigente && !!s.rascunho && !mesmoTexto(s.vigente, s.rascunho);
}

// Fechar o navegador com mudanças: o navegador pergunta.
function aoSair(e: BeforeUnloadEvent) {
  e.preventDefault();
  e.returnValue = '';
}
let guardando = false;
useRevisaoEcrStore.subscribe((s) => {
  const deve = temMudancaNaRevisao(s);
  if (deve === guardando || typeof window === 'undefined') return;
  guardando = deve;
  if (deve) window.addEventListener('beforeunload', aoSair);
  else window.removeEventListener('beforeunload', aoSair);
});
