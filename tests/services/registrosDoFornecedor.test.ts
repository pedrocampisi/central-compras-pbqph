import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CTO-D812/D813 §4 — o registro do fornecedor pelo escritório, ligado aos
 * nomes do Banco (`d812-parte-c-registros-do-fornecedor`), contra um banco
 * FALSO e funções de borda FALSAS (o `fetch` deste teste, num endereço
 * `.invalid`). Nada chega ao banco de verdade. Empresas, OCs e pessoas são
 * inventadas.
 */

const banco = vi.hoisted(() => ({
  tabelas: {} as Record<string, Record<string, unknown>[]>,
  lidas: [] as string[],
  rpc: [] as { nome: string; args: Record<string, unknown> }[],
  resposta: { data: null as unknown, error: null as null | { code?: string; message: string } },
  falha: {} as Record<string, { message: string }>,
}));

/** A leitura: aceita `select`, `order` e `range`, e responde com a contagem, como a API. */
function tabela(nome: string) {
  banco.lidas.push(nome);
  const c = {
    select: () => c,
    order: () => c,
    range: () => c,
    then: (ok: (r: unknown) => unknown, falhou?: (e: unknown) => unknown) => {
      const erro = banco.falha[nome];
      const linhas = banco.tabelas[nome] ?? [];
      return Promise.resolve(erro ? { data: null, error: erro } : { data: linhas, error: null, count: linhas.length })
        .then(ok, falhou);
    },
  };
  return c;
}

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'token-de-teste' } } }) } },
  core: () => ({}),
  compras: () => ({
    from: tabela,
    rpc: async (nome: string, args: Record<string, unknown>) => {
      banco.rpc.push({ nome, args });
      return banco.resposta;
    },
  }),
}));

import {
  arquivarPapelDoFornecedor,
  carregarRegistrosDoFornecedor,
  corrigirRegistroDoFornecedor,
  guardarRegistroDoFornecedor,
  lerPapelDoFornecedor,
  prepararPapel,
} from '../../src/services/supabase/registrosDoFornecedor';

const ENDERECO = 'https://banco-de-teste.invalid';
const funcao = vi.hoisted(() => ({
  responde: { status: 200, corpo: {} as unknown },
  chamadas: [] as { url: string; corpo: Record<string, unknown> }[],
}));
const fetchFalso = vi.fn(async (url: string, init: RequestInit) => {
  funcao.chamadas.push({ url, corpo: JSON.parse(String(init.body)) as Record<string, unknown> });
  return new Response(JSON.stringify(funcao.responde.corpo), {
    status: funcao.responde.status,
    headers: { 'Content-Type': 'application/json' },
  });
});

beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', ENDERECO);
  vi.stubGlobal('fetch', fetchFalso);
  funcao.chamadas.length = 0;
  funcao.responde = { status: 200, corpo: {} };
  banco.tabelas = {};
  banco.lidas.length = 0;
  banco.rpc.length = 0;
  banco.resposta = { data: null, error: null };
  banco.falha = {};
});

