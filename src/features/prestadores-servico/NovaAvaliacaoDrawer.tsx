/**
 * Drawer da avaliação digital de prestador de serviço.
 * Réplica digital do carimbo PBQP-H "CRITÉRIOS DE AVALIAÇÃO DE FORNECEDORES DE SERVIÇO":
 *   1. Atendeu o prazo estipulado
 *   2. Usou equipamentos de segurança do trabalho (EPI)
 *   3. Está executando conforme o PES (Procedimento de Execução do Serviço)
 *
 * Cada critério: CONFORME / NÃO CONFORME. Mais campos: data, obra, responsável, observações.
 */

import { useEffect, useState } from 'react';
import { Drawer } from '../../components/Drawer/Drawer';
import { Field } from '../../components/Field/Field';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { Button } from '../../components/Button/Button';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { uid } from '../../domain/id';
import { nowIso, todayIso } from '../../domain/format';
import type {
  AvaliacaoPrestador,
  PrestadorServico,
} from '../../domain/types';
import type { StatusCriterio } from '../../domain/constants';
import styles from './PrestadorDrawer.module.css';

interface Props {
  open: boolean;
  prestador: PrestadorServico;
  avaliacao: AvaliacaoPrestador | null;  // null = nova
  onClose: () => void;
}

function emptyAvaliacao(prestador_id: string): AvaliacaoPrestador {
  return {
    id: uid('aval'),
    prestador_id,
    obra_id: '',
    data_avaliacao: todayIso(),
    responsavel: '',
    atendeu_prazo: null,
    usou_epi: null,
    conforme_pes: null,
    observacoes: '',
    criado_em: nowIso(),
    atualizado_em: nowIso(),
  };
}

interface CriterioPickerProps {
  label: string;
  hint: string;
  value: StatusCriterio;
  onChange: (v: StatusCriterio) => void;
}

function CriterioPicker({ label, hint, value, onChange }: CriterioPickerProps) {
  return (
    <div className={styles.criterioRow}>
      <div className={styles.criterioLabel}>
        <strong>{label}</strong>
        <span className={styles.criterioHint}>{hint}</span>
      </div>
      <div className={styles.criterioButtons}>
        <button
          type="button"
          className={[
            styles.critBtn,
            styles.critOk,
            value === 'CONFORME' ? styles.critActiveOk : '',
          ].join(' ')}
          onClick={() => onChange(value === 'CONFORME' ? null : 'CONFORME')}
        >
          ✓ Conforme
        </button>
        <button
          type="button"
          className={[
            styles.critBtn,
            styles.critNc,
            value === 'NAO_CONFORME' ? styles.critActiveNc : '',
          ].join(' ')}
          onClick={() => onChange(value === 'NAO_CONFORME' ? null : 'NAO_CONFORME')}
        >
          ✗ Não Conforme
        </button>
      </div>
    </div>
  );
}

export function NovaAvaliacaoDrawer({ open, prestador, avaliacao, onClose }: Props) {
  const [form, setForm] = useState<AvaliacaoPrestador>(() =>
    avaliacao ?? emptyAvaliacao(prestador.id),
  );

  const upsertAvaliacao = useDataStore((s) => s.upsertAvaliacao);
  const obras = useDataStore((s) => s.data?.obras ?? []);
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    if (open) {
      setForm(avaliacao ?? emptyAvaliacao(prestador.id));
    }
  }, [open, avaliacao, prestador.id]);

  function set<K extends keyof AvaliacaoPrestador>(key: K, value: AvaliacaoPrestador[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.obra_id) {
      showToast('Selecione a obra avaliada.', 'warning');
      return;
    }
    if (!form.data_avaliacao) {
      showToast('Informe a data da avaliação.', 'warning');
      return;
    }
    upsertAvaliacao({ ...form, atualizado_em: nowIso() });
    showToast(avaliacao ? 'Avaliação atualizada.' : 'Avaliação registrada.', 'success');
    onClose();
  }

  const isNew = !avaliacao;
  const obrasAtivas = obras.filter((o) => o.ativa);

  return (
    <Drawer
      open={open}
      title={isNew ? 'Nova Avaliação de Prestador' : 'Editar Avaliação'}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {isNew ? 'Registrar Avaliação' : 'Salvar'}
          </Button>
        </div>
      }
    >
      {/* Cabeçalho: identifica quem está sendo avaliado */}
      <div className={styles.avalIdent}>
        <div className={styles.avalIdentLabel}>Prestador avaliado:</div>
        <div className={styles.avalIdentName}>{prestador.razao_social}</div>
        {prestador.categoria_servico && (
          <div className={styles.avalIdentCat}>{prestador.categoria_servico}</div>
        )}
      </div>

      <FieldGroup title="Contexto">
        <Field
          as="select"
          label="Obra"
          required
          value={form.obra_id}
          onChange={(e) => set('obra_id', e.target.value)}
        >
          <option value="">Selecione…</option>
          {obrasAtivas.map((o) => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </Field>

        <Field
          label="Data da Avaliação"
          type="date"
          required
          value={form.data_avaliacao}
          onChange={(e) => set('data_avaliacao', e.target.value)}
        />

        <Field
          label="Responsável pela Avaliação"
          span2
          value={form.responsavel}
          placeholder="Nome de quem está avaliando"
          onChange={(e) => set('responsavel', e.target.value)}
        />
      </FieldGroup>

      <FieldGroup title="Critérios PBQP-H">
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <CriterioPicker
            label="1) Atendeu o prazo estipulado?"
            hint="Entrega/execução dentro do cronograma acordado"
            value={form.atendeu_prazo}
            onChange={(v) => set('atendeu_prazo', v)}
          />
          <CriterioPicker
            label="2) Fez uso dos equipamentos de segurança do trabalho?"
            hint="EPI completo durante toda a execução"
            value={form.usou_epi}
            onChange={(v) => set('usou_epi', v)}
          />
          <CriterioPicker
            label="3) Está executando o serviço conforme o PES?"
            hint="Procedimento de Execução do Serviço — qualidade técnica"
            value={form.conforme_pes}
            onChange={(v) => set('conforme_pes', v)}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Observações">
        <Field
          as="textarea"
          label="Observações da avaliação"
          span2
          rows={3}
          placeholder="Detalhes adicionais, justificativas para não-conformidades, ações corretivas…"
          value={form.observacoes}
          onChange={(e) => set('observacoes', e.target.value)}
        />
      </FieldGroup>
    </Drawer>
  );
}
