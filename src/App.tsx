/**
 * Shell raiz — Sidebar + Topbar + conteúdo da aba ativa.
 *
 * Fonte de dados: Supabase (login → carregarDados → realtime). O fluxo antigo
 * de arquivo JSON (services/storage/*) continua no repositório como caminho de
 * volta enquanto a virada não for aprovada, mas não é mais chamado daqui.
 * Com o banco, cada gravação é imediata — não existe mais Ctrl+S nem "salvar
 * arquivo": os botões de Conectar/Salvar da era do JSON saíram junto.
 */

import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react';
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
import { useEntregasSemPapelStore } from './stores/useEntregasSemPapelStore';

// Services
import { sessaoAtual, perfilAtual, sair, podeEmitirOc, podeGerirMestre, type Papel } from './services/supabase/auth';
import { supabase } from './services/supabase/client';
import { assinarMudancas } from './services/supabase/dados';
import { recarregarDados } from './services/supabase/sync';

// Hooks
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Components
import { ToastContainer } from './components/Toast/Toast';
import { GlobalConfirmDialog } from './components/ConfirmDialog/GlobalConfirmDialog';
import { Loader } from './components/Loader/Loader';
import { Icon, type IconName } from './components/Icon/Icon';

// Feature pages
import { LoginPage, SemAcessoPage, SemOrdemDeCompraPage, DefinirSenhaPage } from './features/auth/LoginPage';
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
  // "Painel", e não "Dashboard": o nome da tela em português, igual no menu e no título (D1034c, item 2).
  { id: 'dashboard', label: 'Painel', icon: 'dashboard' },
  { id: 'nova-oc', label: 'Nova OC', icon: 'plus' },
  { id: 'historico', label: 'Histórico', icon: 'history' },
  // O que chegou na obra sem pedido, para ligar à OC ou descartar (CTO-D696 §5.2).
  { id: 'recebimentos', label: 'Recebimentos', icon: 'caixa' },
  { id: 'fornecedores', label: 'Fornecedores', icon: 'users' },
  // A FO 8.4.1.1 no menu (CTO-D661): a qualificação achada sem passar pela ficha.
  { id: 'qualificacao', label: 'Qualificação', icon: 'selo' },
  { id: 'obras', label: 'Obras', icon: 'building' },
  // O acesso do mestre de obra: só admin e engenharia (CTO-D696 §4). Na tela, "encarregado" (CTO-D799).
  { id: 'mestres', label: 'Acesso dos encarregados', icon: 'capacete' },
  { id: 'catalogo', label: 'Catálogo de ECRs', icon: 'clipboard' },
  // O PS.02 no sistema, o manual de compras (CTO-D730 §3.1).
  { id: 'procedimento', label: NOME_NO_MENU, icon: 'livro' },
];

/**
 * A barra de baixo do celular (peça BarraDoCelular, CTO-D1034f item 6): as
 * quatro telas mais usadas e o "Mais", que abre o menu com o resto. Os nomes
 * cabem inteiros; o nome completo vai para o leitor de tela.
 */
const NAV_BARRA: (NavItem & { curto: string })[] = [
  { id: 'dashboard', label: 'Painel', curto: 'Painel', icon: 'dashboard' },
  { id: 'nova-oc', label: 'Nova OC', curto: 'Nova OC', icon: 'plus' },
  { id: 'historico', label: 'Histórico', curto: 'Histórico', icon: 'history' },
  { id: 'recebimentos', label: 'Recebimentos', curto: 'Recebidos', icon: 'caixa' },
];

const NAV_SISTEMA: NavItem[] = [
  { id: 'config', label: 'Configurações', icon: 'settings' },
];

