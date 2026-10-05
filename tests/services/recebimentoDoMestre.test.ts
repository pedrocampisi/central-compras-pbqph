import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecusaDefinitiva, avaliacaoDoMestre } from '../../src/domain/recebimento';
import type { Avaliacao } from '../../src/domain/qualificacao';

/**
 * CTO-D696 §5.2: a ligação da tela do mestre ao contrato do Banco (carta D697
 * do Banco, §2 e §4), contra um banco FALSO e funções de borda FALSAS (o
 * `fetch` deste teste, num endereço `.invalid`). Nada chega ao banco de
 * verdade. Pedido, obra e pessoas são inventados.
 */

const banco = vi.hoisted(() => ({
  rpc: [] as { esquema: string; nome: string; args: Record<string, unknown> }[],
  /** As respostas, na ordem; acabou a fila, a última se repete. */
  respostas: [] as { data: unknown; error: null | { code: string; message: string }; status: number }[],
  tabelas: {} as Record<string, Record<string, unknown>[]>,
}));

/**
 * A chamada de função do Supabase: aceita `order` e `range` (a lista vai por
 * página) e responde ao ser esperada. Lista vem com a contagem, como a API
 * manda quando se pede.
 */
function rpcFalso(esquema: string) {
  return (nome: string, args: Record<string, unknown> = {}) => {
    banco.rpc.push({ esquema, nome, args });
    const c = {
      order: () => c,
      range: () => c,
      then: (ok: (r: unknown) => unknown, falhou?: (e: unknown) => unknown) => {
        const r = banco.respostas.length > 1 ? banco.respostas.shift()! : banco.respostas[0]!;
        return Promise.resolve(Array.isArray(r.data) ? { ...r, count: r.data.length } : r).then(ok, falhou);
      },
    };
    return c;
  };
}

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'token-de-teste' } } }) } },
  core: () => ({
    rpc: rpcFalso('core'),
    from: (t: string) => ({
      select: () => ({
        in: async (_c: string, ids: string[]) => ({
          data: (banco.tabelas[t] ?? []).filter((l) => ids.includes(String(l['id']))),
          error: null,
        }),
      }),
    }),
  }),
  compras: () => ({ rpc: rpcFalso('compras') }),
}));

import {
  arquivarFotoDoRecebimento, cartaoDaLinha, descartarSemPedido, lerLinksDasFotos, ligarSemPedido, lerMaterialAChegar, lerNumeroDaNotaNaFoto,
  registrarEntregaDoMestre, registrarSemPedidoDoMestre, semPedidoDaLinha,
} from '../../src/services/supabase/recebimento';

const ENDERECO = 'https://banco-de-teste.invalid';

const funcao = vi.hoisted(() => ({
  responde: [] as ({ status: number; corpo: unknown } | 'cai')[],
  chamadas: [] as { url: string; corpo: Record<string, unknown>; auth: string }[],
}));
const fetchFalso = vi.fn(async (url: string, init: RequestInit) => {
  funcao.chamadas.push({
    url,
    corpo: JSON.parse(String(init.body)) as Record<string, unknown>,
    auth: (init.headers as Record<string, string>)['Authorization'] ?? '',
  });
  const r = funcao.responde.length > 1 ? funcao.responde.shift()! : funcao.responde[0]!;
  if (r === 'cai') throw new TypeError('Failed to fetch');
  return new Response(JSON.stringify(r.corpo), { status: r.status, headers: { 'Content-Type': 'application/json' } });
});

const ok = (data: unknown) => ({ data, error: null, status: 200 });
const recusa = (code: string, message: string, status = 400) => ({ data: null, error: { code, message }, status });

const AVALIACAO: Avaliacao = {
  notaFiscal: ' 000123 ',
  recebidoEm: '2026-10-05',
  prazoConforme: true,
  integridadeConforme: false,
  ocEcrConforme: true,
  observacao: 'Dois sacos rasgados',
  tratativa: '',
};

let n = 0;
const chave = () => `chave-de-teste-${++n}`;
const FOTO = () => new File([new Uint8Array([1, 2, 3, 4])], 'nota.jpg', { type: 'image/jpeg' });
const ARQUIVADA = { status: 200, corpo: { desfecho: 'arquivado', documento: { id: 'doc-1' }, ja_existia: false } };

