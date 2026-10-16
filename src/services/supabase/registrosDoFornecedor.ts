/**
 * O registro do fornecedor pelo escritório, no contrato do Banco (CTO-D812,
 * D813 §4; o ramo do Banco `d812-parte-c-registros-do-fornecedor`):
 *
 *   ler ............. compras.registros_do_fornecedor, as correções
 *                     (compras.registros_do_fornecedor_correcoes) e a marca
 *                     "a cada entrega" (compras.ecrs_registro_a_cada_entrega)
 *   a leitura ....... ler-documento, origem `registro-ecr` (foto ou PDF)
 *   o arquivo ....... arquivar-documento, origem `qualificacao-fornecedor`, com o `fornecedor_id`
 *   guardar ......... compras.guardar_registro_do_fornecedor (a qualificação, o "Anexar" na OC,
 *                     ou a entrega da lista sem papel, com o `avaliacao_id`: D840 §2.5)
 *   corrigir ........ compras.corrigir_registro_do_fornecedor (a correção fica escrita)
 *
 * Ninguém escreve direto nas tabelas, e o banco recusa quem tentar. A recusa
 * do banco já vem em frase de gente, e sobe como veio.
 */

import { compras } from './client';
import { todasAsLinhas } from './dados';
import { bytesDoBlob, chamarFuncao, leituraDaResposta, prepararFoto, TEMPO_DA_FOTO_MS, TEMPO_DA_LEITURA_MS } from './recebimento';
import { paraBase64 } from '../../domain/pastaDaObra';
import { ALCANCES, type Alcance, type LeituraDoRegistro } from '../../domain/registroDoFornecedor';
import type {
  CorrecaoDoAlcance, EntrouPor, MarcaACadaEntrega, RegistroGuardado, RegistrosDoFornecedor,
} from '../../domain/registrosGuardados';

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const txt = (v: unknown) => (v === null || v === undefined ? '' : String(v));
const alcance = (v: unknown): Alcance => ((ALCANCES as readonly unknown[]).includes(v) ? (v as Alcance) : 'lote');
const dia = (v: unknown) => txt(v).slice(0, 10);

function paraCorrecao(c: Record<string, unknown>): CorrecaoDoAlcance {
  return {
    alcanceAntes: alcance(c['alcance_antes']),
    validoAteAntes: dia(c['valido_ate_antes']),
    alcanceDepois: alcance(c['alcance_depois']),
    validoAteDepois: dia(c['valido_ate_depois']),
    motivo: txt(c['motivo']),
    corrigidoPorNome: txt(c['corrigido_por_nome']),
    corrigidoEm: txt(c['corrigido_em']),
  };
}

function paraRegistro(r: Record<string, unknown>, correcoes: CorrecaoDoAlcance[]): RegistroGuardado {
  const entrou = txt(r['entrou_por']);
  return {
    id: num(r['id']),
    documentoId: txt(r['documento_id']),
    ecrId: num(r['ecr_id']),
    empresaRaizId: (r['empresa_raiz_id'] as string | null) ?? null,
    fornecedorId: (r['fornecedor_id'] as string | null) ?? null,
    alcance: alcance(r['alcance']),
    validoAte: dia(r['valido_ate']),
    ocId: txt(r['oc_id']),
    avaliacaoId: num(r['avaliacao_id']),
    entrouPor: (['recebimento', 'qualificacao', 'oc', 'lista'].includes(entrou) ? entrou : 'qualificacao') as EntrouPor,
    conferidoPorNome: txt(r['conferido_por_nome']),
    conferidoEm: txt(r['conferido_em']),
    correcoes,
  };
}

/** Os papéis guardados, com as correções de cada um, e as marcas "a cada entrega". Falha sobe: quem chama decide. */
export async function carregarRegistrosDoFornecedor(): Promise<RegistrosDoFornecedor> {
  const [registros, correcoes, marcas] = await Promise.all([
    (async () =>
      todasAsLinhas('registros do fornecedor', (de, ate) =>
        compras().from('registros_do_fornecedor').select('*', { count: 'exact' }).order('id').range(de, ate)))(),
    (async () =>
      todasAsLinhas('correções do registro do fornecedor', (de, ate) =>
        compras().from('registros_do_fornecedor_correcoes').select('*', { count: 'exact' })
          .order('corrigido_em').order('id').range(de, ate)))(),
    (async () => compras().from('ecrs_registro_a_cada_entrega').select('ecr_id, porque'))(),
  ]);
  for (const r of [registros, correcoes, marcas]) {
    if (r.error) throw new Error(`Falha ao carregar os registros do fornecedor: ${r.error.message}`);
  }
  const doRegistro = new Map<number, CorrecaoDoAlcance[]>();
  for (const c of (correcoes.data ?? []) as Record<string, unknown>[]) {
    const id = num(c['registro_id']);
    doRegistro.set(id, [...(doRegistro.get(id) ?? []), paraCorrecao(c)]);
  }
  return {
    registros: ((registros.data ?? []) as Record<string, unknown>[]).map((r) =>
      paraRegistro(r, doRegistro.get(num(r['id'])) ?? [])),
    marcas: ((marcas.data ?? []) as Record<string, unknown>[]).map(
      (m): MarcaACadaEntrega => ({ ecrId: num(m['ecr_id']), porque: txt(m['porque']) }),
    ),
  };
}