describe('ler: os papéis, as correções e a marca', () => {
  it('as três tabelas do Banco, com as correções presas ao papel, na ordem', async () => {
    banco.tabelas = {
      registros_do_fornecedor: [
        {
          id: 7, documento_id: 'doc-7', ecr_id: 6, empresa_raiz_id: 'raiz-1', fornecedor_id: null, alcance: 'vale_ate',
          valido_ate: '2027-06-30', oc_id: null, entrou_por: 'qualificacao', conferido_por_nome: 'Comprador de Teste',
          conferido_em: '2026-10-10T12:00:00+00:00',
        },
        {
          id: 8, documento_id: 'doc-8', ecr_id: 2, empresa_raiz_id: null, fornecedor_id: 'forn-2', alcance: 'lote',
          valido_ate: null, oc_id: 'oc-2', entrou_por: 'recebimento', conferido_por_nome: 'Encarregado de Teste',
          conferido_em: '2026-10-11T12:00:00+00:00', avaliacao_id: 31,
        },
        {
          id: 9, documento_id: 'doc-9', ecr_id: 2, empresa_raiz_id: null, fornecedor_id: 'forn-2', alcance: 'lote',
          valido_ate: null, oc_id: 'oc-3', entrou_por: 'entrega', conferido_por_nome: 'Comprador de Teste',
          conferido_em: '2026-10-12T12:00:00+00:00', avaliacao_id: 32,
        },
      ],
      registros_do_fornecedor_correcoes: [
        {
          registro_id: 7, alcance_antes: 'lote', valido_ate_antes: null, alcance_depois: 'produto', valido_ate_depois: null,
          motivo: null, corrigido_por_nome: 'Comprador de Teste', corrigido_em: '2026-10-12T12:00:00+00:00',
        },
        {
          registro_id: 7, alcance_antes: 'produto', valido_ate_antes: null, alcance_depois: 'vale_ate',
          valido_ate_depois: '2027-06-30', motivo: 'a licença tem prazo', corrigido_por_nome: 'Comprador de Teste',
          corrigido_em: '2026-10-13T12:00:00+00:00',
        },
      ],
      ecrs_registro_a_cada_entrega: [{ ecr_id: 2, porque: 'acompanha cada carga (teste)' }],
    };
    const r = await carregarRegistrosDoFornecedor();
    expect(banco.lidas.sort()).toEqual(
      ['ecrs_registro_a_cada_entrega', 'registros_do_fornecedor', 'registros_do_fornecedor_correcoes'],
    );
    expect(r.marcas).toEqual([{ ecrId: 2, porque: 'acompanha cada carga (teste)' }]);
    expect(r.registros[0]).toMatchObject({
      id: 7, documentoId: 'doc-7', ecrId: 6, empresaRaizId: 'raiz-1', fornecedorId: null, alcance: 'vale_ate',
      validoAte: '2027-06-30', ocId: '', avaliacaoId: 0, entrouPor: 'qualificacao',
    });
    expect(r.registros[0]!.correcoes.map((c) => [c.alcanceAntes, c.alcanceDepois, c.validoAteDepois, c.motivo])).toEqual([
      ['lote', 'produto', '', ''],
      ['produto', 'vale_ate', '2027-06-30', 'a licença tem prazo'],
    ]);
    expect(r.registros[1]).toMatchObject({ fornecedorId: 'forn-2', alcance: 'lote', validoAte: '', ocId: 'oc-2', avaliacaoId: 31, correcoes: [] });
    // O papel anexado pela lista das entregas sem papel (o pedido 3 da D840 ao Banco).
    expect(r.registros[2]).toMatchObject({ ocId: 'oc-3', avaliacaoId: 32, entrouPor: 'entrega' });
  });

  it('a falha de uma das três sobe, com a frase do banco', async () => {
    banco.falha = { registros_do_fornecedor_correcoes: { message: 'sem permissão (teste)' } };
    await expect(carregarRegistrosDoFornecedor()).rejects.toThrow(
      'Falha ao carregar os registros do fornecedor: sem permissão (teste)',
    );
  });
});

