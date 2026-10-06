/**
 * Shell raiz — Sidebar + Topbar + conteúdo da aba ativa.
 *
 * Fonte de dados: Supabase (login → carregarDados → realtime). O fluxo antigo
 * de arquivo JSON (services/storage/*) continua no repositório como caminho de
 * volta enquanto a virada não for aprovada, mas não é mais chamado daqui.
 * Com o banco, cada gravação é imediata — não existe mais Ctrl+S nem "salvar
 * arquivo": os botões de Conectar/Salvar da era do JSON saíram junto.
 */

import { useEffect, useState, useCallback } from 'react';
import styles from './App.module.css';

// Stores
import { useDataStore } from './stores/useDataStore';
import { useOcEditingStore } from './stores/useOcEditingStore';
import { abaQueExiste, useUiStore, type TabId } from './stores/useUiStore';
import { useAuthStore } from './stores/useAuthStore';
import { esquecerRascunhoGuardado, useUmaObraStore } from './stores/useUmaObraStore';
import { proximaVirada } from './domain/umaObra';
import { useRevisaoEcrStore } from './stores/useRevisaoEcrStore';
import { useQualificacaoStore } from './stores/useQualificacaoStore';

// Services
import { sessaoAtual, perfilAtual, sair, podeGerirMestre, type Papel } from './services/supabase/auth';
import { supabase } from './services/supabase/client';
import { assinarMudancas } from './services/supabase/dados';
import { recarregarDados } from './services/supabase/sync';

// Hooks
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTema } from './hooks/useTema';

// Components
import { ToastContainer } from './components/Toast/Toast';
import { GlobalConfirmDialog } from './components/ConfirmDialog/GlobalConfirmDialog';
import { Loader } from './components/Loader/Loader';
import { Icon, type IconName } from './components/Icon/Icon';

// Feature pages
import { LoginPage, SemAcessoPage, DefinirSenhaPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { NovaOcPage } from './features/ordens-compra/NovaOcPage';
import { HistoricoPage } from './features/ordens-compra/HistoricoPage';
import { FornecedoresPage } from './features/fornecedores/FornecedoresPage';
import { QualificacaoPage } from './features/qualificacao/QualificacaoPage';
import { ObrasPage } from './features/obras/ObrasPage';
import { CatalogoPage } from './features/catalogo-ecr/CatalogoPage';
import { ProcedimentoPage } from './features/procedimento/ProcedimentoPage';
import { NOME_NO_MENU } from './domain/procedimento';
import { ConfigPage } from './features/configuracoes/ConfigPage';
import { TelaDoMestre } from './features/recebimento/TelaDoMestre';
import { RecebimentosPage } from './features/recebimento/RecebimentosPage';
import { MestresPage } from './features/mestres/MestresPage';
import { EntrarNoIcone, PorOIconeNoIphone, QrNaoEntrou } from './features/mestres/EntradaDoMestre';
import { acessoQueChegouNoEndereco, ehDaApple, estaNoIcone } from './services/aparelho';
import { entrarComOQr } from './services/supabase/mestres';
import { oQueFazerComOAcesso } from './domain/acessoPorQr';

// ── Navegação da sidebar ──────────────────────────────────────────────────────

interface NavItem {
  id: TabId;
  label: string;
  icon: IconName;
}

const NAV_COMPRAS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'nova-oc', label: 'Nova OC', icon: 'plus' },
  { id: 'historico', label: 'Histórico', icon: 'history' },
  // O que chegou na obra sem pedido, para ligar à OC ou descartar (CTO-D696 §5.2).
  { id: 'recebimentos', label: 'Recebimentos', icon: 'caixa' },
  { id: 'fornecedores', label: 'Fornecedores', icon: 'users' },
  // A FO 8.4.1.1 no menu (CTO-D661): a qualificação achada sem passar pela ficha.
  { id: 'qualificacao', label: 'Qualificação', icon: 'selo' },
  { id: 'obras', label: 'Obras', icon: 'building' },
  // O acesso do mestre de obra: só admin e engenharia (CTO-D696 §4).
  { id: 'mestres', label: 'Mestres', icon: 'capacete' },
  { id: 'catalogo', label: 'Catálogo de ECRs', icon: 'clipboard' },
  // O PS.02 no sistema, o manual de compras (CTO-D730 §3.1).
  { id: 'procedimento', label: NOME_NO_MENU, icon: 'livro' },
];

const NAV_SISTEMA: NavItem[] = [
  { id: 'config', label: 'Configurações', icon: 'settings' },
];

