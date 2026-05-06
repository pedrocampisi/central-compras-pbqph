/**
 * Shell raiz — Sidebar + Topbar + conteúdo da aba ativa.
 * Inicializa os dados ao montar (cache → file handle → seed).
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './App.module.css';

// Stores
import { useDataStore } from './stores/useDataStore';
import { useUiStore, type TabId } from './stores/useUiStore';
import { useFileHandleStore } from './stores/useFileHandleStore';

// Services
import { loadCache, purgeLegacyCaches } from './services/storage/cache';
import {
  connectFile,
  saveData,
  reloadFromHandle,
  tryRestoreFileHandle,
  loadFromFileHandle,
} from './services/storage/fileSystem';
import { runMigrations } from './domain/migrations';
import { normalizeData } from './domain/normalize';

// Hooks
import { useAutoSave } from './hooks/useAutoSave';
import { useDirtyGuard } from './hooks/useDirtyGuard';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Components
import { ToastContainer } from './components/Toast/Toast';
import { ConfirmDialog } from './components/ConfirmDialog/ConfirmDialog';

// Feature pages
import { DashboardPage } from './features/dashboard/DashboardPage';
import { NovaOcPage } from './features/ordens-compra/NovaOcPage';
import { HistoricoPage } from './features/ordens-compra/HistoricoPage';
import { FornecedoresPage } from './features/fornecedores/FornecedoresPage';
import { ObrasPage } from './features/obras/ObrasPage';
import { CatalogoPage } from './features/catalogo-ecr/CatalogoPage';
import { ConfigPage } from './features/configuracoes/ConfigPage';

// ── Navegação da sidebar ──────────────────────────────────────────────────────

interface NavItem {
  id: TabId;
  label: string;
  icon: string;
}

const NAV_COMPRAS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'nova-oc', label: 'Nova OC', icon: '+' },
  { id: 'historico', label: 'Histórico', icon: '↺' },
  { id: 'fornecedores', label: 'Fornecedores', icon: '👥' },
  { id: 'obras', label: 'Obras', icon: '🏗' },
];

const NAV_SISTEMA: NavItem[] = [
  { id: 'catalogo', label: 'Catálogo ECR', icon: '📋' },
  { id: 'config', label: 'Configurações', icon: '⚙' },
];

const TAB_TITLES: Record<TabId, string> = {
  dashboard: 'Dashboard',
  'nova-oc': 'Nova Ordem de Compra',
  historico: 'Histórico de OCs',
  fornecedores: 'Fornecedores',
  obras: 'Obras',
  catalogo: 'Catálogo ECR',
  config: 'Configurações',
};

// ── Componente de conflito de concorrência ─────────────────────────────────────

interface ConflictState {
  open: boolean;
  remoteTs: string;
  knownTs: string;
  pendingSave: (() => Promise<void>) | null;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const data = useDataStore((s) => s.data);
  const dirty = useDataStore((s) => s.dirty);
  const dirtySince = useDataStore((s) => s.dirtySince);
  const lastKnownSavedAt = useDataStore((s) => s.lastKnownSavedAt);
  const setData = useDataStore((s) => s.setData);
  const clearDirty = useDataStore((s) => s.clearDirty);

  const activeTab = useUiStore((s) => s.activeTab);
  const setTab = useUiStore((s) => s.setActiveTab);
  const showToast = useUiStore((s) => s.showToast);

  const fileHandle = useFileHandleStore((s) => s.fileHandle);
  const sourceName = useFileHandleStore((s) => s.sourceName);
  const setFileHandle = useFileHandleStore((s) => s.setFileHandle);

  const conflictRef = useRef<ConflictState>({
    open: false, remoteTs: '', knownTs: '', pendingSave: null,
  });
  const [, setConflictTick] = useState(0);
  const forceRender = useCallback(() => setConflictTick((n) => n + 1), []);
  // Hooks transversais
  useAutoSave();
  useDirtyGuard();

  // ── Inicialização ───────────────────────────────────────────────────────────

  useEffect(() => {
    void (async () => {
      // 0. Limpa caches de versões antigas (idempotente)
      purgeLegacyCaches();

      // 1. Tenta cache localStorage
      const cached = loadCache();
      if (cached) {
        setData(cached.data, cached.data.last_saved);
        setFileHandle(null, cached.sourceName);
      }

      // 2. Tenta restaurar handle do IndexedDB
      const handle = await tryRestoreFileHandle();
      if (handle) {
        try {
          const result = await loadFromFileHandle(handle);
          setData(result.data, result.lastSavedAt);
          setFileHandle(result.fileHandle, result.sourceName);
          return;
        } catch {
          /* handle inválido — usa cache ou seed */
        }
      }

      // 3. Se não tem nada, carrega seed público
      if (!cached) {
        try {
          const resp = await fetch(`${import.meta.env.BASE_URL}seed-data.json`);
          const raw = (await resp.json()) as unknown;
          const migrated = runMigrations(raw);
          const seedData = normalizeData(migrated);
          setData(seedData, '');
          setFileHandle(null, 'Base inicial embutida');
        } catch {
          showToast('Falha ao carregar dados iniciais.', 'error');
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!data) return;
    const result = await saveData({
      data,
      fileHandle,
      sourceName,
      lastKnownSavedAt,
    });

    if (result.ok) {
      setData(result.data, result.lastSavedAt);
      if (result.fileHandle) setFileHandle(result.fileHandle, result.sourceName);
      else clearDirty(result.lastSavedAt);
      showToast('Salvo com sucesso.', 'success');
    } else if (result.reason === 'conflict') {
      conflictRef.current = {
        open: true,
        remoteTs: result.remoteTs,
        knownTs: result.knownTs,
        pendingSave: handleSave,
      };
      forceRender();
    } else if (result.reason === 'download') {
      setData(result.data, result.lastSavedAt);
      clearDirty(result.lastSavedAt);
      showToast('JSON baixado. Substitua manualmente o arquivo no OneDrive.', 'warning');
    } else if (result.reason === 'aborted') {
      showToast('Salvamento cancelado.', 'info');
    }
  }, [data, fileHandle, sourceName, lastKnownSavedAt, setData, setFileHandle, clearDirty, showToast, forceRender]);

  const handleConnect = useCallback(async () => {
    try {
      const result = await connectFile();
      if (result) {
        setData(result.data, result.lastSavedAt);
        setFileHandle(result.fileHandle, result.sourceName);
        showToast('Arquivo conectado.', 'success');
      }
    } catch {
      showToast('Não consegui abrir o arquivo.', 'warning');
    }
  }, [setData, setFileHandle, showToast]);

  const handleReload = useCallback(async () => {
    if (!fileHandle) { showToast('Nenhum arquivo conectado.', 'warning'); return; }
    if (dirty && !window.confirm('Há alterações não salvas. Recarregar vai descartá-las. Continuar?')) return;
    try {
      const result = await reloadFromHandle(fileHandle);
      setData(result.data, result.lastSavedAt);
      showToast('Recarregado.', 'success');
    } catch (err) {
      showToast(`Falha: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    }
  }, [fileHandle, dirty, setData, showToast]);

  useKeyboardShortcuts({
    onSave: handleSave,
    onNewOC: () => setTab('nova-oc'),
  });

  // ── Emitente banner ─────────────────────────────────────────────────────────

  const emitentes = data?.config.emitentes ?? [];
  const principal = emitentes[0];
  const showBanner =
    !principal ||
    !principal.razao_social ||
    (principal.tipo === 'PF' ? !principal.cpf : !principal.cnpj);

  // ── Dirty indicator ─────────────────────────────────────────────────────────

  const dirtySinceMin = dirtySince ? Math.round((Date.now() - dirtySince) / 60000) : 0;
  const dirtyTitle = dirtySinceMin > 0
    ? `Não salvo há ${dirtySinceMin} min...`
    : 'Alterações não salvas...';

  // ── Render ──────────────────────────────────────────────────────────────────

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
              <span>{item.icon}</span>
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
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.sfRow}>
            <span
              className={[styles.dirtyDot, dirty ? styles.isDirty : ''].join(' ')}
              title={dirty ? dirtyTitle : 'Sem alterações'}
            />
            <span className={styles.sfLabel}>Arquivo:</span>
            <span className={styles.sfValue} title={sourceName}>{sourceName}</span>
          </div>
          <div className={styles.sfRow}>
            <span className={styles.sfLabel}>Salvo:</span>
            <span className={styles.sfValue}>
              {data?.last_saved
                ? new Date(data.last_saved).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                : '—'}
            </span>
          </div>
          <div className={styles.sfActions}>
            <button className={styles.btnGhostSm} onClick={handleConnect}>📂 Conectar</button>
            <button className={styles.btnGhostSm} onClick={handleReload}>↺ Recarregar</button>
          </div>
          <div className={styles.sfActions}>
            <button className={styles.btnGhostSm} onClick={() => setTab('config')}>⚙ Config</button>
            <button
              className={styles.btnGhostSm}
              style={{ background: dirty ? 'var(--amber)' : undefined, color: dirty ? 'var(--navy-dark)' : undefined, fontWeight: dirty ? 700 : undefined }}
              onClick={handleSave}
            >
              💾 Salvar
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
            {fileHandle && (
              <div className={styles.syncChip}>
                <span className={styles.chipDot} />
                {sourceName}
              </div>
            )}
            <button className="btn-navy" style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }} onClick={handleSave}>
              💾 Salvar
            </button>
          </div>
        </header>

        {/* Content */}
        <main className={styles.mainContent}>
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

          {activeTab === 'dashboard'     && <DashboardPage />}
          {activeTab === 'nova-oc'       && <NovaOcPage />}
          {activeTab === 'historico'     && <HistoricoPage />}
          {activeTab === 'fornecedores'  && <FornecedoresPage />}
          {activeTab === 'obras'         && <ObrasPage />}
          {activeTab === 'catalogo'      && <CatalogoPage />}
          {activeTab === 'config'        && <ConfigPage />}
        </main>
      </div>

      {/* ── Global overlays ────────────────────────────────────────── */}
      <ToastContainer />

      <ConfirmDialog
        open={conflictRef.current.open}
        title="Conflito de edição simultânea"
        message={`O arquivo foi modificado por outra sessão.\n\nSalvar agora vai SOBRESCREVER as alterações remotas. Continuar?`}
        confirmLabel="Sobrescrever"
        cancelLabel="Cancelar"
        tone="danger"
        onConfirm={() => {
          conflictRef.current.open = false;
          void conflictRef.current.pendingSave?.();
        }}
        onCancel={() => {
          conflictRef.current.open = false;
          showToast('Salvamento cancelado. Use Recarregar para puxar a versão remota.', 'warning');
        }}
      />
    </div>
  );
}
