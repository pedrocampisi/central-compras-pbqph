/**
 * Cliente Supabase — substitui o JSON no OneDrive como fonte de verdade.
 *
 * A chave publishable fica no código do navegador de propósito: é para isso que
 * ela existe. Ela não autoriza nada sozinha — quem decide o que cada pessoa
 * enxerga e altera são as políticas (RLS) dentro do banco, avaliadas a cada
 * consulta contra o usuário logado. Uma chave publishable roubada não abre nada
 * sem um login válido por trás.
 *
 * A chave secreta (sb_secret_…) NUNCA aparece aqui. Ela vive só no servidor.
 */

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
const chave = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined;

if (!url || !chave) {
  throw new Error(
    'Configuração do Supabase ausente. Crie um arquivo .env.local com ' +
      'VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.',
  );
}

export const supabase = createClient(url, chave, {
  auth: {
    // Mantém a sessão entre recarregamentos e renova o token sozinho: sem isso
    // o usuário é deslogado ao atualizar a página, e a sessão morre em 1h.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  db: { schema: 'public' },
});

/** Schemas próprios precisam ser pedidos explicitamente. */
export const core = () => supabase.schema('core');
export const compras = () => supabase.schema('compras');
