import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

/**
 * CTO-D812 §2 (ajuste 1), D811 §2 e §4.3, D813 §4 — o registro do fornecedor
 * no escritório: na tela da qualificação, cada ECR com o que a revisão vigente
 * pede ao lado do que está guardado; o "Anexar papel" e o "Corrigir" de quem
 * emite OC; o "Anexar papel" na OC. Banco FALSO; empresas, papéis e pessoas
 * INVENTADOS.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const banco = vi.hoisted(() => ({}) as {
  carregar: Mock; preparar: Mock; ler: Mock; arquivar: Mock; guardar: Mock; corrigir: Mock;
});
vi.mock('../../src/services/supabase/registrosDoFornecedor', () => ({
  carregarRegistrosDoFornecedor: () => banco.carregar(),
  prepararPapel: (...a: unknown[]) => banco.preparar(...a),
  lerPapelDoFornecedor: (...a: unknown[]) => banco.ler(...a),
  arquivarPapelDoFornecedor: (...a: unknown[]) => banco.arquivar(...a),
  guardarRegistroDoFornecedor: (...a: unknown[]) => banco.guardar(...a),
  corrigirRegistroDoFornecedor: (...a: unknown[]) => banco.corrigir(...a),
}));
vi.mock('../../src/services/supabase/recebimento', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/recebimento')>()),
  lerLinksDasFotos: async (ids: string[]) => new Map(ids.map((id) => [id, `https://pasta.invalid/${id}`])),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn() }));
vi.mock('../../src/hooks/useHojeEmSaoPaulo', () => ({ useHojeEmSaoPaulo: () => '2026-10-15' }));

import { QualificacaoPage } from '../../src/features/qualificacao/QualificacaoPage';
import { AnexarPapelDialogo } from '../../src/features/qualificacao/DialogosDoRegistro';
import { normalizeFornecedor } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useQualificacaoStore } from '../../src/stores/useQualificacaoStore';
import { useRegistrosStore } from '../../src/stores/useRegistrosStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { RegistroGuardado, RegistrosDoFornecedor } from '../../src/domain/registrosGuardados';
import type { Data, Fornecedor } from '../../src/domain/types';

const A1: Fornecedor = {
  ...normalizeFornecedor({ id: 'a1', razao_social: 'Alfa (teste) filial a1' }),
  ativo: true, empresa_id: 'empresa-a', empresa_apelido: 'Alfa (teste)',
};

const ECR_12 = {
  id: 12, codigo: 'ECR 12', nome: 'Madeira (teste)', categoria: '', unidades_padrao: [], materiais: [],
  revisao: '01', emitida_em: '2026-04-15', revisoes: null,
  secoes: [
    { titulo: 'REFERÊNCIA', itens: [{ rotulo: null, texto: 'Norma de teste', numerado: true }] },
    {
      titulo: 'REGISTRO DO FORNECEDOR',
      itens: [
        { rotulo: null, texto: 'Guia de transporte de cada carga (teste)', numerado: true },
        { rotulo: 'Licença', texto: 'licença ambiental vigente (teste)', numerado: true },
        { rotulo: 'Atenção', texto: 'exceto compensado (teste)', numerado: false },
      ],
    },
  ],
};

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: [], texto_condicoes_contratacao: '', texto_envio_nf: '', texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [A1], obras: [], ordens_compra: [], ecrs: [ECR_12],
  } as unknown as Data;
}

const papel = (o: Partial<RegistroGuardado>): RegistroGuardado => ({
  id: 1, documentoId: 'doc-1', ecrId: 12, empresaRaizId: 'empresa-a', fornecedorId: null, alcance: 'vale_ate',
  validoAte: '2026-10-30', ocId: '', entrouPor: 'qualificacao', conferidoPorNome: 'Comprador de Teste',
  conferidoEm: '2026-10-01T12:00:00Z', correcoes: [], ...o,
});

const GUARDADOS: RegistrosDoFornecedor = {
  registros: [
    papel({ id: 1 }),
    papel({
      id: 2, documentoId: 'doc-2', alcance: 'lote', validoAte: '', ocId: 'oc-1', entrouPor: 'recebimento',
      conferidoPorNome: 'Encarregado de Teste',
      correcoes: [{
        alcanceAntes: 'produto', validoAteAntes: '', alcanceDepois: 'lote', validoAteDepois: '', motivo: 'é da carga (teste)',
        corrigidoPorNome: 'Comprador de Teste', corrigidoEm: '2026-10-12T12:00:00Z',
      }],
    }),
    // De outra empresa: não aparece.
    papel({ id: 3, documentoId: 'doc-3', empresaRaizId: 'empresa-z' }),
  ],
  marcas: [{ ecrId: 12, porque: 'a guia acompanha cada carga (teste)' }],
};

function qualificacoes() {
  return {
    linhas: [{
      id: 1, empresaRaizId: 'empresa-a', fornecedorId: null, categoria: 'material' as const, tipo: 'Madeira',
      qualificadaEm: '2026-05-07', venceEm: '2027-05-07',
      criterios: [{ atende: true, motivo: '' }, { atende: true, motivo: '' }, { atende: true, motivo: '' }],
      nota: 3, minimo: 2, qualificada: true, qualificadoPorNome: 'Pessoa de teste', origem: '',
      situacao: 'qualificada' as const, ecrs: [12], vigente: true,
    }],
    categorias: [{ categoria: 'material' as const, nome: 'Materiais', minimo: 2, criterios: ['Atende', 'Preço', 'Prazo'] }],
    tratativas: [], desempenho: [],
  };
}

const PAPEL_PRONTO = { base64: 'JVBERg==', mime: 'application/pdf' };
const LIDO_VALE_ATE = { alcance: 'vale_ate', validoAte: '2027-06-30', confira: '', bruta: { alcance: 'vale_ate', valido_ate: '2027-06-30' } };

beforeEach(() => {
  banco.carregar = vi.fn(async () => GUARDADOS);
  banco.preparar = vi.fn(async () => PAPEL_PRONTO);
  banco.ler = vi.fn(async () => LIDO_VALE_ATE);
  banco.arquivar = vi.fn(async () => 'doc-novo');
  banco.guardar = vi.fn(async () => 50);
  banco.corrigir = vi.fn(async () => {});
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useQualificacaoStore.getState().definir(qualificacoes());
  useRegistrosStore.setState({ dados: null, erro: '', carregando: false });
});

async function abrirPapeis() {
  render(<QualificacaoPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Papéis' }));
  const caixa = document.querySelector<HTMLElement>('[data-registros-da-ecr="12"]')!;
  await waitFor(() => expect(caixa.querySelectorAll('[data-registro]').length).toBe(2));
  return caixa;
}

const arquivo = (nome = 'licenca.pdf') => new File([new Uint8Array([37, 80, 68, 70])], nome, { type: 'application/pdf' });

describe('a ECR, o que ela pede e o que está guardado', () => {
  it('a lista da revisão vigente, como está, ao lado dos papéis da empresa, com o alcance', async () => {
    const caixa = await abrirPapeis();
    expect(caixa.querySelector('h5')!.textContent).toBe('ECR 12 — Madeira (teste)');
    expect(caixa.textContent).toContain('O que a ECR pede (Rev. 01)');
    const pede = [...caixa.querySelectorAll('li')].map((li) => li.textContent);
    expect(pede).toContain('Guia de transporte de cada carga (teste)');
    expect(pede).toContain('Licença: licença ambiental vigente (teste)');
    expect(caixa.textContent).toContain('Atenção: exceto compensado (teste)');
    expect(caixa.textContent).not.toContain('Norma de teste');

    const [um, dois] = [...caixa.querySelectorAll<HTMLElement>('[data-registro]')];
    // O "vale até" que vence em 15 dias vem no alto, com o aviso de 30 dias; o lote, depois.
    expect(um!.dataset['vigencia']).toBe('vence_em_30_dias');
    expect(um!.textContent).toContain('Vence em 30/10/2026, em menos de 30 dias');
    expect(um!.textContent).toContain('anexado na qualificação · conferido por Comprador de Teste');
    expect(within(um!).getByRole('link', { name: /Abrir/ }).getAttribute('href')).toBe('https://pasta.invalid/doc-1');
    expect(dois!.textContent).toContain('Deste lote');
    expect(dois!.textContent).toContain('chegou com o material, na obra · conferido por Encarregado de Teste');
    expect(dois!.querySelector('[data-correcao]')!.textContent).toMatch(
      /^Corrigido de vale para o produto, sem prazo para deste lote — Comprador de Teste, .*\. Motivo: é da carga \(teste\)$/,
    );
    expect(caixa.querySelector('[data-registro="3"]')).toBeNull();
  });

  it('a marca "a cada entrega" aparece na ECR, com o porquê do Banco', async () => {
    const caixa = await abrirPapeis();
    expect(caixa.querySelector('[data-a-cada-entrega]')!.textContent).toBe(
      'Pede o papel a cada entrega: a guia acompanha cada carga (teste)',
    );
  });

  it('sem nada guardado, a tela diz; a falha da leitura avisa, e não finge lista vazia', async () => {
    banco.carregar = vi.fn(async () => ({ registros: [], marcas: [] }));
    render(<QualificacaoPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Papéis' }));
    expect((await screen.findByText('Nenhum papel guardado para esta ECR.')).closest('[data-aviso-da-ecr]')).toBeTruthy();

    useRegistrosStore.setState({ dados: null, erro: '', carregando: false });
    banco.carregar = vi.fn(async () => {
      throw new Error('sem rede (teste)');
    });
    await act(async () => {
      await useRegistrosStore.getState().carregar(true);
    });
    expect(screen.getByRole('alert').textContent).toContain('Não consegui ler os papéis guardados');
    expect(screen.queryByText('Nenhum papel guardado para esta ECR.')).toBeNull();
  });

  it('quem só lê vê os papéis, mas não anexa nem corrige', async () => {
    useAuthStore.setState({ perfil: { papel: 'leitura' } as never });
    const caixa = await abrirPapeis();
    expect(within(caixa).queryByRole('button', { name: 'Corrigir' })).toBeNull();
    expect(within(caixa).queryByRole('button', { name: /Anexar papel/ })).toBeNull();
  });
});

describe('"Anexar papel" na qualificação', () => {
  it('a IA lê, o alcance vem marcado, e guarda pela empresa: o arquivo e a guardar_registro_do_fornecedor', async () => {
    const caixa = await abrirPapeis();
    fireEvent.click(within(caixa).getByRole('button', { name: /Anexar papel/ }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-anexar]')!;
    expect(janela.textContent).toContain('Alfa (teste)');
    expect(janela.textContent).toContain('ECR 12 — Madeira (teste)');
    // Na qualificação, o lote não é escolha.
    const input = janela.querySelector<HTMLInputElement>('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [arquivo()] } });
    await waitFor(() => expect(janela.querySelector('[data-leitura]')!.textContent).toContain('O papel diz: vale até 30/06/2027.'));
    expect(within(janela).queryByLabelText('Deste lote')).toBeNull();
    expect(within(janela).getByLabelText<HTMLInputElement>('Vale até uma data').checked).toBe(true);
    expect(within(janela).getByLabelText<HTMLInputElement>('Vale até').value).toBe('2027-06-30');

    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    await waitFor(() => expect(banco.guardar).toHaveBeenCalledTimes(1));
    expect(banco.arquivar).toHaveBeenCalledWith(PAPEL_PRONTO, 'licenca.pdf', 12, { fornecedorId: 'a1' }, LIDO_VALE_ATE.bruta);
    expect(banco.guardar).toHaveBeenCalledWith({
      documentoId: 'doc-novo', ecrId: 12, alcance: 'vale_ate', validoAte: '2027-06-30', onde: { fornecedorId: 'a1' },
    });
    // Guardou: a janela fecha e a lista lê de novo.
    await waitFor(() => expect(document.querySelector('[data-dialogo-anexar]')).toBeNull());
    expect(banco.carregar).toHaveBeenCalledTimes(2);
  });

  it('a leitura diz "deste lote": ninguém escolhe pelo comprador, e sem escolha nada sobe', async () => {
    banco.ler = vi.fn(async () => ({ alcance: 'lote', validoAte: '', confira: 'cita o número da nota', bruta: {} }));
    const caixa = await abrirPapeis();
    fireEvent.click(within(caixa).getByRole('button', { name: /Anexar papel/ }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-anexar]')!;
    fireEvent.change(janela.querySelector('input[type="file"]')!, { target: { files: [arquivo('gca.pdf')] } });
    await waitFor(() => expect(janela.querySelector('[data-leitura]')!.textContent).toContain('Confira: cita o número da nota'));
    expect(janela.textContent).toContain('O papel deste lote se anexa na OC em que ele chegou');
    expect(janela.querySelectorAll<HTMLInputElement>('[data-alcance-escolha] input[type="radio"]:checked').length).toBe(0);
    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    expect(within(janela).getByRole('alert').textContent).toBe('Escolha a quem o papel vale.');
    expect(banco.arquivar).not.toHaveBeenCalled();
  });

  it('a recusa do banco aparece na janela, e ela fica aberta', async () => {
    banco.guardar = vi.fn(async () => {
      throw new Error('Este papel já está guardado para esta ECR.');
    });
    const caixa = await abrirPapeis();
    fireEvent.click(within(caixa).getByRole('button', { name: /Anexar papel/ }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-anexar]')!;
    fireEvent.change(janela.querySelector('input[type="file"]')!, { target: { files: [arquivo()] } });
    await waitFor(() => expect(within(janela).getByLabelText<HTMLInputElement>('Vale até uma data').checked).toBe(true));
    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    expect((await within(janela).findByRole('alert')).textContent).toBe('Este papel já está guardado para esta ECR.');
    expect(document.querySelector('[data-dialogo-anexar]')).toBeTruthy();
  });
});

describe('"Corrigir" o alcance', () => {
  it('o papel que chegou na OC aceita o lote; a correção vai com o motivo, e a lista lê de novo', async () => {
    const caixa = await abrirPapeis();
    const lote = caixa.querySelector<HTMLElement>('[data-registro="2"]')!;
    fireEvent.click(within(lote).getByRole('button', { name: 'Corrigir' }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-corrigir]')!;
    expect(janela.textContent).toContain('Hoje: Deste lote');
    // A correção de antes aparece na janela.
    expect(janela.querySelector('[data-correcoes-antes]')!.textContent).toContain('é da carga (teste)');
    const corrigir = within(janela).getByRole('button', { name: 'Corrigir' });
    expect(corrigir.hasAttribute('disabled')).toBe(true);

    fireEvent.click(within(janela).getByLabelText('Vale para o produto, sem prazo'));
    fireEvent.change(within(janela).getByLabelText('Por que corrigir (opcional)'), { target: { value: 'é a FISPQ (teste)' } });
    fireEvent.click(corrigir);
    await waitFor(() => expect(banco.corrigir).toHaveBeenCalledWith(2, 'produto', '', 'é a FISPQ (teste)'));
    await waitFor(() => expect(document.querySelector('[data-dialogo-corrigir]')).toBeNull());
    expect(banco.carregar).toHaveBeenCalledTimes(2);
  });

  it('o papel da qualificação não vira lote: a escolha nem aparece', async () => {
    const caixa = await abrirPapeis();
    fireEvent.click(within(caixa.querySelector<HTMLElement>('[data-registro="1"]')!).getByRole('button', { name: 'Corrigir' }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-corrigir]')!;
    expect(within(janela).queryByLabelText('Deste lote')).toBeNull();
    fireEvent.change(within(janela).getByLabelText('Vale até'), { target: { value: '2027-10-30' } });
    fireEvent.click(within(janela).getByRole('button', { name: 'Corrigir' }));
    await waitFor(() => expect(banco.corrigir).toHaveBeenCalledWith(1, 'vale_ate', '2027-10-30', ''));
  });
});

describe('"Anexar papel" na OC (CTO-D811 §4.3)', () => {
  it('com duas ECRs, escolhe-se a ECR; sem leitura, é deste lote; guarda pela OC', async () => {
    banco.ler = vi.fn(async () => null);
    const aoGuardar = vi.fn();
    render(
      <AnexarPapelDialogo
        quem="OC 2026/101 · Alfa (teste)"
        naOc
        ecrs={[{ id: 12, rotulo: 'ECR 12 — Madeira (teste)' }, { id: 6, rotulo: 'ECR 06 — Aço (teste)' }]}
        onde={() => ({ ocId: 'oc-1', fornecedorId: 'a1' })}
        aoFechar={() => {}}
        aoGuardar={aoGuardar}
      />,
    );
    const janela = document.querySelector<HTMLElement>('[data-dialogo-anexar]')!;
    fireEvent.change(janela.querySelector('input[type="file"]')!, { target: { files: [arquivo('certificado.pdf')] } });
    await waitFor(() => expect(janela.querySelector('[data-leitura]')!.textContent).toContain('Não consegui ler o papel'));
    expect(within(janela).getByLabelText<HTMLInputElement>('Deste lote').checked).toBe(true);
    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    expect(within(janela).getByRole('alert').textContent).toBe('Escolha a ECR do papel.');

    fireEvent.change(within(janela).getByLabelText('ECR do papel'), { target: { value: '6' } });
    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    await waitFor(() => expect(banco.guardar).toHaveBeenCalledTimes(1));
    expect(banco.arquivar).toHaveBeenCalledWith(PAPEL_PRONTO, 'certificado.pdf', 6, { ocId: 'oc-1', fornecedorId: 'a1' }, undefined);
    expect(banco.guardar).toHaveBeenCalledWith({
      documentoId: 'doc-novo', ecrId: 6, alcance: 'lote', validoAte: '', onde: { ocId: 'oc-1', fornecedorId: 'a1' },
    });
    expect(aoGuardar).toHaveBeenCalledTimes(1);
  });
});
