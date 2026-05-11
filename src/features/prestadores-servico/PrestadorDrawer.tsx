/**
 * Drawer de criação/edição de Prestador de Serviço.
 *
 * Layout dual: para prestadores existentes, abre com duas abas
 *   - Cadastro: dados do prestador
 *   - Avaliações: histórico + botão "Nova Avaliação" (carimbo digital PBQP-H)
 *
 * Para prestadores novos, só mostra Cadastro até a primeira gravação —
 * sem ID persistido não dá pra criar avaliação.
 */

import { useEffect, useMemo, useState } from 'react';
import { Drawer } from '../../components/Drawer/Drawer';
import { Field } from '../../components/Field/Field';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { Button } from '../../components/Button/Button';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { uid } from '../../domain/id';
import { nowIso } from '../../domain/format';
import { CATEGORIAS_SERVICO, TIPOS_PRESTADOR } from '../../domain/constants';
import { NovaAvaliacaoDrawer } from './NovaAvaliacaoDrawer';
import type { AvaliacaoPrestador, PrestadorServico } from '../../domain/types';
import styles from './PrestadorDrawer.module.css';

interface Props {
  open: boolean;
  prestador: PrestadorServico | null;
  onClose: () => void;
}

type Tab = 'cadastro' | 'avaliacoes';

function emptyPrestador(): PrestadorServico {
  return {
    id: uid('prest'),
    razao_social: '',
    nome_fantasia: '',
    tipo: 'PJ',
    cnpj_cpf: '',
    categoria_servico: '',
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
    telefones: ['', ''],
    email: '',
    contato_responsavel: '',
    observacoes: '',
    ativo: true,
    criado_em: nowIso(),
    atualizado_em: nowIso(),
  };
}

function formatDateBr(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

interface StatusBadgeProps {
  status: 'CONFORME' | 'NAO_CONFORME' | null;
}

function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'CONFORME') {
    return <span className={[styles.badge, styles.badgeOk].join(' ')}>✓ Conforme</span>;
  }
  if (status === 'NAO_CONFORME') {
    return <span className={[styles.badge, styles.badgeNc].join(' ')}>✗ Não Conforme</span>;
  }
  return <span className={[styles.badge, styles.badgeMuted].join(' ')}>— Não avaliado</span>;
}

