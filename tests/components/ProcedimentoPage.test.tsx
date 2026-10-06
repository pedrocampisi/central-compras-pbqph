import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

/**
 * CTO-D730 §3.1 — a página "Procedimento de Compras (PS.02)": o manual da
 * equipe, com a estrutura do documento do SGQ. O texto é o da Rev. 00, palavra
 * por palavra (os nomes do histórico são inventados); a leitura do banco é
 * falsa, nada sai daqui.
 */

const ler = vi.fn();
vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/procedimento', () => ({ lerProcedimento: (c: string) => ler(c) }));

import { ProcedimentoPage } from '../../src/features/procedimento/ProcedimentoPage';
import { useUiStore } from '../../src/stores/useUiStore';
import { FALHA_AO_LER, NOME_DA_PAGINA, SEM_PROCEDIMENTO, textoSimples, type Procedimento } from '../../src/domain/procedimento';
import { ps02Rev00 } from '../fixtures/ps02Rev00';

const rolou = vi.fn();
beforeEach(() => {
  ler.mockReset();
  rolou.mockReset();
  Element.prototype.scrollIntoView = rolou;
  useUiStore.setState({ activeTab: 'procedimento', ancoraDoProcedimento: null });
});
afterEach(cleanup);

async function abre(p: Procedimento | null = ps02Rev00()) {
  ler.mockResolvedValue(p);
  await act(async () => {
    render(<ProcedimentoPage />);
  });
  if (p) await screen.findByRole('heading', { name: p.titulo });
  return document.querySelector('[data-procedimento]') as HTMLElement | null;
}

/** As palavras do texto, sem espaço: o negrito parte a frase em pedaços. */
const semEspaco = (s: string) => s.replace(/\s+/g, '');

/** Todo texto do documento (fora o emoji do cartão), para conferir que a página mostra cada um. */
function textosDe(p: Procedimento): string[] {
  const out = [p.titulo, p.subtitulo, p.sobretitulo, p.situacao, p.responsavel, p.referencia, p.escopo, textoSimples(p.comoUsar)];
  out.push(p.fluxo.titulo, p.fluxo.introducao, p.fluxo.tituloDaSequencia);
  for (const c of p.fluxo.cartoes) out.push(c.texto);
  for (const s of p.fluxo.sequencia) out.push(s.titulo, s.texto);
  for (const s of p.secoes) {
    out.push(s.titulo, s.selo);
    for (const b of s.blocos) {
      if (b.tipo === 'paragrafo') out.push(textoSimples(b.texto));
      if (b.tipo === 'quadros') for (const q of b.quadros) out.push(q.titulo, q.texto);
      if (b.tipo === 'lista') for (const i of b.itens) out.push(i.texto);
      if (b.tipo === 'tabela') {
        out.push(...b.colunas);
        for (const l of b.linhas) out.push(...l.celulas.map(textoSimples));
      }
    }
  }
  out.push(p.rodape!.titulo, p.rodape!.texto);
  return out;
}

