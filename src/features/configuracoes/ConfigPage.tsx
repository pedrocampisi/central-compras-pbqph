/**
 * Aba Configurações — emitentes, textos, chave de API, backup.
 * Portado de renderConfig / renderEmitentesListConfig / saveConfig (CentralCompras-PBQPH.html).
 */

import { useState } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { EmitenteDrawer } from './EmitenteDrawer';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { Field } from '../../components/Field/Field';
import { Button } from '../../components/Button/Button';
import type { Emitente } from '../../domain/types';
import styles from './ConfigPage.module.css';

export function ConfigPage() {
  const data = useDataStore((s) => s.data);
  const updateConfig = useDataStore((s) => s.updateConfig);
  const showToast = useUiStore((s) => s.showToast);

  const [emitenteDrawerOpen, setEmitenteDrawerOpen] = useState(false);
  const [editingEmitente, setEditingEmitente] = useState<Emitente | null>(null);
  const [newCondicao, setNewCondicao] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  if (!data) return null;

  const cfg = data.config;

  // ── Emitentes ───────────────────────────────────────────────────────────────

  function openNewEmitente() {
    setEditingEmitente(null);
    setEmitenteDrawerOpen(true);
  }

  function openEditEmitente(e: Emitente) {
    setEditingEmitente(e);
    setEmitenteDrawerOpen(true);
  }

  function handleSaveEmitente(emitente: Emitente) {
    const existing = cfg.emitentes.findIndex((e) => e.id === emitente.id);
    const emitentes =
      existing >= 0
        ? cfg.emitentes.map((e) => (e.id === emitente.id ? emitente : e))
        : [...cfg.emitentes, emitente];
    updateConfig({ emitentes });
  }

  function handleDeleteEmitente(id: string) {
    if (cfg.emitentes.length <= 1) {
      showToast('Deve haver ao menos um emitente.', 'warning');
      return;
    }
    if (!window.confirm('Excluir este emitente?')) return;
    updateConfig({ emitentes: cfg.emitentes.filter((e) => e.id !== id) });
    showToast('Emitente excluído.', 'success');
  }

  // ── Condições de pagamento ──────────────────────────────────────────────────

  function addCondicao() {
    const trimmed = newCondicao.trim();
    if (!trimmed) return;
    if (cfg.condicoes_pagamento.includes(trimmed)) {
      showToast('Essa condição já existe.', 'warning');
      return;
    }
    updateConfig({ condicoes_pagamento: [...cfg.condicoes_pagamento, trimmed] });
    setNewCondicao('');
  }

  function removeCondicao(v: string) {
    updateConfig({ condicoes_pagamento: cfg.condicoes_pagamento.filter((c) => c !== v) });
  }

  // ── Pasta de backups ────────────────────────────────────────────────────────

  async function handlePickBackups() {
    if (!('showDirectoryPicker' in window)) {
      showToast('Seleção de pasta não suportada neste navegador.', 'warning');
      return;
    }
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      updateConfig({ pasta_backups: dirHandle.name });
      showToast(`Pasta de backups: "${dirHandle.name}"`, 'success');
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        showToast('Não foi possível selecionar a pasta.', 'warning');
      }
    }
  }

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>Configurações</h2>
          <p className="section-sub">Emitentes, textos legais, integração com IA e backups.</p>
        </div>
      </div>

      {/* ── Emitentes ─────────────────────────────────────────────────────── */}
      <FieldGroup title="Emitentes">
        <div className={styles.emitentesList}>
          {cfg.emitentes.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Nenhum emitente cadastrado. Adicione pelo menos um para emitir OCs.
            </p>
          )}
          {cfg.emitentes.map((e, idx) => (
            <div key={e.id} className={styles.emitenteCard}>
              <div className={styles.emitenteInfo}>
                <div className={styles.emitenteTop}>
                  <strong>{e.razao_social}</strong>
                  {idx === 0 && (
                    <span className={styles.principalBadge}>Principal</span>
                  )}
                </div>
                <div className={styles.emitenteSub}>
                  {e.tipo === 'PJ' ? `CNPJ: ${e.cnpj || '—'}` : `CPF: ${e.cpf || '—'}`}
                  {e.email_envio_nf && <> · {e.email_envio_nf}</>}
                </div>
              </div>
              <div className={styles.emitenteActions}>
                <Button variant="ghost" size="sm" onClick={() => openEditEmitente(e)}>Editar</Button>
                {idx > 0 && (
                  <Button variant="danger" size="sm" onClick={() => handleDeleteEmitente(e.id)}>Excluir</Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={openNewEmitente} style={{ marginTop: 4 }}>
          + Adicionar Emitente
        </Button>
      </FieldGroup>

      {/* ── Integração IA ─────────────────────────────────────────────────── */}
      <FieldGroup title="Integração com IA (OpenRouter)">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', gridColumn: '1 / -1' }}>
          <input
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: 7,
              border: '1px solid var(--border)',
              fontSize: 13,
              fontFamily: 'monospace',
              background: 'var(--surface)',
              color: 'var(--text)',
              outline: 'none',
            }}
            type={showApiKey ? 'text' : 'password'}
            placeholder="sk-or-…"
            value={cfg.openrouter_api_key}
            onChange={(e) => updateConfig({ openrouter_api_key: e.target.value })}
          />
          <Button variant="ghost" size="sm" onClick={() => setShowApiKey((v) => !v)}>
            {showApiKey ? '🙈' : '👁'}
          </Button>
        </div>
        <p style={{ gridColumn: '1 / -1', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          Chave de API do{' '}
          <a href="https://openrouter.ai" target="_blank" rel="noreferrer" style={{ color: 'var(--navy)' }}>
            OpenRouter
          </a>{' '}
          para importação de pedidos via IA. Armazenada apenas no JSON local.
        </p>
      </FieldGroup>

      {/* ── Condições de pagamento ────────────────────────────────────────── */}
      <FieldGroup title="Condições de Pagamento">
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {cfg.condicoes_pagamento.map((c) => (
            <div key={c} className={styles.condicaoChip}>
              <span>{c}</span>
              <button
                className={styles.chipRemove}
                onClick={() => removeCondicao(c)}
                aria-label={`Remover ${c}`}
              >
                ×
              </button>
            </div>
          ))}
          {cfg.condicoes_pagamento.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nenhuma condição cadastrada.</span>
          )}
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
          <input
            style={{
              flex: 1,
              padding: '6px 10px',
              border: '1px solid var(--border)',
              borderRadius: 7,
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              background: 'var(--surface)',
              color: 'var(--text)',
            }}
            placeholder="Ex: 30/60/90 dias"
            value={newCondicao}
            onChange={(e) => setNewCondicao(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCondicao(); } }}
          />
          <Button variant="outline" size="sm" onClick={addCondicao}>Adicionar</Button>
        </div>
      </FieldGroup>

      {/* ── Textos legais ─────────────────────────────────────────────────── */}
      <FieldGroup title="Textos Legais">
        <Field
          as="textarea"
          label="Condições de Contratação"
          span2
          rows={4}
          value={cfg.texto_condicoes_contratacao}
          onChange={(e) => updateConfig({ texto_condicoes_contratacao: e.target.value })}
        />
        <Field
          as="textarea"
          label="Instrução para Envio de NF"
          span2
          rows={3}
          value={cfg.texto_envio_nf}
          onChange={(e) => updateConfig({ texto_envio_nf: e.target.value })}
        />
        <Field
          as="textarea"
          label="Requisito de Qualidade"
          span2
          rows={3}
          value={cfg.texto_qualidade}
          onChange={(e) => updateConfig({ texto_qualidade: e.target.value })}
        />
      </FieldGroup>

      {/* ── Backups ───────────────────────────────────────────────────────── */}
      <FieldGroup title="Pasta de Backups Automáticos">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: '1 / -1' }}>
          <div
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: 7,
              border: '1px solid var(--border)',
              background: 'var(--surface-alt)',
              fontSize: 12,
              fontFamily: 'monospace',
              color: cfg.pasta_backups ? 'var(--text)' : 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {cfg.pasta_backups || 'Nenhuma pasta selecionada — backups desativados'}
          </div>
          <Button variant="outline" size="sm" onClick={handlePickBackups}>
            📂 Selecionar
          </Button>
        </div>
        <p style={{ gridColumn: '1 / -1', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          A cada salvamento, um snapshot timestampado é criado nesta pasta (máximo 10 backups rotativos).
        </p>
      </FieldGroup>

      {/* Drawer emitentes */}
      <EmitenteDrawer
        open={emitenteDrawerOpen}
        emitente={editingEmitente}
        onClose={() => setEmitenteDrawerOpen(false)}
        onSave={handleSaveEmitente}
      />
    </div>
  );
}