const PAPEL_LABEL: Record<Papel, string> = {
  admin: 'Administrador',
  engenharia: 'Engenharia',
  financeiro: 'Financeiro',
  leitura: 'Somente leitura',
  mestre: 'Encarregado de obra',
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

  // O menu vira gaveta abaixo de 960 px (DESIGN.md §9, peça MenuLateral): o "Mais" da
  // barra de baixo abre; o véu, o Esc e a escolha de uma tela fecham, e o foco volta ao "Mais".
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoDoMenu = useRef<HTMLButtonElement>(null);
  const fecharMenu = useCallback(() => setMenuAberto(false), []);
  const irPara = useCallback(
    (aba: TabId) => {
      setTab(aba);
      if (menuAberto) fecharMenu();
    },
    [setTab, menuAberto, fecharMenu],
  );
  // Com a gaveta aberta o resto fica fora do alcance (inert): o foco entra nela, na tela da vez.
  // Ao fechar, o foco volta ao "Mais", depois que o inert sai (antes, o foco não pega).
  const menuJaAbriu = useRef(false);
  useEffect(() => {
    if (!menuAberto) {
      if (menuJaAbriu.current) botaoDoMenu.current?.focus();
      return;
    }
    menuJaAbriu.current = true;
    const menu = document.getElementById('menu-lateral');
    (menu?.querySelector<HTMLElement>('.cp-item.ativo') ?? menu?.querySelector<HTMLElement>('button'))?.focus();
  }, [menuAberto]);

  // O número no item Recebimentos (CTO-D845 §2): as entregas sem papel do fornecedor. Só para
  // quem emite OC (a régua da lista no banco), e lido de novo quando os dados mudam.
  const podeEmitir = podeEmitirOc(perfil?.papel);
  const semPapel = useEntregasSemPapelStore((s) => (podeEmitir ? (s.linhas?.length ?? 0) : 0));
  useEffect(() => {
    if (!podeEmitir || !data) return;
    const t = setTimeout(() => void useEntregasSemPapelStore.getState().carregar(), 0);
    return () => clearTimeout(t);
  }, [podeEmitir, data]);

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
      useEntregasSemPapelStore.setState({ linhas: null, erro: '' });
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
        // O perfil sem a Ordem de Compra (CTO-D814) não lê nada: o banco recusaria.
        if (p && p.papel !== 'mestre' && !p.sem_ordem_de_compra) await recarregarDados();
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
      const quem = useAuthStore.getState().perfil;
      if (quem?.papel === 'mestre' || quem?.sem_ordem_de_compra) return;
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
    onEsc: () => {
      if (menuAberto) fecharMenu();
    },
  });

  // A tecla "/" leva o cursor à busca da lista, de qualquer lugar da tela, como na
  // Central (DESIGN.md §14). Dentro de um campo, a barra é só uma barra.
  useEffect(() => {
    const naBarra = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const alvo = e.target;
      if (alvo instanceof Element && alvo.closest('input, textarea, select, [contenteditable="true"]')) return;
    // Com uma ficha, uma janela ou o menu aberto, a busca de trás não é de ninguém (D1034k).
    if (document.querySelector('[aria-modal="true"], .cp-veu.aberto')) return;
      const busca = document.querySelector<HTMLInputElement>('main .cc-busca input');
      if (!busca) return;
      e.preventDefault();
      busca.focus();
    };
    window.addEventListener('keydown', naBarra);
    return () => window.removeEventListener('keydown', naBarra);
  }, []);

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

  // O perfil com a Ordem de Compra barrada (CTO-D814): avisa, e não entra. Vale
  // para todo papel, o do mestre também: a trava do banco é dos atos da OC.
  if (perfil?.sem_ordem_de_compra) {
    return (
      <>
        <SemOrdemDeCompraPage email={sessao.user.email ?? ''} onSair={() => void handleSair()} />
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

  const NavBotao = (item: NavItem) => (
    <button
      key={item.id}
      type="button"
      className={['cp-item', activeTab === item.id ? 'ativo' : ''].join(' ')}
      aria-current={activeTab === item.id ? 'page' : undefined}
      onClick={() => irPara(item.id)}
    >
      <Icon name={item.icon} size={19} />
      <span>{item.label}</span>
      {/* O número no item Recebimentos (CTO-D845 §2): o que espera o escritório, no fim da linha. */}
      {item.id === 'recebimentos' && semPapel > 0 && (
        <b className={styles.contador} data-contador-sem-papel="" title={`${semPapel} sem papel do fornecedor`}>
          {semPapel}
        </b>
      )}
    </button>
  );

  return (
    <div className={styles.layout}>
      {/* ── O menu: a peça MenuLateral do pacote; no celular, a gaveta do pacote ── */}
      <div className={['cp-veu', menuAberto ? 'aberto' : ''].join(' ')} onClick={fecharMenu} aria-hidden />
      <aside
        id="menu-lateral"
        className={['cp-lateral', 'cp-gaveta', styles.sidebar, menuAberto ? 'aberta' : ''].join(' ')}
        style={{ '--brasao': `url(${import.meta.env.BASE_URL}padrao_campisi/marca/brasao.png)` } as CSSProperties}
      >
        <div className="cp-marca">
          <span className="cp-brasao" role="img" aria-label="Campisi Engenharia" />
          <span>
            <b>Compras</b>
            <small className={styles.marcaSub}>Campisi · PBQP-H Nível A</small>
          </span>
        </div>

        <nav id="tabsNav" className={styles.menu} aria-label="Telas da Central de Compras">
          <p className="cp-grupo">Compras</p>
          <div className="cp-nav">
            {NAV_COMPRAS.filter((item) => item.id !== 'mestres' || podeGerirMestre(perfil?.papel)).map(NavBotao)}
          </div>
          <p className={`cp-grupo ${styles.grupoSeguinte}`}>Sistema</p>
          <div className="cp-nav">{NAV_SISTEMA.map(NavBotao)}</div>
        </nav>

        {/* O pé do menu: a troca de modo (peça TrocaDeModo), o Recarregar e quem está usando. */}
        <div className={styles.pe}>
          <button className="cp-item cp-modo" type="button" data-trocar-modo>
            <span className="sol"><Icon name="sun" size={19} /></span>
            <span className="lua"><Icon name="moon" size={19} /></span>
            <span className="vai-dia">Modo diurno</span>
            <span className="vai-noite">Modo noturno</span>
          </button>
          <button className="cp-item" type="button" onClick={() => void handleRecarregar()}>
            <Icon name="reload" size={19} /> Recarregar os dados
          </button>
          <div className="cp-usuario">
            <span className="cp-mono" aria-hidden="true">
              {iniciais(perfil?.nome ?? '', sessao.user.email ?? '')}
            </span>
            <span className={styles.quem}>
              <b title={sessao.user.email ?? ''}>{perfil?.nome || sessao.user.email || '—'}</b>
              <small>{perfil ? PAPEL_LABEL[perfil.papel] : '—'}</small>
            </span>
            <button type="button" className="cp-icone" onClick={() => void handleSair()} aria-label="Sair" title="Sair">
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <div className={styles.mainWrapper} inert={menuAberto}>
        {/* Topbar */}
        <header className={styles.topbar}>
          {/* O nome da tela mora no cabeçalho da página, uma vez só (CTO-D643):
              a barra diz de que sistema é, e o estado do banco. */}
          <div className={styles.topbarContext}>Central de Compras</div>
          <div className={styles.topbarRight}>
            {/* Com a carga falhada o selo não diz "conectado" (D1034a): dizia, por cima do aviso de erro. */}
            {erroDados ? (
              <span className="cp-selo cp-selo--erro">Dados não carregaram</span>
            ) : (
              <span className="cp-selo cp-selo--pronto">Banco conectado</span>
            )}
          </div>
        </header>

        {/* Content */}
        <main className={styles.mainContent}>
          {erroDados && (
            <div className="cp-faixa erro" role="alert">
              <Icon name="alerta" size={20} />
              <span className={styles.faixaTexto}>
                <b>Os dados não carregaram.</b> {erroDados} Não conclua que uma OC ou um cadastro não existe.
              </span>
              <button type="button" className="cp-btn cp-btn--contorno cp-btn--p" onClick={() => void handleRecarregar()}>
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

        {/* A barra de baixo do celular (peça BarraDoCelular): só abaixo de 960 px. */}
        <div className={styles.barraDoCelular}>
          <nav className="cp-barra" aria-label="Telas mais usadas">
            {NAV_BARRA.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={activeTab === item.id ? 'page' : undefined}
                aria-label={item.curto === item.label ? undefined : item.label}
                onClick={() => irPara(item.id)}
              >
                <Icon name={item.icon} size={22} />
                <span>{item.curto}</span>
              </button>
            ))}
            <button
              ref={botaoDoMenu}
              type="button"
              aria-label="Mais: abrir o menu"
              aria-expanded={menuAberto}
              aria-controls="menu-lateral"
              onClick={() => setMenuAberto(true)}
            >
              <Icon name="menu" size={22} />
              <span>Mais</span>
            </button>
          </nav>
        </div>
      </div>

      {/* ── Global overlays ────────────────────────────────────────── */}
      <ToastContainer />
      <GlobalConfirmDialog />
    </div>
  );
}
