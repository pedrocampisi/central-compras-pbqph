/**
 * O recebimento pelo mestre de obra, ligado ao contrato do Banco (CTO-D693,
 * D696; carta do Banco D697 §2):
 *
 *   a lista ............ compras.material_a_chegar  (o mestre vê só as obras dele)
 *   as obras dele ...... core.obras_do_mestre_com_nome  (Banco-D710)
 *   a foto da nota ..... arquivar-documento, origem `recebimento-obra`
 *   o número na foto ... ler-documento, origem `ordem-compra`
 *   o papel da ECR ..... arquivar-documento, `origem_item` `registro-ecr-NN`, com a leitura em `extracao`;
 *                        a leitura, ler-documento, origem `registro-ecr` (D811; o contrato do Banco, D813)
 *   a entrega .......... compras.registrar_entrega  (sem versão: para o mestre não é conferida)
 *   o sem pedido ....... compras.registrar_sem_pedido
 *
 * E o lado do escritório: a fila do sem pedido (compras.sem_pedido_na_fila),
 * ligar a uma OC e descartar.
 *
 * Quem decide se uma falha espera ou para é a régua do domínio
 * (`oQueFazerComARecusa`): aqui ela vira `RecusaDefinitiva` (para) ou erro
 * comum (a fila do celular tenta de novo).
 */

import { compras, core, supabase } from './client';
import { todasAsLinhas } from './dados';
import { paraBase64 } from '../../domain/pastaDaObra';
import {
  RecusaDefinitiva, oQueFazerComARecusa, oQueFazerComOStatus, type CartaoAChegar, type ItemRecebido, type ObraDoMestre,
} from '../../domain/recebimento';
import type { Avaliacao } from '../../domain/qualificacao';
import {
  ALCANCES, type Alcance, type LeituraDoRegistro, type RegistroNoEnvio, type RegistroPedido,
} from '../../domain/registroDoFornecedor';

// ---------------------------------------------------------------------------
// A lista
// ---------------------------------------------------------------------------

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const txt = (v: unknown) => (v === null || v === undefined ? '' : String(v));

const objeto = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/**
 * O registro do fornecedor de uma ECR da entrega, como a `material_a_chegar` o
 * manda (o contrato do Banco, D813 §2): o `o_que_pede` é `{ecr, revisao,
 * emitida_em, itens}`, e `itens` é nulo quando a revisão não tem o texto. A
 * marca `a_cada_entrega` é das ECRs 01, 02 e 17 (o pedido 2 da D840 ao Banco).
 */
function registroDaLinha(r: Record<string, unknown>): RegistroPedido {
  const oQuePede = objeto(r['o_que_pede']);
  const itens = Array.isArray(oQuePede['itens']) ? (oQuePede['itens'] as unknown[]) : [];
  const posicoes = Array.isArray(r['posicoes']) ? (r['posicoes'] as unknown[]) : [];
  return {
    ecrId: num(r['ecr_id']),
    pede: r['pede'] === true,
    aCadaEntrega: r['a_cada_entrega'] === true,
    porque: txt(r['porque']),
    revisao: txt(oQuePede['revisao']),
    linhas: itens
      .map((i) => {
        const it = objeto(i);
        const rotulo = typeof it['rotulo'] === 'string' && it['rotulo'].trim() ? it['rotulo'] : null;
        return { rotulo, texto: txt(it['texto']), numerado: it['numerado'] === true };
      })
      .filter((x) => x.texto.trim()),
    posicoes: posicoes.map(Number).filter((p) => Number.isInteger(p) && p >= 1),
  };
}

