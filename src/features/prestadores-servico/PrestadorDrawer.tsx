/**
 * Drawer de consulta de Prestador de Serviço — SOMENTE LEITURA nesta versão.
 *
 * A camada de dados ainda não grava prestadores nem avaliações no banco
 * (políticas core.pode_editar_cadastro = admin|engenharia, e a gravação será
 * ligada numa próxima etapa). Até lá, a tela não pode fingir que salva:
 * campos desabilitados, sem botões de criar/editar/excluir.
 *
 * Layout dual preservado: aba Cadastro (dados) e aba Avaliações (histórico
 * do carimbo digital PBQP-H, agora vindo do banco).
 */

import { useMemo, useState } from 'react';
import { Drawer } from '../../components/Drawer/Drawer';
import { Field } from '../../components/Field/Field';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { EnderecoFields } from '../../components/EnderecoFields/EnderecoFields';
import { AvisoSomenteLeitura } from '../../components/AvisoSomenteLeitura/AvisoSomenteLeitura';
import { Button } from '../../components/Button/Button';
import { useDataStore } from '../../stores/useDataStore';
import { uid } from '../../domain/id';
import { nowIso } from '../../domain/format';
import { CATEGORIAS_SERVICO, TIPOS_PRESTADOR } from '../../domain/constants';
import type { PrestadorServico } from '../../domain/types';
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
  // Montado só quando aberto; o form é apenas exibição (campos desabilitados).
  const [form] = useState<PrestadorServico>(() => prestador ?? emptyPrestador());
  const [tab, setTab] = useState<Tab>('cadastro');

  const data = useDataStore((s) => s.data);

  // Avaliações deste prestador, ordenadas por data desc.
  const avaliacoes = useMemo(() => {
    if (!data || !prestador) return [];
    return data.avaliacoes_prestadores
      .filter((a) => a.prestador_id === prestador.id)
      .sort((a, b) => (b.data_avaliacao > a.data_avaliacao ? 1 : -1));
  }, [data, prestador]);

  const obrasMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of data?.obras ?? []) map.set(o.id, o.nome);
    return map;
  }, [data]);

  return (
    <Drawer
      open={open}
      title="Prestador — somente leitura"
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" onClick={onClose}>Fechar</Button>
          {tab === 'cadastro' && (
            <Button
              variant="primary"
              size="sm"
              disabled
              title="A camada de dados ainda não grava prestadores — edição virá numa próxima etapa"
            >
              Salvar
            </Button>
          )}
        </div>
      }
    >
      {/* Tabs internas */}
      <div className={styles.tabBar}>
        <button
          className={[styles.tabBtn, tab === 'cadastro' ? styles.tabActive : ''].join(' ')}
          onClick={() => setTab('cadastro')}
        >
          Cadastro
        </button>
        <button
          className={[styles.tabBtn, tab === 'avaliacoes' ? styles.tabActive : ''].join(' ')}
          onClick={() => setTab('avaliacoes')}
        >
          Avaliações
          {avaliacoes.length > 0 && (
            <span className={styles.tabCount}>{avaliacoes.length}</span>
          )}
        </button>
      </div>

      {tab === 'cadastro' && (
        <>
          <AvisoSomenteLeitura oQue="o cadastro de prestadores" />

          <fieldset disabled className="fieldset-reset">
            <FieldGroup title="Identificação">
              <Field label="Razão Social / Nome" span2 value={form.razao_social} readOnly />
              <Field label="Nome Fantasia" value={form.nome_fantasia} readOnly />
              <Field as="select" label="Tipo" value={form.tipo} onChange={() => undefined}>
                {TIPOS_PRESTADOR.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Field>
              <Field label={form.tipo === 'PF' ? 'CPF' : 'CNPJ'} value={form.cnpj_cpf} readOnly />
              <Field
                as="select"
                label="Categoria de Serviço"
                value={form.categoria_servico}
                onChange={() => undefined}
              >
                <option value="">—</option>
                {CATEGORIAS_SERVICO.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                {form.categoria_servico &&
                  !(CATEGORIAS_SERVICO as readonly string[]).includes(form.categoria_servico) && (
                    <option value={form.categoria_servico}>{form.categoria_servico}</option>
                  )}
              </Field>
            </FieldGroup>

            <FieldGroup title="Contato">
              <Field label="E-mail" type="email" value={form.email} readOnly />
              <Field label="Contato / Responsável" value={form.contato_responsavel} readOnly />
              <Field label="Telefone 1" value={form.telefones[0]} readOnly />
              <Field label="Telefone 2" value={form.telefones[1]} readOnly />
            </FieldGroup>

            <FieldGroup title="Endereço">
              <EnderecoFields endereco={form.endereco} onChange={() => undefined} />
            </FieldGroup>

            <FieldGroup title="Observações">
              <Field as="textarea" label="Observações" span2 rows={3} value={form.observacoes} readOnly />
            </FieldGroup>

            <FieldGroup title="Status">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={form.ativo} readOnly />
                Prestador ativo
              </label>
            </FieldGroup>
          </fieldset>
        </>
      )}

      {tab === 'avaliacoes' && prestador && (
        <div className={styles.avaliacoesPanel}>
          <AvisoSomenteLeitura oQue="o registro de avaliações" />
          {avaliacoes.length === 0 ? (
            <div className={styles.emptyAval}>
              <strong>Nenhuma avaliação registrada</strong>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                As avaliações deste prestador aparecerão aqui.
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
                        {obrasMap.get(a.obra_id) ?? '— obra removida'}
                      </div>
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
  );
}
