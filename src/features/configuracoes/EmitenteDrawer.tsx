/**
 * Drawer de criação/edição de Emitente (empresa/pessoa que emite a OC).
 * Portado de openEmitentDrawer (CentralCompras-PBQPH.html).
 */

import { useState } from 'react';
import { Drawer } from '../../components/Drawer/Drawer';
import { Field } from '../../components/Field/Field';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { EnderecoFields } from '../../components/EnderecoFields/EnderecoFields';
import { Button } from '../../components/Button/Button';
import { useUiStore } from '../../stores/useUiStore';
import { uid } from '../../domain/id';
import type { Emitente } from '../../domain/types';

interface Props {
  open: boolean;
  emitente: Emitente | null;
  onClose: () => void;
  onSave: (e: Emitente) => void;
}

function emptyEmitente(): Emitente {
  return {
    id: uid('emit'),
    tipo: 'PJ',
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    cpf: '',
    ie: '',
    email_envio_nf: '',
    telefones: ['', ''],
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
  };
}

export function EmitenteDrawer({ open, emitente, onClose, onSave }: Props) {
  // O drawer é montado apenas quando aberto (render condicional na página),
  // então o estado inicial do form já reflete o emitente correto.
  const [form, setForm] = useState<Emitente>(() => emitente ?? emptyEmitente());
  const showToast = useUiStore((s) => s.showToast);

  function set<K extends keyof Emitente>(key: K, value: Emitente[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setEndereco(key: keyof Emitente['endereco'], value: string) {
    setForm((f) => ({ ...f, endereco: { ...f.endereco, [key]: value } }));
  }

  function handleSave() {
    if (!form.razao_social.trim()) {
      showToast('Razão Social é obrigatória.', 'warning');
      return;
    }
    if (form.tipo === 'PJ' && !form.cnpj?.trim()) {
      showToast('CNPJ é obrigatório para Pessoa Jurídica.', 'warning');
      return;
    }
    if (form.tipo === 'PF' && !form.cpf?.trim()) {
      showToast('CPF é obrigatório para Pessoa Física.', 'warning');
      return;
    }
    onSave(form);
    showToast(emitente ? 'Emitente atualizado.' : 'Emitente criado.', 'success');
    onClose();
  }

  const isNew = !emitente;

  return (
    <Drawer
      open={open}
      title={isNew ? 'Novo Emitente' : 'Editar Emitente'}
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
      <FieldGroup title="Tipo de Pessoa">
        <div style={{ display: 'flex', gap: 16, gridColumn: '1 / -1' }}>
          {(['PJ', 'PF'] as const).map((tipo) => (
            <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="radio"
                name="tipo_emitente"
                value={tipo}
                checked={form.tipo === tipo}
                onChange={() => set('tipo', tipo)}
              />
              {tipo === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
            </label>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup title="Identificação">
        <Field
          label="Razão Social / Nome Completo"
          required
          span2
          value={form.razao_social}
          onChange={(e) => set('razao_social', e.target.value)}
        />
        {form.tipo === 'PJ' && (
          <Field
            label="Nome Fantasia"
            span2
            value={form.nome_fantasia ?? ''}
            onChange={(e) => set('nome_fantasia', e.target.value)}
          />
        )}
        {form.tipo === 'PJ' ? (
          <>
            <Field
              label="CNPJ"
              required
              value={form.cnpj ?? ''}
              placeholder="00.000.000/0000-00"
              onChange={(e) => set('cnpj', e.target.value)}
            />
            <Field
              label="Inscrição Estadual"
              value={form.ie ?? ''}
              onChange={(e) => set('ie', e.target.value)}
            />
          </>
        ) : (
          <Field
            label="CPF"
            required
            value={form.cpf ?? ''}
            placeholder="000.000.000-00"
            onChange={(e) => set('cpf', e.target.value)}
          />
        )}
      </FieldGroup>

      <FieldGroup title="Contato">
        <Field
          label="E-mail para Envio de NF"
          type="email"
          value={form.email_envio_nf}
          onChange={(e) => set('email_envio_nf', e.target.value)}
        />
        <Field
          label="Telefone 1"
          value={form.telefones[0]}
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
    </Drawer>
  );
}

// Re-export type used in ConfigPage
export type { Emitente };
