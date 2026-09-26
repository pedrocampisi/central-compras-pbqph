/**
 * Regras da lista de fornecedores na tela da OC.
 *
 * Nasceram em 14/09/2026 de uma reclamação do Pedro que tinha duas causas
 * escondidas atrás de um sintoma só ("tem nome repetido e tem fornecedor de
 * obra"): a tela lia `core.fornecedores` inteira — 224 linhas, das quais 161
 * fornecem material e 124 só prestam serviço — e as filiais de uma mesma
 * empresa (a Beija Flor Tintas tem 8 CNPJs) apareciam como oito linhas
 * iguais. Lógica pura, sem React e sem banco, para ser testada sozinha.
 */
import type { Fornecedor, Obra } from './types';
import { formatarDocumento } from './destinatario';
import { normalizarBusca, type OpcaoPesquisavel } from './pesquisa';

/**
 * Quem entra na lista da OC: ativo E fornece material.
 *
 * `fornece_material` precisa ser exatamente `true`. `undefined` (o banco não
 * classificou) fica de fora de propósito: é o caso da linha sem bandeira
 * nenhuma e de qualquer cadastro que um dia entre sem passar pela tela desta
 * casa. Deixar o indefinido entrar seria repetir a lista suja com outro nome.
 *
 * Desde 25/09/2026 (CTO-D519) o `fornece_material` que chega aqui é o
 * RESOLVIDO — o da filial, ou o da empresa-mãe quando a filial está em branco.
 * Quem resolve é o banco; esta regra não sabe que mãe existe, e não precisa.
 */
export function fornecedoresParaOc(todos: Fornecedor[], manter = ''): Fornecedor[] {
  return todos.filter((f) => entraNaOc(f) || (manter !== '' && f.id === manter));
}

/**
 * A regra de uma filial só. A bloqueada para compra nova (BAIXADA na Receita,
 * por exemplo) fica de fora desde 26/09/2026 (CTO-D542): aparecia na Nova OC
 * porque a regra olhava só `ativo` e `fornece_material`. No Histórico ela
 * continua, porque uma OC antiga pode ser dela.
 *
 * O `manter` de `fornecedoresParaOc` é a filial já gravada na OC aberta: um
 * rascunho cuja filial hoje não entraria abre mostrando a gravada, sem trocar
 * sozinho de fornecedor — e o rótulo dela diz que está fora.
 */
export function entraNaOc(f: Fornecedor): boolean {
  return f.ativo && f.fornece_material === true && f.bloqueado_para_compra_nova !== true;
}

export const EMITIR_BLOQUEADA =
  'Esta filial está bloqueada para compra nova. Escolha outra filial para emitir.';

/**
 * A trava da filial bloqueada (CTO-D545): o rascunho SALVA — quem abriu uma OC
 * antiga não perde o que digitou —, mas não EMITE. O `bloqueado_para_compra_nova`
 * marca CNPJ baixado na Receita, e nenhum gatilho do banco o lê: se a tela não
 * travar, ninguém trava. Devolve a mensagem da recusa, ou '' quando pode.
 */
export function travaDaFilial(f: Fornecedor | undefined, acao: 'salvar' | 'emitir'): string {
  if (acao === 'emitir' && f?.bloqueado_para_compra_nova === true) return EMITIR_BLOQUEADA;
  return '';
}

/** Por que uma filial está fora da lista da Nova OC hoje ('' = não está). */
export function motivoForaDaOc(f: Fornecedor): string {
  if (f.bloqueado_para_compra_nova === true) return 'bloqueada para compra nova';
  if (!f.ativo) return 'inativa';
  if (f.fornece_material !== true) return 'fora da lista de material';
  return '';
}

/**
 * O endereço em uma linha, para mostrar abaixo do campo depois de escolher.
 * Sem rótulos ("Rua:", "Cidade:") — quem lê um endereço reconhece as partes.
 */
export function enderecoResumido(f: Fornecedor | undefined): string {
  if (!f) return '';
  const e = f.endereco ?? ({} as Fornecedor['endereco']);
  const rua = [e.logradouro, e.numero].filter(Boolean).join(', ');
  const ruaComplemento = [rua, e.complemento].filter(Boolean).join(' ');
  const cidade = [e.cidade, e.uf].filter(Boolean).join('/');
  // O banco guarda só dígitos; a pessoa lê com a pontuação.
  const cnpj = f.cnpj ? `CNPJ ${formatarDocumento(f.cnpj, 'pj')}` : '';
  return [ruaComplemento, e.bairro, cidade, cnpj].filter(Boolean).join(' · ');
}

// ---------------------------------------------------------------------------
// O fornecedor por EMPRESA, e a filial depois (CTO-D542, 26/09/2026)
//
// A palavra do Pedro, com a foto da lista aberta: "essa forma como as filiais
// estão aparecendo da OC não está legal. Melhore". A lista mostrava uma linha
// por filial — "BEIJA FLOR COMERCIO DE TINTAS LTDA · UBERLANDIA/MG · ····NNNN"
// oito vezes seguidas. Agora a pessoa escolhe a empresa pelo nome que ela usa
// (o apelido), e só depois, se houver mais de uma, a filial — pelo que a filial
// é (cidade, rua, matriz), nunca pelos quatro últimos dígitos do CNPJ, que
// levam o dígito verificador e não dizem nada a ninguém.
// ---------------------------------------------------------------------------