describe('a página lê o procedimento e o mostra inteiro', () => {
  it('o nome, o subtítulo que diz o que ela é, e pede o PS.02 ao banco', async () => {
    await abre();
    expect(ler).toHaveBeenCalledWith('PS.02');
    expect(screen.getByRole('heading', { level: 2, name: NOME_DA_PAGINA })).toBeTruthy();
    expect(screen.getByText(/O procedimento do SGQ que diz como a Campisi compra e contrata/)).toBeTruthy();
  });

  it('cada texto do documento está na página, palavra por palavra', async () => {
    const doc = await abre();
    const naPagina = semEspaco(doc!.textContent!);
    const faltam = textosDe(ps02Rev00()).filter((t) => !naPagina.includes(semEspaco(t)));
    expect(faltam).toEqual([]);
  });

  it('os seis campos do cabeçalho, com a revisão e a data', async () => {
    const doc = await abre();
    const campos = within(doc!.querySelector('dl')!);
    for (const rotulo of ['Código', 'Revisão vigente', 'Data da revisão', 'Responsável pela próxima revisão', 'Referência principal', 'Escopo']) {
      expect(campos.getByText(rotulo)).toBeTruthy();
    }
    expect(campos.getByText(/Rev\. 00/)).toBeTruthy();
    expect(campos.getByText('31/08/2026')).toBeTruthy();
  });

  it('as 7 seções, na ordem, cada uma com a âncora do documento', async () => {
    const doc = await abre();
    const secoes = [...doc!.querySelectorAll('section[id]')].map((s) => s.id);
    expect(secoes).toEqual(['objetivo', 'qualificacao', 'contratacao', 'avaliacao', 'laboratorios', 'registros', 'revisoes']);
    for (const id of ['materiais', 'servicos', 'locacao', 'projetos']) expect(document.getElementById(id)?.tagName).toBe('TR');
  });

  it('o negrito do documento fica negrito ("não conformes", no aviso do PSQ)', async () => {
    const doc = await abre();
    const negritos = [...doc!.querySelectorAll('strong')].map((s) => s.textContent);
    expect(negritos).toContain('não conformes');
    expect(negritos).toContain('FO 8.4.1.1 — Qualificação de Fornecedores');
  });

  it('sem emoji: os cartões do fluxo mostram só o texto', async () => {
    const doc = await abre();
    expect(doc!.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(within(doc!).getByRole('button', { name: /^Material controlado/ })).toBeTruthy();
  });

  it('o "?" de cada uma das 7 seções abre o texto dele', async () => {
    const doc = await abre();
    const p = ps02Rev00();
    for (const s of p.secoes) {
      fireEvent.click(within(doc!).getByRole('button', { name: `Ajuda: O que diz o item ${s.numero}` }));
      expect(within(doc!).getByRole('note').textContent).toContain(s.ajuda);
      fireEvent.click(within(doc!).getByRole('button', { name: 'Fechar' }));
    }
  });

  it('o histórico é a tabela da seção 7, com as colunas do documento', async () => {
    await abre();
    const h = document.querySelector('[data-historico]') as HTMLElement;
    expect(h.closest('section')?.id).toBe('revisoes');
    const colunas = [...h.querySelectorAll('th')].map((t) => t.textContent);
    expect(colunas).toEqual(['Revisão', 'Data', 'Descrição', 'Resp. revisão', 'Análise crítica / aprovação']);
    expect(h.querySelector('tbody')!.textContent).toContain('Emissão inicial.');
  });
});

describe('os pulos: o sumário, os cartões e o caminho das outras telas', () => {
  it('o cartão leva à linha da tabela, como no documento, e a marca', async () => {
    const doc = await abre();
    fireEvent.click(within(doc!).getByRole('button', { name: /^Projeto \/ engenharia/ }));
    const linha = document.getElementById('projetos')!;
    expect(rolou.mock.contexts.at(-1)).toBe(linha);
    expect(linha.hasAttribute('data-alvo')).toBe(true);
    // O próximo pulo tira a marca do anterior.
    fireEvent.click(within(doc!).getByRole('button', { name: /^Laboratório/ }));
    expect(linha.hasAttribute('data-alvo')).toBe(false);
    expect(document.getElementById('laboratorios')!.hasAttribute('data-alvo')).toBe(true);
  });

  it('o sumário diz o que o documento diz e leva à seção', async () => {
    await abre();
    const nav = screen.getByRole('navigation', { name: 'Sumário do procedimento' });
    expect(within(nav).getAllByRole('button').map((b) => b.textContent)).toEqual([
      '1. Objetivo',
      '2. Qualificação',
      '3. Contratação',
      '4. Avaliação',
      '5. Laboratórios',
      '6. Registros',
      '7. Revisões',
    ]);
    fireEvent.click(within(nav).getByRole('button', { name: '4. Avaliação' }));
    expect(rolou.mock.contexts.at(-1)).toBe(document.getElementById('avaliacao'));
  });

  it('o "ver no PS.02, item 2" de outra tela abre a página no item, e a âncora se gasta', async () => {
    act(() => useUiStore.getState().abrirProcedimento('qualificacao'));
    await abre();
    await waitFor(() => expect(rolou.mock.contexts.at(-1)).toBe(document.getElementById('qualificacao')));
    expect(useUiStore.getState().ancoraDoProcedimento).toBeNull();
  });
});

describe('o que falta, a página diz', () => {
  it('sem o procedimento no banco, uma linha', async () => {
    await abre(null);
    expect(await screen.findByText(SEM_PROCEDIMENTO)).toBeTruthy();
  });

  it('a leitura falhou: diz, e tenta de novo', async () => {
    ler.mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce(ps02Rev00());
    render(<ProcedimentoPage />);
    expect((await screen.findByRole('alert')).textContent).toContain(FALHA_AO_LER);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('heading', { name: ps02Rev00().titulo })).toBeTruthy();
  });

  it('o histórico não lido não vira tabela vazia', async () => {
    await abre({ ...ps02Rev00(), revisoes: null });
    expect(document.querySelector('[data-historico]')).toBeNull();
    expect(screen.getByText('O histórico de revisões ainda não foi carregado.')).toBeTruthy();
  });
});
