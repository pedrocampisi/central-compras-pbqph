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
import { useUiStore, type TabId } from './stores/useUiStore';
import { useAuthStore } from './stores/useAuthStore';

// Services
import { sessaoAtual, aoMudarSessao, perfilAtual, sair, type Papel } from './services/supabase/auth';
import { assinarMudancas } from './services/supabase/dados';
import { recarregarDados } from './services/supabase/sync';

// Hooks
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Components
import { ToastContainer } from './components/Toast/Toast';
import { GlobalConfirmDialog } from './components/ConfirmDialog/GlobalConfirmDialog';
import { Icon, type IconName } from './components/Icon/Icon';

// Feature pages
import { LoginPage, SemAcessoPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { NovaOcPage } from './features/ordens-compra/NovaOcPage';
import { HistoricoPage } from './features/ordens-compra/HistoricoPage';
import { FornecedoresPage } from './features/fornecedores/FornecedoresPage';
import { ObrasPage } from './features/obras/ObrasPage';
import { PrestadoresPage } from './features/prestadores-servico/PrestadoresPage';
import { CatalogoPage } from './features/catalogo-ecr/CatalogoPage';
import { ConfigPage } from './features/configuracoes/ConfigPage';

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
  { id: 'fornecedores', label: 'Fornecedores', icon: 'users' },
  { id: 'obras', label: 'Obras', icon: 'building' },
  { id: 'prestadores', label: 'Prestadores', icon: 'wrench' },
  { id: 'catalogo', label: 'Catálogo ECR', icon: 'clipboard' },
];

const NAV_SISTEMA: NavItem[] = [
  { id: 'config', label: 'Configurações', icon: 'settings' },
];

const TAB_TITLES: Record<TabId, string> = {
  dashboard: 'Dashboard',
  'nova-oc': 'Nova Ordem de Compra',
  historico: 'Histórico de OCs',
  fornecedores: 'Fornecedores',
  obras: 'Obras',
  prestadores: 'Prestadores de Serviço',
  catalogo: 'Catálogo ECR',
  config: 'Configurações',
};

const PAPEL_LABEL: Record<Papel, string> = {
  admin: 'Administrador',
  engenharia: 'Engenharia',
  financeiro: 'Financeiro',
  leitura: 'Somente leitura',
};

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const data = useDataStore((s) => s.data);

  const activeTab = useUiStore((s) => s.activeTab);
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

  // ── Sessão: estado inicial + mudanças (login, logout, expiração) ───────────

  useEffect(() => {
    void sessaoAtual().then((s) => {
      setSessao(s);
      setVerificando(false);
    });
    const cancelar = aoMudarSessao((s) => setSessao(s));
    return cancelar;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Dados: perfil + carga inicial + realtime, amarrados ao usuário logado ──
  // Chaveado no user.id (não no objeto sessão) para não recarregar tudo a cada
  // renovação de token, que troca o objeto mas não o usuário.

  const userId = sessao?.user.id ?? '';

  useEffect(() => {
    if (!userId) {
      setPerfil(null);
      useDataStore.setState({ data: null, dirty: false, dirtySince: null });
      return;
    }

    let ativo = true;

    void (async () => {
      try {
        setErroDados('');
        setCarregandoDados(true);
        const p = await perfilAtual();
        if (!ativo) return;
        setPerfil(p);
        if (p) await recarregarDados();
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
  }, [userId]);

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

  if (verificando) {
    return (
      <div className={styles.gateScreen}>
        <p>Verificando sessão…</p>
      </div>
    );
  }

  if (!sessao) {
    return (
      <>
        <LoginPage />
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

  // ── Emitente banner ────────────────────────────────────────────────────────

  const emitentes = data?.config.emitentes ?? [];
  const principal = emitentes[0];
  const showBanner =
    !!data &&
    (!principal ||
      !principal.razao_social ||
      (principal.tipo === 'PF' ? !principal.cpf : !principal.cnpj));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoWrap}>
            <img
              src={`${import.meta.env.BASE_URL}brazao1.png`}
              alt="Campisi"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className={styles.brandName}>COMPRAS</div>
            <div className={styles.brandSub}>PBQP-H · CAMPISI</div>
          </div>
        </div>

        <div className={styles.pbqphBadge}>
          <span className={styles.pbqphDot} />
          <span className={styles.pbqphLabel}>PBQP-H Nível A</span>
        </div>

        <nav id="tabsNav">
          <div className={styles.navLabel}>Compras</div>
          {NAV_COMPRAS.map((item) => (
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

        {/* Sidebar footer — quem está logado + ações de sessão */}
        <div className={styles.sidebarFooter}>
          <div className={styles.sfRow}>
            <span className={styles.sfLabel}>Usuário:</span>
            <span className={styles.sfValue} title={sessao.user.email ?? ''}>
              {perfil?.nome || sessao.user.email || '—'}
            </span>
          </div>
          <div className={styles.sfRow}>
            <span className={styles.sfLabel}>Acesso:</span>
            <span className={styles.sfValue}>
              {perfil ? PAPEL_LABEL[perfil.papel] : '—'}
            </span>
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
          <div>
            <div className={styles.topbarContext}>Central de Compras</div>
            <div className={styles.topbarTitle}>{TAB_TITLES[activeTab]}</div>
          </div>
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
              <span>⚠️ {erroDados}</span>
              <button
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={() => void handleRecarregar()}
              >
                Tentar de novo
              </button>
            </div>
          )}

          {showBanner && (
            <div className={styles.banner}>
              <span>⚠️ Configure o emitente principal para emitir OCs.</span>
              <button
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={() => setTab('config')}
              >
                Configurar agora
              </button>
            </div>
          )}

          {!data && carregandoDados && (
            <div className={styles.gateScreen}>
              <p>Carregando dados do banco…</p>
            </div>
          )}

          {data && (
            <>
              {activeTab === 'dashboard'     && <DashboardPage />}
              {activeTab === 'nova-oc'       && <NovaOcPage />}
              {activeTab === 'historico'     && <HistoricoPage />}
              {activeTab === 'fornecedores'  && <FornecedoresPage />}
              {activeTab === 'obras'         && <ObrasPage />}
              {activeTab === 'prestadores'   && <PrestadoresPage />}
              {activeTab === 'catalogo'      && <CatalogoPage />}
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
