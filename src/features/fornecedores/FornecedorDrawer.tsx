/**
 * Drawer de criação/edição de Fornecedor.
 * Portado de renderFornecedores / openFornecedorDrawer (CentralCompras-PBQPH.html).
 */

import { useState, useEffect } from 'react';
import { Drawer } from '../../components/Drawer/Drawer';
import { Field } from '../../components/Field/Field';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { Button } from '../../components/Button/Button';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { uid } from '../../domain/id';
import { nowIso } from '../../domain/format';
import type { Fornecedor } from '../../domain/types';

interface Props {
  open: boolean;
  fornecedor: Fornecedor | null;   // null = novo
  onClose: () => void;
}

function emptyFornecedor(): Fornecedor {
  return {
    id: uid('forn'),
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    ie: '',
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
    telefones: ['', ''],
    email: '',
    contato_responsavel: '',
    ecrs_atende: [],
    observacoes: '',
    ativo: true,
    criado_em: nowIso(),
    atualizado_em: nowIso(),
  };
}

export function FornecedorDrawer({ open, fornecedor, onClose }: Props) {
  const [form, setForm] = useState<Fornecedor>(() => fornecedor ?? emptyFornecedor());
  const upsertFornecedor = useDataStore((s) => s.upsertFornecedor);
  const ecrs = useDataStore((s) => s.data?.ecrs ?? []);
  const showToast = useUiStore((s) => s.showToast);

  // Sincroniza form quando o drawer abre com fornecedor diferente
  useEffect(() => {
    if (open) setForm(fornecedor ?? emptyFornecedor());
  }, [open, fornecedor]);

  function set<K extends keyof Fornecedor>(key: K, value: Fornecedor[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setEndereco(key: keyof Fornecedor['endereco'], value: string) {
    setForm((f) => ({ ...f, endereco: { ...f.endereco, [key]: value } }));
  }

  function toggleEcr(ecr_id: number) {
    setForm((f) => ({
      ...f,
      ecrs_atende: f.ecrs_atende.includes(ecr_id)
        ? f.ecrs_atende.filter((id) => id !== ecr_id)
        : [...f.ecrs_atende, ecr_id],
    }));
  }

  function handleSave() {
    if (!form.razao_social.trim()) {
      showToast('Razão social é obrigatória.', 'warning');
      return;
    }
    upsertFornecedor({
      ...form,
      atualizado_em: nowIso(),
    });
    showToast(fornecedor ? 'Fornecedor atualizado.' : 'Fornecedor criado.', 'success');
    onClose();
  }

  const isNew = !fornecedor;

  return (
    <Drawer
      open={open}
      title={isNew ? 'Novo Fornecedor' : 'Editar Fornecedor'}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {isNew ? 'Criar' : 'Salvar'}
          </Button>
        </div>
      }
    >
      <FieldGroup title="Identificação">
        <Field
          label="Razão Social"
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
          label="CNPJ"
          value={form.cnpj}
          placeholder="00.000.000/0000-00"
          onChange={(e) => set('cnpj', e.target.value)}
        />
        <Field
          label="I.E."
          value={form.ie}
          onChange={(e) => set('ie', e.target.value)}
        />
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

      {ecrs.length > 0 && (
        <FieldGroup title="ECRs que Atende">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, gridColumn: '1 / -1' }}>
            {ecrs.map((ecr) => (
              <label
                key={ecr.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: form.ecrs_atende.includes(ecr.id)
                    ? 'rgba(29,79,124,0.12)'
                    : 'var(--surface-alt)',
                  border: `1px solid ${form.ecrs_atende.includes(ecr.id) ? 'var(--navy)' : 'var(--border)'}`,
                  color: form.ecrs_atende.includes(ecr.id) ? 'var(--navy)' : 'var(--text)',
                  fontWeight: form.ecrs_atende.includes(ecr.id) ? 600 : 400,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.ecrs_atende.includes(ecr.id)}
                  onChange={() => toggleEcr(ecr.id)}
                  style={{ margin: 0 }}
                />
                {ecr.codigo} — {ecr.nome}
              </label>
            ))}
          </div>
        </FieldGroup>
      )}

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
          Fornecedor ativo
        </label>
      </FieldGroup>
    </Drawer>
  );
}
