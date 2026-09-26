import { describe, expect, it } from 'vitest';
import {
  agruparPorEmpresa,
  cidadeUf,
  enderecoResumido,
  escolherEmpresa,
  fornecedoresParaOc,
  motivoForaDaOc,
  opcoesDeEmpresa,
  ordemDoCnpj,
  rotuloDaFilial,
} from '../../src/domain/fornecedores';
import { filtrarOpcoes } from '../../src/domain/pesquisa';
import type { Fornecedor } from '../../src/domain/types';

// Um fornecedor de mentira, com só o que estas regras olham. Nenhum dado de
// pessoa: os CNPJs são inventados e as razões sociais também.
function forn(p: Partial<Fornecedor> & { id: string }): Fornecedor {
  return {
    razao_social: 'Fornecedor Qualquer',
    nome_fantasia: '',
    cnpj: '',
    ie: '',
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
    telefones: ['', ''],
    email: '',
    contato_responsavel: '',
    ecrs_atende: [],
    observacoes: '',
    ativo: true,
    criado_em: '',
    atualizado_em: '',
    ...p,
  };
}

describe('fornecedoresParaOc — quem entra na lista da OC', () => {
  it('deixa entrar só quem fornece material E está ativo', () => {
    const lista = fornecedoresParaOc([
      forn({ id: 'a', fornece_material: true }),
      forn({ id: 'b', fornece_material: true, ativo: false }),
      forn({ id: 'c', presta_servico: true }),
      forn({ id: 'd', fornece_material: true, presta_servico: true }),
    ]);
    expect(lista.map((f) => f.id)).toEqual(['a', 'd']);
  });

  it('o indefinido (o banco não classificou) fica de FORA — não é o mesmo que true', () => {
    // É a linha sem bandeira nenhuma do banco, e é qualquer cadastro que entre
    // sem passar pela tela desta casa. Deixar entrar seria a lista suja de volta.
    const lista = fornecedoresParaOc([
      forn({ id: 'sem-bandeira' }),
      forn({ id: 'falso', fornece_material: false }),
    ]);
    expect(lista).toEqual([]);
  });

  it('reproduz a queixa do Pedro: 224 linhas viram 161', () => {
    // As proporções do banco de produção em 14/09/2026, medidas pelo CTO:
    // 161 fornecem material, 62 só prestam serviço, 1 sem bandeira.
    const todos = [
      ...Array.from({ length: 161 }, (_, i) => forn({ id: `m${i}`, fornece_material: true })),
      ...Array.from({ length: 62 }, (_, i) => forn({ id: `s${i}`, presta_servico: true })),
      forn({ id: 'nenhuma' }),
    ];
    expect(todos).toHaveLength(224);
    expect(fornecedoresParaOc(todos)).toHaveLength(161);
  });
});

