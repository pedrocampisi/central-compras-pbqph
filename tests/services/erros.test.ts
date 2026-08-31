import { describe, it, expect } from 'vitest';
import { traduzirErroDoBanco, TRAVAS_TRADUZIDAS } from '../../src/services/supabase/erros';

/**
 * O formato das mensagens abaixo é o do Postgres, e os nomes das travas foram
 * conferidos no banco em 28/08/2026 — nos dois, ensaio e principal — em vez de
 * copiados da carta. Nome errado aqui faria a tradução nunca disparar: o
 * defeito continuaria vivo e a bateria continuaria verde.
 */
const RECUSA_DO_CONTATO =
  'new row for relation "fornecedores" violates check constraint "fornecedores_cpf_pessoa_exige_pessoa"';
const RECUSA_DA_EMPRESA =
  'insert or update on table "fornecedores" violates foreign key constraint "fornecedores_raiz_pendura_na_empresa"';

describe('traduzirErroDoBanco', () => {
  it('troca a recusa do contato por uma frase sem jargão', () => {
    const frase = traduzirErroDoBanco(RECUSA_DO_CONTATO);
    expect(frase).not.toBe(RECUSA_DO_CONTATO);
    expect(frase).toContain('contato responsável');
  });

  it('troca a recusa da empresa nova por uma frase sem jargão', () => {
    const frase = traduzirErroDoBanco(RECUSA_DA_EMPRESA);
    expect(frase).not.toBe(RECUSA_DA_EMPRESA);
    expect(frase).toContain('empresa');
  });

  it.each([
    ['contato', RECUSA_DO_CONTATO],
    ['empresa', RECUSA_DA_EMPRESA],
  ])('a frase do caso "%s" não vaza nome de trava nem jargão do banco', (_caso, cru) => {
    const frase = traduzirErroDoBanco(cru);
    for (const jargao of ['constraint', 'violates', 'relation', 'fornecedores_']) {
      expect(frase.toLowerCase()).not.toContain(jargao);
    }
  });

  it('deixa passar intacta a recusa que ninguém traduziu', () => {
    const desconhecida =
      'new row for relation "fornecedores" violates check constraint "fornecedores_uf_check"';
    expect(traduzirErroDoBanco(desconhecida)).toBe(desconhecida);
  });

  it('não engole erro de rede nem mensagem vazia', () => {
    expect(traduzirErroDoBanco('TypeError: Failed to fetch')).toBe('TypeError: Failed to fetch');
    expect(traduzirErroDoBanco('')).toBe('');
  });

  /**
   * Canário: se alguém renomear uma trava aqui dentro sem renomear no banco, a
   * tradução para de disparar em silêncio. Este teste é o que grita.
   */
  it('cobre exatamente as duas travas conferidas no banco', () => {
    expect([...TRAVAS_TRADUZIDAS].sort()).toEqual([
      'fornecedores_cpf_pessoa_exige_pessoa',
      'fornecedores_raiz_pendura_na_empresa',
    ]);
  });
});
