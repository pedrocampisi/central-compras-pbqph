/**
 * O rascunho da revisão de uma ECR (CTO-D589 §4.2). Uma ECR por vez.
 *
 * Mora numa loja, e não na tela, de propósito: trocar de aba e voltar não
 * perde nada. Sair sem salvar só acontece por escolha — o "Cancelar" da tela
 * pergunta, e fechar o navegador com mudanças também (o aviso do próprio
 * navegador).
 *
 * O rascunho guarda DE QUEM é e DE ONDE partiu (perícia de 27/09, achados 2 e
 * 4; CTO-D607): a saída da conta o apaga, outra conta não o enxerga, e a tela
 * recusa gravar um rascunho que partiu de uma revisão que já não é a vigente.
 */

import { create } from 'zustand';
import type { Ecr, EcrSecao } from '../domain/types';
import { mesmoTexto } from '../domain/ecr';

interface RevisaoEcrState {
  ecrId: number | null;
  /** O texto vigente quando a edição começou. */
  vigente: EcrSecao[] | null;
  rascunho: EcrSecao[] | null;
  /** A revisão vigente quando a edição começou ("00", "01"...). */
  revisaoDeOrigem: string | null;
  /** A conta que abriu o rascunho (o id do usuário). */
  dono: string | null;

  abrir: (ecr: Ecr, dono: string) => void;
  mudar: (f: (secoes: EcrSecao[]) => EcrSecao[]) => void;
  fechar: () => void;
}

export const useRevisaoEcrStore = create<RevisaoEcrState>((set) => ({
  ecrId: null,
  vigente: null,
  rascunho: null,
  revisaoDeOrigem: null,
  dono: null,

  abrir(ecr, dono) {
    if (!ecr.secoes || !dono) return;
    set({ ecrId: ecr.id, vigente: ecr.secoes, rascunho: ecr.secoes, revisaoDeOrigem: ecr.revisao ?? '', dono });
  },
  mudar(f) {
    set((s) => (s.rascunho ? { rascunho: f(s.rascunho) } : s));
  },
  fechar() {
    set({ ecrId: null, vigente: null, rascunho: null, revisaoDeOrigem: null, dono: null });
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
