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
import { useUiStore } from '../../stores/useUiStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { salvarFornecedor } from '../../services/supabase/dados';
import { recarregarDados } from '../../services/supabase/sync';
import { podeEditar } from '../../services/supabase/auth';
import { uid } from '../../domain/id';
import { nowIso } from '../../domain/format';
import type { Fornecedor } from '../../domain/types';
import { ecrsDaGaveta, seloDaFilial } from '../../domain/qualificacao';
import { useQualificacoesDoDia } from '../../stores/useQualificacaoStore';
import { SeloDaQualificacao } from './SeloDaQualificacao';
import { FichaDaEmpresa } from './FichaDaEmpresa';

interface Props {
  open: boolean;
  fornecedor: Fornecedor | null;   // null = novo
  onClose: () => void;
  /** O cadastro novo gravou: o id do banco (a tela Qualificação volta para qualificar, CTO-D661 §4.7). */
  aoCriar?: (id: string) => void;
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

export function FornecedorDrawer({ open, fornecedor, onClose, aoCriar }: Props) {
  // O drawer é montado apenas quando aberto (render condicional na página),
  // então o estado inicial do form já reflete o fornecedor correto.
  const [form, setForm] = useState<Fornecedor>(() => fornecedor ?? emptyFornecedor());
  const [salvando, setSalvando] = useState(false);
  const perfil = useAuthStore((s) => s.perfil);
  const showToast = useUiStore((s) => s.showToast);
  const editaOk = podeEditar(perfil?.papel);
  const qualificacoes = useQualificacoesDoDia();
  const [fichaAberta, setFichaAberta] = useState(false);

  function set<K extends keyof Fornecedor>(key: K, value: Fornecedor[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setEndereco(key: keyof Fornecedor['endereco'], value: string) {
    setForm((f) => ({ ...f, endereco: { ...f.endereco, [key]: value } }));
  }

  async function handleSave() {
    if (!form.razao_social.trim()) {
      showToast('Razão social é obrigatória.', 'warning');
      return;
    }
    setSalvando(true);
    try {
      // Grava direto no banco; a lista é recarregada de lá em seguida.
      const id = await salvarFornecedor({ ...form, atualizado_em: nowIso() });
      await recarregarDados();
      showToast(fornecedor ? 'Fornecedor atualizado.' : 'Fornecedor criado.', 'success');
      onClose();
      if (!fornecedor) aoCriar?.(id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Falha ao gravar fornecedor.', 'error');
    } finally {
      setSalvando(false);
    }
  }

  const isNew = !fornecedor;
  const seloDeMaterial = fornecedor && qualificacoes ? seloDaFilial(fornecedor, qualificacoes.linhas) : null;

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

      {/*
        A qualificação é da empresa, e mora na ficha dela (CTO-D613 §2). As
        ECRs que a empresa atende também: são as da qualificação de material
        que vale, as mesmas que a trava da emissão lê. Até 28/09 a gaveta
        editava a `compras.fornecedor_ecrs`, por filial, que ninguém mais lia;
        eram duas respostas, e o comprador marcava a ECR que a trava recusava
        (CTO-D614 §2.1). Aqui só se lê.
      */}
      {!isNew && fornecedor && (
        <FieldGroup title="Qualificação">
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <SeloDaQualificacao selo={seloDeMaterial} rotulo="Material" />
            <Button variant="outline" size="sm" onClick={() => setFichaAberta(true)}>
              Abrir a ficha da empresa
            </Button>
          </div>
          <p
            data-ecrs-da-qualificacao
            style={{ gridColumn: '1 / -1', margin: 0, fontSize: 13, color: 'var(--texto-suave)' }}
          >
            {ecrsDaGaveta(seloDeMaterial)}
          </p>
        </FieldGroup>
      )}
      {fichaAberta && fornecedor && <FichaDaEmpresa filial={fornecedor} aoFechar={() => setFichaAberta(false)} />}

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
