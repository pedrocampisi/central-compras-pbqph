/**
 * Drawer de criação/edição de Obra.
 * Portado de renderObras / openObraDrawer (CentralCompras-PBQPH.html).
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
import type { Obra } from '../../domain/types';
import {
  saveObraDirHandle,
  getObraDirHandle,
  deleteObraDirHandle,
} from '../../services/storage/handles';
import { verifyHandlePermission } from '../../services/storage/permissions';

interface Props {
  open: boolean;
  obra: Obra | null;   // null = nova
  onClose: () => void;
}

function emptyObra(): Obra {
  return {
    id: uid('obra'),
    nome: '',
    cei: '',
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
    telefone: '',
    responsavel: '',
    observacoes: '',
    ativa: true,
    pasta_oc_path: '',
    criado_em: nowIso(),
    atualizado_em: nowIso(),
  };
}

export function ObraDrawer({ open, obra, onClose }: Props) {
  const [form, setForm] = useState<Obra>(() => obra ?? emptyObra());
  const [handleConnected, setHandleConnected] = useState(false);
  const upsertObra = useDataStore((s) => s.upsertObra);
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    if (open) {
      const next = obra ?? emptyObra();
      setForm(next);
      // Verifica se já existe handle persistido para esta obra
      void getObraDirHandle(next.id).then((h) => setHandleConnected(!!h));
    }
  }, [open, obra]);

  function set<K extends keyof Obra>(key: K, value: Obra[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setEndereco(key: keyof Obra['endereco'], value: string) {
    setForm((f) => ({ ...f, endereco: { ...f.endereco, [key]: value } }));
  }

  async function handlePickPasta() {
    if (!('showDirectoryPicker' in window)) {
      showToast(
        'Seleção de pasta não é suportada neste navegador. Use Edge ou Chrome.',
        'warning',
      );
      return;
    }
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      // Garante permissão de escrita já no momento da seleção
      const granted = await verifyHandlePermission(dirHandle, true);
      if (!granted) {
        showToast('Permissão de escrita negada para esta pasta.', 'warning');
        return;
      }
      await saveObraDirHandle(form.id, dirHandle);
      set('pasta_oc_path', dirHandle.name);
      setHandleConnected(true);
      showToast(`Pasta "${dirHandle.name}" conectada.`, 'success');
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        showToast('Não foi possível selecionar a pasta.', 'warning');
      }
    }
  }

  async function handleDisconnectPasta() {
    await deleteObraDirHandle(form.id);
    set('pasta_oc_path', '');
    setHandleConnected(false);
    showToast('Pasta desconectada. PDFs serão baixados pelo navegador.', 'info');
  }

  function handleSave() {
    if (!form.nome.trim()) {
      showToast('Nome da obra é obrigatório.', 'warning');
      return;
    }
    upsertObra({ ...form, atualizado_em: nowIso() });
    showToast(obra ? 'Obra atualizada.' : 'Obra criada.', 'success');
    onClose();
  }

  const isNew = !obra;

  return (
    <Drawer
      open={open}
      title={isNew ? 'Nova Obra' : 'Editar Obra'}
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
          label="Nome da Obra"
          required
          span2
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
        />
        <Field
          label="CEI / Matrícula"
          value={form.cei}
          placeholder="000.000.000/00-0"
          onChange={(e) => set('cei', e.target.value)}
        />
        <Field
          label="Responsável"
          value={form.responsavel}
          onChange={(e) => set('responsavel', e.target.value)}
        />
        <Field
          label="Telefone"
          value={form.telefone}
          placeholder="(11) 99999-9999"
          onChange={(e) => set('telefone', e.target.value)}
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

      <FieldGroup title="Pasta de OCs">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: '1 / -1' }}>
          <div style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: 7,
            border: handleConnected ? '1px solid var(--green)' : '1px solid var(--border)',
            background: handleConnected ? 'var(--green-bg)' : 'var(--surface-alt)',
            fontSize: 12,
            color: form.pasta_oc_path ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            {handleConnected && <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span>}
            {form.pasta_oc_path || 'Nenhuma pasta selecionada'}
          </div>
          <Button variant="outline" size="sm" onClick={handlePickPasta}>
            📂 {handleConnected ? 'Trocar' : 'Selecionar'}
          </Button>
          {handleConnected && (
            <Button variant="ghost" size="sm" onClick={() => void handleDisconnectPasta()}>
              ✕
            </Button>
          )}
        </div>
        <p style={{ gridColumn: '1 / -1', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          {handleConnected
            ? 'PDFs desta obra serão salvos nesta pasta. Se a pasta estiver no OneDrive, sincroniza para a nuvem automaticamente.'
            : 'Selecione a pasta da obra (ex: OneDrive\\…\\JARDIM IPANEMA II\\notas\\Ordem de Compra). PDFs serão salvos lá automaticamente.'}
        </p>
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
            checked={form.ativa}
            onChange={(e) => set('ativa', e.target.checked)}
          />
          Obra ativa
        </label>
      </FieldGroup>
    </Drawer>
  );
}
