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
import { Button } from '../../components/Button/Button';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
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

        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => void handleEsqueciSenha()}
          disabled={enviandoReset}
        >
          {enviandoReset ? 'Enviando…' : 'Esqueci minha senha'}
        </button>

        <p className={styles.rodape}>
          Primeiro acesso? Use "Esqueci minha senha" para definir a sua.
        </p>
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
