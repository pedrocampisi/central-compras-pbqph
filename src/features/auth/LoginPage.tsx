/**
 * Tela de login — porta de entrada quando não há sessão.
 *
 * Duas responsabilidades:
 *   1. entrar(email, senha) — com erros sempre em português (traduzErroAuth
 *      já roda dentro de entrar(); nunca mostramos o erro cru do Supabase).
 *   2. "Esqueci minha senha" — resetPasswordForEmail. Não é acessório: as
 *      contas da equipe foram criadas SEM senha conhecida, e é por este
 *      fluxo que cada pessoa define a dela no primeiro acesso.
 */

import { useState } from 'react';
import { entrar, traduzErroAuth } from '../../services/supabase/auth';
import { supabase } from '../../services/supabase/client';
import { useUiStore } from '../../stores/useUiStore';
import { Button } from '../../components/Button/Button';
import styles from './LoginPage.module.css';

/**
 * Erro vindo do link do e-mail (ex.: token expirado), lido uma única vez no
 * carregamento do módulo. O hash é limpo em seguida para o erro não
 * reaparecer em recarregamentos futuros.
 */
const erroDoLink = (() => {
  if (typeof window === 'undefined') return '';
  const h = window.location.hash;
  if (h.includes('error_code=otp_expired') || h.includes('error=access_denied')) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return 'O link do e-mail é inválido ou já expirou (ele só vale uma vez). Peça um novo em "Esqueci minha senha".';
  }
  return '';
})();

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(erroDoLink);
  const [aviso, setAviso] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [enviandoReset, setEnviandoReset] = useState(false);

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setAviso('');
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.');
      return;
    }
    setEntrando(true);
    try {
      await entrar(email.trim(), senha);
      // A troca de tela acontece pelo aoMudarSessao no App.
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setEntrando(false);
    }
  }

  async function handleEsqueciSenha() {
    setErro('');
    setAviso('');
    if (!email.trim()) {
      setErro('Informe seu e-mail para receber o link de redefinição.');
      return;
    }
    setEnviandoReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw new Error(traduzErroAuth(error.message));
      setAviso(
        'Enviamos um link de redefinição de senha para o seu e-mail. ' +
          'Confira também a caixa de spam.',
      );
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar o e-mail.');
    } finally {
      setEnviandoReset(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={(e) => void handleEntrar(e)}>
        <div className={styles.brand}>
          <img
            src={`${import.meta.env.BASE_URL}brazao1.png`}
            alt=""
            className={styles.logo}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div>
            <div className={styles.brandName}>CENTRAL DE COMPRAS</div>
            <div className={styles.brandSub}>PBQP-H · CAMPISI ENGENHARIA</div>
          </div>
        </div>

        <label className={styles.field}>
          <span>E-mail</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@campisi.com.br"
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span>Senha</span>
          <input
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
          />
        </label>

        {erro && <p className={styles.erro} role="alert">{erro}</p>}
        {aviso && <p className={styles.aviso}>{aviso}</p>}

        <Button variant="primary" type="submit" loading={entrando}>
          Entrar
        </Button>

        <Button
          variant="outline"
          type="button"
          onClick={() => void handleEsqueciSenha()}
          loading={enviandoReset}
        >
          Primeiro acesso — definir minha senha
        </Button>

        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => void handleEsqueciSenha()}
          disabled={enviandoReset}
        >
          Esqueci minha senha
        </button>

        <p className={styles.rodape}>
          Usuários novos são criados pelo administrador. Depois de criado,
          defina sua senha pelo botão acima.
        </p>
      </form>
    </div>
  );
}

/**
 * Tela de definição de senha nova — aparece quando a pessoa chega pelo link
 * do e-mail (evento PASSWORD_RECOVERY). É aqui que cada usuário define a
 * própria senha no primeiro acesso, ou troca quando esqueceu.
 */
export function DefinirSenhaPage({ onConcluida }: { onConcluida: () => void }) {
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const showToast = useUiStore((s) => s.showToast);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (senha.length < 8) {
      setErro('Use pelo menos 8 caracteres.');
      return;
    }
    if (senha !== confirma) {
      setErro('As duas senhas não conferem.');
      return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw new Error(traduzErroAuth(error.message));
      showToast('Senha definida com sucesso!', 'success');
      onConcluida();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar a senha.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={(e) => void handleSalvar(e)}>
        <div className={styles.brand}>
          <div>
            <div className={styles.brandName}>DEFINIR NOVA SENHA</div>
            <div className={styles.brandSub}>Central de Compras · Campisi</div>
          </div>
        </div>

        <label className={styles.field}>
          <span>Nova senha</span>
          <input
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo de 8 caracteres"
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span>Repita a nova senha</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            placeholder="Digite a mesma senha de novo"
          />
        </label>

        {erro && <p className={styles.erro} role="alert">{erro}</p>}

        <Button variant="primary" type="submit" loading={salvando}>
          Salvar senha e entrar
        </Button>
      </form>
    </div>
  );
}

/**
 * Logado, mas sem acesso concedido (perfil inexistente ou inativo).
 * Login e permissão são dois atos separados de propósito — esta tela
 * distingue "senha errada" de "entrou mas ninguém liberou o acesso".
 */
export function SemAcessoPage({ email, onSair }: { email: string; onSair: () => void }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div>
            <div className={styles.brandName}>ACESSO PENDENTE</div>
            <div className={styles.brandSub}>Central de Compras · Campisi</div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text)' }}>
          Você entrou como <strong>{email}</strong>, mas o seu acesso ainda não
          foi liberado por um administrador.
        </p>
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)' }}>
          Peça a liberação e entre novamente.
        </p>
        <Button variant="outline" onClick={onSair}>Sair</Button>
      </div>
    </div>
  );
}
