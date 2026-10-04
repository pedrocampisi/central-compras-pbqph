import { describe, expect, it } from 'vitest';
import { avisoDoPdf, lerRespostaDaPasta, linkSeguro, paraBase64, semResposta } from '../../src/domain/pastaDaObra';

/**
 * CTO-D685: a leitura da resposta da `guardar-oc-na-obra` e o aviso da tela.
 * As frases da função são as do contrato do Banco (D682 §2), copiadas como
 * exemplo; os nomes de arquivo são inventados.
 */

const FALHOU =
  'O PDF não foi para a pasta da obra (credenciais do Microsoft Graph ausentes). A OC está emitida do mesmo jeito; ' +
  'o PDF ficou baixado neste aparelho, e dá para mandar de novo pelo Histórico.';

describe('D685 — a resposta da função', () => {
  it('o 200 é o único ok, e traz o link e o nome', () => {
    const r = lerRespostaDaPasta(200, {
      desfecho: 'gravado', mensagem: 'PDF guardado na pasta da obra como "x.pdf".',
      web_url: 'https://exemplo.invalid/x.pdf', nome: 'x.pdf', registrado: true,
    });
    expect(r).toMatchObject({ ok: true, desfecho: 'gravado', webUrl: 'https://exemplo.invalid/x.pdf', nome: 'x.pdf', aviso: '' });
    expect(lerRespostaDaPasta(422, { desfecho: 'sem_pasta', mensagem: 'm' }).ok).toBe(false);
    expect(lerRespostaDaPasta(502, { desfecho: 'falhou', mensagem: 'm' }).ok).toBe(false);
  });

  it('sem corpo, ou sem resposta, não quebra', () => {
    expect(lerRespostaDaPasta(500, null)).toMatchObject({ ok: false, desfecho: 'falhou', mensagem: '' });
    expect(semResposta()).toMatchObject({ ok: false, status: 0, desfecho: 'sem_resposta' });
  });

  it('o link só abre https', () => {
    expect(linkSeguro('https://exemplo.invalid/a.pdf')).toBe('https://exemplo.invalid/a.pdf');
    expect(linkSeguro('javascript:alert(1)')).toBe('');
    expect(linkSeguro('http://exemplo.invalid/a.pdf')).toBe('');
  });

  it('o PDF vai em base64 inteiro, também o grande (em pedaços, sem estourar a pilha)', () => {
    const bytes = new Uint8Array(200_000).map((_, i) => (i * 7) % 256);
    const volta = Uint8Array.from(atob(paraBase64(bytes)), (c) => c.charCodeAt(0));
    expect(volta).toEqual(bytes);
    expect(paraBase64(new TextEncoder().encode('%PDF-'))).toBe('JVBERi0=');
  });
});

describe('D685 — o aviso da tela diz a mensagem da função', () => {
  it('200: a OC emitida e a frase da função, em verde', () => {
    const r = lerRespostaDaPasta(200, { desfecho: 'gravado', mensagem: 'PDF guardado na pasta da obra como "x.pdf".' });
    expect(avisoDoPdf('2026/011', r, null, 'emissao')).toEqual({
      texto: 'OC 2026/011 emitida. PDF guardado na pasta da obra como "x.pdf".',
      tom: 'success',
    });
  });

  it('200 com aviso (o ✓ não ficou): amarelo, com o aviso junto', () => {
    const r = lerRespostaDaPasta(200, {
      desfecho: 'gravado', mensagem: 'PDF guardado.', aviso: 'o PDF está na pasta, mas a OC não ficou marcada: x',
    });
    const a = avisoDoPdf('2026/011', r, null, 'emissao');
    expect(a.tom).toBe('warning');
    expect(a.texto).toContain('a OC não ficou marcada');
  });

  it('502: a frase da função, que já diz que a OC está emitida, sem repetir', () => {
    const a = avisoDoPdf('2026/011', lerRespostaDaPasta(502, { desfecho: 'falhou', mensagem: FALHOU }), 'downloaded', 'emissao');
    expect(a).toEqual({ texto: `OC 2026/011: ${FALHOU}`, tom: 'warning' });
    expect(a.texto.match(/emitida/g)).toHaveLength(1);
  });

  it('a frase que não diz onde ficou o PDF: a tela completa, pelo caminho que ele tomou', () => {
    const r = lerRespostaDaPasta(403, { desfecho: 'sem_permissao', mensagem: 'O seu perfil não emite OC.' });
    expect(avisoDoPdf('2026/011', r, 'saved', 'emissao').texto).toBe(
      'OC 2026/011 emitida. O PDF não foi para a pasta da obra: O seu perfil não emite OC. ' +
        'O PDF ficou salvo na pasta ligada neste computador. Dá para mandar de novo pelo Histórico.',
    );
    expect(avisoDoPdf('2026/011', semResposta(), 'downloaded', 'mandar').texto).toBe(
      'OC 2026/011: O PDF não foi para a pasta da obra: A pasta da obra não respondeu. O PDF ficou baixado neste aparelho.',
    );
  });
});
