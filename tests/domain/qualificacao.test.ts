import { describe, expect, it } from 'vitest';
import {
  QUALIFICACAO_SEM_CONFIRMACAO,
  SEM_QUALIFICACAO,
  ecrsDaGaveta,
  ecrsDaOc,
  ecrsDoQualificarAgora,
  desempenhoDaFilial,
  fraseDaRecusaDaCiencia,
  fraseDaRecusaDaEntrega,
  fraseDaRecusaDaQualificacao,
  fraseDaTravaDoBanco,
  historicoDaFilial,
  naoConformes,
  nomeDasEcrs,
  notaAoVivo,
  paraSituacao,
  pedeTratativa,
  problemaDaAvaliacao,
  problemaDaQualificacao,
  seloDaFilial,
  sujeitoParaGravar,
  textoDoDesempenho,
  textoDoSelo,
  travaDaQualificacao,
  vencimentoDe,
  type Avaliacao,
  type LinhaDeQualificacao,
  type Selo,
} from '../../src/domain/qualificacao';

const selo = (s: Partial<Selo>): Selo => ({ ...SEM_QUALIFICACAO, ...s });

describe('D604 §3.4 — o selo da empresa', () => {
  it('cada situação diz o que é, com a data quando tem', () => {
    expect(textoDoSelo(selo({ situacao: 'qualificada', venceEm: '2027-05-07' }))).toBe('Qualificada até 05/2027');
    expect(textoDoSelo(selo({ situacao: 'vence_em_30_dias', venceEm: '2026-10-15' }))).toBe('Vence em 15/10/2026');
    expect(textoDoSelo(selo({ situacao: 'vencida', venceEm: '2026-08-04' }))).toBe('Vencida desde 04/08/2026');
    expect(textoDoSelo(selo({ situacao: 'desqualificada' }))).toBe('Desqualificada');
    expect(textoDoSelo(SEM_QUALIFICACAO)).toBe('Sem qualificação');
  });

  it('situação que a tela não conhece vira "sem qualificação" — nunca "qualificada" por engano', () => {
    expect(paraSituacao('qualificada')).toBe('qualificada');
    expect(paraSituacao('vence_em_30_dias')).toBe('vence_em_30_dias');
    expect(paraSituacao('algo_novo')).toBe('sem_qualificacao');
    expect(paraSituacao(null)).toBe('sem_qualificacao');
  });
});

