/**
 * Estado de autenticação compartilhado com as telas.
 *
 * O App é quem alimenta este store (sessão via aoMudarSessao, perfil via
 * perfilAtual); as telas só LEEM daqui para decidir o que habilitar.
 * A palavra final sobre permissão é sempre do banco (RLS) — aqui é só para
 * a pessoa não preencher um formulário inteiro e tomar erro no fim.
 */

import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { PerfilUsuario } from '../services/supabase/auth';

interface AuthState {
  /** true enquanto a sessão inicial ainda está sendo verificada. */
  verificando: boolean;
  sessao: Session | null;
  /** null = logado sem acesso concedido (ou ainda carregando). */
  perfil: PerfilUsuario | null;

  setVerificando: (v: boolean) => void;
  setSessao: (s: Session | null) => void;
  setPerfil: (p: PerfilUsuario | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  verificando: true,
  sessao: null,
  perfil: null,

  setVerificando: (verificando) => set({ verificando }),
  setSessao: (sessao) => set({ sessao }),
  setPerfil: (perfil) => set({ perfil }),
}));