/** Uma linha da `compras.material_a_chegar` → o cartão que o mestre vê. */
export function cartaoDaLinha(l: Record<string, unknown>): CartaoAChegar {
  const itens = Array.isArray(l['itens']) ? (l['itens'] as Record<string, unknown>[]) : [];
  const registros = l['registros'];
  return {
    ocId: txt(l['oc_id']),
    intervencaoId: txt(l['intervencao_id']),
    obra: txt(l['obra']),
    numero: txt(l['numero']),
    fornecedor: txt(l['fornecedor']),
    combinadoPara: txt(l['entrega_prevista']).slice(0, 10),
    itens: itens.map((i) => ({
      // a posição na OC: é ela que a quantidade por item leva de volta (Banco-D794 §3)
      ...(Number.isInteger(Number(i['posicao'])) && Number(i['posicao']) >= 1 ? { posicao: Number(i['posicao']) } : {}),
      descricao: txt(i['descricao']),
      quantidade: num(i['quantidade']),
      unidade: txt(i['unidade']),
    })),
    total: num(l['valor_total']),
    // Só quando o banco manda: sem a chave, o carimbo fica como antes.
    ...(Array.isArray(registros) && {
      registros: (registros as Record<string, unknown>[]).map(registroDaLinha).filter((r) => r.ecrId > 0),
    }),
  };
}

export interface ListaDoMestre {
  cartoes: CartaoAChegar[];
  /** As obras em que ele está hoje, com o nome, inclusive a que não tem pedido a caminho. */
  obras: ObraDoMestre[];
}

/**
 * As duas leituras vão página por página até a contagem (perícia 05/10,
 * achado 9): a API corta em mil linhas sem erro, e lista pela metade acusa em
 * vez de seguir calada. A ordem é a das funções, com o id de desempate, para
 * as páginas não se sobreporem.
 */
export async function lerMaterialAChegar(): Promise<ListaDoMestre> {
  const [lista, obras] = await Promise.all([
    todasAsLinhas('material a chegar', (de, ate) =>
      compras()
        .rpc('material_a_chegar', {}, { count: 'exact' })
        .order('entrega_prevista', { nullsFirst: false })
        .order('data')
        .order('numero')
        .order('oc_id')
        .range(de, ate)),
    todasAsLinhas('obras do encarregado', (de, ate) =>
      core().rpc('obras_do_mestre_com_nome', {}, { count: 'exact' }).order('obra').order('intervencao_id').range(de, ate)),
  ]);
  if (lista.error) throw new Error(lista.error.message);
  if (obras.error) throw new Error(obras.error.message);
  return {
    cartoes: ((lista.data ?? []) as Record<string, unknown>[]).map(cartaoDaLinha),
    obras: ((obras.data ?? []) as Record<string, unknown>[])
      .map((o) => ({ id: txt(o['intervencao_id']), nome: txt(o['obra']) }))
      .filter((o) => o.id),
  };
}

// ---------------------------------------------------------------------------
// As funções de borda (a foto)
// ---------------------------------------------------------------------------

/** O tamanho que basta para ler o número da nota, e que sobe com sinal fraco. */
const LADO_MAXIMO = 2000;
/** Abaixo disto a foto vai como está. */
const PEQUENA_BYTES = 700_000;
const MIMES_DA_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
export const TEMPO_DA_FOTO_MS = 60_000;
export const TEMPO_DA_LEITURA_MS = 25_000;

export async function bytesDoBlob(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === 'function') return new Uint8Array(await blob.arrayBuffer());
  return new Uint8Array(
    await new Promise<ArrayBuffer>((ok, falha) => {
      const r = new FileReader();
      r.onload = () => ok(r.result as ArrayBuffer);
      r.onerror = () => falha(r.error);
      r.readAsArrayBuffer(blob);
    }),
  );
}

/** A foto em JPEG, no máximo `LADO_MAXIMO`; `null` onde o navegador não sabe desenhar. */
async function reduzir(foto: Blob): Promise<Blob | null> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return null;
  try {
    const img = await createImageBitmap(foto);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height));
    const tela = document.createElement('canvas');
    tela.width = Math.round(img.width * escala);
    tela.height = Math.round(img.height * escala);
    const ctx = tela.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, tela.width, tela.height);
    img.close();
    return await new Promise<Blob | null>((ok) => tela.toBlob(ok, 'image/jpeg', 0.85));
  } catch {
    return null;
  }
}