describe('D605 — a trava da emissão, a mesma conta da qualificacao_da_oc do banco', () => {
  it('as ECRs da OC: sem repetir, em ordem, e item sem ECR não conta', () => {
    expect(ecrsDaOc([{ ecr_id: 19 }, { ecr_id: null }, { ecr_id: 12 }, { ecr_id: 19 }])).toEqual([12, 19]);
    expect(ecrsDaOc([{ ecr_id: null }])).toEqual([]);
  });

  it('o nome das ECRs, como a tela escreve', () => {
    expect(nomeDasEcrs([12])).toBe('ECR 12');
    expect(nomeDasEcrs([5, 12])).toBe('ECRs 05 e 12');
    expect(nomeDasEcrs([5, 12, 19])).toBe('ECRs 05, 12 e 19');
  });

  it('OC sem item de ECR não pede qualificação (D605 3), qualquer que seja a empresa', () => {
    for (const situacao of ['sem_qualificacao', 'vencida', 'desqualificada'] as const) {
      expect(travaDaQualificacao(selo({ situacao }), [])).toBe('');
    }
  });

  it('qualificada, ou vencendo em 30 dias, com todas as ECRs da OC cobertas: emite', () => {
    expect(travaDaQualificacao(selo({ situacao: 'qualificada', ecrs: [12, 19] }), [12, 19])).toBe('');
    expect(travaDaQualificacao(selo({ situacao: 'vence_em_30_dias', ecrs: [12] }), [12])).toBe('');
  });

  it('vencida, desqualificada ou sem qualificação: não emite, e a frase diz por quê e o que fazer', () => {
    expect(travaDaQualificacao(selo({ situacao: 'vencida', venceEm: '2026-08-04', ecrs: [12] }), [12])).toBe(
      'Esta OC tem material controlado (ECR 12), e a qualificação de material da empresa venceu em 04/08/2026. ' +
        'Qualifique a empresa na tela Qualificação, no menu, e emita de novo.',
    );
    expect(travaDaQualificacao(selo({ situacao: 'desqualificada' }), [12])).toContain('está desqualificada');
    expect(travaDaQualificacao(SEM_QUALIFICACAO, [5, 12])).toBe(
      'Esta OC tem material controlado (ECRs 05 e 12), e a empresa não tem qualificação de material. ' +
        'Qualifique a empresa na tela Qualificação, no menu, e emita de novo.',
    );
  });

  it('qualificada, mas não para uma ECR da OC (D606 1): não emite, e a frase nomeia só a que falta', () => {
    expect(travaDaQualificacao(selo({ situacao: 'qualificada', ecrs: [12] }), [12, 19])).toBe(
      'A empresa está qualificada, mas não para a ECR 19 desta OC. ' +
        'Qualifique a empresa na tela Qualificação, no menu, e emita de novo.',
    );
    expect(travaDaQualificacao(selo({ situacao: 'qualificada', ecrs: [] }), [5, 19])).toContain('as ECRs 05 e 19');
  });

  it('D614 §2.4 — dentro do "Qualificar agora", a frase não manda usar o "Qualificar agora": qualifica ali', () => {
    const aqui = travaDaQualificacao(SEM_QUALIFICACAO, [12, 19], 'aqui');
    expect(aqui).toBe(
      'Esta OC tem material controlado (ECRs 12 e 19), e a empresa não tem qualificação de material. ' +
        'Qualifique aqui para emitir, ou volte e salve como rascunho.',
    );
    expect(travaDaQualificacao(selo({ situacao: 'qualificada', ecrs: [12] }), [12, 19], 'aqui')).toBe(
      'A empresa está qualificada, mas não para a ECR 19 desta OC. Qualifique aqui para emitir, ou volte e salve como rascunho.',
    );
    for (const onde of ['aqui', 'na_ficha'] as const) {
      expect(travaDaQualificacao(SEM_QUALIFICACAO, [12], onde)).not.toContain('Qualificar agora');
    }
    expect(travaDaQualificacao(null, [12], 'aqui')).toBe(QUALIFICACAO_SEM_CONFIRMACAO);
  });

  it('"Qualificar agora" traz as ECRs da OC somadas às da vigente: requalificar não tira nenhuma', () => {
    expect(ecrsDoQualificarAgora([19, 12], [12, 6])).toEqual([6, 12, 19]);
    expect(ecrsDoQualificarAgora([12], [])).toEqual([12]);
  });
});

describe('D604 §3.1 — o formulário de qualificar', () => {
  const marcados = (a: boolean[], motivo = 'motivo') => a.map((atende) => ({ atende, motivo }));

  it('a nota ao vivo é quantos critérios atendem', () => {
    expect(notaAoVivo(marcados([true, false, true]))).toBe(2);
    expect(notaAoVivo(marcados([false, false, false]))).toBe(0);
  });

  it('o vencimento é +12 meses, como o banco; 29/02 vira 28/02', () => {
    expect(vencimentoDe('2026-05-07')).toBe('2027-05-07');
    expect(vencimentoDe('2026-01-31')).toBe('2027-01-31');
    expect(vencimentoDe('2024-02-29')).toBe('2025-02-28');
  });

  it('o que falta, na ordem da tela', () => {
    const hoje = '2026-09-28';
    expect(problemaDaQualificacao('material', marcados([true, true, true]), [12], hoje, hoje)).toBe('');
    expect(problemaDaQualificacao('material', [{ atende: true, motivo: 'a' }, { atende: true, motivo: '  ' }, { atende: false, motivo: 'c' }], [12], hoje, hoje)).toBe(
      'Escreva o motivo do critério 2: por que atende, ou por que não atende.',
    );
    expect(problemaDaQualificacao('material', marcados([true, true, true]), [12], '2026-09-29', hoje)).toBe(
      'A data da qualificação não pode ser depois de hoje.',
    );
    expect(problemaDaQualificacao('material', marcados([true, true, true]), [], hoje, hoje)).toBe(
      'Marque para quais ECRs a empresa está sendo qualificada.',
    );
  });

  it('ECR só em material: serviço, projeto, laboratório e locação qualificam sem ECR', () => {
    for (const c of ['servico', 'controle_tecnologico', 'projeto', 'locacao'] as const) {
      expect(problemaDaQualificacao(c, marcados([true, false, false]), [], '2026-09-28', '2026-09-28')).toBe('');
    }
  });
});

