/**
 * Drawer de criação/edição de Fornecedor.
 * Portado de renderFornecedores / openFornecedorDrawer (CentralCompras-PBQPH.html).
 */

import { useState } from 'react';
import { Drawer } from '../../components/Drawer/Drawer';
import { Field } from '../../components/Field/Field';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { EnderecoFields } from '../../components/EnderecoFields/EnderecoFields';
import { Button } from '../../components/Button/Button';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { salvarFornecedor } from '../../services/supabase/dados';
import { recarregarDados } from '../../services/supabase/sync';
import { podeEditar } from '../../services/supabase/auth';
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
  // O drawer é montado apenas quando aberto (render condicional na página),
  // então o estado inicial do form já reflete o fornecedor correto.
  const [form, setForm] = useState<Fornecedor>(() => fornecedor ?? emptyFornecedor());
  const [salvando, setSalvando] = useState(false);
  const ecrs = useDataStore((s) => s.data?.ecrs ?? []);
  const perfil = useAuthStore((s) => s.perfil);
  const showToast = useUiStore((s) => s.showToast);
  const editaOk = podeEditar(perfil?.papel);

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

  async function handleSave() {
    if (!form.razao_social.trim()) {
      showToast('Razão social é obrigatória.', 'warning');
      return;
    }
    setSalvando(true);
    try {
      // Grava direto no banco; a lista é recarregada de lá em seguida.
      await salvarFornecedor({ ...form, atualizado_em: nowIso() });
      await recarregarDados();
      showToast(fornecedor ? 'Fornecedor atualizado.' : 'Fornecedor criado.', 'success');
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Falha ao gravar fornecedor.', 'error');
    } finally {
      setSalvando(false);
    }
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => void handleSave()}
            loading={salvando}
            disabled={!editaOk}
            title={editaOk ? undefined : 'Seu acesso não permite editar fornecedores'}
          >
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
        <EnderecoFields endereco={form.endereco} onChange={setEndereco} />
      </FieldGroup>

      {/*
        Voltou a ser editável em 19/08/2026: a tabela `compras.fornecedor_ecrs`
        passou a existir, e a camada grava a diferença. Entre 12 e 19/08 este
        bloco ficou somente-leitura de propósito — a tela dizia "salvo" e a
        marcação sumia no reload, e mentir para quem usa é pior que não deixar
        editar.
      */}
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
                  cursor: editaOk ? 'pointer' : 'not-allowed',
                  padding: '4px 8px',
                  borderRadius: 'var(--raio-pill)',
                  background: form.ecrs_atende.includes(ecr.id)
                    ? 'var(--marca-fraca)'
                    : 'var(--painel-2)',
                  border: `1px solid ${form.ecrs_atende.includes(ecr.id) ? 'var(--marca)' : 'var(--borda)'}`,
                  color: form.ecrs_atende.includes(ecr.id) ? 'var(--marca)' : 'var(--texto-suave)',
                  fontWeight: form.ecrs_atende.includes(ecr.id) ? 600 : 400,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.ecrs_atende.includes(ecr.id)}
                  onChange={() => toggleEcr(ecr.id)}
                  disabled={!editaOk}
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