const PAPEL_LABEL: Record<Papel, string> = {
  admin: 'Administrador',
  engenharia: 'Engenharia',
  financeiro: 'Financeiro',
  leitura: 'Somente leitura',
  mestre: 'Mestre de obra',
};

/**
 * O QR do mestre que chegou no endereço (CTO-D696 §4): entra já, ou — no
 * iPhone fora do ícone — guarda o QR sem gastar e ensina a pôr o ícone.
 */
type EntradaPeloQr = { tipo: 'nada' } | { tipo: 'entrando' } | { tipo: 'por-o-icone' } | { tipo: 'falhou'; erro: string };

function entradaQueChegou(): EntradaPeloQr {
  if (!acessoQueChegouNoEndereco()) return { tipo: 'nada' };
  return oQueFazerComOAcesso(ehDaApple(), estaNoIcone()) === 'entrar' ? { tipo: 'entrando' } : { tipo: 'por-o-icone' };
}

/** Iniciais para o avatar do rodapé (padrão: círculo com 2 letras). */
function iniciais(nome: string, email: string): string {
  const base = nome.trim() || email.split('@')[0]?.replace(/[._-]+/g, ' ') || '';
  const partes = base.split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '—';
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '';
  return (primeira + ultima).toUpperCase();
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const data = useDataStore((s) => s.data);

  const activeTab = useUiStore((s) => abaQueExiste(s.activeTab));
  const setTab = useUiStore((s) => s.setActiveTab);
  const showToast = useUiStore((s) => s.showToast);

  const verificando = useAuthStore((s) => s.verificando);
  const sessao = useAuthStore((s) => s.sessao);
  const perfil = useAuthStore((s) => s.perfil);
  const setVerificando = useAuthStore((s) => s.setVerificando);
  const setSessao = useAuthStore((s) => s.setSessao);
  const setPerfil = useAuthStore((s) => s.setPerfil);

  const [carregandoDados, setCarregandoDados] = useState(false);
  const [erroDados, setErroDados] = useState('');
  const [definindoSenha, setDefinindoSenha] = useState(false);
  const [entradaPeloQr, setEntradaPeloQr] = useState<EntradaPeloQr>(entradaQueChegou);
  /** Dentro do ícone, a tela de entrada é a do QR; quem tem senha pede o formulário. */
  const [usarSenha, setUsarSenha] = useState(false);

  const { escuro, alternar } = useTema();

  // ── "Mostrar só uma obra" (CTO-D599): o relógio da máscara ─────────────────
  // Ela liga e desliga sozinha: a tela confere de tempos em tempos, e quando a
  // pessoa volta à janela. Quando uma borda da janela está a menos de uma volta
  // do relógio, a virada fica marcada para o instante dela (perícia 28/09, A2).
  // Na virada, os dados recarregam (abaixo).
  const obraAtiva = useUmaObraStore((s) => s.obraAtiva);
  useEffect(() => {
    const VOLTA = 15_000;
    let borda: ReturnType<typeof setTimeout> | null = null;
    let bordaEm = 0;
    const conferir = () => {
      useUmaObraStore.getState().conferir();
      const agora = new Date();
      const proxima = proximaVirada(useUmaObraStore.getState().armada, agora);
      if (proxima === null || proxima === bordaEm || proxima - agora.getTime() > VOLTA * 2) return;
      if (borda) clearTimeout(borda);
      bordaEm = proxima;
      borda = setTimeout(() => {
        borda = null;
        bordaEm = 0; // se chegar adiantado, a conferência marca de novo
        conferir();
      }, proxima - agora.getTime());
    };
    conferir();
    const relogio = setInterval(conferir, VOLTA);
    document.addEventListener('visibilitychange', conferir);
    window.addEventListener('focus', conferir);
    return () => {
      clearInterval(relogio);
      if (borda) clearTimeout(borda);
      document.removeEventListener('visibilitychange', conferir);
      window.removeEventListener('focus', conferir);
    };
  }, []);

  // ── Sessão: estado inicial + mudanças (login, logout, expiração) ───────────
  // Assinatura direta no supabase (e não via aoMudarSessao) porque aqui o NOME
  // do evento importa: PASSWORD_RECOVERY significa que a pessoa chegou pelo
  // link do e-mail e precisa definir a senha nova antes de usar o sistema.

  useEffect(() => {
    void sessaoAtual().then((s) => {
      setSessao(s);
      setVerificando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      setSessao(s);
      if (evento === 'PASSWORD_RECOVERY') setDefinindoSenha(true);
    });
    return () => data.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── O QR do mestre: entra com o código que veio no endereço ───────────────
  useEffect(() => {
    const acesso = acessoQueChegouNoEndereco();
    if (entradaPeloQr.tipo !== 'entrando' || !acesso) return;
    let viva = true;
    entrarComOQr(acesso).then(
      () => viva && setEntradaPeloQr({ tipo: 'nada' }),
      (e: unknown) => viva && setEntradaPeloQr({ tipo: 'falhou', erro: e instanceof Error ? e.message : 'Não deu para entrar.' }),
    );
    return () => {
      viva = false;
    };
  }, [entradaPeloQr.tipo]);

  // ── Dados: perfil + carga inicial + realtime, amarrados ao usuário logado ──
  // Chaveado no user.id (não no objeto sessão) para não recarregar tudo a cada
  // renovação de token, que troca o objeto mas não o usuário. E na obra da
  // máscara: quando ela liga ou desliga, a busca e o aviso mudam (CTO-D599).

  const userId = sessao?.user.id ?? '';

  useEffect(() => {
    if (!userId) {
      setPerfil(null);
      useDataStore.setState({ data: null, dirty: false, dirtySince: null });
      // O rascunho de OC aberto também é dado de quem estava logado: sem isto,
      // quem entra depois no mesmo computador encontra a OC do colega no editor.
      useOcEditingStore.getState().stopEditing();
      esquecerRascunhoGuardado();
      // Idem o rascunho da ECR (perícia 27/09, achado 4).
      useRevisaoEcrStore.getState().fechar();
      // E as qualificações que a conta anterior leu (CTO-D604).
      useQualificacaoStore.getState().esquecer();
      setTab('dashboard');
      return;
    }
    // Troca de conta sem passar pela saída: o rascunho da outra conta some.
    const { dono } = useRevisaoEcrStore.getState();
    if (dono && dono !== userId) useRevisaoEcrStore.getState().fechar();

    let ativo = true;

    void (async () => {
      try {
        setErroDados('');
        setCarregandoDados(true);
        const p = await perfilAtual();
        if (!ativo) return;
        setPerfil(p);
        // O mestre não lê o cadastro nem as OCs (CTO-D693): a tela dele busca a própria lista.
        if (p && p.papel !== 'mestre') await recarregarDados();
      } catch (err) {
        if (ativo) {
          setErroDados(err instanceof Error ? err.message : 'Falha ao carregar dados.');
        }
      } finally {
        if (ativo) setCarregandoDados(false);
      }
    })();

    // Outra pessoa gravou → recarrega. Debounce porque uma gravação de OC gera
    // vários eventos seguidos (cabeçalho + itens) e uma recarga basta.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const cancelarRealtime = assinarMudancas(() => {
      if (useAuthStore.getState().perfil?.papel === 'mestre') return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void recarregarDados().catch(() => {
          /* transitório — a próxima mudança ou o Recarregar manual resolve */
        });
      }, 600);
    });

    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
      cancelarRealtime();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, obraAtiva]);

  // ── Ações ──────────────────────────────────────────────────────────────────

  const handleRecarregar = useCallback(async () => {
    try {
      await recarregarDados();
      showToast('Dados recarregados do banco.', 'success');
    } catch (err) {
      showToast(`Falha: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    }
  }, [showToast]);

  const handleSair = useCallback(async () => {
    try {
      await sair();
    } catch {
      showToast('Não foi possível sair. Tente novamente.', 'warning');
    }
  }, [showToast]);

  useKeyboardShortcuts({
    onNewOC: () => setTab('nova-oc'),
  });

  // ── Portões de entrada ─────────────────────────────────────────────────────

  if (entradaPeloQr.tipo === 'entrando') {
    return <Loader texto="Entrando pelo QR…" />;
  }
  if (entradaPeloQr.tipo === 'por-o-icone') {
    return <PorOIconeNoIphone aoUsarAqui={() => setEntradaPeloQr({ tipo: 'entrando' })} />;
  }
  if (entradaPeloQr.tipo === 'falhou') {
    return <QrNaoEntrou erro={entradaPeloQr.erro} aoVoltar={() => setEntradaPeloQr({ tipo: 'nada' })} />;
  }

  if (verificando) {
    return <Loader texto="Verificando sessão…" />;
  }

  if (!sessao && estaNoIcone() && !usarSenha) {
    return <EntrarNoIcone aoUsarSenha={() => setUsarSenha(true)} />;
  }

  if (!sessao) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  if (definindoSenha) {
    return (
      <>
        <DefinirSenhaPage onConcluida={() => setDefinindoSenha(false)} />
        <ToastContainer />
      </>
    );
  }

  if (!perfil && !carregandoDados && !erroDados) {
    return (
      <>
        <SemAcessoPage email={sessao.user.email ?? ''} onSair={() => void handleSair()} />
        <ToastContainer />
      </>
    );
  }

  // O mestre de obra: a tela dele, sem menu, e só ela (CTO-D693, D696).
  if (perfil?.papel === 'mestre') {
    return (
      <>
        <TelaDoMestre dono={userId} aoSair={() => void handleSair()} />
        <ToastContainer />
      </>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoWrap}>
            <img
              src={`${import.meta.env.BASE_URL}marca/brasao.png`}
              alt="Campisi Engenharia"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className={styles.brandName}>Compras</div>
            <div className={styles.brandSub}>Campisi</div>
          </div>
        </div>

        <div className={styles.pbqphBadge}>
          <span className={styles.pbqphDot} />
          <span className={styles.pbqphLabel}>PBQP-H Nível A</span>
        </div>

        <nav id="tabsNav">
          <div className={styles.navLabel}>Compras</div>
          {NAV_COMPRAS.filter((item) => item.id !== 'mestres' || podeGerirMestre(perfil?.papel)).map((item) => (
            <button
              key={item.id}
              className={[styles.tabBtn, activeTab === item.id ? styles.active : ''].join(' ')}
              onClick={() => setTab(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
          <div className={styles.navLabel}>Sistema</div>
          {NAV_SISTEMA.map((item) => (
            <button
              key={item.id}
              className={[styles.tabBtn, activeTab === item.id ? styles.active : ''].join(' ')}
              onClick={() => setTab(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Rodapé da lateral — quem está logado, tema e ações de sessão */}
        <div className={styles.sidebarFooter}>
          <div className={styles.sfIdentidade}>
            <div className={styles.avatar} aria-hidden="true">
              {iniciais(perfil?.nome ?? '', sessao.user.email ?? '')}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className={styles.sfNome} title={sessao.user.email ?? ''}>
                {perfil?.nome || sessao.user.email || '—'}
              </div>
              <div className={styles.sfPapel}>{perfil ? PAPEL_LABEL[perfil.papel] : '—'}</div>
            </div>
            <button
              className={styles.temaBtn}
              onClick={alternar}
              title={escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
              aria-label={escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
            >
              <Icon name={escuro ? 'moon' : 'sun'} size={16} />
            </button>
          </div>
          <div className={styles.sfActions}>
            <button className={styles.btnGhostSm} onClick={() => void handleRecarregar()}>
              <Icon name="reload" size={13} /> Recarregar
            </button>
            <button className={styles.btnGhostSm} onClick={() => void handleSair()}>
              <Icon name="logout" size={13} /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <div className={styles.mainWrapper}>
        {/* Topbar */}
        <header className={styles.topbar}>
          {/* O nome da tela mora no cabeçalho da página, uma vez só (CTO-D643):
              a barra diz de que sistema é, e o estado do banco. */}
          <div className={styles.topbarContext}>Central de Compras</div>
          <div className={styles.topbarRight}>
            <div className={styles.syncChip}>
              <span className={styles.chipDot} />
              Banco conectado
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={styles.mainContent}>
          {erroDados && (
            <div className={styles.banner}>
              <span>{erroDados}</span>
              <button
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={() => void handleRecarregar()}
              >
                Tentar de novo
              </button>
            </div>
          )}

          {!data && carregandoDados && <Loader texto="Carregando dados do banco…" />}

          {data && (
            <>
              {activeTab === 'dashboard'     && <DashboardPage />}
              {activeTab === 'nova-oc'       && <NovaOcPage />}
              {activeTab === 'historico'     && <HistoricoPage />}
              {activeTab === 'recebimentos'  && <RecebimentosPage />}
              {activeTab === 'fornecedores'  && <FornecedoresPage />}
              {activeTab === 'qualificacao'  && <QualificacaoPage />}
              {activeTab === 'obras'         && <ObrasPage />}
              {activeTab === 'mestres'       && podeGerirMestre(perfil?.papel) && <MestresPage />}
              {activeTab === 'catalogo'      && <CatalogoPage />}
              {activeTab === 'procedimento'  && <ProcedimentoPage />}
              {activeTab === 'config'        && <ConfigPage />}
            </>
          )}
        </main>
      </div>

      {/* ── Global overlays ────────────────────────────────────────── */}
      <ToastContainer />
      <GlobalConfirmDialog />
    </div>
  );
}