describe('D604 §3.2 — a avaliação na entrega (PS.02, SiAC 8.4.1.2)', () => {
  const base: Avaliacao = {
    notaFiscal: '1234',
    recebidoEm: '2026-09-28',
    prazoConforme: true,
    integridadeConforme: true,
    ocEcrConforme: true,
    observacao: '',
    tratativa: '',
  };

  it('conta as "Não Conforme"; resposta em branco não é nenhuma das duas', () => {
    expect(naoConformes(base)).toBe(0);
    expect(naoConformes({ ...base, prazoConforme: false, ocEcrConforme: null })).toBe(1);
    expect(naoConformes({ ...base, prazoConforme: false, integridadeConforme: false, ocEcrConforme: false })).toBe(3);
  });

  it('a tratativa é obrigatória com duas ou mais "Não Conforme", e só aí', () => {
    expect(pedeTratativa({ ...base, prazoConforme: false })).toBe(false);
    expect(pedeTratativa({ ...base, prazoConforme: false, integridadeConforme: false })).toBe(true);
  });

  it('o que falta, na ordem da tela', () => {
    const hoje = '2026-09-28';
    expect(problemaDaAvaliacao(base, hoje)).toBe('');
    expect(problemaDaAvaliacao({ ...base, notaFiscal: ' ' }, hoje)).toBe('Informe o número da nota fiscal.');
    expect(problemaDaAvaliacao({ ...base, recebidoEm: '' }, hoje)).toBe('Informe o dia do recebimento.');
    expect(problemaDaAvaliacao({ ...base, recebidoEm: '2026-09-29' }, hoje)).toBe('O dia do recebimento não pode ser depois de hoje.');
    expect(problemaDaAvaliacao({ ...base, integridadeConforme: null }, hoje)).toBe(
      'Responda as três perguntas: Conforme ou Não Conforme.',
    );
    expect(problemaDaAvaliacao({ ...base, prazoConforme: false, integridadeConforme: false }, hoje)).toBe(
      'Com duas ou mais "Não Conforme", escreva a tratativa: o que foi feito com a entrega.',
    );
    expect(
      problemaDaAvaliacao({ ...base, prazoConforme: false, integridadeConforme: false, tratativa: 'devolvido' }, hoje),
    ).toBe('');
  });
});

describe('as recusas do banco (contrato de 28/09 §2 e §4), em frase de gente', () => {
  it('a trava da emissão (23514) mostra o motivo do banco e a dica', () => {
    expect(
      fraseDaTravaDoBanco({
        code: '23514',
        message: 'A OC 2026/009 não pode ser emitida: a empresa está sem qualificação de material.',
        hint: 'Qualifique a empresa antes.',
      }),
    ).toBe(
      'A OC 2026/009 não pode ser emitida: a empresa está sem qualificação de material. Qualifique a empresa antes.',
    );
  });

  it('cada código da qualificação, da entrega e da ciência tem a sua frase; o resto sobe com a mensagem', () => {
    expect(fraseDaRecusaDaQualificacao({ code: '42501', message: 'x' })).toContain('Só quem pode emitir OC qualifica');
    expect(fraseDaRecusaDaQualificacao({ code: 'P0002', message: 'x' })).toContain('não existe mais');
    expect(fraseDaRecusaDaQualificacao({ code: '22023', message: 'motivo vazio' })).toBe('O banco recusou a qualificação: motivo vazio');
    expect(fraseDaRecusaDaEntrega({ code: '40001', message: 'x' })).toContain('mudou desde que você abriu');
    expect(fraseDaRecusaDaEntrega({ code: '55000', message: 'x' })).toContain('Só OC emitida ou entregue');
    expect(fraseDaRecusaDaCiencia({ code: '42501', message: 'x' })).toBe(
      'Só quem revisa as ECRs dá ciência de tratativa. A ciência não foi gravada.',
    );
    expect(fraseDaRecusaDaCiencia({ code: '55000', message: 'x' })).toContain('já foi dada');
    expect(fraseDaRecusaDaEntrega({ code: 'XX000', message: 'caiu' })).toBe('Falha ao gravar a avaliação: caiu');
  });
});

