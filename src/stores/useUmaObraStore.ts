/**
 * A máscara "mostrar só uma obra" na tela (CTO-D599): o que está armado neste
 * navegador e qual obra ela mostra agora. O App confere o relógio de tempos em
 * tempos: a máscara liga sozinha no começo da janela e desliga sozinha no fim,
 * e a tela recarrega os dados na virada.
 *
 * O filtro em si não mora aqui: mora na busca (`carregarDados`). Esta loja só
 * diz à tela quando recarregar e o que mostrar em Configurações.
 */

import { create } from 'zustand';
import { type MascaraDeObra, ligadaAgora } from '../domain/umaObra';
import type { OrdemCompra } from '../domain/types';
import { apagarMascara, gravarMascara, lerMascara } from '../services/storage/umaObra';
import { useOcEditingStore } from './useOcEditingStore';
import { useUiStore } from './useUiStore';

interface UmaObraState {
  /** O que está armado (ligado ou esperando o começo). */
  armada: MascaraDeObra | null;
  /** A obra que a tela mostra agora, ou `null` (todas). */
  obraAtiva: string | null;

  /** Relê o navegador e o relógio. Muda o estado só se algo mudou. */
  conferir: (agora?: Date) => void;
  /** `false`: este navegador não guarda, e a máscara não foi armada. */
  armar: (m: MascaraDeObra) => boolean;
  desarmar: () => void;
}

function estado(agora: Date) {
  const armada = lerMascara(agora);
  return { armada, obraAtiva: ligadaAgora(armada, agora) ? armada!.obraId : null };
}

export const useUmaObraStore = create<UmaObraState>((set, get) => ({
  ...estado(new Date()),

  conferir(agora = new Date()) {
    const novo = estado(agora);
    const s = get();
    if (novo.obraAtiva !== s.obraAtiva || JSON.stringify(novo.armada) !== JSON.stringify(s.armada)) set(novo);
    guardarOuDevolverRascunho(get().obraAtiva);
  },
  armar(m) {
    const ok = gravarMascara(m);
    get().conferir();
    return ok;
  },
  desarmar() {
    apagarMascara();
    get().conferir();
  },
}));

// ── O rascunho da Nova OC de outra obra ──────────────────────────────────────
// Mora só na memória da página (a OC não guarda rascunho no navegador). Com a
// máscara ligada, o de outra obra sai da tela e fica guardado aqui; volta
// quando ela desligar — se a Nova OC estiver livre (vazia ou fechada).

let rascunhoGuardado: OrdemCompra | null = null;

/** Uma OC nova que ninguém começou a preencher: pode dar lugar ao rascunho guardado. */
function ocEmBranco(oc: OrdemCompra): boolean {
  return oc.id.startsWith('oc-') && !oc.obra_id && !oc.fornecedor_id && oc.itens.every((i) => !i.descricao.trim());
}

export function guardarOuDevolverRascunho(obraAtiva: string | null): void {
  const editando = useOcEditingStore.getState();
  const oc = editando.ocEditing;
  if (obraAtiva) {
    if (oc && oc.obra_id && oc.obra_id !== obraAtiva) {
      rascunhoGuardado = oc;
      editando.stopEditing();
      // Sem rascunho, a Nova OC aberta ficaria em "Inicializando…".
      if (useUiStore.getState().activeTab === 'nova-oc') useUiStore.getState().setActiveTab('dashboard');
    }
    return;
  }
  if (rascunhoGuardado && (!oc || ocEmBranco(oc))) {
    editando.startEditing(rascunhoGuardado);
    rascunhoGuardado = null;
  }
}

/** Quem saiu não deixa rascunho para quem entra depois no mesmo computador. */
export function esquecerRascunhoGuardado(): void {
  rascunhoGuardado = null;
}
