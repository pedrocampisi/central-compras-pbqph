/**
 * As frases da tela de entrada, uma por situação (CTO-D541, pendência 9 b e c).
 *
 * Até 26/09/2026 "Primeiro acesso" e "Esqueci minha senha" diziam a MESMA
 * frase ("…o link de redefinição"), e quem nunca teve senha lia que ia
 * redefinir uma. E depois da frase não havia o que apertar: a ação laranja
 * continuava "Entrar", com o campo Senha na tela. Agora cada situação tem a
 * sua frase e o seu botão de enviar.
 *
 * O envio é o mesmo nos dois casos (o link do Supabase que abre a tela de
 * definir senha): as contas da equipe são criadas SEM senha, e a primeira
 * senha nasce por este link. Muda o que se diz à pessoa, não o que se manda.
 */

export type ModoDoAcesso = 'entrar' | 'primeiro-acesso' | 'esqueci';

interface Textos {
  titulo: string;
  frase: string;
  acao: string;
  acaoEnviando: string;
  enviado: string;
}

export const TEXTOS_DO_ACESSO: Record<Exclude<ModoDoAcesso, 'entrar'>, Textos> = {
  'primeiro-acesso': {
    titulo: 'Primeiro acesso',
    frase:
      'Sua conta já foi criada pelo administrador. Informe o seu e-mail da empresa: ' +
      'enviamos um link para você criar a sua senha.',
    acao: 'Enviar link para criar minha senha',
    acaoEnviando: 'Enviando…',
    enviado:
      'Enviamos o link para criar a sua senha. Abra o e-mail e siga o link — ele vale ' +
      'uma vez só. Confira também a caixa de spam.',
  },
  esqueci: {
    titulo: 'Esqueci minha senha',
    frase: 'Informe o seu e-mail da empresa: enviamos um link para você criar uma senha nova.',
    acao: 'Enviar link de senha nova',
    acaoEnviando: 'Enviando…',
    enviado:
      'Enviamos o link para criar uma senha nova. Ele vale uma vez só. ' +
      'Confira também a caixa de spam.',
  },
};

export const FALTA_EMAIL = 'Informe o seu e-mail.';
