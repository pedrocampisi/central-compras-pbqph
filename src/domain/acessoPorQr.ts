/**
 * O acesso do mestre pelo QR (CTO-D696 §4; Banco D696 §3, D697): o que o QR
 * carrega, de onde ele é lido e quanto tempo falta. Lógica pura, sem tela.
 *
 * O Banco devolve um link de entrada de uso único (`generateLink`, magiclink).
 * A tela NÃO desenha esse link: desenha o endereço da OC com o código do link
 * depois do `#` (`/#entrar=<código>&tipo=magiclink`). Três razões:
 *
 *   1. **O iPhone.** O ícone na tela do iPhone tem cookies e memória separados do
 *      Safari, e nada passa de um para o outro (Apple, WWDC23 "What's new in web
 *      apps": a cópia de cookies ao instalar é só do Mac). O link do Banco,
 *      aberto pela câmera, gastaria o QR no Safari, e o ícone abriria sem
 *      ninguém. Com o código na OC, o Safari do iPhone NÃO gasta: ensina a pôr
 *      o ícone, e o ícone lê o MESMO QR e entra ele mesmo.
 *   2. **Depois do `#` nada vai ao servidor.** O código não passa pelo
 *      endereço que o servidor da OC recebe, nem pelo registro dele.
 *   3. **Um QR menos denso** (o endereço é mais curto): a câmera lê de mais longe.
 *
 * O código é o mesmo segredo do link, com as mesmas travas: uso único, só para
 * perfil `mestre` (a trava mora no banco).
 *
 * Dois tipos (Banco D1036b): `qr_do_mestre`, o QR de 24 horas, cujo código é
 * do Banco e se troca na `entrar-pelo-qr` pelo link de entrada na hora da
 * leitura; e `magiclink`, o QR de uma hora de antes, que vai direto ao login.
 * Quanto tempo vale, quem diz é o `vence_em` que o Banco devolve.
 */

export interface AcessoPorQr {
  /** O código do link de entrada (o `token` do link do Banco). */
  codigo: string;
  /** O tipo do link (`magiclink`): vai junto para o banco conferir. */
  tipo: string;
}

const CHAVE = 'entrar';
/** Só letras, números, `-` e `_`: o código do Auth é hexadecimal; o resto é lixo ou ataque. */
const CODIGO_VALIDO = /^[A-Za-z0-9_-]{16,200}$/;
const TIPO_VALIDO = /^[a-z_]{3,20}$/;

/** O código e o tipo de dentro do link do Banco; null se o link não tem. */
export function acessoDoLink(link: string): AcessoPorQr | null {
  let u: URL;
  try {
    u = new URL(link);
  } catch {
    return null;
  }
  const codigo = u.searchParams.get('token') ?? '';
  const tipo = u.searchParams.get('type') ?? 'magiclink';
  return CODIGO_VALIDO.test(codigo) && TIPO_VALIDO.test(tipo) ? { codigo, tipo } : null;
}

/** O endereço que o QR desenha: a raiz da OC, com o acesso depois do `#`. */
export function enderecoDoQr(origem: string, a: AcessoPorQr): string {
  return `${origem.replace(/\/+$/, '')}/#${CHAVE}=${encodeURIComponent(a.codigo)}&tipo=${encodeURIComponent(a.tipo)}`;
}

/** O acesso do `#` do endereço (`location.hash`); null se não há. */
export function acessoDoHash(hash: string): AcessoPorQr | null {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const codigo = p.get(CHAVE) ?? '';
  const tipo = p.get('tipo') ?? 'magiclink';
  return CODIGO_VALIDO.test(codigo) && TIPO_VALIDO.test(tipo) ? { codigo, tipo } : null;
}

/**
 * O acesso de um QR lido pela câmera do ícone. Só aceita QR desta OC (o
 * endereço com `#entrar=`) ou o link do próprio servidor de login — um QR de
 * outro lugar não vira tentativa de entrar.
 */
export function acessoDoTextoLido(texto: string, origensAceitas: readonly string[]): AcessoPorQr | null {
  let u: URL;
  try {
    u = new URL(texto.trim());
  } catch {
    return null;
  }
  const aceitas = origensAceitas.map((o) => o.replace(/\/+$/, ''));
  if (!aceitas.includes(u.origin)) return null;
  return acessoDoHash(u.hash) ?? acessoDoLink(u.href);
}

/**
 * "59:12" até vencer, na última hora; acima de uma hora, "23 h 59 min" (o QR
 * de 24 horas da CTO-D1036 §2.1, que dizia "1439:59"). null quando venceu.
 */
export function tempoQueFalta(venceEm: string, agora: Date): string | null {
  const ms = Date.parse(venceEm) - agora.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const s = Math.ceil(ms / 1000);
  if (s > 3600) {
    const min = Math.ceil(s / 60);
    return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`;
  }
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const DIA_SP = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

/** "12/11 às 15h05", sem "hoje" nem "amanhã": para a imagem que vai ao engenheiro, lida no outro dia. */
export function diaEHoraDoVencimento(venceEm: string): string {
  const v = new Date(venceEm);
  if (!Number.isFinite(v.getTime())) return '';
  const [, mes, d] = DIA_SP(v).split('-');
  const [h, m] = v
    .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' })
    .split(':');
  return `${d}/${mes} às ${h}h${m}`;
}

/** "hoje às 15h05", "amanhã às 15h05" ou "em 12/11 às 15h05", no horário de Brasília; '' se não se lê. */
export function quandoVence(venceEm: string, agora: Date): string {
  const v = new Date(venceEm);
  if (!Number.isFinite(v.getTime())) return '';
  const [h, m] = v
    .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' })
    .split(':');
  const hora = `${h}h${m}`;
  const dia = DIA_SP(v);
  if (dia === DIA_SP(agora)) return `hoje às ${hora}`;
  if (dia === DIA_SP(new Date(agora.getTime() + 86_400_000))) return `amanhã às ${hora}`;
  const [, mes, d] = dia.split('-');
  return `em ${d}/${mes} às ${hora}`;
}

/** iPhone ou iPad (o iPad novo se diz Mac, mas tem toque). */
export function ehAparelhoDaApple(userAgent: string, pontosDeToque: number): boolean {
  return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && pontosDeToque > 1);
}

/**
 * O que a OC faz com o acesso que chegou no endereço:
 * - `entrar`: entra já (Android, computador, ou já dentro do ícone);
 * - `por-o-icone`: iPhone fora do ícone — guarda o QR sem gastar, e ensina a pôr o ícone.
 */
export function oQueFazerComOAcesso(aparelhoDaApple: boolean, noIcone: boolean): 'entrar' | 'por-o-icone' {
  return aparelhoDaApple && !noIcone ? 'por-o-icone' : 'entrar';
}