describe('D606 3 — de quem é o selo da filial (a mesma resolução da qualificacao_do_fornecedor)', () => {
  const l = (o: Partial<LinhaDeQualificacao>): LinhaDeQualificacao => ({
    id: 1,
    empresaRaizId: null,
    fornecedorId: null,
    categoria: 'material',
    tipo: '',
    qualificadaEm: '2026-01-01',
    venceEm: '2027-01-01',
    criterios: [],
    nota: 3,
    minimo: 2,
    qualificada: true,
    qualificadoPorNome: '',
    origem: 'sistema',
    situacao: 'qualificada',
    ecrs: [12],
    vigente: true,
    ...o,
  });
  const filial = { id: 'filial-1', empresa_id: 'empresa-a' };

  it('a filial com raiz mostra a qualificação da empresa dela', () => {
    const linhas = [l({ id: 1, empresaRaizId: 'empresa-a', ecrs: [12, 19] }), l({ id: 2, empresaRaizId: 'empresa-b' })];
    expect(seloDaFilial(filial, linhas)).toEqual({
      situacao: 'qualificada',
      qualificadaEm: '2026-01-01',
      venceEm: '2027-01-01',
      ecrs: [12, 19],
    });
  });

  it('só a vigente e só a categoria pedida; sem nenhuma, "sem qualificação"', () => {
    const linhas = [
      l({ id: 1, empresaRaizId: 'empresa-a', vigente: false, situacao: 'desqualificada' }),
      l({ id: 2, empresaRaizId: 'empresa-a', categoria: 'servico', situacao: 'vencida' }),
    ];
    expect(seloDaFilial(filial, linhas).situacao).toBe('sem_qualificacao');
    expect(seloDaFilial(filial, linhas, 'servico').situacao).toBe('vencida');
  });

  it('quem ganhou raiz depois segue pela linha antiga do fornecedor, até a empresa ter uma mais nova', () => {
    const antiga = l({ id: 1, fornecedorId: 'filial-1', qualificadaEm: '2026-03-01', ecrs: [5] });
    expect(seloDaFilial(filial, [antiga]).ecrs).toEqual([5]);
    const daEmpresa = l({ id: 2, empresaRaizId: 'empresa-a', qualificadaEm: '2026-06-01', situacao: 'desqualificada' });
    expect(seloDaFilial(filial, [antiga, daEmpresa]).situacao).toBe('desqualificada');
  });

  it('no mesmo dia, vale a linha mais nova', () => {
    const a = l({ id: 3, empresaRaizId: 'empresa-a', qualificadaEm: '2026-06-01', situacao: 'desqualificada' });
    const b = l({ id: 4, empresaRaizId: 'empresa-a', qualificadaEm: '2026-06-01', situacao: 'qualificada' });
    expect(seloDaFilial(filial, [b, a]).situacao).toBe('qualificada');
  });

  it('o fornecedor sem raiz se qualifica por ele mesmo; com raiz, pela empresa', () => {
    expect(sujeitoParaGravar({ id: 'pf-1' })).toEqual({ fornecedor_id: 'pf-1' });
    expect(sujeitoParaGravar(filial)).toEqual({ empresa_raiz_id: 'empresa-a' });
  });

  it('o histórico da ficha: todas as linhas do sujeito na categoria, a mais nova primeiro', () => {
    const linhas = [
      l({ id: 1, empresaRaizId: 'empresa-a', qualificadaEm: '2025-01-01', vigente: false }),
      l({ id: 2, empresaRaizId: 'empresa-a', qualificadaEm: '2026-01-01' }),
      l({ id: 3, empresaRaizId: 'empresa-b' }),
    ];
    expect(historicoDaFilial(filial, linhas, 'material').map((x) => x.id)).toEqual([2, 1]);
  });

  it('sem as qualificações carregadas, a OC com ECR não emite: a trava falha fechada', () => {
    expect(travaDaQualificacao(null, [12])).toBe(QUALIFICACAO_SEM_CONFIRMACAO);
    expect(travaDaQualificacao(null, [])).toBe('');
  });
});

