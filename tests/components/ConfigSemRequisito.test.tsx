/**
 * CTO-D808 §3 — o campo "Requisito de Qualidade" sai da Configuração: o PDF não
 * o usa mais (D805). Os outros textos legais ficam.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../src/services/supabase/client', () => ({ supabase: {}, core: () => ({}), compras: () => ({}) }));

import { ConfigPage } from '../../src/features/configuracoes/ConfigPage';
import { useDataStore } from '../../src/stores/useDataStore';
import type { Data } from '../../src/domain/types';

describe('D808 §3 — a Configuração sem o "Requisito de Qualidade"', () => {
  it('o campo sumiu, mesmo com texto na configuração; os outros textos legais ficam', () => {
    useDataStore.setState({
      data: {
        schema_version: 1, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
        config: {
          emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
          condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: 'condições (teste)', texto_envio_nf: 'nota (teste)',
          texto_qualidade: 'requisito antigo (teste)', pasta_backups: '',
        },
        fornecedores: [], obras: [], ecrs: [], ordens_compra: [],
      } as unknown as Data,
    });
    render(<ConfigPage />);
    expect(screen.queryByText('Requisito de Qualidade')).toBeNull();
    expect(screen.queryByDisplayValue('requisito antigo (teste)')).toBeNull();
    expect(screen.getByText('Condições de Contratação')).toBeInTheDocument();
    expect(screen.getByDisplayValue('condições (teste)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('nota (teste)')).toBeInTheDocument();
  });
});
