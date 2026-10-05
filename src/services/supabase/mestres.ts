/**
 * O acesso do mestre de obra, do lado do engenheiro (CTO-D696 §4; as três
 * portas do Banco, D696):
 *
 *   quem é mestre ........ core.equipe (papel `mestre`)
 *   em que obra está ..... core.mestre_da_obra (o vínculo aberto: `ate` vazio)
 *   o que aconteceu ...... core.acesso_do_mestre (cadastrado, qr_gerado, desligado, religado)
 *   cadastrar e o QR ..... função de borda `acesso-do-mestre`
 *   pôr e tirar da obra .. core.por_mestre_na_obra / core.tirar_mestre_da_obra
 *   desligar e religar ... core.desligar_mestre / core.religar_mestre
 *
 * E o lado do mestre: entrar com o código do QR (`verifyOtp`).
 *
 * Quem pode é admin e engenharia; a trava mora no banco (`pode_gerir_mestre`),
 * e a tela só esconde o que o banco recusaria.
 */

import type { EmailOtpType } from '@supabase/supabase-js';
import { core, supabase } from './client';
import { todasAsLinhas } from './dados';
import { chamarFuncao } from './recebimento';
import type { AcessoPorQr } from '../../domain/acessoPorQr';

const txt = (v: unknown) => (v === null || v === undefined ? '' : String(v));

export type EventoDoAcesso = 'cadastrado' | 'qr_gerado' | 'desligado' | 'religado';

export interface ObraDoMestreNaLista {
  /** O id do vínculo: é por ele que se tira da obra. */
  vinculo: number;
  obraId: string;
  desde: string;
}

export interface MestreNaLista {
  userId: string;
  nome: string;
  ativo: boolean;
  obras: ObraDoMestreNaLista[];
  /** O último QR gerado: quem e quando. */
  ultimoQr: { porNome: string; em: string } | null;
  /** O motivo do desligamento, quando está desligado. */
  motivoDesligado: string;
}

/** Os mestres, com as obras abertas e o último QR. Desligados por último; depois, pelo nome. */
export async function lerMestres(): Promise<MestreNaLista[]> {
  const [equipe, vinculos, registro] = await Promise.all([
    todasAsLinhas('mestres', (de, ate) =>
      core().from('equipe').select('user_id, nome, ativo', { count: 'exact' })
        .eq('papel', 'mestre').order('nome').order('user_id').range(de, ate)),
    todasAsLinhas('obras dos mestres', (de, ate) =>
      core().from('mestre_da_obra').select('id, user_id, intervencao_id, desde', { count: 'exact' })
        .is('ate', null).order('id').range(de, ate)),
    todasAsLinhas('registro do acesso', (de, ate) =>
      core().from('acesso_do_mestre').select('id, mestre, evento, por_nome, em, motivo', { count: 'exact' })
        .order('id').range(de, ate)),
  ]);
  for (const r of [equipe, vinculos, registro]) if (r.error) throw new Error(r.error.message);

  const obras = new Map<string, ObraDoMestreNaLista[]>();
  for (const l of (vinculos.data ?? []) as Record<string, unknown>[]) {
    const lista = obras.get(txt(l['user_id'])) ?? [];
    lista.push({ vinculo: Number(l['id']), obraId: txt(l['intervencao_id']), desde: txt(l['desde']) });
    obras.set(txt(l['user_id']), lista);
  }
  // Em ordem de id: o último de cada tipo fica por cima.
  const ultimoQr = new Map<string, { porNome: string; em: string }>();
  const desligadoPor = new Map<string, string>();
  for (const l of (registro.data ?? []) as Record<string, unknown>[]) {
    const m = txt(l['mestre']);
    if (l['evento'] === 'qr_gerado') ultimoQr.set(m, { porNome: txt(l['por_nome']), em: txt(l['em']) });
    if (l['evento'] === 'desligado') desligadoPor.set(m, txt(l['motivo']));
  }

  return ((equipe.data ?? []) as Record<string, unknown>[])
    .map((l) => {
      const id = txt(l['user_id']);
      const ativo = l['ativo'] !== false;
      return {
        userId: id,
        nome: txt(l['nome']),
        ativo,
        obras: obras.get(id) ?? [],
        ultimoQr: ultimoQr.get(id) ?? null,
        motivoDesligado: ativo ? '' : (desligadoPor.get(id) ?? ''),
      };
    })
    .sort((a, b) => Number(b.ativo) - Number(a.ativo) || a.nome.localeCompare(b.nome, 'pt-BR'));
}