const entrega = (extra: Partial<Parameters<typeof registrarEntregaDoMestre>[0]> = {}) => ({
  chave: chave(),
  ocId: 'oc-1',
  intervencaoId: 'obra-1',
  avaliacao: AVALIACAO,
  soUmaParte: false,
  foto: null,
  ...extra,
});

beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', ENDERECO);
  vi.stubGlobal('fetch', fetchFalso);
  fetchFalso.mockClear();
  funcao.responde = [ARQUIVADA];
  funcao.chamadas.length = 0;
  banco.rpc.length = 0;
  banco.respostas = [ok({ desfecho: 'registrada', ja_estava: false })];
  banco.tabelas = {};
});

describe('a lista do mestre (compras.material_a_chegar)', () => {
  it('a linha vira o cartão: o apelido, o dia combinado, os itens, o total e a obra', () => {
    const c = cartaoDaLinha({
      oc_id: 'oc-1', numero: '2026/101', versao: 3, data: '2026-10-01', entrega_prevista: '2026-10-06',
      intervencao_id: 'obra-1', obra: 'Obra de Teste', fornecedor: 'Fornecedor de Teste', valor_total: '1540.5',
      itens: [{ posicao: 1, descricao: 'Cimento de teste', quantidade: 40, unidade: 'sc', preco_unit: 38.5 }],
      entregas: 0, ultima_entrega: null,
    });
    expect(c).toEqual({
      ocId: 'oc-1', intervencaoId: 'obra-1', obra: 'Obra de Teste', numero: '2026/101',
      fornecedor: 'Fornecedor de Teste', combinadoPara: '2026-10-06', total: 1540.5,
      itens: [{ descricao: 'Cimento de teste', quantidade: 40, unidade: 'sc' }],
    });
  });

  it('sem dia combinado, o cartão fica sem dia (e não "null")', () => {
    expect(cartaoDaLinha({ oc_id: 'oc-1', entrega_prevista: null, itens: null }).combinadoPara).toBe('');
  });

  it('lê a lista e as obras dele numa volta só', async () => {
    banco.respostas = [
      ok([{ oc_id: 'oc-1', intervencao_id: 'obra-1', obra: 'Obra de Teste', itens: [] }]),
      ok([{ intervencao_id: 'obra-2', obra: 'Obra A' }, { intervencao_id: 'obra-1', obra: 'Obra de Teste' }, { obra: 'sem id' }]),
    ];
    const l = await lerMaterialAChegar();
    expect(banco.rpc.map((r) => `${r.esquema}.${r.nome}`)).toEqual(['compras.material_a_chegar', 'core.obras_do_mestre_com_nome']);
    expect(l.cartoes.map((c) => c.ocId)).toEqual(['oc-1']);
    expect(l.obras).toEqual([{ id: 'obra-2', nome: 'Obra A' }, { id: 'obra-1', nome: 'Obra de Teste' }]);
  });
});

