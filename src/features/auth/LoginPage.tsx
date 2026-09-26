/**
 * Tela de login — porta de entrada quando não há sessão.
 *
 * Duas responsabilidades:
 *   1. entrar(email, senha) — com erros sempre em português (traduzErroAuth
 *      já roda dentro de entrar(); nunca mostramos o erro cru do Supabase).
 *   2. "Primeiro acesso" e "Esqueci minha senha" — resetPasswordForEmail. Não
 *      é acessório: as contas da equipe foram criadas SEM senha conhecida, e
 *      é por este fluxo que cada pessoa define a dela no primeiro acesso. Os
 *      dois mandam o mesmo link e dizem frases diferentes (textosDoAcesso).
 *
 * Sem portão de boas-vindas e sem animação de entrada: a cerimônia da marca é
 * da Central, que é por onde a equipe entra. Aqui fica só o formulário, no
 * padrão visual comum das telas de trabalho.
 */

import { useRef, useState } from 'react';
import { entrar, traduzErroAuth } from '../../services/supabase/auth';
import { supabase } from '../../services/supabase/client';
import { useUiStore } from '../../stores/useUiStore';
import { FALTA_EMAIL, TEXTOS_DO_ACESSO, type ModoDoAcesso } from './textosDoAcesso';
import styles from './LoginPage.module.css';

const MARCA = `${import.meta.env.BASE_URL}marca/`;

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
  const [modo, setModo] = useState<ModoDoAcesso>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(erroDoLink);
  const [aviso, setAviso] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const campoEmail = useRef<HTMLInputElement>(null);

  function mudarPara(m: ModoDoAcesso) {
    setModo(m);
    setErro('');
    setAviso('');
    // O foco vai para o que a pessoa preenche a seguir, e não fica no botão
    // que acabou de sumir (pelo teclado, ele caía em "Voltar para entrar").
    campoEmail.current?.focus();
  }

  async function handleEntrar() {
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

  /** Primeiro acesso e "esqueci" mandam o MESMO link; muda só o que se diz. */
  async function handleEnviarLink(enviado: string) {
    if (!email.trim()) {
      setErro(FALTA_EMAIL);
      return;
    }
    setEnviando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw new Error(traduzErroAuth(error.message));
      setAviso(enviado);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar o e-mail.');
    } finally {
      setEnviando(false);
    }
  }

  const textos = modo === 'entrar' ? null : TEXTOS_DO_ACESSO[modo];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setAviso('');
    if (textos) void handleEnviarLink(textos.enviado);
    else void handleEntrar();
  }

  return (
    <main className={styles.wrap}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <img
          src={`${MARCA}brasao.png`}
          alt=""
          className={styles.logo}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <h1 className={styles.brandName}>{textos ? textos.titulo : 'Central de Compras'}</h1>
        <p className={styles.brandSub}>{textos ? textos.frase : 'Entre com seu e-mail da empresa.'}</p>

        <label className={styles.field}>
          <span>E-mail</span>
          <input
            ref={campoEmail}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@campisi.com.br"
            autoFocus
          />
        </label>

        {!textos && (
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
        )}

        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}
        {aviso && (
          <p className={styles.aviso} role="status">
            {aviso}
          </p>
        )}

        {/* A ação laranja é UMA por tela, e é a da situação em que a pessoa está. */}
        {textos ? (
          <>
            <button className={styles.btnEntrar} type="submit" disabled={enviando}>
              {enviando ? textos.acaoEnviando : textos.acao}
            </button>
            <button type="button" className={styles.linkBtn} onClick={() => mudarPara('entrar')}>
              Voltar para entrar
            </button>
          </>
        ) : (
          <>
            <button className={styles.btnEntrar} type="submit" disabled={entrando}>
              {entrando ? 'Entrando…' : 'Entrar'}
            </button>
            <button
              type="button"
              className={styles.btnSecundario}
              onClick={() => mudarPara('primeiro-acesso')}
            >
              Primeiro acesso — definir minha senha
            </button>
            <button type="button" className={styles.linkBtn} onClick={() => mudarPara('esqueci')}>
              Esqueci minha senha
            </button>
          </>
        )}

        <p className={styles.rodape}>
          Usuários novos são criados pelo administrador. Depois de criado, defina sua senha em
          “Primeiro acesso”.
        </p>
      </form>
    </main>
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
    <main className={styles.wrap}>
      <form className={styles.card} onSubmit={(e) => void handleSalvar(e)}>
        <img
          src={`${MARCA}brasao.png`}
          alt=""
          className={styles.logo}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <h1 className={styles.brandName}>Definir nova senha</h1>
        <p className={styles.brandSub}>Central de Compras · Campisi</p>

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

        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}

        <button className={styles.btnEntrar} type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar senha e entrar'}
        </button>
      </form>
    </main>
  );
}

/**
 * Logado, mas sem acesso concedido (perfil inexistente ou inativo).
 * Login e permissão são dois atos separados de propósito — esta tela
 * distingue "senha errada" de "entrou mas ninguém liberou o acesso".
 */
export function SemAcessoPage({ email, onSair }: { email: string; onSair: () => void }) {
  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <img
          src={`${MARCA}mascote-corpo.png`}
          alt=""
          className={styles.logo}
          style={{ width: 150 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <h1 className={styles.brandName}>Acesso pendente</h1>
        <p className={styles.brandSub}>
          Você entrou como <strong>{email}</strong>, mas o seu acesso ainda não foi liberado por um
          administrador.
        </p>
        <button type="button" className={styles.btnSecundario} onClick={onSair}>
          Sair
        </button>
      </div>
    </main>
  );
}
