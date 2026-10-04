/**
 * O PDF da OC na pasta da obra: a chamada à `guardar-oc-na-obra` do Banco
 * (D682 §2) e a leitura do ✓ em `compras.oc_pdf_na_pasta` (CTO-D685).
 *
 * A chamada vai por `fetch`, como a `extrair-itens`: só o token da sessão e o
 * tipo do corpo, e um tempo máximo — a emissão não fica presa numa função que
 * não responde. Nada aqui lança: a falha volta como resposta, e quem chama cai
 * no caminho de hoje.
 */

import { compras, supabase } from './client';
import { todasAsLinhas } from './dados';
import { savePdfToFile } from '../pdf/generateOcPdf';
import { getObraDirHandle } from '../storage/handles';
import { verifyHandlePermission } from '../storage/permissions';
import {
  lerRespostaDaPasta, paraBase64, semResposta, type CaminhoDeHoje, type PdfNaPasta, type RespostaDaPasta,
} from '../../domain/pastaDaObra';

/** O PDF de uma OC tem dezenas de KB e o Graph grava em segundos; passou disto, é o caminho de hoje. */
export const TEMPO_MAXIMO_MS = 30_000;

async function bytesDoBlob(blob: Blob): Promise<Uint8Array> {
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

/** Manda o PDF para a pasta da obra. Nunca lança: sem login, sem rede ou sem tempo viram resposta. */
export async function guardarOcNaObra(ocId: string, pdf: Blob, nomeArquivo: string): Promise<RespostaDaPasta> {
  try {
    const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
    if (!url) return semResposta('O endereço do servidor não está configurado.');
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) return semResposta('A sessão expirou.');

    const corpo = { oc_id: ocId, pdf_base64: paraBase64(await bytesDoBlob(pdf)), nome_arquivo: nomeArquivo };
    const freio = new AbortController();
    const relogio = setTimeout(() => freio.abort(), TEMPO_MAXIMO_MS);
    try {
      // Sem `apikey`, como na `extrair-itens`: o token da sessão autentica sozinho.
      const resp = await fetch(`${url}/functions/v1/guardar-oc-na-obra`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        signal: freio.signal,
      });
      let json: unknown = null;
      try {
        json = await resp.json();
      } catch {
        /* sem corpo: fica a resposta só com o status */
      }
      return lerRespostaDaPasta(resp.status, json);
    } finally {
      clearTimeout(relogio);
    }
  } catch (e) {
    const tempo = e instanceof DOMException && e.name === 'AbortError';
    return semResposta(tempo ? 'A pasta da obra demorou demais para responder.' : 'A pasta da obra não respondeu.');
  }
}

/**
 * A pasta ligada a esta obra NESTE navegador (o botão em Obras), se ainda
 * houver permissão. É a reserva: só entra quando a função falha (D685 §3.5).
 */
async function pastaDoNavegador(obraId: string): Promise<FileSystemDirectoryHandle | undefined> {
  try {
    const guardada = await getObraDirHandle(obraId);
    return guardada && (await verifyHandlePermission(guardada, true)) ? guardada : undefined;
  } catch {
    return undefined;
  }
}

/**
 * As duas portas (a emissão e o "mandar de novo") passam por aqui, para a
 * regra ser uma só: o Graph primeiro; com 200, o PDF NÃO é salvo de novo; com
 * qualquer outra coisa, a pasta deste navegador, se houver, e senão o download.
 */
export async function entregarPdfDaOc(
  oc: { id: string; obra_id: string },
  pdf: Blob,
  nomeArquivo: string,
): Promise<{ resposta: RespostaDaPasta; caminho: CaminhoDeHoje | null }> {
  const resposta = await guardarOcNaObra(oc.id, pdf, nomeArquivo);
  if (resposta.ok) return { resposta, caminho: null };
  const caminho = await savePdfToFile(pdf, nomeArquivo, await pastaDoNavegador(oc.obra_id));
  return { resposta, caminho };
}

/**
 * O ✓ de cada OC, pelo id. `null` quando a leitura falha — inclusive quando a
 * tabela ainda não existe (ela nasce no passo 1 do §6 da D682): aí a tela não
 * mostra a coluna, em vez de dizer "não está na pasta" de toda OC.
 */
export async function lerPdfsNaPasta(): Promise<Map<string, PdfNaPasta> | null> {
  try {
    const r = await todasAsLinhas('PDFs na pasta da obra', (de, ate) =>
      compras().from('oc_pdf_na_pasta').select('oc_id, web_url, nome, gravado_em, vezes', { count: 'exact' })
        .order('oc_id').range(de, ate));
    if (r.error) return null;
    const mapa = new Map<string, PdfNaPasta>();
    for (const l of (r.data ?? []) as Record<string, unknown>[]) {
      const ocId = String(l['oc_id'] ?? '');
      if (!ocId) continue;
      mapa.set(ocId, {
        ocId,
        webUrl: String(l['web_url'] ?? ''),
        nome: String(l['nome'] ?? ''),
        gravadoEm: String(l['gravado_em'] ?? ''),
        vezes: Number(l['vezes']) || 0,
      });
    }
    return mapa;
  } catch {
    return null;
  }
}
