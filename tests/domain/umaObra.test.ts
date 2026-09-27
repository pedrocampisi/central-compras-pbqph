/**
 * "Mostrar só uma obra" (CTO-D599): a janela é lida no relógio de Brasília,
 * nunca no do computador. Este arquivo roda com o computador em UTC: se a
 * conta usasse o fuso do computador, a máscara ligaria três horas antes, às
 * 21h de 15/11 — e os testes dos limites acusam.
 */
process.env.TZ = 'UTC';

import { describe, expect, it } from 'vitest';
import {
  JANELA_SUGERIDA,
  emBrasilia,
  instanteEmBrasilia,
  janelaEscolhida,
  ligadaAgora,
  mascaraDeEnsaio,
  mascaraDoTexto,
  problemaParaArmar,
  textoEmBrasilia,
  ultimoMinuto,
  vencida,
  type MascaraDeObra,
} from '../../src/domain/umaObra';

const { deDia, deHora, ateDia, ateHora } = JANELA_SUGERIDA;
const { inicio, fim } = janelaEscolhida(deDia, deHora, ateDia, ateHora);
const auditoria: MascaraDeObra = {
  obraId: 'obra-a',
  obraNome: 'Obra Alfa (teste)',
  inicio: inicio.toISOString(),
  fim: fim.toISOString(),
  ensaio: false,
};
const em = (iso: string) => new Date(iso);

describe('D599 — o relógio é o de Brasília', () => {
  it('o computador deste teste está mesmo em UTC', () => {
    expect(new Date(2026, 10, 16).getTimezoneOffset()).toBe(0);
  });

  it('16/11/2026 00:00 em Brasília é 03:00 em UTC', () => {
    expect(instanteEmBrasilia('2026-11-16', '00:00').toISOString()).toBe('2026-11-16T03:00:00.000Z');
    expect(emBrasilia(em('2026-11-16T03:00:00Z'))).toEqual({ dia: '2026-11-16', hora: '00:00' });
    expect(textoEmBrasilia(em('2026-11-18T02:59:00Z'))).toBe('17/11/2026 23:59');
  });

  it('a janela sugerida é a da auditoria: 16/11 00:00 a 17/11 23:59', () => {
    expect(JANELA_SUGERIDA).toEqual({ deDia: '2026-11-16', deHora: '00:00', ateDia: '2026-11-17', ateHora: '23:59' });
    expect(textoEmBrasilia(inicio)).toBe('16/11/2026 00:00');
    expect(textoEmBrasilia(ultimoMinuto(auditoria))).toBe('17/11/2026 23:59');
  });
});

describe('D599 §4.1 — os limites da janela', () => {
  it('às 23:59:59 de 15/11 (Brasília), desligada', () => {
    expect(ligadaAgora(auditoria, em('2026-11-16T02:59:59Z'))).toBe(false);
  });
  it('às 00:00:00 de 16/11, ligada', () => {
    expect(ligadaAgora(auditoria, em('2026-11-16T03:00:00Z'))).toBe(true);
  });
  it('às 23:59:59 de 17/11, ainda ligada (o minuto 23:59 inteiro)', () => {
    expect(ligadaAgora(auditoria, em('2026-11-18T02:59:59Z'))).toBe(true);
    expect(vencida(auditoria, em('2026-11-18T02:59:59Z'))).toBe(false);
  });
  it('às 00:00:00 de 18/11, desligada e vencida', () => {
    expect(ligadaAgora(auditoria, em('2026-11-18T03:00:00Z'))).toBe(false);
    expect(vencida(auditoria, em('2026-11-18T03:00:00Z'))).toBe(true);
  });
  it('nada armado é sempre desligada', () => {
    expect(ligadaAgora(null, em('2026-11-16T12:00:00Z'))).toBe(false);
  });
});

describe('D599 §2.6 — o ensaio liga já e desliga às 23:59 do dia, em Brasília', () => {
  it('armado às 12h, desliga depois de 23:59:59 do mesmo dia', () => {
    const m = mascaraDeEnsaio('obra-a', 'Obra Alfa (teste)', em('2026-09-27T15:00:00Z'));
    expect(m.ensaio).toBe(true);
    expect(ligadaAgora(m, em('2026-09-27T15:00:00Z'))).toBe(true);
    expect(ligadaAgora(m, em('2026-09-28T02:59:59Z'))).toBe(true);
    expect(ligadaAgora(m, em('2026-09-28T03:00:00Z'))).toBe(false);
    expect(textoEmBrasilia(ultimoMinuto(m))).toBe('27/09/2026 23:59');
  });

  it('armado às 23h30 de Brasília (já 02h30 do dia seguinte em UTC), desliga meia hora depois, e não 24 h depois', () => {
    const m = mascaraDeEnsaio('obra-a', '', em('2026-09-28T02:30:00Z'));
    expect(m.fim).toBe('2026-09-28T03:00:00.000Z');
  });
});

describe('D599 — o que impede de armar, e o que veio do navegador', () => {
  const agora = em('2026-09-27T15:00:00Z');
  it('as frases', () => {
    expect(problemaParaArmar('', inicio, fim, agora)).toBe('Escolha a obra.');
    expect(problemaParaArmar('obra-a', new Date(NaN), fim, agora)).toBe('Preencha as datas e as horas.');
    expect(problemaParaArmar('obra-a', fim, inicio, agora)).toBe('O fim tem de vir depois do começo.');
    expect(problemaParaArmar('obra-a', inicio, fim, em('2026-11-19T00:00:00Z'))).toBe('Essa janela já passou.');
    expect(problemaParaArmar('obra-a', inicio, fim, agora)).toBeNull();
  });

  it('forma errada vira "nada armado", e nunca quebra', () => {
    expect(mascaraDoTexto(null)).toBeNull();
    expect(mascaraDoTexto('{quebrado')).toBeNull();
    expect(mascaraDoTexto(JSON.stringify({ obraId: '', inicio: 'x', fim: 'y' }))).toBeNull();
    expect(mascaraDoTexto(JSON.stringify({ obraId: 'obra-a', inicio: 'x', fim: 'y' }))).toBeNull();
    expect(mascaraDoTexto(JSON.stringify(auditoria))).toEqual(auditoria);
  });
});
