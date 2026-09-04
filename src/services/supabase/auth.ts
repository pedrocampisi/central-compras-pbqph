/**
 * Autenticação — substitui o "login" atual, que hoje é uma senha guardada
 * dentro do próprio JSON compartilhado.
 *
 * A diferença que importa: aqui o navegador não decide nada. Ele recebe um
 * token do Supabase e o banco valida esse token a cada consulta. Antes, quem
 * abrisse as ferramentas do navegador podia contornar a tela de login, porque
 * a checagem acontecia no próprio navegador.
 */

import type { Session, User } from '@supabase/supabase-js';
import { supabase, core } from './client';

export type Papel = 'admin' | 'engenharia' | 'financeiro' | 'leitura';

export interface PerfilUsuario {
  user_id: string;
  nome: string;
  papel: Papel;
  ativo: boolean;
}

export async function entrar(email: string, senha: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw new Error(traduzErroAuth(error.message));
  if (!data.session) throw new Error('Login sem sessão — tente novamente.');
  return data.session;
}

export async function sair(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sessaoAtual(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function usuarioAtual(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Perfil do usuário logado. Retorna null quando o login existe mas ninguém
 * concedeu acesso — são dois atos separados de propósito, e a tela precisa
 * distinguir "senha errada" de "você entrou mas não tem permissão".
 */
export async function perfilAtual(): Promise<PerfilUsuario | null> {
  // O filtro por user_id é obrigatório: administradores enxergam TODOS os
  // perfis pela RLS, e sem o filtro o maybeSingle() recebe várias linhas e
  // quebra. Confiar só na RLS aqui funcionava para papel comum, não para admin.
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data, error } = await core()
    .from('perfis')
    .select('user_id, nome, papel, ativo')
    .eq('user_id', u.user.id)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar seu perfil: ${error.message}`);
  return data && data.ativo ? (data as PerfilUsuario) : null;
}

/**
 * Espelho das políticas do banco (não é a segurança em si — o RLS decide):
 *   - OCs (compras.pode_emitir_oc) e fornecedores (fornecedores_escrita):
 *     admin | engenharia | financeiro — o financeiro foi incluído pela
 *     migration 20260810120000_financeiro_emite_oc, por decisão do Pedro.
 *   - Catálogo técnico (ECRs/materiais), prestadores e avaliações
 *     (core.pode_editar_cadastro): admin | engenharia apenas. As telas
 *     correspondentes estão somente-leitura nesta versão, então não há
 *     botão para o financeiro clicar e tomar erro.
 */
export function podeEditar(papel: Papel | null | undefined): boolean {
  return papel === 'admin' || papel === 'engenharia' || papel === 'financeiro';
}

export function podeEmitirOc(papel: Papel | null | undefined): boolean {
  return papel === 'admin' || papel === 'engenharia' || papel === 'financeiro';
}

export function aoMudarSessao(cb: (s: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => cb(sessao));
  return () => data.subscription.unsubscribe();
}

/** As mensagens do Supabase vêm em inglês e técnicas demais para o usuário. */
export function traduzErroAuth(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(msg)) return 'E-mail ainda não confirmado.';
  if (/rate limit|too many/i.test(msg)) return 'Muitas tentativas. Aguarde um instante.';
  if (/unable to validate email|invalid format/i.test(msg)) return 'E-mail inválido. Confira a digitação.';
  if (/should be different from the old password/i.test(msg)) return 'A senha nova precisa ser diferente da antiga.';
  if (/password should be at least/i.test(msg)) return 'A senha é curta demais.';
  return msg;
}