/** O PDF sobe como está, até este tamanho; a foto é reduzida, como a do recebimento. */
export const PDF_MAXIMO_BYTES = 10 * 1024 * 1024;

/** O arquivo pronto para subir: a foto reduzida, ou o PDF como está. */
export async function prepararPapel(arquivo: File): Promise<{ base64: string; mime: string }> {
  if (arquivo.type !== 'application/pdf') return prepararFoto(arquivo);
  if (arquivo.size > PDF_MAXIMO_BYTES) throw new Error('O PDF passa de 10 MB. Mande uma foto do papel, ou um PDF menor.');
  return { base64: paraBase64(await bytesDoBlob(arquivo)), mime: 'application/pdf' };
}

/** A IA lê o papel; `null` quando não leu. Não ler não trava: o comprador escolhe o alcance. */
export async function lerPapelDoFornecedor(papel: { base64: string; mime: string }): Promise<LeituraDoRegistro | null> {
  try {
    const { status, json } = await chamarFuncao(
      'ler-documento',
      { imagem_base64: papel.base64, mime: papel.mime, origem: 'registro-ecr' },
      TEMPO_DA_LEITURA_MS,
    );
    return status === 200 ? leituraDaResposta(json) : null;
  } catch {
    return null;
  }
}

/**
 * Onde o papel entra: a empresa, pela qualificação; a OC, pelo "Anexar" na OC;
 * ou a entrega, pela lista das entregas sem papel, com a OC dela de envelope.
 */
export type OndeEntra =
  | { fornecedorId: string }
  | { ocId: string; fornecedorId: string; posicoes?: number[]; avaliacaoId?: number };

const nn = (ecrId: number) => String(ecrId).padStart(2, '0');

/**
 * Guarda o arquivo pela origem `qualificacao-fornecedor`, com a leitura em
 * `extracao`; devolve o id do documento. O item leva a ECR e a hora: a licença
 * renovada, com o mesmo nome, é outro papel. O nome do arquivo não entra nele,
 * porque pode trazer dado de pessoa (perícia de 16/10, achado 4).
 */
export async function arquivarPapelDoFornecedor(
  papel: { base64: string; mime: string },
  nomeArquivo: string,
  ecrId: number,
  onde: OndeEntra,
  extracao?: Record<string, unknown>,
): Promise<string> {
  const { status, json } = await chamarFuncao(
    'arquivar-documento',
    {
      arquivo_base64: papel.base64,
      nome_arquivo: nomeArquivo,
      mime: papel.mime,
      origem: 'qualificacao-fornecedor',
      origem_id: 'ocId' in onde ? onde.ocId : onde.fornecedorId,
      origem_item: `registro-ecr-${nn(ecrId)}-${new Date().toISOString()}`,
      fornecedor_id: onde.fornecedorId,
      ...(extracao ? { extracao } : {}),
    },
    TEMPO_DA_FOTO_MS,
  );
  const documento = json['documento'] as Record<string, unknown> | null | undefined;
  const id = txt(documento?.['id']);
  if (status === 200 && id) return id;
  throw new Error(txt(json['erro']) || 'O papel não foi aceito.');
}

export interface PapelParaGuardar {
  documentoId: string;
  ecrId: number;
  alcance: Alcance;
  /** AAAA-MM-DD, só no `vale_ate`. */
  validoAte: string;
  onde: OndeEntra;
}

/** A recusa do banco em frase de gente; a do papel repetido, dita aqui. */
function fraseDaRecusa(error: { code?: string; message: string }): string {
  if (error.code === '23505') return 'Este papel já está guardado para esta ECR.';
  return error.message;
}

export async function guardarRegistroDoFornecedor(g: PapelParaGuardar): Promise<number> {
  const p = {
    documento_id: g.documentoId,
    ecr_id: g.ecrId,
    alcance: g.alcance,
    ...(g.alcance === 'vale_ate' ? { valido_ate: g.validoAte } : {}),
    ...('ocId' in g.onde
      ? {
          oc_id: g.onde.ocId,
          ...(g.onde.posicoes?.length ? { oc_posicoes: g.onde.posicoes } : {}),
          ...(g.onde.avaliacaoId ? { avaliacao_id: g.onde.avaliacaoId } : {}),
        }
      : { fornecedor_id: g.onde.fornecedorId }),
  };
  const { data, error } = await compras().rpc('guardar_registro_do_fornecedor', { p });
  if (error) throw new Error(fraseDaRecusa(error));
  return num((data as Record<string, unknown> | null)?.['registro_id']);
}

export async function corrigirRegistroDoFornecedor(
  registroId: number,
  novo: Alcance,
  validoAte: string,
  motivo: string,
): Promise<void> {
  const { error } = await compras().rpc('corrigir_registro_do_fornecedor', {
    p_registro_id: registroId,
    p_alcance: novo,
    p_valido_ate: novo === 'vale_ate' ? validoAte : null,
    p_motivo: motivo.trim() || null,
  });
  if (error) throw new Error(fraseDaRecusa(error));
}
