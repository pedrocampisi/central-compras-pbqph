import { describe, expect, it } from 'vitest';
import { normalizeFornecedor } from '../../src/domain/normalize';
import {
  linhasDoDia,
  seloDaFilial,
  travaDaQualificacao,
  type LinhaDeQualificacao,
  type Situacao,
} from '../../src/domain/qualificacao';
import { FORA_DO_CADASTRO, desempenhoCurto, linhasDaTela } from '../../src/domain/telaDaQualificacao';
import type { Fornecedor } from '../../src/domain/types';

/**
 * CTO-D661 §5.1: a regra que monta as linhas da tela Qualificação. Uma linha
 * por empresa e categoria, com a que vale; a Permissão para compra pela regra
 * da trava. Empresas, filiais e números INVENTADOS.
 */

const filial = (id: string, empresa?: string, apelido?: string, ativo = true): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: `Filial ${id} (teste)` }),
  ativo,
  empresa_id: empresa,
  empresa_apelido: apelido,
});

const linha = (o: Partial<LinhaDeQualificacao>): LinhaDeQualificacao => ({
  id: 1, empresaRaizId: 'empresa-a', fornecedorId: null, categoria: 'material', tipo: 'Cimento',
  qualificadaEm: '2026-05-07', venceEm: '2027-05-07',
  criterios: [
    { atende: true, motivo: 'atende' },
    { atende: true, motivo: 'atende' },
    { atende: false, motivo: 'não atende' },
  ],
  nota: 2, minimo: 2, qualificada: true, qualificadoPorNome: 'Pessoa de teste', origem: '',
  situacao: 'qualificada', ecrs: [12], vigente: true,
  ...o,
});

const A1 = filial('a1', 'empresa-a', 'Alfa (teste)');
const A2 = filial('a2', 'empresa-a', 'Alfa (teste)');
const SOLTO = filial('solto');
const CADASTRO = [A1, A2, SOLTO, filial('b1', 'empresa-b', 'Beta (teste)')];