describe('a empresa e a filial (CTO-D542) — a pessoa lê o apelido, e a filial pelo que ela é', () => {
  // Uma "Império" de mentira: 4 filiais, duas razões sociais, duas cidades, sem
  // rua — como o cadastro de produção em 26/09/2026. CNPJs inventados.
  const end = (cidade: string, uf = 'MG', logradouro = '', numero = '', bairro = '') => ({
    logradouro, numero, complemento: '', bairro, cidade, uf, cep: '',
  });
  const filial = (id: string, empresa: string, apelido: string, razao: string, cnpj: string, e = end('UBERLANDIA')) =>
    forn({ id, empresa_id: empresa, empresa_apelido: apelido, razao_social: razao, cnpj, fornece_material: true, endereco: e });

  const imp1 = filial('i1', 'E-IMP', 'Império das Tintas', 'IMPERIO DAS TINTAS LTDA', '22222222000155');
  const imp27 = filial('i27', 'E-IMP', 'Império das Tintas', 'BEIJA FLOR COMERCIO DE TINTAS LTDA', '22222222002741');
  const imp48 = filial('i48', 'E-IMP', 'Império das Tintas', 'BEIJA FLOR COMERCIO DE TINTAS LTDA', '22222222004813', end('Uberlandia'));
  const impAra = filial('iA', 'E-IMP', 'Império das Tintas', 'BEIJA FLOR COMERCIO DE TINTAS LTDA', '22222222005200', end('ARAGUARI'));
  const arc1 = filial('a1', 'E-ARC', 'ArcelorMittal', 'ARCELORMITTAL BRASIL S.A.', '33333333000100', end('BELO HORIZONTE'));
  const arc3 = filial('a3', 'E-ARC', 'ArcelorMittal', 'ArcelorMittal Brasil S/A', '33333333000372', end('Uberlandia'));
  const cerca1 = filial('c1', 'E-CER1', 'Triângulo Cercas', 'TRIANGULO CERCAS LTDA', '44444444000190');
  const cerca2 = filial('c2', 'E-CER2', 'Triângulo Cercas', 'CERCAS DO TRIANGULO EIRELI', '55555555000110');
  const zapi = filial('z1', 'E-ZAP', 'Zapi Distribuidora', 'ZAPI DISTRIBUIDORA LTDA', '66666666000120');
  const lista = [zapi, imp48, cerca2, arc3, imp1, cerca1, impAra, arc1, imp27];

  it('(a) cada filial cai em exatamente uma empresa, e a soma dos grupos é o tamanho da entrada', () => {
    const grupos = agruparPorEmpresa(lista);
    const ids = grupos.flatMap((g) => g.filiais.map((f) => f.id));
    expect(ids).toHaveLength(lista.length);
    expect(new Set(ids).size).toBe(lista.length);
    expect(grupos.map((g) => g.chave).sort()).toEqual(['E-ARC', 'E-CER1', 'E-CER2', 'E-IMP', 'E-ZAP']);
  });

  it('o grupo é o empresa_id do BANCO, não a raiz do CNPJ', () => {
    // Mesma raiz, empresas diferentes no banco: ficam separadas.
    const x = filial('x', 'E-X', 'X', 'X LTDA', '77777777000100');
    const y = filial('y', 'E-Y', 'Y', 'Y LTDA', '77777777000200');
    expect(agruparPorEmpresa([x, y])).toHaveLength(2);
    // Sem empresa no banco, a filial é uma empresa sozinha.
    const solta = forn({ id: 's', razao_social: 'Solta Ltda', fornece_material: true });
    expect(agruparPorEmpresa([solta])[0]?.chave).toBe('filial:s');
  });

  it('uma linha por empresa, pelo apelido, na ordem do apelido', () => {
    const opcoes = opcoesDeEmpresa(agruparPorEmpresa(lista));
    expect(opcoes.map((o) => o.rotulo)).toEqual([
      'ArcelorMittal', 'Império das Tintas', 'Triângulo Cercas', 'Triângulo Cercas', 'Zapi Distribuidora',
    ]);
  });

  it('a linha menor conta as filiais e diz as cidades — sem repetir a cidade escrita de dois jeitos', () => {
    const opcoes = opcoesDeEmpresa(agruparPorEmpresa(lista));
    expect(opcoes.find((o) => o.valor === 'E-IMP')?.detalhe).toBe('4 filiais · Araguari/MG e Uberlandia/MG');
    expect(opcoes.find((o) => o.valor === 'E-ARC')?.detalhe).toBe('2 filiais · Belo Horizonte/MG e Uberlandia/MG');
    expect(opcoes.find((o) => o.valor === 'E-ZAP')?.detalhe).toBe('Uberlandia/MG');
  });

  it('(e) duas empresas com o mesmo apelido nunca saem com a mesma linha inteira', () => {
    const opcoes = opcoesDeEmpresa(agruparPorEmpresa(lista));
    const cercas = opcoes.filter((o) => o.rotulo === 'Triângulo Cercas');
    expect(cercas.map((o) => [o.valor, o.detalhe])).toEqual([
      ['E-CER1', 'TRIANGULO CERCAS LTDA · Uberlandia/MG'],
      ['E-CER2', 'CERCAS DO TRIANGULO EIRELI · Uberlandia/MG'],
    ]);
    const linhas = opcoes.map((o) => `${o.rotulo}|${o.detalhe}`);
    expect(new Set(linhas).size).toBe(linhas.length);
  });

  it('(e) mesmo com a razão social e a cidade iguais, a linha não se repete', () => {
    const g1 = filial('g1', 'E-G1', 'Gêmeas', 'GEMEAS LTDA', '88888888000100');
    const g2 = filial('g2', 'E-G2', 'Gêmeas', 'GEMEAS LTDA', '99999999000100');
    const linhas = opcoesDeEmpresa(agruparPorEmpresa([g1, g2])).map((o) => `${o.rotulo}|${o.detalhe}`);
    expect(new Set(linhas).size).toBe(2);
  });

  it('a pesquisa acha a empresa pelo apelido e pela razão social ou fantasia de qualquer filial', () => {
    const opcoes = opcoesDeEmpresa(agruparPorEmpresa(lista));
    expect(filtrarOpcoes(opcoes, 'imperio').map((o) => o.valor)).toEqual(['E-IMP']);
    expect(filtrarOpcoes(opcoes, 'beija flor').map((o) => o.valor)).toEqual(['E-IMP']);
    expect(filtrarOpcoes(opcoes, 'triangulo').map((o) => o.valor).sort()).toEqual(['E-CER1', 'E-CER2']);
  });

  it('a filial: a cidade; na mesma cidade sem rua, "matriz" ou "filial nº N"; e a razão social quando o grupo junta duas', () => {
    const g = agruparPorEmpresa(lista).find((x) => x.chave === 'E-IMP')!;
    expect(g.filiais.map((f) => rotuloDaFilial(f, g.filiais))).toEqual([
      'Araguari/MG · BEIJA FLOR COMERCIO DE TINTAS LTDA',
      'Uberlandia/MG · matriz · IMPERIO DAS TINTAS LTDA',
      'Uberlandia/MG · filial nº 27 · BEIJA FLOR COMERCIO DE TINTAS LTDA',
      'Uberlandia/MG · filial nº 48 · BEIJA FLOR COMERCIO DE TINTAS LTDA',
    ]);
  });

  it('a ArcelorMittal: o mesmo nome escrito de dois jeitos não conta como duas razões sociais', () => {
    const g = agruparPorEmpresa(lista).find((x) => x.chave === 'E-ARC')!;
    expect(g.filiais.map((f) => rotuloDaFilial(f, g.filiais))).toEqual(['Belo Horizonte/MG', 'Uberlandia/MG']);
  });

  it('a rua desempata a mesma cidade, e aí o número da filial nem aparece', () => {
    const r1 = filial('r1', 'E-R', 'R', 'R LTDA', '12121212000100', end('Uberlândia', 'MG', 'Av. Rondon Pacheco', '100', 'Centro'));
    const r2 = filial('r2', 'E-R', 'R', 'R LTDA', '12121212000200', end('UBERLÂNDIA', 'MG', 'Rua Goiás', '9'));
    expect(rotuloDaFilial(r1, [r1, r2])).toBe('Uberlândia/MG · Av. Rondon Pacheco, 100 · Centro');
    expect(rotuloDaFilial(r2, [r1, r2])).toBe('Uberlândia/MG · Rua Goiás, 9');
  });

  it('(b) nenhum rótulo — de empresa ou de filial — leva os quatro últimos dígitos do CNPJ', () => {
    const grupos = agruparPorEmpresa(lista);
    const textos = [
      ...opcoesDeEmpresa(grupos).map((o) => `${o.rotulo} ${o.detalhe ?? ''}`),
      ...grupos.flatMap((g) => g.filiais.map((f) => rotuloDaFilial(f, g.filiais))),
    ];
    for (const f of lista) {
      const final = f.cnpj.slice(-4);
      for (const t of textos) expect(t.replace(/\D/g, ' ')).not.toMatch(new RegExp(`\\b\\d*${final}\\b`));
    }
    expect(textos.join(' ')).not.toContain('····');
  });

  it('(c) a filial bloqueada fica FORA da Nova OC e DENTRO do Histórico', () => {
    const bloqueada = { ...imp27, bloqueado_para_compra_nova: true };
    const todos = [imp1, bloqueada];
    expect(fornecedoresParaOc(todos).map((f) => f.id)).toEqual(['i1']);
    // O Histórico agrupa a tabela inteira, sem o filtro da Nova OC.
    const doHistorico = agruparPorEmpresa(todos);
    expect(doHistorico[0]?.filiais.map((f) => f.id).sort()).toEqual(['i1', 'i27']);
  });

  it('a filial gravada no rascunho que hoje estaria fora continua na lista, e diz o porquê', () => {
    const bloqueada = { ...imp27, bloqueado_para_compra_nova: true };
    const daOc = fornecedoresParaOc([imp1, bloqueada], 'i27');
    expect(daOc.map((f) => f.id)).toEqual(['i1', 'i27']);
    expect(rotuloDaFilial(bloqueada, daOc)).toContain('bloqueada para compra nova');
    expect(motivoForaDaOc(imp1)).toBe('');
  });

  it('(d) a empresa com uma filial só escolhe a filial sozinha', () => {
    const [zap] = agruparPorEmpresa([zapi]);
    expect(escolherEmpresa(zap, '')).toEqual({ fornecedorId: 'z1', empresaEsperando: '' });
  });

  it('com mais de uma filial, a empresa espera a filial — e a já escolhida da mesma empresa fica', () => {
    const imp = agruparPorEmpresa(lista).find((g) => g.chave === 'E-IMP');
    expect(escolherEmpresa(imp, '')).toEqual({ fornecedorId: '', empresaEsperando: 'E-IMP' });
    expect(escolherEmpresa(imp, 'z1')).toEqual({ fornecedorId: '', empresaEsperando: 'E-IMP' });
    expect(escolherEmpresa(imp, 'i48')).toEqual({ fornecedorId: 'i48', empresaEsperando: '' });
    expect(escolherEmpresa(undefined, 'i48')).toEqual({ fornecedorId: '', empresaEsperando: '' });
  });

  it('a cidade sai sem gritar: "UBERLANDIA" vira "Uberlandia", "de" fica minúsculo, a UF maiúscula', () => {
    expect(cidadeUf(forn({ id: 'q', endereco: end('SAO JOAO DEL REI', 'mg') }))).toBe('Sao Joao Del Rei/MG');
    expect(cidadeUf(forn({ id: 'q', endereco: end('RIO DE JANEIRO', 'RJ') }))).toBe('Rio de Janeiro/RJ');
  });

  it('ordemDoCnpj: os quatro dígitos depois da barra; sem CNPJ, nenhum', () => {
    expect(ordemDoCnpj('22.222.222/0027-41')).toBe(27);
    expect(ordemDoCnpj('22222222000155')).toBe(1);
    expect(ordemDoCnpj('')).toBeNull();
    expect(ordemDoCnpj('12345678901')).toBeNull();
  });
});

describe('enderecoResumido — a linha abaixo do campo', () => {
  it('monta em uma linha, sem rótulos, pulando o que está vazio', () => {
    const f = forn({
      id: 'e',
      cnpj: '11.111.111/0001-11',
      endereco: {
        logradouro: 'Rua das Tintas',
        numero: '120',
        complemento: 'Loja 3',
        bairro: 'Setor Industrial',
        cidade: 'Brasília',
        uf: 'DF',
        cep: '',
      },
    });
    expect(enderecoResumido(f)).toBe(
      'Rua das Tintas, 120 Loja 3 · Setor Industrial · Brasília/DF · CNPJ 11.111.111/0001-11',
    );
  });

  it('CNPJ que vem do banco só em dígitos sai pontuado', () => {
    const f = forn({ id: 'd', cnpj: '11111111000111' });
    expect(enderecoResumido(f)).toBe('CNPJ 11.111.111/0001-11');
  });

  it('sem fornecedor escolhido, nada aparece', () => {
    expect(enderecoResumido(undefined)).toBe('');
  });
});