/** A foto pronta para subir: pequena, num formato que o arquivo aceita. */
export async function prepararFoto(foto: Blob): Promise<{ base64: string; mime: string }> {
  const aceita = MIMES_DA_FOTO.includes(foto.type);
  const reduzida = aceita && foto.size <= PEQUENA_BYTES ? null : await reduzir(foto);
  if (reduzida) return { base64: paraBase64(await bytesDoBlob(reduzida)), mime: 'image/jpeg' };
  if (!aceita) throw new RecusaDefinitiva('Não consegui usar esta foto. Abra o pedido e tire outra.');
  return { base64: paraBase64(await bytesDoBlob(foto)), mime: foto.type };
}

/** Chama uma função de borda com o crachá da sessão. Sem rede ou sem tempo, lança erro comum (espera). */
export async function chamarFuncao(
  nome: string,
  corpo: unknown,
  tempoMs: number,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
  if (!url) throw new Error('O endereço do servidor não está configurado.');
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error('A sessão expirou.');
  const freio = new AbortController();
  const relogio = setTimeout(() => freio.abort(), tempoMs);
  try {
    // Sem `apikey`, como a `extrair-itens` e a `guardar-oc-na-obra`: o token da sessão autentica sozinho.
    const resp = await fetch(`${url}/functions/v1/${nome}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      signal: freio.signal,
    });
    let json: Record<string, unknown> = {};
    try {
      json = ((await resp.json()) ?? {}) as Record<string, unknown>;
    } catch {
      /* sem corpo: fica só o status */
    }
    return { status: resp.status, json };
  } finally {
    clearTimeout(relogio);
  }
}

/**
 * O documento de cada foto já arquivada, pela chave do envio: a nova tentativa
 * (a entrega falhou depois de a foto subir) não sobe os bytes de novo. Some ao
 * fechar o app; aí a foto sobe outra vez, e a régua de hash do Banco devolve o
 * mesmo documento (`ja_existia`).
 */
const fotosArquivadas = new Map<string, string>();

/**
 * Guarda a foto na pasta da obra; devolve o id do documento. A da nota, ou o
 * papel de uma ECR (`origemItem` `registro-ecr-08`, com a chave própria dele e
 * a leitura em `extracao`, que o banco guarda no documento).
 */
export async function arquivarFotoDoRecebimento(
  foto: Blob,
  intervencaoId: string,
  chave: string,
  origemItem = 'foto-da-nota',
  extracao?: Record<string, unknown>,
): Promise<string> {
  const ja = fotosArquivadas.get(chave);
  if (ja) return ja;
  const { base64, mime } = await prepararFoto(foto);
  const { status, json } = await chamarFuncao(
    'arquivar-documento',
    {
      arquivo_base64: base64,
      nome_arquivo: `recebimento-${chave}.${mime === 'image/jpeg' ? 'jpg' : mime.slice(6)}`,
      mime,
      origem: 'recebimento-obra',
      origem_id: chave,
      origem_item: origemItem,
      intervencao_id: intervencaoId,
      ...(extracao ? { extracao } : {}),
    },
    TEMPO_DA_FOTO_MS,
  );
  const documento = json['documento'] as Record<string, unknown> | null | undefined;
  const id = txt(documento?.['id']);
  if (status === 200 && id) {
    fotosArquivadas.set(chave, id);
    return id;
  }
  const motivo = txt(json['erro']) || (origemItem === 'foto-da-nota' ? 'A foto da nota não foi aceita.' : 'A foto do papel não foi aceita.');
  if (status !== 200 && oQueFazerComOStatus(status) === 'para') throw new RecusaDefinitiva(motivo);
  throw new Error(motivo);
}

/** Lê o número da nota na foto. Nunca lança: sem leitura, '' — ele escreve o número. */
export async function lerNumeroDaNotaNaFoto(foto: Blob): Promise<string> {
  try {
    const { base64, mime } = await prepararFoto(foto);
    const { status, json } = await chamarFuncao(
      'ler-documento',
      { imagem_base64: base64, mime, origem: 'ordem-compra' },
      TEMPO_DA_LEITURA_MS,
    );
    return status === 200 ? txt(json['numero_documento']).trim() : '';
  } catch {
    return '';
  }
}

/**
 * Lê o papel da ECR na foto: deste lote, vale até uma data, ou vale para o
 * produto (D811 §3). Nunca lança: sem leitura, `null`, e a tela conta como
 * deste lote.
 */
export async function lerRegistroNaFoto(foto: Blob): Promise<LeituraDoRegistro | null> {
  try {
    const { base64, mime } = await prepararFoto(foto);
    const { status, json } = await chamarFuncao(
      'ler-documento',
      { imagem_base64: base64, mime, origem: 'registro-ecr' },
      TEMPO_DA_LEITURA_MS,
    );
    return status === 200 ? leituraDaResposta(json) : null;
  } catch {
    return null;
  }
}

/** A resposta da `ler-documento` (origem `registro-ecr`) → a leitura da tela, com a resposta inteira em `bruta`. */
export function leituraDaResposta(json: Record<string, unknown>): LeituraDoRegistro {
  const alcance = txt(json['alcance']);
  return {
    alcance: (ALCANCES as readonly string[]).includes(alcance) ? (alcance as Alcance) : null,
    validoAte: txt(json['valido_ate']).slice(0, 10),
    confira: txt(json['confira']),
    bruta: json,
  };
}

// ---------------------------------------------------------------------------
// As gravações do mestre
// ---------------------------------------------------------------------------

interface RespostaDoRpc {
  data: unknown;
  error: { code?: string; message: string } | null;
  status: number;
}

/**
 * Chama, e aplica a régua: 23505 manda de novo uma vez (a segunda volta
 * "já estava"); "para" vira `RecusaDefinitiva`, com a mensagem do banco como
 * veio; o resto é erro comum, e a fila espera.
 */
async function comARegua(chamar: () => PromiseLike<RespostaDoRpc>): Promise<Record<string, unknown>> {
  for (let vez = 1; ; vez++) {
    const { data, error, status } = await chamar();
    if (!error) return (data ?? {}) as Record<string, unknown>;
    const fazer = oQueFazerComARecusa(error.code, status);
    if (fazer === 'de-novo-uma-vez' && vez === 1) continue;
    if (fazer === 'espera') throw new Error(error.message);
    throw new RecusaDefinitiva(error.message);
  }
}

export interface EntregaDoMestre {
  chave: string;
  ocId: string;
  intervencaoId: string;
  avaliacao: Avaliacao;
  soUmaParte: boolean;
  foto: Blob | null;
  /** Quanto veio de cada item (D794). Vazio, ou ausente no envio guardado por uma versão antiga: grava como antes. */
  itens?: ItemRecebido[];
  /** O papel do fornecedor que o encarregado anexou, por ECR que o banco pede (D811, D840), com a foto. */
  registros?: (RegistroNoEnvio & { foto?: Blob | null })[];
}

const doisDigitos = (n: number) => String(n).padStart(2, '0');

/**
 * Cada papel sobe com a chave dele e a leitura como veio; o envio leva o
 * documento e o alcance conferido. A leitura não vai na entrega: mora no
 * documento (Banco-D812 §4). Só vai o papel que veio, com a foto (Banco-D840):
 * o que não veio, a lista do escritório cuida.
 */
async function registrosParaGravar(e: EntregaDoMestre): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  for (const r of e.registros ?? []) {
    if (r.resposta !== 'veio' || !r.foto) continue;
    const ecr = doisDigitos(r.ecrId);
    const documentoId = await arquivarFotoDoRecebimento(r.foto, e.intervencaoId, `${e.chave}-ecr-${ecr}`, `registro-ecr-${ecr}`, r.lido?.bruta);
    out.push({
      ecr_id: r.ecrId,
      resposta: 'veio',
      documento_id: documentoId,
      ...(r.alcance ? { alcance: r.alcance } : {}),
      ...(r.alcance === 'vale_ate' && r.validoAte ? { valido_ate: r.validoAte } : {}),
    });
  }
  return out;
}

/**
 * A entrega. Devolve o recado do banco quando a OC já não recebia entrega e o
 * recebimento foi para a fila do escritório (D699 §2); '' quando entrou na OC.
 */
export async function registrarEntregaDoMestre(e: EntregaDoMestre): Promise<string> {
  const fotoId = e.foto ? await arquivarFotoDoRecebimento(e.foto, e.intervencaoId, e.chave) : '';
  const registros = await registrosParaGravar(e);
  const a = e.avaliacao;
  const p = {
    nota_fiscal: a.notaFiscal.trim(),
    recebido_em: a.recebidoEm,
    prazo_conforme: a.prazoConforme,
    integridade_conforme: a.integridadeConforme,
    oc_ecr_conforme: a.ocEcrConforme,
    ...(a.observacao.trim() ? { observacao: a.observacao.trim() } : {}),
    ...(a.tratativa.trim() ? { tratativa: a.tratativa.trim() } : {}),
    chegou_tudo: !e.soUmaParte,
    ...(fotoId ? { foto_documento_id: fotoId } : {}),
    ...(e.itens?.length ? { itens: e.itens.map((i) => ({ posicao: i.posicao, quantidade: i.quantidade })) } : {}),
    // Sem ECR pedida, a chave nem vai: o banco de antes recebe como sempre recebeu.
    ...(registros.length ? { registros } : {}),
    chave: e.chave,
  };
  // Sem versão: a entrega guardada horas no celular é o fato da obra (Banco D697 §2.2.3).
  const r = await comARegua(() => compras().rpc('registrar_entrega', { p_oc_id: e.ocId, p_versao: null, p }));
  return r['desfecho'] === 'na_fila' ? txt(r['mensagem']) || 'Ele foi para o escritório resolver.' : '';
}

export interface SemPedidoDoMestre {
  chave: string;
  intervencaoId: string;
  recebidoEm: string;
  foto: Blob | null;
  numeroDaNota: string;
  deQuem: string;
  oQueChegou: string;
  comEstrago: boolean;
}

export async function registrarSemPedidoDoMestre(e: SemPedidoDoMestre): Promise<void> {
  const fotoId = e.foto ? await arquivarFotoDoRecebimento(e.foto, e.intervencaoId, e.chave) : '';
  const p = {
    intervencao_id: e.intervencaoId,
    recebido_em: e.recebidoEm,
    o_que_chegou: e.oQueChegou.trim(),
    chegou_com_estrago: e.comEstrago,
    ...(e.numeroDaNota.trim() ? { nota_fiscal: e.numeroDaNota.trim() } : {}),
    ...(fotoId ? { foto_documento_id: fotoId } : {}),
    ...(e.deQuem.trim() ? { fornecedor_texto: e.deQuem.trim() } : {}),
    chave: e.chave,
  };
  await comARegua(() => compras().rpc('registrar_sem_pedido', { p }));
}

// ---------------------------------------------------------------------------
// O escritório: a fila do sem pedido
// ---------------------------------------------------------------------------

export interface SemPedidoNaFila {
  id: number;
  intervencaoId: string;
  obra: string;
  recebidoEm: string;
  fornecedorTexto: string;
  notaFiscal: string;
  oQueChegou: string;
  chegouComEstrago: boolean;
  observacao: string;
  fotoDocumentoId: string;
  registradoPorNome: string;
  criadoEm: string;
  /** A OC que o mestre recebeu, quando ela já não recebia entrega (D699 §2). */
  ocInformadaId: string;
  ocInformadaNumero: string;
}

export function semPedidoDaLinha(l: Record<string, unknown>): SemPedidoNaFila {
  return {
    id: num(l['id']),
    intervencaoId: txt(l['intervencao_id']),
    obra: txt(l['obra']),
    recebidoEm: txt(l['recebido_em']).slice(0, 10),
    fornecedorTexto: txt(l['fornecedor_texto']),
    notaFiscal: txt(l['nota_fiscal']),
    oQueChegou: txt(l['o_que_chegou']),
    chegouComEstrago: l['chegou_com_estrago'] === true,
    observacao: txt(l['observacao']),
    fotoDocumentoId: txt(l['foto_documento_id']),
    registradoPorNome: txt(l['registrado_por_nome']),
    criadoEm: txt(l['criado_em']),
    ocInformadaId: txt(l['oc_informada_id']),
    ocInformadaNumero: txt(l['oc_informada_numero']),
  };
}

/**
 * A fila do escritório. Com a máscara de uma obra (`obra`), o filtro vai NA
 * consulta: as linhas das outras obras nem chegam ao navegador (perícia 05/10,
 * achado 5; a família da D620).
 */
export async function lerFilaSemPedido(obra: string | null): Promise<SemPedidoNaFila[]> {
  const r = await todasAsLinhas('recebimentos sem pedido', (de, ate) => {
    const q = compras().from('sem_pedido_na_fila').select('*', { count: 'exact' });
    return (obra ? q.eq('intervencao_id', obra) : q).order('criado_em').order('id').range(de, ate);
  });
  if (r.error) throw new Error(`Falha ao ler os recebimentos sem pedido: ${r.error.message}`);
  return ((r.data ?? []) as Record<string, unknown>[]).map(semPedidoDaLinha);
}

/** O link de cada foto (o OneDrive da obra), pelo id do documento. Sem leitura, mapa vazio. */
export async function lerLinksDasFotos(ids: readonly string[]): Promise<Map<string, string>> {
  const unicos = [...new Set(ids.filter(Boolean))];
  if (unicos.length === 0) return new Map();
  const { data, error } = await core().from('documentos').select('id, onedrive_url').in('id', unicos);
  if (error) return new Map();
  return new Map(
    ((data ?? []) as Record<string, unknown>[])
      .filter((l) => txt(l['onedrive_url']))
      .map((l) => [txt(l['id']), txt(l['onedrive_url'])] as const),
  );
}

export interface Ligacao {
  ocId: string;
  versao: number;
  /** Só quando o mestre mandou a foto sem o número: o banco exige o número da nota na avaliação. */
  notaFiscal: string;
  prazoConforme: boolean;
  ocEcrConforme: boolean;
  chegouTudo: boolean;
  tratativa: string;
  observacao: string;
}

/** Liga o recebimento a uma OC da mesma obra: vira a avaliação dela (a integridade é o que o mestre disse). */
export async function ligarSemPedido(id: number, l: Ligacao): Promise<void> {
  const p = {
    ...(l.notaFiscal.trim() ? { nota_fiscal: l.notaFiscal.trim() } : {}),
    prazo_conforme: l.prazoConforme,
    oc_ecr_conforme: l.ocEcrConforme,
    chegou_tudo: l.chegouTudo,
    ...(l.tratativa.trim() ? { tratativa: l.tratativa.trim() } : {}),
    ...(l.observacao.trim() ? { observacao: l.observacao.trim() } : {}),
  };
  const { error } = await compras().rpc('ligar_sem_pedido', { p_id: id, p_oc_id: l.ocId, p_versao: l.versao, p });
  if (error) throw new Error(error.message);
}

export async function descartarSemPedido(id: number, motivo: string): Promise<void> {
  const { error } = await compras().rpc('descartar_sem_pedido', { p_id: id, p_motivo: motivo.trim() });
  if (error) throw new Error(error.message);
}