describe('CTO-D661 — as linhas da tela Qualificação', () => {
  it('uma linha por empresa e categoria, com a que vale; o histórico não vira linha', () => {
    const linhas = [
      linha({ id: 1, qualificadaEm: '2025-05-07', venceEm: '2026-05-07', situacao: 'vencida', vigente: false }),
      linha({ id: 2 }),
      linha({ id: 3, categoria: 'servico', ecrs: [] }),
    ];
    const tela = linhasDaTela(linhas, 'material', CADASTRO);
    expect(tela.map((l) => [l.chave, l.nome, l.vale.id])).toEqual([['empresa-a', 'Alfa (teste)', 2]]);
    expect(linhasDaTela(linhas, 'servico', CADASTRO).map((l) => l.vale.id)).toEqual([3]);
    expect(linhasDaTela(linhas, 'locacao', CADASTRO)).toEqual([]);
  });

  it('a empresa com duas filiais dá uma linha só, e a filial que abre o diálogo é dela', () => {
    const tela = linhasDaTela([linha({ id: 2 })], 'material', CADASTRO);
    expect(tela).toHaveLength(1);
    expect(['a1', 'a2']).toContain(tela[0]!.filial!.id);
  });

  it('o fornecedor sem empresa cadastrada tem linha própria', () => {
    const tela = linhasDaTela(
      [linha({ id: 2 }), linha({ id: 5, empresaRaizId: null, fornecedorId: 'solto' })],
      'material',
      CADASTRO,
    );
    expect(tela.map((l) => [l.chave, l.filial?.id])).toEqual([
      ['empresa-a', 'a1'],
      ['filial:solto', 'solto'],
    ]);
  });

  it('requalificar não duplica a linha: vale a nova', () => {
    const antes = [linha({ id: 2, qualificadaEm: '2025-09-01', venceEm: '2026-09-01' })];
    const depois = [{ ...antes[0]!, vigente: false }, linha({ id: 9, qualificadaEm: '2026-10-01', venceEm: '2027-10-01' })];
    const tela = linhasDaTela(depois, 'material', CADASTRO);
    expect(tela.map((l) => l.vale.id)).toEqual([9]);
  });

  it('quem diz qual vale é o banco (a `vigente`), mesmo com a requalificação lançada com data anterior', () => {
    const tela = linhasDaTela(
      [
        linha({ id: 2, qualificadaEm: '2026-06-01', venceEm: '2027-06-01', vigente: false }),
        linha({ id: 9, qualificadaEm: '2026-05-20', venceEm: '2027-05-20', situacao: 'desqualificada', qualificada: false }),
      ],
      'material',
      CADASTRO,
    );
    expect(tela.map((l) => [l.vale.id, l.vale.situacao])).toEqual([[9, 'desqualificada']]);
  });

  it('quem ganhou empresa depois e ainda tem a linha antiga dele: uma linha, a mais recente das duas', () => {
    const tela = linhasDaTela(
      [
        linha({ id: 4, empresaRaizId: null, fornecedorId: 'a1', qualificadaEm: '2026-08-01', venceEm: '2027-08-01' }),
        linha({ id: 2, qualificadaEm: '2026-05-07' }),
      ],
      'material',
      CADASTRO,
    );
    expect(tela.map((l) => [l.chave, l.vale.id])).toEqual([['empresa-a', 4]]);
  });

  it('a vencida aparece vencida no dia, mesmo que a carga tenha vindo "qualificada" (situacaoNoDia)', () => {
    const carregada = [linha({ id: 2, venceEm: '2026-09-30', situacao: 'qualificada' })];
    const [l] = linhasDaTela(linhasDoDia(carregada, '2026-10-01'), 'material', CADASTRO);
    expect(l!.vale.situacao).toBe('vencida');
    expect(l!.pedeAcao).toBe(true);
    expect(l!.podeComprar).toBe(false);
  });

  it('a Permissão para compra bate com a trava da emissão, para a mesma empresa, em toda situação', () => {
    const situacoes: Situacao[] = ['qualificada', 'vence_em_30_dias', 'vencida', 'desqualificada'];
    for (const situacao of situacoes) {
      for (const ecrs of [[12], [12, 19], []]) {
        const linhas = [linha({ id: 2, situacao, ecrs })];
        const [l] = linhasDaTela(linhas, 'material', CADASTRO);
        for (const f of [A1, A2]) {
          const selo = seloDaFilial(f, linhas);
          // A OC com as ECRs da qualificação (ou com uma ECR qualquer, quando ela não tem nenhuma).
          const emite = travaDaQualificacao(selo, ecrs.length ? ecrs : [12]) === '';
          expect(l!.podeComprar, `${situacao} ${JSON.stringify(ecrs)} ${f.id}`).toBe(emite);
        }
      }
    }
  });

  it('o que pede ação vem primeiro: vencida, desqualificada, vencendo; depois as qualificadas, pelo nome', () => {
    const cadastro = ['c', 'd', 'e', 'f'].map((x) => filial(x, `empresa-${x}`, `${x.toUpperCase()} (teste)`));
    const tela = linhasDaTela(
      [
        linha({ id: 1, empresaRaizId: 'empresa-c', situacao: 'qualificada' }),
        linha({ id: 2, empresaRaizId: 'empresa-d', situacao: 'vence_em_30_dias' }),
        linha({ id: 3, empresaRaizId: 'empresa-e', situacao: 'desqualificada' }),
        linha({ id: 4, empresaRaizId: 'empresa-f', situacao: 'vencida' }),
      ],
      'material',
      cadastro,
    );
    expect(tela.map((l) => [l.nome, l.pedeAcao])).toEqual([
      ['F (teste)', true],
      ['E (teste)', true],
      ['D (teste)', true],
      ['C (teste)', false],
    ]);
  });

  it('a qualificação de quem não está no cadastro aparece, com o nome da folha do auditor e sem filial', () => {
    const [l] = linhasDaTela([linha({ id: 7, empresaRaizId: 'empresa-sumida' })], 'material', CADASTRO);
    expect(l!.nome).toBe(FORA_DO_CADASTRO);
    expect(l!.filial).toBeNull();
  });

  it('a filial que abre o diálogo é uma ativa, quando a empresa tem', () => {
    const cadastro = [filial('x1', 'empresa-x', 'Xis (teste)', false), filial('x2', 'empresa-x', 'Xis (teste)')];
    const [l] = linhasDaTela([linha({ empresaRaizId: 'empresa-x' })], 'material', cadastro);
    expect(l!.filial!.id).toBe('x2');
  });

  it('o desempenho curto', () => {
    expect(desempenhoCurto(undefined)).toBe('Sem entregas');
    expect(desempenhoCurto({ entregas: 1, noPrazo: 1, inteiras: 1, conformes: 1 })).toBe('1 entrega, 1 no prazo');
    expect(desempenhoCurto({ entregas: 4, noPrazo: 3, inteiras: 4, conformes: 2 })).toBe('4 entregas, 3 no prazo');
  });
});
