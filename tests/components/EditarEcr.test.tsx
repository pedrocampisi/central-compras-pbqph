import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

/**
 * A tela de editar a ECR (CTO-D589 §4.2, D596 §3). Nada aqui fala com o
 * banco: `core.pode_revisar_ecr` e `compras.revisar_ecr` são falsas e seguem
 * o contrato do Banco (D588/D589 §1) — o que a função recebe, o que ela
 * devolve, e as recusas 42501, 22023, 55000 e P0002. Nenhuma revisão de
 * verdade: a primeira é do Pedro.
 */

type Recusa = { code: string; message: string };
const banco = {
  podeRevisar: true as boolean | 'falha',
  recusa: null as Recusa | null,
  chamadas: [] as Record<string, unknown>[],
};

vi.mock('../../src/services/supabase/client', () => ({
  core: () => ({
    rpc: async (nome: string) => {
      if (nome !== 'pode_revisar_ecr') throw new Error(`rpc inesperada: ${nome}`);
      if (banco.podeRevisar === 'falha') return { data: null, error: { code: '08006', message: 'sem rede' } };
      return { data: banco.podeRevisar, error: null };
    },
  }),
  compras: () => ({
    rpc: async (nome: string, args: Record<string, unknown>) => {
      if (nome !== 'revisar_ecr') throw new Error(`rpc inesperada: ${nome}`);
      banco.chamadas.push(args);
      if (banco.recusa) return { data: null, error: banco.recusa };
      return {
        data: { ecr_id: args['p_ecr_id'], revisao_anterior: '00', revisao: '01', emitida_em: '2026-09-27', historico_id: 99 },
        error: null,
      };
    },
  }),
}));
const recarregar = vi.fn(async () => {});
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: () => recarregar() }));
vi.mock('../../src/services/pdf/generateEcrPdf', () => ({ baixarPdfDaEcr: vi.fn() }));

import { CatalogoPage } from '../../src/features/catalogo-ecr/CatalogoPage';
import { GlobalConfirmDialog } from '../../src/components/ConfirmDialog/GlobalConfirmDialog';
import { useDataStore } from '../../src/stores/useDataStore';
import { useUiStore } from '../../src/stores/useUiStore';
import { useRevisaoEcrStore } from '../../src/stores/useRevisaoEcrStore';
import { secoesDoBanco } from '../../src/domain/ecr';
import { normalizeEcr } from '../../src/domain/normalize';
import type { Data, Ecr, EcrSecao } from '../../src/domain/types';
import ecrs from '../fixtures/ecrs-03-e-08.json';

function ecr03(): Ecr {
  const e = ecrs[0]!;
  return {
    ...normalizeEcr({ id: 3, codigo: 'ECR 03', nome: 'Concreto Usinado', categoria: 'Estrutura' }),
    revisao: '00',
    emitida_em: '2026-04-15',
    secoes: secoesDoBanco(e.secoes),
    revisoes: [],
  };
}

/** Uma ECR como a 02 antes da D592: a linha "Dimensão" com o rótulo e o texto vazio. */
function comDimensaoVazia(): Ecr {
  const e = ecr03();
  const secoes = e.secoes!.map((s) => ({ ...s, itens: [...s.itens] }));
  secoes[1]!.itens.splice(1, 0, { rotulo: 'Dimensão', texto: '', numerado: true });
  return { ...e, id: 2, codigo: 'ECR 02', nome: 'Peças de teste', secoes };
}

async function montar(lista: Ecr[]) {
  useDataStore.setState({ data: { ecrs: lista } as unknown as Data });
  render(
    <>
      <CatalogoPage />
      <GlobalConfirmDialog />
    </>,
  );
  // A pergunta ao banco ("pode revisar?") é assíncrona.
  await act(async () => {});
}

async function editar(codigo: string) {
  fireEvent.click(await screen.findByRole('button', { name: `Editar a ${codigo}` }));
  return document.querySelector('[data-editor]') as HTMLElement;
}

