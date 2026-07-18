/**
 * Bloco de campos de endereço compartilhado pelos drawers de
 * Fornecedor, Obra, Prestador e Emitente. Renderiza os 7 campos
 * dentro do grid do FieldGroup pai (não inclui o FieldGroup).
 */

import { Field } from '../Field/Field';
import type { Endereco } from '../../domain/types';

interface EnderecoFieldsProps {
  endereco: Endereco;
  onChange: (key: keyof Endereco, value: string) => void;
}

export function EnderecoFields({ endereco, onChange }: EnderecoFieldsProps) {
  return (
    <>
      <Field
        label="Logradouro"
        span2
        value={endereco.logradouro}
        onChange={(e) => onChange('logradouro', e.target.value)}
      />
      <Field
        label="Número"
        value={endereco.numero}
        onChange={(e) => onChange('numero', e.target.value)}
      />
      <Field
        label="Complemento"
        value={endereco.complemento}
        onChange={(e) => onChange('complemento', e.target.value)}
      />
      <Field
        label="Bairro"
        value={endereco.bairro}
        onChange={(e) => onChange('bairro', e.target.value)}
      />
      <Field
        label="Cidade"
        value={endereco.cidade}
        onChange={(e) => onChange('cidade', e.target.value)}
      />
      <Field
        label="UF"
        value={endereco.uf}
        maxLength={2}
        placeholder="SP"
        onChange={(e) => onChange('uf', e.target.value.toUpperCase())}
      />
      <Field
        label="CEP"
        value={endereco.cep}
        placeholder="00000-000"
        onChange={(e) => onChange('cep', e.target.value)}
      />
    </>
  );
}