describe('D604 §3.3 — a prova ao requalificar: o desempenho dos últimos 12 meses', () => {
  const lista = [
    { empresaRaizId: 'empresa-a', fornecedorId: null, entregas: 4, noPrazo: 3, inteiras: 4, conformes: 1 },
    { empresaRaizId: null, fornecedorId: 'forn-pf', entregas: 1, noPrazo: 1, inteiras: 1, conformes: 1 },
  ];

  it('a filial com raiz lê o da empresa; a sem raiz, o dela; filial de outra empresa não pega o de ninguém', () => {
    expect(desempenhoDaFilial({ id: 'filial-x', empresa_id: 'empresa-a' }, lista)?.entregas).toBe(4);
    expect(desempenhoDaFilial({ id: 'forn-pf' }, lista)?.entregas).toBe(1);
    expect(desempenhoDaFilial({ id: 'forn-pf', empresa_id: 'empresa-b' }, lista)).toBeUndefined();
  });

  it('o texto diz os quatro números, com singular e plural; sem entrega, diz que não houve', () => {
    expect(textoDoDesempenho(lista[0])).toBe(
      'Nos últimos 12 meses: 4 entregas avaliadas — 3 no prazo, 4 inteiras, 1 conforme com a OC e a ECR.',
    );
    expect(textoDoDesempenho(lista[1])).toBe(
      'Nos últimos 12 meses: 1 entrega avaliada — 1 no prazo, 1 inteira, 1 conforme com a OC e a ECR.',
    );
    expect(textoDoDesempenho(undefined)).toBe('Nenhuma entrega avaliada nos últimos 12 meses.');
    expect(textoDoDesempenho({ entregas: 0, noPrazo: 0, inteiras: 0, conformes: 0 })).toBe(
      'Nenhuma entrega avaliada nos últimos 12 meses.',
    );
  });
});

describe('D614 §2.1 — a linha das ECRs na gaveta da filial: só leitura, pela qualificação de material', () => {
  it('qualificada: as ECRs da qualificação que vale, e onde muda', () => {
    expect(ecrsDaGaveta(selo({ situacao: 'qualificada', ecrs: [12, 19] }))).toBe(
      'ECRs 12 e 19, pela qualificação de material. Muda na ficha da empresa.',
    );
    expect(ecrsDaGaveta(selo({ situacao: 'vence_em_30_dias', ecrs: [5] }))).toBe(
      'ECR 05, pela qualificação de material. Muda na ficha da empresa.',
    );
  });

  it('sem qualificação, desqualificada ou sem ECR: diz que nenhuma vale, e não lista ECR', () => {
    expect(ecrsDaGaveta(SEM_QUALIFICACAO)).toBe('Sem qualificação de material: nenhuma ECR. Muda na ficha da empresa.');
    expect(ecrsDaGaveta(selo({ situacao: 'desqualificada', ecrs: [12] }))).toBe(
      'Desqualificada para material: nenhuma ECR vale. Muda na ficha da empresa.',
    );
    expect(ecrsDaGaveta(selo({ situacao: 'qualificada', ecrs: [] }))).toBe(
      'Nenhuma ECR na qualificação de material. Muda na ficha da empresa.',
    );
  });

  it('vencida: as ECRs, dizendo que venceu; sem carga: diz que não carregou', () => {
    expect(ecrsDaGaveta(selo({ situacao: 'vencida', ecrs: [12] }))).toBe(
      'ECR 12, pela qualificação de material, que venceu: requalifique na ficha da empresa.',
    );
    expect(ecrsDaGaveta(null)).toBe('As ECRs vêm da qualificação de material, que não carregou.');
  });
});
