import { describe, expect, it } from 'vitest';
import {
  SEM_QUALIFICACAO,
  ecrsDaOc,
  ecrsDoQualificarAgora,
  fraseDaRecusaDaCiencia,
  fraseDaRecusaDaEntrega,
  fraseDaRecusaDaQualificacao,
  fraseDaTravaDoBanco,
  naoConformes,
  nomeDasEcrs,
  notaAoVivo,
  paraSituacao,
  pedeTratativa,
  problemaDaAvaliacao,
  problemaDaQualificacao,
  textoDoSelo,
  travaDaQualificacao,
  vencimentoDe,
  type Avaliacao,
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
      'Esta OC tem material controlado (ECR 12), e a qualificação dela venceu em 04/08/2026. Use "Qualificar agora" para emitir.',
    );
    expect(travaDaQualificacao(selo({ situacao: 'desqualificada' }), [12])).toContain('está desqualificada');
    expect(travaDaQualificacao(SEM_QUALIFICACAO, [5, 12])).toBe(
      'Esta OC tem material controlado (ECRs 05 e 12), e ela não tem qualificação de material. Use "Qualificar agora" para emitir.',
    );
  });

  it('qualificada, mas não para uma ECR da OC (D606 1): não emite, e a frase nomeia só a que falta', () => {
    expect(travaDaQualificacao(selo({ situacao: 'qualificada', ecrs: [12] }), [12, 19])).toBe(
      'A empresa está qualificada, mas não para a ECR 19 desta OC. Use "Qualificar agora" para incluir.',
    );
    expect(travaDaQualificacao(selo({ situacao: 'qualificada', ecrs: [] }), [5, 19])).toContain('as ECRs 05 e 19');
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
      'O banco não deixou emitir: A OC 2026/009 não pode ser emitida: a empresa está sem qualificação de material. Qualifique a empresa antes.',
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