export function PrestadorDrawer({ open, prestador, onClose }: Props) {
  const [form, setForm] = useState<PrestadorServico>(() => prestador ?? emptyPrestador());
  const [tab, setTab] = useState<Tab>('cadastro');
  const [avaliacaoOpen, setAvaliacaoOpen] = useState(false);
  const [editingAvaliacao, setEditingAvaliacao] = useState<AvaliacaoPrestador | null>(null);

  const upsertPrestador = useDataStore((s) => s.upsertPrestador);
  const removeAvaliacao = useDataStore((s) => s.removeAvaliacao);
  const data = useDataStore((s) => s.data);
  const showToast = useUiStore((s) => s.showToast);

  // Sincroniza form quando o drawer abre com prestador diferente.
  useEffect(() => {
    if (open) {
      setForm(prestador ?? emptyPrestador());
      setTab('cadastro');
    }
  }, [open, prestador]);

  // Avaliações deste prestador, ordenadas por data desc.
  const avaliacoes = useMemo(() => {
    if (!data || !prestador) return [];
    return data.avaliacoes_prestadores
      .filter((a) => a.prestador_id === prestador.id)
      .sort((a, b) => (b.data_avaliacao > a.data_avaliacao ? 1 : -1));
  }, [data, prestador]);

  function set<K extends keyof PrestadorServico>(key: K, value: PrestadorServico[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setEndereco(key: keyof PrestadorServico['endereco'], value: string) {
    setForm((f) => ({ ...f, endereco: { ...f.endereco, [key]: value } }));
  }

  function handleSave() {
    if (!form.razao_social.trim()) {
      showToast('Razão social é obrigatória.', 'warning');
      return;
    }
    upsertPrestador({ ...form, atualizado_em: nowIso() });
    showToast(prestador ? 'Prestador atualizado.' : 'Prestador cadastrado.', 'success');
    onClose();
  }

  function handleNovaAvaliacao() {
    setEditingAvaliacao(null);
    setAvaliacaoOpen(true);
  }

  function handleEditAvaliacao(a: AvaliacaoPrestador) {
    setEditingAvaliacao(a);
    setAvaliacaoOpen(true);
  }

  function handleDeleteAvaliacao(a: AvaliacaoPrestador) {
    if (!window.confirm(`Excluir avaliação de ${formatDateBr(a.data_avaliacao)}?`)) return;
    removeAvaliacao(a.id);
    showToast('Avaliação excluída.', 'success');
  }

  const isNew = !prestador;
  const obrasMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of data?.obras ?? []) map.set(o.id, o.nome);
    return map;
  }, [data]);

  return (
    <>
      <Drawer
        open={open}
        title={isNew ? 'Novo Prestador de Serviço' : 'Editar Prestador'}
        onClose={onClose}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            {tab === 'cadastro' && (
              <Button variant="primary" size="sm" onClick={handleSave}>
                {isNew ? 'Cadastrar' : 'Salvar'}
              </Button>
            )}
            {tab === 'avaliacoes' && !isNew && (
              <Button variant="primary" size="sm" onClick={handleNovaAvaliacao}>
                + Nova Avaliação
              </Button>
            )}
          </div>
        }
      >
        {/* Tabs internas (só aparece se for edição) */}
        {!isNew && (
          <div className={styles.tabBar}>
            <button
              className={[styles.tabBtn, tab === 'cadastro' ? styles.tabActive : ''].join(' ')}
              onClick={() => setTab('cadastro')}
            >
              📋 Cadastro
            </button>
            <button
              className={[styles.tabBtn, tab === 'avaliacoes' ? styles.tabActive : ''].join(' ')}
              onClick={() => setTab('avaliacoes')}
            >
              ⚖ Avaliações
              {avaliacoes.length > 0 && (
                <span className={styles.tabCount}>{avaliacoes.length}</span>
              )}
            </button>
          </div>
        )}

        {tab === 'cadastro' && (
          <>
            <FieldGroup title="Identificação">
              <Field
                label="Razão Social / Nome"
                required
                span2
                value={form.razao_social}
                onChange={(e) => set('razao_social', e.target.value)}
              />
              <Field
                label="Nome Fantasia"
                value={form.nome_fantasia}
                onChange={(e) => set('nome_fantasia', e.target.value)}
              />
              <Field
                as="select"
                label="Tipo"
                value={form.tipo}
                onChange={(e) => set('tipo', e.target.value as PrestadorServico['tipo'])}
              >
                {TIPOS_PRESTADOR.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Field>
              <Field
                label={form.tipo === 'PF' ? 'CPF' : 'CNPJ'}
                value={form.cnpj_cpf}
                placeholder={form.tipo === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                onChange={(e) => set('cnpj_cpf', e.target.value)}
              />
              <Field
                as="select"
                label="Categoria de Serviço"
                value={form.categoria_servico}
                onChange={(e) => set('categoria_servico', e.target.value)}
              >
                <option value="">Selecione…</option>
                {CATEGORIAS_SERVICO.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Field>
            </FieldGroup>

            <FieldGroup title="Contato">
              <Field
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
              <Field
                label="Contato / Responsável"
                value={form.contato_responsavel}
                onChange={(e) => set('contato_responsavel', e.target.value)}
              />
              <Field
                label="Telefone 1"
                value={form.telefones[0]}
                placeholder="(11) 99999-9999"
                onChange={(e) => set('telefones', [e.target.value, form.telefones[1]])}
              />
              <Field
                label="Telefone 2"
                value={form.telefones[1]}
                onChange={(e) => set('telefones', [form.telefones[0], e.target.value])}
              />
            </FieldGroup>

            <FieldGroup title="Endereço">
              <Field
                label="Logradouro"
                span2
                value={form.endereco.logradouro}
                onChange={(e) => setEndereco('logradouro', e.target.value)}
              />
              <Field
                label="Número"
                value={form.endereco.numero}
                onChange={(e) => setEndereco('numero', e.target.value)}
              />
              <Field
                label="Complemento"
                value={form.endereco.complemento}
                onChange={(e) => setEndereco('complemento', e.target.value)}
              />
              <Field
                label="Bairro"
                value={form.endereco.bairro}
                onChange={(e) => setEndereco('bairro', e.target.value)}
              />
              <Field
                label="Cidade"
                value={form.endereco.cidade}
                onChange={(e) => setEndereco('cidade', e.target.value)}
              />
              <Field
                label="UF"
                value={form.endereco.uf}
                maxLength={2}
                placeholder="SP"
                onChange={(e) => setEndereco('uf', e.target.value.toUpperCase())}
              />
              <Field
                label="CEP"
                value={form.endereco.cep}
                placeholder="00000-000"
                onChange={(e) => setEndereco('cep', e.target.value)}
              />
            </FieldGroup>

            <FieldGroup title="Observações">
              <Field
                as="textarea"
                label="Observações"
                span2
                rows={3}
                value={form.observacoes}
                onChange={(e) => set('observacoes', e.target.value)}
              />
            </FieldGroup>

            <FieldGroup title="Status">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => set('ativo', e.target.checked)}
                />
                Prestador ativo
              </label>
            </FieldGroup>
          </>
        )}

        {tab === 'avaliacoes' && prestador && (
          <div className={styles.avaliacoesPanel}>
            {avaliacoes.length === 0 ? (
              <div className={styles.emptyAval}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>⚖</div>
                <strong>Nenhuma avaliação ainda</strong>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  Clique em "+ Nova Avaliação" para registrar a primeira avaliação deste prestador.
                </p>
              </div>
            ) : (
              <div className={styles.avalList}>
                {avaliacoes.map((a) => (
                  <div key={a.id} className={styles.avalCard}>
                    <div className={styles.avalHeader}>
                      <div>
                        <strong>{formatDateBr(a.data_avaliacao)}</strong>
                        <div className={styles.avalObra}>
                          🏗 {obrasMap.get(a.obra_id) ?? '— obra removida'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="ghost" size="sm" onClick={() => handleEditAvaliacao(a)}>
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteAvaliacao(a)}>
                          Excluir
                        </Button>
                      </div>
                    </div>
                    <div className={styles.avalCriterios}>
                      <div className={styles.avalCrit}>
                        <span className={styles.avalCritLabel}>Atendeu prazo:</span>
                        <StatusBadge status={a.atendeu_prazo} />
                      </div>
                      <div className={styles.avalCrit}>
                        <span className={styles.avalCritLabel}>Usou EPI:</span>
                        <StatusBadge status={a.usou_epi} />
                      </div>
                      <div className={styles.avalCrit}>
                        <span className={styles.avalCritLabel}>Conforme PES:</span>
                        <StatusBadge status={a.conforme_pes} />
                      </div>
                    </div>
                    {a.responsavel && (
                      <div className={styles.avalFooter}>
                        Responsável: <strong>{a.responsavel}</strong>
                      </div>
                    )}
                    {a.observacoes && (
                      <div className={styles.avalObs}>{a.observacoes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Drawer aninhado para criar/editar avaliação */}
      {prestador && (
        <NovaAvaliacaoDrawer
          open={avaliacaoOpen}
          prestador={prestador}
          avaliacao={editingAvaliacao}
          onClose={() => setAvaliacaoOpen(false)}
        />
      )}
    </>
  );
}