describe('guardar: os nomes da guardar_registro_do_fornecedor', () => {
  it('pela qualificação: a empresa (fornecedor_id), o alcance e a data só no "vale até"', async () => {
    banco.resposta = { data: { registro_id: 41, alcance: 'vale_ate' }, error: null };
    const id = await guardarRegistroDoFornecedor({
      documentoId: 'doc-1', ecrId: 6, alcance: 'vale_ate', validoAte: '2027-06-30', onde: { fornecedorId: 'forn-1' },
    });
    expect(id).toBe(41);
    expect(banco.rpc).toEqual([{
      nome: 'guardar_registro_do_fornecedor',
      args: { p: { documento_id: 'doc-1', ecr_id: 6, alcance: 'vale_ate', valido_ate: '2027-06-30', fornecedor_id: 'forn-1' } },
    }]);
  });

  it('pela OC: a OC, sem a empresa (o banco tira da OC), e as posições ficam com o banco', async () => {
    await guardarRegistroDoFornecedor({
      documentoId: 'doc-2', ecrId: 1, alcance: 'lote', validoAte: '2027-01-01', onde: { ocId: 'oc-1', fornecedorId: 'forn-1' },
    });
    expect(banco.rpc[0]!.args).toEqual({ p: { documento_id: 'doc-2', ecr_id: 1, alcance: 'lote', oc_id: 'oc-1' } });
  });

  it('pela entrega da lista sem papel: a OC e a entrega (avaliacao_id) que o papel cobre (D840 §2.5)', async () => {
    await guardarRegistroDoFornecedor({
      documentoId: 'doc-3', ecrId: 2, alcance: 'lote', validoAte: '', onde: { ocId: 'oc-1', fornecedorId: 'forn-1', avaliacaoId: 31 },
    });
    expect(banco.rpc[0]!.args).toEqual({ p: { documento_id: 'doc-3', ecr_id: 2, alcance: 'lote', oc_id: 'oc-1', avaliacao_id: 31 } });
  });

  it('a recusa sobe como o banco disse; o papel repetido (23505) em frase de gente', async () => {
    banco.resposta = { data: null, error: { code: '22023', message: 'O registro que vale só para o lote precisa da OC em que chegou.' } };
    await expect(guardarRegistroDoFornecedor({
      documentoId: 'd', ecrId: 1, alcance: 'lote', validoAte: '', onde: { fornecedorId: 'f' },
    })).rejects.toThrow('O registro que vale só para o lote precisa da OC em que chegou.');
    banco.resposta = { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
    await expect(guardarRegistroDoFornecedor({
      documentoId: 'd', ecrId: 1, alcance: 'produto', validoAte: '', onde: { fornecedorId: 'f' },
    })).rejects.toThrow('Este papel já está guardado para esta ECR.');
  });
});

describe('corrigir: os nomes da corrigir_registro_do_fornecedor', () => {
  it('o alcance novo, a data só no "vale até", e o motivo vazio vai nulo', async () => {
    await corrigirRegistroDoFornecedor(7, 'produto', '2027-06-30', '  ');
    await corrigirRegistroDoFornecedor(7, 'vale_ate', '2027-06-30', ' a licença tem prazo ');
    expect(banco.rpc.map((r) => r.args)).toEqual([
      { p_registro_id: 7, p_alcance: 'produto', p_valido_ate: null, p_motivo: null },
      { p_registro_id: 7, p_alcance: 'vale_ate', p_valido_ate: '2027-06-30', p_motivo: 'a licença tem prazo' },
    ]);
    expect(banco.rpc.every((r) => r.nome === 'corrigir_registro_do_fornecedor')).toBe(true);
  });

  it('a recusa do banco sobe como veio', async () => {
    banco.resposta = { data: null, error: { code: '22023', message: 'O registro já está com esse alcance: nada a corrigir.' } };
    await expect(corrigirRegistroDoFornecedor(7, 'lote', '', '')).rejects.toThrow('nada a corrigir');
  });
});

describe('o arquivo e a leitura', () => {
  const PDF = () => new File([new Uint8Array([37, 80, 68, 70])], 'licenca.pdf', { type: 'application/pdf' });

  it('o PDF sobe como está; o grande demais para antes de subir', async () => {
    expect(await prepararPapel(PDF())).toEqual({ base64: 'JVBERg==', mime: 'application/pdf' });
    const grande = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'grande.pdf', { type: 'application/pdf' });
    await expect(prepararPapel(grande)).rejects.toThrow('O PDF passa de 10 MB');
  });

  it('a leitura pela origem registro-ecr, e a resposta inteira guardada em `bruta`', async () => {
    funcao.responde = { status: 200, corpo: { legivel: true, alcance: 'vale_ate', valido_ate: '2027-06-30', confira: '' } };
    const lido = await lerPapelDoFornecedor({ base64: 'JVBERg==', mime: 'application/pdf' });
    expect(funcao.chamadas[0]!.url).toBe(`${ENDERECO}/functions/v1/ler-documento`);
    expect(funcao.chamadas[0]!.corpo).toEqual({ imagem_base64: 'JVBERg==', mime: 'application/pdf', origem: 'registro-ecr' });
    expect(lido).toMatchObject({ alcance: 'vale_ate', validoAte: '2027-06-30' });
    expect(lido!.bruta).toEqual(funcao.responde.corpo);
  });

  it('a leitura que falha não trava: vira nulo', async () => {
    funcao.responde = { status: 502, corpo: { erro: 'fora do ar (teste)' } };
    expect(await lerPapelDoFornecedor({ base64: 'x', mime: 'image/jpeg' })).toBeNull();
  });

  it('o arquivo pela origem qualificacao-fornecedor, com o fornecedor_id e a leitura em `extracao`', async () => {
    funcao.responde = { status: 200, corpo: { desfecho: 'arquivado', documento: { id: 'doc-9' } } };
    const id = await arquivarPapelDoFornecedor(
      { base64: 'JVBERg==', mime: 'application/pdf' }, 'licenca.pdf', 6, { fornecedorId: 'forn-1' }, { alcance: 'vale_ate' },
    );
    expect(id).toBe('doc-9');
    const c = funcao.chamadas[0]!;
    expect(c.url).toBe(`${ENDERECO}/functions/v1/arquivar-documento`);
    expect(c.corpo).toMatchObject({
      arquivo_base64: 'JVBERg==', nome_arquivo: 'licenca.pdf', mime: 'application/pdf',
      origem: 'qualificacao-fornecedor', origem_id: 'forn-1', fornecedor_id: 'forn-1', extracao: { alcance: 'vale_ate' },
    });
    // O item distingue a licença renovada com o mesmo nome: a ECR com dois dígitos, a hora e o nome.
    expect(String(c.corpo['origem_item'])).toMatch(/^registro-ecr-06-\d{4}-\d{2}-\d{2}T.+-licenca\.pdf$/);
    expect(c.corpo).not.toHaveProperty('intervencao_id');
  });

  it('pela OC, o envelope é a OC, e a empresa é a da OC; sem leitura, sem `extracao`', async () => {
    funcao.responde = { status: 200, corpo: { documento: { id: 'doc-10' } } };
    await arquivarPapelDoFornecedor({ base64: 'x', mime: 'image/jpeg' }, 'gca.jpg', 2, { ocId: 'oc-1', fornecedorId: 'forn-1' });
    expect(funcao.chamadas[0]!.corpo).toMatchObject({ origem_id: 'oc-1', fornecedor_id: 'forn-1' });
    expect(funcao.chamadas[0]!.corpo).not.toHaveProperty('extracao');
  });

  it('pela entrega, o envelope é a OC dela (D840 §5, pedido 4)', async () => {
    funcao.responde = { status: 200, corpo: { documento: { id: 'doc-11' } } };
    await arquivarPapelDoFornecedor({ base64: 'x', mime: 'image/jpeg' }, 'gca.jpg', 2, { ocId: 'oc-1', fornecedorId: 'forn-1', avaliacaoId: 31 });
    expect(funcao.chamadas[0]!.corpo).toMatchObject({ origem: 'qualificacao-fornecedor', origem_id: 'oc-1', fornecedor_id: 'forn-1' });
  });

  it('a recusa do arquivo sobe com a frase da função', async () => {
    funcao.responde = { status: 400, corpo: { erro: "O papel da qualificação precisa da empresa ('fornecedor_id')." } };
    await expect(arquivarPapelDoFornecedor({ base64: 'x', mime: 'image/jpeg' }, 'a.jpg', 6, { fornecedorId: '' }))
      .rejects.toThrow('precisa da empresa');
  });
});