const TEMPO_DA_FUNCAO_MS = 30_000;

/** A função de borda, com a frase dela quando recusa; sem rede, a frase de sem rede. */
async function acessoDoMestre(corpo: Record<string, unknown>): Promise<Record<string, unknown>> {
  let r: { status: number; json: Record<string, unknown> };
  try {
    r = await chamarFuncao('acesso-do-mestre', corpo, TEMPO_DA_FUNCAO_MS);
  } catch (e) {
    if (e instanceof Error && /sess/i.test(e.message)) throw e;
    throw new Error('Sem sinal para falar com o servidor. Tente de novo.', { cause: e });
  }
  if (r.status === 200) return r.json;
  throw new Error(txt(r.json['erro']) || `O servidor recusou (${r.status}).`);
}

export interface NovoMestre {
  nome: string;
  email: string;
  telefone: string;
  /** A obra onde ele já entra; vazio = depois. */
  obraId: string;
}

/** Cadastra; devolve o id e o aviso (quando o cadastro foi, mas a obra não). */
export async function cadastrarMestre(m: NovoMestre): Promise<{ userId: string; aviso: string }> {
  const j = await acessoDoMestre({
    acao: 'cadastrar',
    nome: m.nome.trim(),
    ...(m.email.trim() ? { email: m.email.trim() } : {}),
    ...(m.telefone.trim() ? { telefone: m.telefone.trim() } : {}),
    ...(m.obraId ? { obra: m.obraId } : {}),
  });
  return { userId: txt(j['user_id']), aviso: txt(j['aviso']) };
}

/** O QR: o link de entrada (uso único) e quando vence. O link não é guardado em lugar nenhum. */
export async function gerarQr(userId: string): Promise<{ link: string; venceEm: string }> {
  const j = await acessoDoMestre({ acao: 'gerar_qr', mestre: userId });
  const link = txt(j['link']);
  if (!link) throw new Error('O servidor não devolveu o acesso. Tente de novo.');
  return { link, venceEm: txt(j['vence_em']) };
}

async function rpc(nome: string, args: Record<string, unknown>): Promise<unknown> {
  const { data, error } = await core().rpc(nome, args);
  if (error) throw new Error(error.message);
  return data;
}

export async function porNaObra(userId: string, obraId: string): Promise<void> {
  await rpc('por_mestre_na_obra', { p_mestre: userId, p_obra: obraId });
}

export async function tirarDaObra(vinculo: number, motivo: string): Promise<void> {
  await rpc('tirar_mestre_da_obra', { p_id: vinculo, p_motivo: motivo.trim() });
}

export async function desligarMestre(userId: string, motivo: string): Promise<void> {
  await rpc('desligar_mestre', { p_mestre: userId, p_motivo: motivo.trim() });
}

export async function religarMestre(userId: string): Promise<void> {
  await rpc('religar_mestre', { p_mestre: userId });
}

/** A entrada em curso (ou que deu certo) de cada código: pedir de novo não gasta o QR outra vez. */
const entradas = new Map<string, Promise<void>>();

/**
 * O mestre entra com o código do QR. Uso único: o mesmo QR não entra duas
 * vezes, nem depois de vencer. Pedir duas vezes o mesmo código (a tela que
 * monta duas vezes) devolve a mesma tentativa; a que falhou pode tentar de novo.
 */
export function entrarComOQr(a: AcessoPorQr): Promise<void> {
  const ja = entradas.get(a.codigo);
  if (ja) return ja;
  const tentativa = verificar(a).catch((e: unknown) => {
    entradas.delete(a.codigo);
    throw e;
  });
  entradas.set(a.codigo, tentativa);
  return tentativa;
}

async function verificar(a: AcessoPorQr): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ token_hash: a.codigo, type: a.tipo as EmailOtpType });
  if (!error) return;
  if (/expired|invalid|not found|used/i.test(error.message) || error.status === 403) {
    throw new Error('Este QR já foi usado ou venceu. Peça outro ao engenheiro.');
  }
  if (error.status === 0 || /fetch|network/i.test(error.message)) {
    throw new Error('Sem sinal para entrar. Chegue perto do sinal e tente de novo.');
  }
  throw new Error(`Não deu para entrar: ${error.message}`);
}