export interface EmpresaDaLista {
  /** O `empresa_id` do banco; `filial:<id>` para quem não tem empresa. */
  chave: string;
  /** O nome que a lista mostra: o apelido, ou a razão social na falta dele. */
  apelido: string;
  /** As filiais DESTA lista, em ordem de cidade e de número da filial. */
  filiais: Fornecedor[];
}

/**
 * De que empresa é a filial. Quem diz é o BANCO (`empresa_id` da
 * `fornecedor_resolvido`) — nunca a raiz do CNPJ calculada aqui, pelo mesmo
 * motivo do portal (D504). Sem empresa (o cadastro recém-criado, o formato
 * antigo de arquivo), a filial é uma empresa sozinha.
 */
export function chaveDaEmpresa(f: Fornecedor): string {
  return f.empresa_id ? f.empresa_id : `filial:${f.id}`;
}

const MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

/**
 * "UBERLANDIA/MG" e "Uberlandia/MG" são a mesma cidade — o cadastro tem os
 * dois jeitos. A tela mostra um só, sem gritar: cada palavra com a primeira
 * maiúscula, "de/da/do" minúsculos, a UF em maiúsculas.
 */
export function cidadeUf(f: Fornecedor): string {
  const cidade = (f.endereco?.cidade ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');
  const uf = (f.endereco?.uf ?? '').trim().toUpperCase();
  return [cidade, uf].filter(Boolean).join('/');
}

/** Rua e número, e o bairro quando houver — o que desempata na mesma cidade. */
function ruaDa(f: Fornecedor): string {
  const e = f.endereco;
  const rua = [e?.logradouro?.trim(), e?.numero?.trim()].filter(Boolean).join(', ');
  return [rua, e?.bairro?.trim()].filter(Boolean).join(' · ');
}

/**
 * O número de ordem do CNPJ: os quatro dígitos depois da barra (0001 é a
 * matriz). É a numeração da Receita, e se lê. Sem CNPJ, nenhum.
 */
export function ordemDoCnpj(cnpj: string | undefined): number | null {
  const d = (cnpj ?? '').replace(/\D/g, '');
  if (d.length !== 14) return null;
  const n = Number(d.slice(8, 12));
  return n > 0 ? n : null;
}

function nomeDaOrdem(n: number): string {
  return n === 1 ? 'matriz' : `filial nº ${n}`;
}

/**
 * As razões sociais diferentes de um grupo. "ARCELORMITTAL BRASIL S.A." e
 * "ArcelorMittal Brasil S/A" são o MESMO nome escrito de dois jeitos: a
 * comparação ignora caixa, acento, pontuação e espaço.
 */
function razoesDistintas(filiais: Fornecedor[]): string[] {
  const vistas = new Map<string, string>();
  for (const f of filiais) {
    const r = f.razao_social.trim();
    const k = normalizarBusca(r).replace(/[^a-z0-9]/g, '');
    if (k && !vistas.has(k)) vistas.set(k, r);
  }
  return [...vistas.values()];
}

/** "A", "A e B", "A, B e C". */
function emLista(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? '';
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

const comparar = (a: string, b: string) =>
  normalizarBusca(a).localeCompare(normalizarBusca(b), 'pt-BR');

/**
 * As filiais agrupadas pela empresa, na ordem do apelido (o nome que a pessoa
 * lê). Cada filial da entrada cai em exatamente um grupo.
 */
export function agruparPorEmpresa(lista: Fornecedor[]): EmpresaDaLista[] {
  const grupos = new Map<string, Fornecedor[]>();
  for (const f of lista) {
    const k = chaveDaEmpresa(f);
    const g = grupos.get(k);
    if (g) g.push(f);
    else grupos.set(k, [f]);
  }
  return [...grupos.entries()]
    .map(([chave, filiais]) => {
      const apelido =
        filiais.map((f) => (f.empresa_apelido ?? '').trim()).find(Boolean) ||
        (filiais[0]?.razao_social ?? '').trim();
      const ordenadas = [...filiais].sort(
        (a, b) =>
          comparar(cidadeUf(a), cidadeUf(b)) || (ordemDoCnpj(a.cnpj) ?? 0) - (ordemDoCnpj(b.cnpj) ?? 0),
      );
      return { chave, apelido, filiais: ordenadas };
    })
    .sort((a, b) => comparar(a.apelido, b.apelido) || comparar(a.chave, b.chave));
}

/**
 * As empresas, prontas para a pesquisa. Uma linha por empresa, pelo apelido;
 * a linha menor diz as filiais ("11 filiais · Uberlândia/MG e Araguari/MG") ou,
 * com uma só, a cidade dela. Duas empresas com o MESMO apelido (duas raízes de
 * CNPJ com a mesma marca) levam também a razão social na linha menor — e, se
 * ainda assim empatarem, a raiz do CNPJ, que é a parte dele que diz a empresa.
 * A pesquisa acha pelo apelido e pela razão social e fantasia de qualquer filial.
 */
export function opcoesDeEmpresa(grupos: EmpresaDaLista[]): OpcaoPesquisavel[] {
  const porApelido = new Map<string, number>();
  for (const g of grupos) {
    const k = normalizarBusca(g.apelido);
    porApelido.set(k, (porApelido.get(k) ?? 0) + 1);
  }

  const opcoes = grupos.map((g): OpcaoPesquisavel => {
    const cidades = [
      ...new Map(g.filiais.map((f) => [normalizarBusca(cidadeUf(f)), cidadeUf(f)])).values(),
    ].filter(Boolean);
    let detalhe =
      g.filiais.length > 1
        ? [`${g.filiais.length} filiais`, emLista(cidades)].filter(Boolean).join(' · ')
        : (cidades[0] ?? '');
    if ((porApelido.get(normalizarBusca(g.apelido)) ?? 0) > 1) {
      detalhe = [razoesDistintas(g.filiais).join(' / '), detalhe].filter(Boolean).join(' · ');
    }
    return {
      valor: g.chave,
      rotulo: g.apelido,
      detalhe: detalhe || undefined,
      termos: g.filiais
        .flatMap((f) => [f.razao_social, f.nome_fantasia, f.empresa_apelido ?? ''])
        .filter(Boolean),
    };
  });

  // Último desempate: a linha inteira nunca se repete.
  const linha = (o: OpcaoPesquisavel) => normalizarBusca(`${o.rotulo}|${o.detalhe ?? ''}`);
  const vezes = new Map<string, number>();
  for (const o of opcoes) vezes.set(linha(o), (vezes.get(linha(o)) ?? 0) + 1);
  return opcoes.map((o, i) => {
    if ((vezes.get(linha(o)) ?? 0) < 2) return o;
    const g = grupos[i]!;
    const raiz = (g.filiais[0]?.cnpj ?? '').replace(/\D/g, '').slice(0, 8);
    const marca =
      raiz.length === 8 ? `CNPJ ${raiz.slice(0, 2)}.${raiz.slice(2, 5)}.${raiz.slice(5)}` : g.chave;
    return { ...o, detalhe: [o.detalhe, marca].filter(Boolean).join(' · ') };
  });
}

/**
 * Como a filial aparece no campo "Filial", entre as irmãs da mesma empresa:
 *   1. a cidade/UF;
 *   2. se uma irmã está na mesma cidade, a rua e o número (e o bairro);
 *   3. se ainda empata (as duas sem rua), "matriz" ou "filial nº N";
 *   4. se a empresa junta duas razões sociais, a razão social da filial;
 *   5. se a filial está fora da lista hoje (a gravada no rascunho), o porquê.
 * Os quatro últimos dígitos do CNPJ nunca: não dizem nada a quem escolhe.
 * Quando o Banco preencher as ruas em branco (D543), o "filial nº N" some
 * sozinho, porque a rua passa a desempatar.
 */
export function rotuloDaFilial(f: Fornecedor, irmas: Fornecedor[]): string {
  const cidade = cidadeUf(f);
  const partes = [cidade || f.razao_social.trim()];

  const mesmaCidade = irmas.filter(
    (o) => o.id !== f.id && normalizarBusca(cidadeUf(o)) === normalizarBusca(cidade),
  );
  if (mesmaCidade.length > 0) {
    const rua = ruaDa(f);
    if (rua) partes.push(rua);
    const empata = mesmaCidade.some((o) => normalizarBusca(ruaDa(o)) === normalizarBusca(rua));
    const n = ordemDoCnpj(f.cnpj);
    if (empata && n !== null) partes.push(nomeDaOrdem(n));
  }

  if (razoesDistintas(irmas).length > 1) partes.push(f.razao_social.trim());
  const fora = motivoForaDaOc(f);
  if (fora) partes.push(fora);
  return partes.join(' · ');
}

/**
 * O que acontece ao escolher uma empresa na Nova OC:
 *   - nenhuma → nenhum fornecedor;
 *   - uma filial só → ela, e o campo Filial nem aparece;
 *   - mais de uma → a filial já escolhida continua, se for desta empresa;
 *     senão nenhuma, e a empresa fica esperando a filial.
 */
export function escolherEmpresa(
  grupo: EmpresaDaLista | undefined,
  fornecedorAtual: string,
): { fornecedorId: string; empresaEsperando: string } {
  if (!grupo) return { fornecedorId: '', empresaEsperando: '' };
  if (grupo.filiais.length === 1) {
    return { fornecedorId: grupo.filiais[0]!.id, empresaEsperando: '' };
  }
  if (grupo.filiais.some((f) => f.id === fornecedorAtual)) {
    return { fornecedorId: fornecedorAtual, empresaEsperando: '' };
  }
  return { fornecedorId: '', empresaEsperando: grupo.chave };
}

/** As opções da escolha de obra: o nome que a tela mostra. */
export function opcoesDeObra(lista: Obra[]): OpcaoPesquisavel[] {
  return lista.map((o) => ({ valor: o.id, rotulo: o.nome }));
}