const texto = (s: string, l: number) => screen.getByLabelText(`Texto da linha ${l} da seção ${s}`) as HTMLTextAreaElement;
const clicar = (nome: string | RegExp) => fireEvent.click(screen.getByRole('button', { name: nome }));
const dialogo = () => document.querySelector('[data-dialogo-revisao]') as HTMLElement | null;

beforeEach(() => {
  banco.podeRevisar = true;
  banco.recusa = null;
  banco.chamadas = [];
  recarregar.mockClear();
  useRevisaoEcrStore.getState().fechar();
  useUiStore.setState({ catalogoFilter: { search: '' }, toasts: [] });
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-27T15:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('D589 §4.3 — só o Pedro vê "Editar"', () => {
  it('para o Pedro, cada ECR com texto tem "Editar"', async () => {
    await montar([ecr03(), comDimensaoVazia()]);
    expect(screen.getByRole('button', { name: 'Editar a ECR 03' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar a ECR 02' })).toBeInTheDocument();
  });

  it('para outro perfil, não há "Editar" em ECR nenhuma', async () => {
    banco.podeRevisar = false;
    await montar([ecr03()]);
    expect(screen.queryByRole('button', { name: /Editar/ })).toBeNull();
    // O resto da tela é o mesmo: o PDF continua lá.
    expect(screen.getByRole('button', { name: 'PDF da ECR 03' })).toBeInTheDocument();
  });

  it('se o banco não responde, o botão não aparece', async () => {
    banco.podeRevisar = 'falha';
    await montar([ecr03()]);
    expect(screen.queryByRole('button', { name: /Editar/ })).toBeNull();
  });
});

describe('D589 §4.2 — a ECR em edição', () => {
  it('abre com o texto vigente em cada linha, marca "Em edição", e as outras ECRs não oferecem "Editar"', async () => {
    await montar([ecr03(), comDimensaoVazia()]);
    const editor = await editar('ECR 03');
    expect(editor).not.toBeNull();
    expect(texto('01', 1).value).toBe('NBR 7212 - Execução de Concreto Dosado em Central - Especificação;');
    expect(editor.querySelectorAll('fieldset')).toHaveLength(5);
    expect(screen.getByText('Em edição')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar a ECR 02' })).toBeNull();
    // A nota "Atenção" vem marcada como nota.
    const atencao = screen.getAllByLabelText(/^Rótulo da linha/).find((i) => (i as HTMLInputElement).value === 'Atenção')!;
    expect(within(atencao.closest('[data-linha]') as HTMLElement).getByRole('checkbox')).toBeChecked();
  });

  it('a seção de uma linha só não deixa tirar a última', async () => {
    await montar([ecr03()]);
    await editar('ECR 03');
    expect(screen.getByRole('button', { name: 'Tirar a linha 1 da seção 03' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Subir a linha 1 da seção 01' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Descer a linha 4 da seção 01' })).toBeDisabled();
  });
});

describe('D596 §3 (a proposta do §6) — a tela confere antes de mandar e aponta a linha', () => {
  it('a linha "Dimensão" sem texto: aponta a linha pelo rótulo, põe o cursor nela, e nada vai ao banco', async () => {
    await montar([comDimensaoVazia()]);
    await editar('ECR 02');
    clicar('Salvar revisão');
    const frase = 'Seção 02, a linha "Dimensão" está sem texto: escreva o texto ou tire a linha.';
    const linha = texto('02', 2).closest('[data-linha]') as HTMLElement;
    expect(linha).toHaveAttribute('data-com-problema');
    expect(within(linha).getByText(frase)).toBeInTheDocument();
    expect(texto('02', 2)).toHaveAttribute('aria-invalid', 'true');
    expect(document.activeElement).toBe(texto('02', 2));
    expect(within(screen.getByRole('alert')).getByText(frase)).toBeInTheDocument();
    expect(dialogo()).toBeNull();
    expect(banco.chamadas).toHaveLength(0);

    // Escreveu o texto: o problema some na hora, e a confirmação abre.
    fireEvent.change(texto('02', 2), { target: { value: 'Verificar as dimensões das peças.' } });
    expect(linha).not.toHaveAttribute('data-com-problema');
    clicar('Salvar revisão');
    expect(dialogo()).not.toBeNull();
  });

  it('tirar a linha também resolve', async () => {
    await montar([comDimensaoVazia()]);
    await editar('ECR 02');
    clicar('Salvar revisão');
    clicar('Tirar a linha 2 da seção 02');
    expect(screen.queryByRole('alert')).toBeNull();
    clicar('Salvar revisão');
    expect(dialogo()).not.toBeNull();
  });

  it('texto só com número ou espaço não vale (o banco quer uma letra); rótulo sem letra também não', async () => {
    await montar([ecr03()]);
    await editar('ECR 03');
    fireEvent.change(texto('01', 2), { target: { value: '  123;  ' } });
    fireEvent.change(screen.getByLabelText('Rótulo da linha 3 da seção 01'), { target: { value: '12' } });
    clicar('Salvar revisão');
    const alerta = screen.getByRole('alert');
    expect(alerta.textContent).toContain('Seção 01, a linha 2 está sem texto: escreva o texto ou tire a linha.');
    expect(alerta.textContent).toContain('Seção 01, a linha 3: o rótulo precisa ter uma letra, ou ficar em branco.');
    expect(banco.chamadas).toHaveLength(0);
  });

  it('sem mudança nenhuma, diz que não há o que revisar', async () => {
    await montar([ecr03()]);
    await editar('ECR 03');
    // Espaço nas pontas não é mudança: o banco compara o texto limpo.
    fireEvent.change(texto('01', 1), { target: { value: `  ${texto('01', 1).value}  ` } });
    clicar('Salvar revisão');
    expect(screen.getByRole('alert').textContent).toContain('O texto está igual ao da revisão 00: não há o que revisar.');
    expect(dialogo()).toBeNull();
  });
});

describe('D589 §4.2 — salvar é aprovar: a confirmação e o que vai ao banco', () => {
  async function ateAConfirmacao() {
    await montar([ecr03()]);
    await editar('ECR 03');
    fireEvent.change(texto('01', 1), { target: { value: '  NBR 7212 - Concreto dosado em central;  ' } });
    clicar('Salvar revisão');
  }

  it('a confirmação diz "Rev. 00 → 01, emitida hoje (27/09/2026), aprovada por você."', async () => {
    await ateAConfirmacao();
    expect(within(dialogo()!).getByText('Gravar a revisão da ECR 03')).toBeInTheDocument();
    expect(dialogo()!.querySelector('[data-resumo]')!.textContent).toBe(
      'Rev. 00 → 01, emitida hoje (27/09/2026), aprovada por você.',
    );
  });

  it('sem "O que mudou", não grava', async () => {
    await ateAConfirmacao();
    fireEvent.change(screen.getByLabelText(/O que mudou/), { target: { value: '   ' } });
    clicar('Gravar revisão');
    expect(within(dialogo()!).getByRole('alert').textContent).toBe(
      'Escreva o que mudou: é a descrição desta revisão no histórico.',
    );
    expect(banco.chamadas).toHaveLength(0);
  });

  it('"Voltar" fecha a confirmação e o rascunho continua', async () => {
    await ateAConfirmacao();
    clicar('Voltar');
    expect(dialogo()).toBeNull();
    expect(texto('01', 1).value).toBe('  NBR 7212 - Concreto dosado em central;  ');
  });

  it('grava pelo contrato: as cinco seções, o texto limpo, o rótulo vazio como null; recarrega, fecha e avisa', async () => {
    await ateAConfirmacao();
    fireEvent.change(screen.getByLabelText('Rótulo da linha 2 da seção 01'), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText(/O que mudou/), { target: { value: '  O nome da NBR 7212.  ' } });
    await act(async () => clicar('Gravar revisão'));

    expect(banco.chamadas).toHaveLength(1);
    const args = banco.chamadas[0]!;
    expect(Object.keys(args).sort()).toEqual(['p_descricao', 'p_ecr_id', 'p_secoes']);
    expect(args['p_ecr_id']).toBe(3);
    expect(args['p_descricao']).toBe('O nome da NBR 7212.');
    const secoes = args['p_secoes'] as EcrSecao[];
    expect(secoes.map((s) => s.titulo)).toEqual(ecr03().secoes!.map((s) => s.titulo));
    for (const s of secoes) {
      expect(Object.keys(s).sort()).toEqual(['itens', 'titulo']);
      for (const it of s.itens) expect(Object.keys(it).sort()).toEqual(['numerado', 'rotulo', 'texto']);
    }
    expect(secoes[0]!.itens[0]).toEqual({ rotulo: null, texto: 'NBR 7212 - Concreto dosado em central;', numerado: true });
    expect(secoes[0]!.itens[1]!.rotulo).toBeNull();
    // Só a linha mudada mudou.
    expect(secoes.slice(1)).toEqual(ecr03().secoes!.slice(1));

    expect(recarregar).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(document.querySelector('[data-editor]')).toBeNull());
    expect(useUiStore.getState().toasts.map((t) => [t.message, t.tone])).toContainEqual([
      'ECR 03 revisada: Rev. 01, emitida em 27/09/2026.',
      'success',
    ]);
  });

  it('subir, descer, pôr linha e marcar nota mudam o que vai ao banco', async () => {
    await montar([ecr03()]);
    await editar('ECR 03');
    const antes = ecr03().secoes![0]!.itens;
    clicar('Descer a linha 1 da seção 01');
    clicar('Pôr linha na seção 01');
    fireEvent.change(texto('01', 5), { target: { value: 'Uma nota nova.' } });
    fireEvent.change(screen.getByLabelText('Rótulo da linha 5 da seção 01'), { target: { value: 'Nota' } });
    fireEvent.click(within(texto('01', 5).closest('[data-linha]') as HTMLElement).getByRole('checkbox'));
    clicar('Salvar revisão');
    fireEvent.change(screen.getByLabelText(/O que mudou/), { target: { value: 'Ordem e nota.' } });
    await act(async () => clicar('Gravar revisão'));
    const itens = (banco.chamadas[0]!['p_secoes'] as EcrSecao[])[0]!.itens;
    expect(itens.map((i) => i.texto)).toEqual([antes[1]!.texto, antes[0]!.texto, antes[2]!.texto, antes[3]!.texto, 'Uma nota nova.']);
    expect(itens[4]).toEqual({ rotulo: 'Nota', texto: 'Uma nota nova.', numerado: false });
  });
});

describe('D596 §3 — a recusa do banco, com a frase que a tela mostra', () => {
  const casos: [string, string, string][] = [
    ['42501', 'permission denied', 'Só o Pedro revisa uma ECR. A revisão não foi gravada.'],
    ['P0002', 'ecr 3 nao existe', 'Esta ECR não existe mais no banco. Recarregue a página. A revisão não foi gravada.'],
    [
      '55000',
      'a revisao vigente nao tem texto no historico',
      'A revisão vigente desta ECR não tem o texto guardado no histórico, e revisar agora perderia esse texto. A revisão não foi gravada.',
    ],
    ['22023', 'o texto novo e igual ao vigente', 'O banco recusou a revisão: o texto novo e igual ao vigente'],
  ];

  it.each(casos)('%s: a frase aparece na confirmação, e o rascunho não se perde', async (code, message, frase) => {
    banco.recusa = { code, message };
    await montar([ecr03()]);
    await editar('ECR 03');
    fireEvent.change(texto('01', 1), { target: { value: 'NBR 7212 - Concreto dosado em central;' } });
    clicar('Salvar revisão');
    fireEvent.change(screen.getByLabelText(/O que mudou/), { target: { value: 'O nome da NBR.' } });
    await act(async () => clicar('Gravar revisão'));

    expect(within(dialogo()!).getByRole('alert').textContent).toBe(frase);
    expect(recarregar).not.toHaveBeenCalled();
    expect(useRevisaoEcrStore.getState().ecrId).toBe(3);
    clicar('Voltar');
    expect(texto('01', 1).value).toBe('NBR 7212 - Concreto dosado em central;');
  });
});

describe('D589 §4.2 — sair sem salvar', () => {
  it('sem mudança, "Cancelar" fecha direto', async () => {
    await montar([ecr03()]);
    await editar('ECR 03');
    await act(async () => clicar('Cancelar'));
    expect(document.querySelector('[data-editor]')).toBeNull();
    expect(screen.queryByText('Sair sem salvar?')).toBeNull();
  });

  it('com mudança, pergunta; "Continuar editando" fica, "Sair sem salvar" volta ao texto vigente', async () => {
    await montar([ecr03()]);
    await editar('ECR 03');
    fireEvent.change(texto('01', 1), { target: { value: 'Mudado.' } });

    await act(async () => clicar('Cancelar'));
    expect(screen.getByText('Sair sem salvar?')).toBeInTheDocument();
    expect(screen.getByText(/A ECR 03 continua como está, na Rev\. 00\./)).toBeInTheDocument();
    await act(async () => clicar('Continuar editando'));
    expect(texto('01', 1).value).toBe('Mudado.');

    await act(async () => clicar('Cancelar'));
    await act(async () => clicar('Sair sem salvar'));
    expect(document.querySelector('[data-editor]')).toBeNull();
    // A ECR continua aberta, com o texto de antes.
    expect(document.querySelector('[data-ecr-aberta]')!.textContent).toContain('NBR 7212 - Execução de Concreto');
  });

  it('fechar o navegador com mudança: o navegador pergunta; sem mudança, não', async () => {
    await montar([ecr03()]);
    await editar('ECR 03');
    const sair = () => {
      const e = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(e);
      return e.defaultPrevented;
    };
    expect(sair()).toBe(false);
    fireEvent.change(texto('01', 1), { target: { value: 'Mudado.' } });
    expect(sair()).toBe(true);
    act(() => useRevisaoEcrStore.getState().fechar());
    expect(sair()).toBe(false);
  });
});

// Perícia do Codex, 27/09/2026, achado 2 — MEDIDA, não conserto (CTO-D603).
// O "como conferir" do perito: abre a Rev. 00 e muda a linha A; os dados
// recarregam com uma Rev. 01 em que a linha B mudou (outra aba aprovou); salva
// o rascunho aberto. O certo: a linha B vai com o texto da 01, ou a tela recusa
// a base velha.
describe('Perícia 27/09, achado 2 — o rascunho aberto sobre uma revisão que já mudou', () => {
  // `it.fails`: esta medida REPRODUZ o achado no código de hoje. Quando o conserto
  // entrar, ela passa a falhar — aí o `.fails` sai e a medida vira trava.
  it.fails('a mudança da Rev. 01 na linha B não é desfeita pelo rascunho aberto na 00', async () => {
    await montar([ecr03()]);
    await editar('ECR 03');
    fireEvent.change(texto('01', 1), { target: { value: 'NBR 7212 - Concreto dosado em central;' } });

    // Outra aba aprovou a Rev. 01, com a linha B (seção 01, linha 2) mudada; a tela recarrega.
    const rev01 = ecr03();
    rev01.revisao = '01';
    rev01.secoes = rev01.secoes!.map((s, i) =>
      i === 0 ? { ...s, itens: s.itens.map((it, j) => (j === 1 ? { ...it, texto: 'Texto da linha B na Rev. 01.' } : it)) } : s,
    );
    act(() => useDataStore.setState({ data: { ecrs: [rev01] } as unknown as Data }));

    clicar('Salvar revisão');
    if (dialogo()) {
      fireEvent.change(screen.getByLabelText(/O que mudou/), { target: { value: 'A linha A.' } });
      await act(async () => clicar('Gravar revisão'));
    }

    const recusou = banco.chamadas.length === 0;
    const linhaB = recusou ? null : (banco.chamadas[0]!['p_secoes'] as EcrSecao[])[0]!.itens[1]!.texto;
    const confirmacao = dialogo()?.textContent ?? null;
    expect(recusou || linhaB === 'Texto da linha B na Rev. 01.', JSON.stringify({ recusou, linhaB, confirmacao })).toBe(true);
  });
});
