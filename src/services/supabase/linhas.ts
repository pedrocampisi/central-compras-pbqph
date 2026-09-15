/**
 * Conversão do formato do app (objetos) para a linha do banco (colunas
 * planas), SEM o cliente do Supabase por perto.
 *
 * Existe separado de `dados.ts` por um motivo só: ser testável sem banco. O
 * que vai para `core.fornecedores` é regra — e a regra mais cara de errar em
 * silêncio é a bandeira `fornece_material`, que decide se o fornecedor
 * aparece ou não na lista da OC.
 */
import type { Destinatario, Endereco, Fornecedor, OrdemCompra } from '../../domain/types';

const vazio = (v: unknown): string => (v == null ? '' : String(v));

export function paraEndereco(l: Record<string, unknown>): Endereco {
  return {
    logradouro: vazio(l['logradouro']),
    numero: vazio(l['numero']),
    complemento: vazio(l['complemento']),
    bairro: vazio(l['bairro']),
    cidade: vazio(l['cidade']),
    uf: vazio(l['uf']),
    cep: vazio(l['cep']),
  };
}

/**
 * O destinatário da nota que a linha de `core.intervencoes` aponta, lido
 * junto com a obra (`nf_empresa` → core.empresas, `nf_cliente` →
 * core.clientes). A trava do banco garante que é UM dos dois, ou nenhum —
 * e nenhum quer dizer "esta obra não emite OC".
 */
export function destinatarioDaLinhaDaObra(l: Record<string, unknown>): Destinatario | undefined {
  const empresa = l['nf_empresa'] as Record<string, unknown> | null | undefined;
  if (empresa) {
    return {
      nome: vazio(empresa['razao_social']),
      documento: vazio(empresa['cnpj']),
      tipo: 'pj',
      endereco: paraEndereco(empresa),
    };
  }
  const cliente = l['nf_cliente'] as Record<string, unknown> | null | undefined;
  if (cliente) {
    return {
      nome: vazio(cliente['nome']),
      documento: vazio(cliente['documento']),
      tipo: cliente['tipo_pessoa'] === 'pj' ? 'pj' : 'pf',
      endereco: paraEndereco(cliente),
    };
  }
  return undefined;
}

/** A fotografia gravada em `compras.ordens_compra` (três colunas), ou nada. */
export function fotografiaDaLinhaDaOc(l: Record<string, unknown>): Destinatario | undefined {
  const nome = vazio(l['destinatario_nome']);
  const documento = vazio(l['destinatario_documento']);
  const tipo = l['destinatario_tipo'];
  if (!nome || !documento || (tipo !== 'pf' && tipo !== 'pj')) return undefined;
  return { nome, documento, tipo, endereco: paraEndereco({}) };
}

/**
 * O `cabecalho` que `compras.salvar_oc` recebe.
 *
 * Desde 19/08/2026 o contrato distingue os três casos: chave ausente não
 * mexe no campo, chave com valor grava, chave com null APAGA. Por isso
 * mandamos null quando a pessoa esvaziou o campo — é o que faz o apagar
 * realmente pegar.
 *
 * A fotografia do destinatário (CTO-D390) NÃO vai daqui: desde a
 * `20260915110000` é a própria porta que a tira, pela obra, na emissão — e
 * ignora as três chaves se a tela as mandar. A tela só resolve o destinatário
 * para mostrar ("Faturar para") e para o PDF; quem grava é o banco.
 */
export function cabecalhoDaOc(oc: OrdemCompra): Record<string, unknown> {
  return {
    data: oc.data,
    status: oc.status,
    intervencao_id: oc.obra_id || null,
    fornecedor_id: oc.fornecedor_id || null,
    // `emitente_id` não vai mais (CTO-D390): chave ausente não mexe, e as duas
    // OCs antigas ficam com o que têm até o banco aposentar a coluna.
    condicao_pagamento: oc.condicao_pagamento || null,
    frete: oc.frete ?? 0,
    outras_despesas: oc.outras_despesas ?? 0,
    desconto_material: oc.desconto_material ?? 0,
    observacoes: oc.observacoes || null,
  };
}

export function deEndereco(e: Partial<Endereco> | undefined) {
  return {
    logradouro: e?.logradouro || null,
    numero: e?.numero || null,
    complemento: e?.complemento || null,
    bairro: e?.bairro || null,
    cidade: e?.cidade || null,
    uf: e?.uf ? e.uf.toUpperCase().slice(0, 2) : null,
    cep: e?.cep ? e.cep.replace(/\D/g, '') || null : null,
  };
}

/** CPF/CNPJ entram no banco só com dígitos — é o que impede o mesmo cadastro
 *  entrar duas vezes com pontuação diferente. */
export const soDigitos = (v: string | undefined): string | null => {
  const d = (v ?? '').replace(/\D/g, '');
  return d.length === 11 || d.length === 14 ? d : null;
};

/** Cadastro que ainda não existe no banco: sem id, ou com o id provisório
 *  que a tela inventa (`forn-…`) antes da primeira gravação. */
export function ehFornecedorNovo(f: Pick<Fornecedor, 'id'>): boolean {
  return !f.id || f.id.startsWith('forn-');
}

/**
 * A linha de `core.fornecedores` que o upsert grava.
 *
 * `fornece_material: true` entra SÓ no cadastro novo. Esta tela é a de
 * fornecedores de material — quem nasce por ela fornece material, e sem a
 * bandeira ele nasceria invisível para a OC (decisão do Pedro, 14/09/2026).
 *
 * Na EDIÇÃO a coluna não vai: o upsert só escreve as colunas que recebe, e
 * omitir é o que impede esta tela de carimbar `true` num prestador de
 * serviço que alguém abriu só para corrigir um telefone. A tela não
 * reclassifica ninguém — só batiza quem ela mesma cria.
 */
export function linhaDoFornecedor(f: Fornecedor): Record<string, unknown> {
  const novo = ehFornecedorNovo(f);
  return {
    ...(novo ? {} : { id: f.id }),
    razao_social: f.razao_social,
    nome_fantasia: f.nome_fantasia || null,
    documento: soDigitos(f.cnpj),
    inscricao_estadual: f.ie || null,
    email: f.email || null,
    telefones: (f.telefones ?? []).filter(Boolean),
    contato_responsavel: f.contato_responsavel || null,
    ...deEndereco(f.endereco),
    observacoes: f.observacoes || null,
    ativo: f.ativo !== false,
    ...(novo ? { fornece_material: true } : {}),
  };
}
