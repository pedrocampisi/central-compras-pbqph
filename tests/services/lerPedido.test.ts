import { beforeEach, describe, expect, it, vi } from 'vitest';

// A última porta (extractItems) fala com o servidor: aqui o fetch é FALSO, e o
// teste prova que página demais nem chega a chamá-lo.
vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'falso' } } }) } },
  core: () => ({}),
  compras: () => ({}),
}));

import { ErroDaImportacao, lerPedido, type DepsDaLeitura } from '../../src/services/ai/lerPedido';
import { extractItemsFromImages } from '../../src/services/ai/extractItems';
import type { Item } from '../../src/domain/types';

const pdf = (nome: string) => new File(['%PDF'], nome, { type: 'application/pdf' });
const png = (nome = 'image.png') => new File(['png'], nome, { type: 'image/png' });

/** Páginas por nome de arquivo; imagem = 1. Cada página vira "nome#n". */
function depsFalsas(paginasPorNome: Record<string, number> = {}) {
  const enviar = vi.fn<(imagens: string[]) => Promise<Item[]>>(async () => []);
  const desenhar = vi.fn();
  const abrir = vi.fn<DepsDaLeitura['abrir']>(async (f, tipo) => {
    const n = tipo === 'imagem' ? 1 : (paginasPorNome[f.name] ?? 1);
    return {
      paginas: n,
      imagens: async () => {
        desenhar(f.name);
        return Array.from({ length: n }, (_, i) => `${f.name}#${i + 1}`);
      },
    };
  });
  return { deps: { abrir, enviar }, abrir, enviar, desenhar };
}

describe('D554 — tipo errado não chega ao servidor', () => {
  it('um .docx: nada é aberto, nada é enviado, e a mensagem diz o que serve', async () => {
    const { deps, abrir, enviar } = depsFalsas();
    const doc = new File(['x'], 'pedido.docx', { type: 'application/msword' });
    await expect(lerPedido([doc], deps)).rejects.toThrow(/PDF, JPG ou PNG/);
    expect(abrir).not.toHaveBeenCalled();
    expect(enviar).not.toHaveBeenCalled();
  });

  it('um bom e um ruim juntos: o ruim barra a leitura inteira', async () => {
    const { deps, enviar } = depsFalsas();
    const err = await lerPedido([pdf('a.pdf'), new File(['x'], 'b.webp', { type: 'image/webp' })], deps).catch((e) => e);
    expect(err).toBeInstanceOf(ErroDaImportacao);
    expect((err as Error).message).toContain('"b.webp" não serve');
    expect(enviar).not.toHaveBeenCalled();
  });
});

describe('D554 — mais de 5 páginas não chega ao servidor', () => {
  it('um PDF de 6 páginas: nada é lido (antes, a sexta sumia em silêncio)', async () => {
    const { deps, enviar } = depsFalsas({ 'pedido.pdf': 6 });
    await expect(lerPedido([pdf('pedido.pdf')], deps)).rejects.toThrow('Chegaram 6 páginas');
    expect(enviar).not.toHaveBeenCalled();
  });

  it('a conta é pelo total: três PDFs de 2 páginas são 6', async () => {
    const { deps, enviar } = depsFalsas({ 'a.pdf': 2, 'b.pdf': 2, 'c.pdf': 2 });
    await expect(lerPedido([pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')], deps)).rejects.toThrow('Chegaram 6 páginas');
    expect(enviar).not.toHaveBeenCalled();
  });

  it('a conta vem ANTES de desenhar: passou do limite, nenhuma página é desenhada', async () => {
    const { deps, desenhar } = depsFalsas({ 'grande.pdf': 40 });
    await expect(lerPedido([pdf('grande.pdf')], deps)).rejects.toThrow('Chegaram 40 páginas');
    expect(desenhar).not.toHaveBeenCalled();
  });

  it('seis prints colados de uma vez: 6 páginas, nada enviado', async () => {
    const { deps, enviar } = depsFalsas();
    await expect(lerPedido(Array.from({ length: 6 }, () => png()), deps)).rejects.toThrow('Chegaram 6 páginas');
    expect(enviar).not.toHaveBeenCalled();
  });

  it('o arquivo que desenha mais páginas do que contou também não passa', async () => {
    const enviar = vi.fn(async () => [] as Item[]);
    const deps: DepsDaLeitura = {
      abrir: async () => ({ paginas: 1, imagens: async () => ['1', '2', '3', '4', '5', '6'] }),
      enviar,
    };
    await expect(lerPedido([pdf('mentiroso.pdf')], deps)).rejects.toThrow('Chegaram 6 páginas');
    expect(enviar).not.toHaveBeenCalled();
  });

  it('a última porta (extractItems) também recusa 6 imagens — sem chamar o servidor', async () => {
    const fetchFalso = vi.fn();
    vi.stubGlobal('fetch', fetchFalso);
    await expect(extractItemsFromImages(['1', '2', '3', '4', '5', '6'])).rejects.toThrow('Chegaram 6 páginas');
    expect(fetchFalso).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('D554 — vários arquivos de uma vez viram UMA leitura, como páginas', () => {
  let d: ReturnType<typeof depsFalsas>;
  beforeEach(() => {
    d = depsFalsas({ 'pedido.pdf': 3 });
  });

  it('um PDF de 3 páginas e dois prints: uma chamada, 5 páginas, na ordem em que chegaram', async () => {
    await lerPedido([pdf('pedido.pdf'), png('p1.png'), png('p2.png')], d.deps);
    expect(d.enviar).toHaveBeenCalledTimes(1);
    expect(d.enviar.mock.calls[0]![0]).toEqual(['pedido.pdf#1', 'pedido.pdf#2', 'pedido.pdf#3', 'p1.png#1', 'p2.png#1']);
  });

  it('exatamente 5 páginas passa; o que o servidor devolve é o que volta', async () => {
    const item = { descricao: 'Cimento' } as Item;
    d.enviar.mockResolvedValueOnce([item]);
    await expect(lerPedido([pdf('pedido.pdf'), png(), png()], d.deps)).resolves.toEqual([item]);
  });

  it('arquivo que não abre: a mensagem diz qual, e nada é enviado', async () => {
    const enviar = vi.fn(async () => [] as Item[]);
    const deps: DepsDaLeitura = { abrir: async () => { throw new Error('corrompido'); }, enviar };
    await expect(lerPedido([pdf('quebrado.pdf')], deps)).rejects.toThrow('Não foi possível abrir "quebrado.pdf"');
    expect(enviar).not.toHaveBeenCalled();
  });

  it('nenhum arquivo: nada é enviado', async () => {
    await expect(lerPedido([], d.deps)).rejects.toBeInstanceOf(ErroDaImportacao);
    expect(d.enviar).not.toHaveBeenCalled();
  });
});