describe('a entrega do mestre (compras.registrar_entrega)', () => {
  it('vai SEM versão, com a chave do envio, o "chegou tudo" e as três respostas', async () => {
    const e = entrega({ soUmaParte: true });
    expect(await registrarEntregaDoMestre(e)).toBe('');
    expect(banco.rpc).toEqual([{
      esquema: 'compras',
      nome: 'registrar_entrega',
      args: {
        p_oc_id: 'oc-1',
        p_versao: null,
        p: {
          nota_fiscal: '000123', recebido_em: '2026-10-05', prazo_conforme: true, integridade_conforme: false,
          oc_ecr_conforme: true, observacao: 'Dois sacos rasgados', chegou_tudo: false, chave: e.chave,
        },
      },
    }]);
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('dois "Não": o que o mestre contou vai em `tratativa`, inteiro, e a observação fica de fora (perícia 05/10, achado 7: é este campo que o banco leva ao sem pedido)', async () => {
    const r = { noDia: false, semEstrago: false, oQueFoiPedido: true, tudo: true };
    const avaliacao = avaliacaoDoMestre(r, '4567', '  Quatro sacos rasgados e chegou dois dias depois  ', '2026-10-05');
    await registrarEntregaDoMestre(entrega({ avaliacao }));
    const p = banco.rpc[0]!.args['p'] as Record<string, unknown>;
    expect(p['tratativa']).toBe('Quatro sacos rasgados e chegou dois dias depois');
    expect(p).not.toHaveProperty('observacao');
  });

  it('com foto: a foto vai primeiro, para a pasta da obra, e o id dela vai na entrega', async () => {
    const e = entrega({ foto: FOTO() });
    await registrarEntregaDoMestre(e);
    expect(funcao.chamadas).toHaveLength(1);
    const f = funcao.chamadas[0]!;
    expect(f.url).toBe(`${ENDERECO}/functions/v1/arquivar-documento`);
    expect(f.auth).toBe('Bearer token-de-teste');
    expect(f.corpo).toMatchObject({
      origem: 'recebimento-obra', intervencao_id: 'obra-1', mime: 'image/jpeg', origem_id: e.chave,
      arquivo_base64: btoa(String.fromCharCode(1, 2, 3, 4)),
    });
    // a foto do mestre não leva identidade de nota (Banco D697 §2.5)
    expect(f.corpo).not.toHaveProperty('extracao');
    expect(f.corpo).not.toHaveProperty('chave_acesso');
    expect((banco.rpc[0]!.args['p'] as Record<string, unknown>)['foto_documento_id']).toBe('doc-1');
  });

  it('a OC foi cancelada antes de o envio chegar: devolve o recado do banco para a tela (D699 §2)', async () => {
    const msg = 'A OC 2026/101 foi cancelada antes deste recebimento chegar. Ele foi para o escritório resolver.';
    banco.respostas = [ok({ desfecho: 'na_fila', ja_estava: false, sem_pedido_id: 7, oc_id: 'oc-1', mensagem: msg })];
    expect(await registrarEntregaDoMestre(entrega())).toBe(msg);
  });

  it('"já estava" (a resposta se perdeu e o celular mandou de novo) é sucesso', async () => {
    banco.respostas = [ok({ desfecho: 'registrada', ja_estava: true, avaliacao_id: 9 })];
    await expect(registrarEntregaDoMestre(entrega())).resolves.toBe('');
  });

  it('23505 manda de novo UMA vez, com a mesma chave; a segunda volta "já estava"', async () => {
    banco.respostas = [recusa('23505', 'duplicate key'), ok({ desfecho: 'registrada', ja_estava: true })];
    const e = entrega();
    await expect(registrarEntregaDoMestre(e)).resolves.toBe('');
    expect(banco.rpc).toHaveLength(2);
    expect(banco.rpc.map((r) => (r.args['p'] as Record<string, unknown>)['chave'])).toEqual([e.chave, e.chave]);
  });

  it('23505 duas vezes: para', async () => {
    banco.respostas = [recusa('23505', 'duplicate key')];
    await expect(registrarEntregaDoMestre(entrega())).rejects.toBeInstanceOf(RecusaDefinitiva);
    expect(banco.rpc).toHaveLength(2);
  });

  it.each([
    ['42501', 'Este pedido não é da sua obra.'],
    ['42501', 'Seu acesso foi desligado. Fale com o engenheiro da obra.'],
    ['22023', 'Falta o numero da nota.'],
    ['55000', 'So\' OC emitida recebe entrega.'],
    ['P0002', 'Nao existe ordem de compra.'],
  ])('%s para, e a mensagem vai como veio: "%s"', async (code, message) => {
    banco.respostas = [recusa(code, message)];
    const erro = await registrarEntregaDoMestre(entrega()).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(RecusaDefinitiva);
    expect((erro as Error).message).toBe(message);
    expect(banco.rpc).toHaveLength(1);
  });

  it.each([
    ['sem rede', '', 0],
    ['servidor fora', '', 503],
    ['conflito de transação', '40001', 409],
    ['tempo esgotado no banco', '57014', 500],
    ['o crachá venceu', 'PGRST301', 401],
  ])('%s: erro comum, e a fila espera (não é RecusaDefinitiva)', async (_n, code, status) => {
    banco.respostas = [recusa(code, 'falhou', status)];
    const erro = await registrarEntregaDoMestre(entrega()).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(Error);
    expect(erro).not.toBeInstanceOf(RecusaDefinitiva);
  });
});

describe('a foto da nota (arquivar-documento)', () => {
  it('sem permissão na obra (403): para, com a frase da função', async () => {
    funcao.responde = [{ status: 403, corpo: { erro: 'Sem permissão para registrar recebimento nesta obra.' } }];
    const erro = await arquivarFotoDoRecebimento(FOTO(), 'obra-1', chave()).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(RecusaDefinitiva);
    expect((erro as Error).message).toBe('Sem permissão para registrar recebimento nesta obra.');
  });

  it('sem rede, ou o servidor fora: espera', async () => {
    for (const r of ['cai', { status: 502, corpo: {} }] as const) {
      funcao.responde = [r];
      const erro = await arquivarFotoDoRecebimento(FOTO(), 'obra-1', chave()).catch((e: unknown) => e);
      expect(erro).not.toBeInstanceOf(RecusaDefinitiva);
    }
  });

  it('a entrega falhou depois de a foto subir: a nova tentativa não sobe a foto de novo', async () => {
    banco.respostas = [recusa('', 'Failed to fetch', 0), ok({ desfecho: 'registrada', ja_estava: false })];
    const e = entrega({ foto: FOTO() });
    await expect(registrarEntregaDoMestre(e)).rejects.not.toBeInstanceOf(RecusaDefinitiva);
    await registrarEntregaDoMestre(e);
    expect(funcao.chamadas).toHaveLength(1);
    expect(banco.rpc).toHaveLength(2);
  });

  it('foto num formato que o arquivo não aceita, onde o navegador não converte: para, e pede outra', async () => {
    const heic = new File([new Uint8Array([9])], 'nota.heic', { type: 'image/heic' });
    await expect(arquivarFotoDoRecebimento(heic, 'obra-1', chave())).rejects.toBeInstanceOf(RecusaDefinitiva);
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('o número lido na foto, pela ler-documento com a origem da OC; sem leitura, vazio, sem erro', async () => {
    funcao.responde = [{ status: 200, corpo: { numero_documento: ' 4567 ' } }];
    expect(await lerNumeroDaNotaNaFoto(FOTO())).toBe('4567');
    expect(funcao.chamadas[0]!.url).toBe(`${ENDERECO}/functions/v1/ler-documento`);
    expect(funcao.chamadas[0]!.corpo).toMatchObject({ origem: 'ordem-compra', mime: 'image/jpeg' });
    funcao.responde = ['cai'];
    expect(await lerNumeroDaNotaNaFoto(FOTO())).toBe('');
    funcao.responde = [{ status: 503, corpo: { erro: 'Serviço de leitura não configurado.' } }];
    expect(await lerNumeroDaNotaNaFoto(FOTO())).toBe('');
  });
});

describe('o sem pedido do mestre (compras.registrar_sem_pedido)', () => {
  it('vai com a obra, o dia do "Pronto", a chave, e só o que ele preencheu', async () => {
    banco.respostas = [ok({ desfecho: 'na_fila', ja_estava: false, sem_pedido_id: 3 })];
    const k = chave();
    await registrarSemPedidoDoMestre({
      chave: k, intervencaoId: 'obra-2', recebidoEm: '2026-10-04', foto: null,
      numeroDaNota: ' 789 ', deQuem: '', oQueChegou: ' Areia ', comEstrago: false,
    });
    expect(banco.rpc).toEqual([{
      esquema: 'compras',
      nome: 'registrar_sem_pedido',
      args: { p: { intervencao_id: 'obra-2', recebido_em: '2026-10-04', o_que_chegou: 'Areia', chegou_com_estrago: false, nota_fiscal: '789', chave: k } },
    }]);
  });

  it('"Esta obra não é a sua." para', async () => {
    banco.respostas = [recusa('42501', 'Esta obra não é a sua.')];
    await expect(registrarSemPedidoDoMestre({
      chave: chave(), intervencaoId: 'obra-9', recebidoEm: '2026-10-04', foto: null,
      numeroDaNota: '1', deQuem: '', oQueChegou: 'Areia', comEstrago: false,
    })).rejects.toThrow(new RecusaDefinitiva('Esta obra não é a sua.'));
  });
});

describe('o escritório: a fila do sem pedido', () => {
  it('a linha da vista vira o registro, com a OC que o mestre informou', () => {
    const s = semPedidoDaLinha({
      id: 5, intervencao_id: 'obra-1', obra: 'Obra de Teste', recebido_em: '2026-10-04', fornecedor_texto: null,
      nota_fiscal: '789', o_que_chegou: 'Areia', chegou_com_estrago: true, observacao: null, foto_documento_id: 'doc-2',
      registrado_por_nome: 'Mestre de Teste', criado_em: '2026-10-04T13:00:00Z', oc_informada_id: 'oc-1',
      oc_informada_numero: '2026/101',
    });
    expect(s).toMatchObject({
      id: 5, obra: 'Obra de Teste', fornecedorTexto: '', chegouComEstrago: true, fotoDocumentoId: 'doc-2',
      ocInformadaNumero: '2026/101', registradoPorNome: 'Mestre de Teste',
    });
  });

  it('o link de cada foto vem do OneDrive da obra; sem link, fica de fora', async () => {
    banco.tabelas['documentos'] = [
      { id: 'doc-1', onedrive_url: 'https://pasta-de-teste.invalid/1.jpg' },
      { id: 'doc-2', onedrive_url: null },
    ];
    const m = await lerLinksDasFotos(['doc-1', 'doc-2', 'doc-1', '']);
    expect([...m]).toEqual([['doc-1', 'https://pasta-de-teste.invalid/1.jpg']]);
  });
});

describe('o escritório: ligar e descartar, com as chaves do contrato (Banco D697 §2)', () => {
  const ligacao = {
    ocId: 'oc-1', versao: 7, notaFiscal: '', prazoConforme: true, ocEcrConforme: false, chegouTudo: false,
    tratativa: ' ', observacao: '  conferido  ',
  };

  it('ligar: o id, a OC, a VERSÃO (obrigatória no escritório) e as respostas; vazios não vão', async () => {
    banco.respostas = [{ data: { desfecho: 'ligado' }, error: null, status: 200 }];
    await ligarSemPedido(5, ligacao);
    expect(banco.rpc.at(-1)).toEqual({
      esquema: 'compras', nome: 'ligar_sem_pedido',
      args: {
        p_id: 5, p_oc_id: 'oc-1', p_versao: 7,
        p: { prazo_conforme: true, oc_ecr_conforme: false, chegou_tudo: false, observacao: 'conferido' },
      },
    });
  });

  it('ligar: a nota que o escritório escreveu vai (o mestre mandou só a foto); e a tratativa', async () => {
    banco.respostas = [{ data: { desfecho: 'ligado' }, error: null, status: 200 }];
    await ligarSemPedido(5, { ...ligacao, notaFiscal: ' 4321 ', tratativa: 'devolvido' });
    expect(banco.rpc.at(-1)!.args['p']).toMatchObject({ nota_fiscal: '4321', tratativa: 'devolvido' });
  });

  it('a recusa do banco sobe com a frase dele', async () => {
    banco.respostas = [{ data: null, error: { code: '22023', message: 'A OC é de outra obra.' }, status: 400 }];
    await expect(ligarSemPedido(5, ligacao)).rejects.toThrow('A OC é de outra obra.');
    await expect(descartarSemPedido(5, 'x')).rejects.toThrow('A OC é de outra obra.');
  });

  it('descartar: o id e o motivo, sem espaço nas pontas', async () => {
    banco.respostas = [{ data: null, error: null, status: 204 }];
    await descartarSemPedido(5, '  registrado em dobro ');
    expect(banco.rpc.at(-1)).toEqual({
      esquema: 'compras', nome: 'descartar_sem_pedido', args: { p_id: 5, p_motivo: 'registrado em dobro' },
    });
  });
});
