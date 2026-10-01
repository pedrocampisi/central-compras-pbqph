/**
 * A qualificação dos fornecedores e a avaliação na entrega (CTO-D604, D605,
 * D606; o contrato do Banco de 28/09, `compras.qualificacoes` e
 * `compras.avaliacoes_entrega`).
 *
 * Regra pura, sem tela e sem banco. Quem decide é o BANCO: a situação, o
 * vencimento e a nota gravada vêm das vistas dele, e as duas travas moram lá.
 * O que está aqui é o que a tela precisa saber ANTES de perguntar — a nota ao
 * vivo enquanto a pessoa marca, a frase de cada recusa, e a trava da emissão
 * para a OC que ainda não foi gravada (a `qualificacao_da_oc` do banco só
 * conhece OC gravada). É a mesma conta do banco, e o banco confere de novo.
 *
 * O "hoje" é o de São Paulo, o mesmo do banco: `hojeEmSaoPaulo`, de `ecr.ts`.
 */

export type Categoria = 'material' | 'servico' | 'controle_tecnologico' | 'projeto' | 'locacao';

export const CATEGORIAS: readonly Categoria[] = ['material', 'servico', 'controle_tecnologico', 'projeto', 'locacao'];

export type Situacao = 'qualificada' | 'vence_em_30_dias' | 'vencida' | 'desqualificada' | 'sem_qualificacao';

/** As duas situações com que a OC com ECR emite (contrato §2, `qualificacao_da_oc`). */
const EMITE_COM: readonly Situacao[] = ['qualificada', 'vence_em_30_dias'];

/**
 * A OC com ECR emite com esta situação? É a regra da trava da emissão
 * (`travaDaQualificacao`), e a "Permissão para compra" da tela Qualificação
 * lê esta mesma função (CTO-D661 §4.5): nunca uma conta à parte.
 */
export function emiteComASituacao(s: Situacao): boolean {
  return EMITE_COM.includes(s);
}

/** A qualificação que vale para uma empresa numa categoria (a `vigente` da vista). */
export interface Selo {
  situacao: Situacao;
  qualificadaEm: string | null; // 'aaaa-mm-dd'
  venceEm: string | null; // 'aaaa-mm-dd'
  ecrs: number[];
}

export const SEM_QUALIFICACAO: Selo = { situacao: 'sem_qualificacao', qualificadaEm: null, venceEm: null, ecrs: [] };

/** 'aaaa-mm-dd' → 'dd/mm/aaaa'. */
export function dataBr(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** 'aaaa-mm-dd' → 'mm/aaaa', como a D604 §3.4 escreve o selo. */
function mesAno(iso: string | null): string {
  const m = /^(\d{4})-(\d{2})/.exec(iso ?? '');
  return m ? `${m[2]}/${m[1]}` : '';
}

/** Uma linha de `compras.qualificacoes_situacao` (contrato §3), já no formato da tela. */
export interface LinhaDeQualificacao {
  id: number;
  /** Exatamente um dos dois (D606 3): a empresa, ou o fornecedor sem raiz. */
  empresaRaizId: string | null;
  fornecedorId: string | null;
  categoria: Categoria;
  tipo: string;
  qualificadaEm: string;
  venceEm: string;
  criterios: CriterioMarcado[];
  nota: number;
  minimo: number;
  qualificada: boolean;
  qualificadoPorNome: string;
  origem: string;
  situacao: Situacao;
  ecrs: number[];
  /** A última do mesmo sujeito e categoria: é a que vale. */
  vigente: boolean;
}

/** De quem é a qualificação que uma filial mostra: a da empresa dela, ou a dela mesma. */
export interface SujeitoDaFilial {
  id: string;
  /** O `empresa_id` resolvido pelo banco, que é o `core.empresa_raiz.id`. */
  empresa_id?: string;
}

/** A mais recente primeiro: pela data da qualificação, e no empate pela linha mais nova. */
function maisRecente(a: LinhaDeQualificacao, b: LinhaDeQualificacao): number {
  return b.qualificadaEm.localeCompare(a.qualificadaEm) || b.id - a.id;
}

/**
 * As linhas vigentes que valem para a filial numa categoria: as da empresa
 * dela, pela raiz, e as do próprio fornecedor. As duas entram porque quem
 * ganhou raiz depois continua qualificado pela linha antiga até a empresa ter
 * uma mais nova — é o que a `qualificacao_do_fornecedor` do banco faz
 * (contrato §2, a resposta à D606 3).
 */
function vigentesDaFilial(f: SujeitoDaFilial, linhas: readonly LinhaDeQualificacao[], categoria: Categoria) {
  return linhas
    .filter(
      (l) =>
        l.vigente &&
        l.categoria === categoria &&
        ((!!f.empresa_id && l.empresaRaizId === f.empresa_id) || l.fornecedorId === f.id),
    )
    .sort(maisRecente);
}

/** 'aaaa-mm-dd' mais `n` dias, no calendário (sem fuso: a data já é a de Brasília). */
export function somaDias(dia: string, n: number): string {
  const t = Date.parse(`${dia}T00:00:00Z`);
  return new Date(t + n * 86_400_000).toISOString().slice(0, 10);
}

/**
 * A situação no dia `hoje` (de Brasília), pela regra do contrato
 * (`compras.situacao_qualificacao`): vencida quando vence antes de hoje; "vence
 * em até 30 dias" quando vence até hoje + 30. A situação que veio na carga é a
 * do dia da carga, e a meia-noite passa sem recarga (perícia 28/09, B3). Sem
 * qualificação e desqualificada não dependem do dia: ficam como vieram.
 */
export function situacaoNoDia(l: { situacao: Situacao; venceEm: string | null }, hoje: string): Situacao {
  if (l.situacao === 'sem_qualificacao' || l.situacao === 'desqualificada' || !l.venceEm) return l.situacao;
  if (l.venceEm < hoje) return 'vencida';
  if (l.venceEm <= somaDias(hoje, 30)) return 'vence_em_30_dias';
  return 'qualificada';
}

/** As linhas com a situação do dia; a linha que não mudou segue a mesma. */
export function linhasDoDia(linhas: readonly LinhaDeQualificacao[], hoje: string): LinhaDeQualificacao[] {
  return linhas.map((l) => {
    const situacao = situacaoNoDia(l, hoje);
    return situacao === l.situacao ? l : { ...l, situacao };
  });
}

/** O selo da filial numa categoria (material, por padrão: é o da Nova OC). */
export function seloDaFilial(
  f: SujeitoDaFilial,
  linhas: readonly LinhaDeQualificacao[],
  categoria: Categoria = 'material',
): Selo {
  const l = vigentesDaFilial(f, linhas, categoria)[0];
  return l ? { situacao: l.situacao, qualificadaEm: l.qualificadaEm, venceEm: l.venceEm, ecrs: l.ecrs } : SEM_QUALIFICACAO;
}

/** O histórico que a ficha mostra: todas as linhas do sujeito na categoria, a mais nova primeiro. */
export function historicoDaFilial(
  f: SujeitoDaFilial,
  linhas: readonly LinhaDeQualificacao[],
  categoria: Categoria,
): LinhaDeQualificacao[] {
  return linhas
    .filter(
      (l) =>
        l.categoria === categoria &&
        ((!!f.empresa_id && l.empresaRaizId === f.empresa_id) || l.fornecedorId === f.id),
    )
    .sort(maisRecente);
}

/** Os números da `desempenho_12_meses` (contrato §3): as entregas avaliadas no último ano. */
export interface NumerosDoDesempenho {
  entregas: number;
  noPrazo: number;
  inteiras: number;
  conformes: number;
}

/**
 * O desempenho que vale para a filial: o da empresa dela, quando tem raiz; o
 * dela mesma, só quando não tem — o mesmo sujeito para quem a qualificação é
 * gravada.
 */
export function desempenhoDaFilial<T extends { empresaRaizId: string | null; fornecedorId: string | null }>(
  f: SujeitoDaFilial,
  lista: readonly T[],
): T | undefined {
  return lista.find((d) => (f.empresa_id ? d.empresaRaizId === f.empresa_id : d.fornecedorId === f.id));
}

/** A prova ao lado dos critérios, ao requalificar (D604 §3.3): a pessoa marca, o sistema mostra o que aconteceu. */
export function textoDoDesempenho(d: NumerosDoDesempenho | undefined): string {
  if (!d || d.entregas === 0) return 'Nenhuma entrega avaliada nos últimos 12 meses.';
  const n = (q: number, um: string, varios: string) => `${q} ${q === 1 ? um : varios}`;
  return (
    `Nos últimos 12 meses: ${n(d.entregas, 'entrega avaliada', 'entregas avaliadas')} — ` +
    `${d.noPrazo} no prazo, ${n(d.inteiras, 'inteira', 'inteiras')}, ` +
    `${n(d.conformes, 'conforme', 'conformes')} com a OC e a ECR.`
  );
}

/**
 * Para quem a qualificação nova é gravada (contrato §2): a empresa, quando a
 * filial tem raiz; o próprio fornecedor, só quando não tem (o banco recusa
 * filial com raiz).
 */
export function sujeitoParaGravar(f: SujeitoDaFilial): { empresa_raiz_id: string } | { fornecedor_id: string } {
  return f.empresa_id ? { empresa_raiz_id: f.empresa_id } : { fornecedor_id: f.id };
}

/** O texto do selo, ao lado da empresa na Nova OC e na lista (D604 §3.4). */
export function textoDoSelo(s: Selo): string {
  switch (s.situacao) {
    case 'qualificada':
      return `Qualificada até ${mesAno(s.venceEm)}`;
    case 'vence_em_30_dias':
      return `Vence em ${dataBr(s.venceEm)}`;
    case 'vencida':
      return `Vencida desde ${dataBr(s.venceEm)}`;
    case 'desqualificada':
      return 'Desqualificada';
    case 'sem_qualificacao':
      return 'Sem qualificação';
  }
}

/** Uma das cinco, ou "sem qualificação" para o que o banco mandar e a tela não conhecer. */
export function paraSituacao(v: unknown): Situacao {
  const s = String(v ?? '');
  return (['qualificada', 'vence_em_30_dias', 'vencida', 'desqualificada', 'sem_qualificacao'] as const).find(
    (x) => x === s,
  ) ?? 'sem_qualificacao';
}

// ---------------------------------------------------------------------------
// A trava da emissão (D605): a mesma conta da `qualificacao_da_oc` do banco
// ---------------------------------------------------------------------------

/** As ECRs da OC: as dos itens, sem repetir, em ordem. Item sem ECR não conta (D605 3). */
export function ecrsDaOc(itens: readonly { ecr_id: number | null }[]): number[] {
  return [...new Set(itens.map((i) => i.ecr_id).filter((e): e is number => typeof e === 'number'))].sort((a, b) => a - b);
}

const NN = (n: number) => String(n).padStart(2, '0');

/** "ECR 12", "ECRs 12 e 19", "ECRs 05, 12 e 19". */
export function nomeDasEcrs(ecrs: readonly number[]): string {
  const n = ecrs.map(NN);
  if (n.length === 0) return '';
  if (n.length === 1) return `ECR ${n[0]}`;
  return `ECRs ${n.slice(0, -1).join(', ')} e ${n[n.length - 1]}`;
}

/**
 * A linha da gaveta da filial (CTO-D614 §2.1): que ECRs a empresa atende é a
 * qualificação de material que vale, a mesma que a trava lê. Só leitura; muda
 * na ficha da empresa. Listar ECR ao lado de "Desqualificada" enganaria.
 */
export function ecrsDaGaveta(selo: Selo | null): string {
  const onde = 'Muda na ficha da empresa.';
  if (!selo) return 'As ECRs vêm da qualificação de material, que não carregou.';
  if (selo.situacao === 'sem_qualificacao') return `Sem qualificação de material: nenhuma ECR. ${onde}`;
  if (selo.situacao === 'desqualificada') return `Desqualificada para material: nenhuma ECR vale. ${onde}`;
  if (selo.ecrs.length === 0) return `Nenhuma ECR na qualificação de material. ${onde}`;
  if (selo.situacao === 'vencida') {
    return `${nomeDasEcrs(selo.ecrs)}, pela qualificação de material, que venceu: requalifique na ficha da empresa.`;
  }
  return `${nomeDasEcrs(selo.ecrs)}, pela qualificação de material. ${onde}`;
}

export const QUALIFICACAO_SEM_CONFIRMACAO =
  'Não deu para confirmar a qualificação desta empresa: as qualificações não chegaram do banco. ' +
  'Recarregue a página e tente de novo.';

/**
 * Onde a pessoa resolve, que é o fim da frase da trava (CTO-D614 §2.4):
 * dentro do "Qualificar agora", qualifica ali mesmo; fora dele (o Histórico,
 * ou a Nova OC quando o diálogo não abre), na tela Qualificação, do menu
 * (CTO-D661 §4.12; até 01/10 mandava à ficha da empresa, cinco passos
 * adentro de Fornecedores). Mandar usar o "Qualificar agora" a quem já está
 * nele, ou a quem está numa tela sem ele, é mandar procurar um botão que não
 * está na frente.
 */
export type OndeQualifica = 'aqui' | 'na_ficha';
const COMO_RESOLVER: Record<OndeQualifica, string> = {
  aqui: 'Qualifique aqui para emitir, ou volte e salve como rascunho.',
  na_ficha: 'Qualifique a empresa na tela Qualificação, no menu, e emita de novo.',
};

/**
 * A recusa da emissão por qualificação, ou '' quando pode emitir. OC sem item
 * de ECR não é material controlado e não pede qualificação; com ECR, emite
 * só com a empresa qualificada (ou vencendo em 30 dias) E com todas as ECRs
 * da OC cobertas pela qualificação vigente (D606 1).
 */
export function travaDaQualificacao(
  selo: Selo | null,
  ecrs: readonly number[],
  onde: OndeQualifica = 'na_ficha',
): string {
  if (ecrs.length === 0) return '';
  // Sem as qualificações carregadas, não se sabe: a trava falha fechada, como a da filial (perícia de 27/09, achado 5).
  if (!selo) return QUALIFICACAO_SEM_CONFIRMACAO;
  if (!emiteComASituacao(selo.situacao)) {
    const porque =
      selo.situacao === 'vencida'
        ? `a qualificação de material da empresa venceu em ${dataBr(selo.venceEm)}`
        : selo.situacao === 'desqualificada'
          ? 'a empresa está desqualificada para material controlado'
          : 'a empresa não tem qualificação de material';
    return `Esta OC tem material controlado (${nomeDasEcrs(ecrs)}), e ${porque}. ${COMO_RESOLVER[onde]}`;
  }
  const faltando = ecrs.filter((e) => !selo.ecrs.includes(e));
  if (faltando.length > 0) {
    return (
      `A empresa está qualificada, mas não para ${faltando.length === 1 ? 'a' : 'as'} ${nomeDasEcrs(faltando)} desta OC. ` +
      COMO_RESOLVER[onde]
    );
  }
  return '';
}

/**
 * As ECRs que o "Qualificar agora" traz marcadas: as da OC somadas às da
 * qualificação vigente (contrato §2: requalificar para uma ECR nova não pode
 * tirar as que a empresa já tinha).
 */
export function ecrsDoQualificarAgora(daOc: readonly number[], vigente: readonly number[]): number[] {
  return [...new Set([...vigente, ...daOc])].sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// O formulário de qualificar
// ---------------------------------------------------------------------------

export interface CriterioMarcado {
  atende: boolean;
  motivo: string;
}

/** A nota enquanto a pessoa marca: quantos critérios atendem. */
export function notaAoVivo(criterios: readonly CriterioMarcado[]): number {
  return criterios.filter((c) => c.atende).length;
}

/**
 * O vencimento que o banco vai calcular: +12 meses, e o próprio dia ainda
 * vale. 29/02 vira 28/02, como o `interval '12 months'` do Postgres.
 */
export function vencimentoDe(qualificadaEm: string): string {
  const [a, m, d] = qualificadaEm.split('-').map(Number);
  const ultimoDia = new Date(Date.UTC(a! + 1, m!, 0)).getUTCDate();
  return `${a! + 1}-${NN(m!)}-${NN(Math.min(d!, ultimoDia))}`;
}

/** O que falta para gravar uma qualificação, na ordem da tela ('' = pode). */
export function problemaDaQualificacao(
  categoria: Categoria,
  criterios: readonly CriterioMarcado[],
  ecrs: readonly number[],
  qualificadaEm: string,
  hoje: string,
): string {
  if (criterios.length !== 3) return 'São três critérios.';
  const semMotivo = criterios.findIndex((c) => !c.motivo.trim());
  if (semMotivo >= 0) return `Escreva o motivo do critério ${semMotivo + 1}: por que atende, ou por que não atende.`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(qualificadaEm)) return 'Informe a data da qualificação.';
  if (qualificadaEm > hoje) return 'A data da qualificação não pode ser depois de hoje.';
  if (categoria === 'material' && ecrs.length === 0) return 'Marque para quais ECRs a empresa está sendo qualificada.';
  return '';
}

// ---------------------------------------------------------------------------
// A avaliação na entrega (PS.02, SiAC 8.4.1.2)
// ---------------------------------------------------------------------------

export interface Avaliacao {
  notaFiscal: string;
  recebidoEm: string;
  prazoConforme: boolean | null;
  integridadeConforme: boolean | null;
  ocEcrConforme: boolean | null;
  observacao: string;
  tratativa: string;
}

/** Quantas "Não Conforme" (resposta em branco não conta como nenhuma das duas). */
export function naoConformes(a: Pick<Avaliacao, 'prazoConforme' | 'integridadeConforme' | 'ocEcrConforme'>): number {
  return [a.prazoConforme, a.integridadeConforme, a.ocEcrConforme].filter((r) => r === false).length;
}

/** Com duas ou mais "Não Conforme", a tratativa é obrigatória (PS.02, regra operacional). */
export function pedeTratativa(a: Pick<Avaliacao, 'prazoConforme' | 'integridadeConforme' | 'ocEcrConforme'>): boolean {
  return naoConformes(a) >= 2;
}

/**
 * O que vai ao banco: a tratativa só com duas ou mais "Não Conforme". Com
 * menos, o campo some da tela e o texto que sobrou fica só na caixa, sem ir
 * junto (perícia 28/09, B6): o Painel e a ciência não oferecem essa pendência.
 */
export function avaliacaoParaGravar(a: Avaliacao): Avaliacao {
  return pedeTratativa(a) ? a : { ...a, tratativa: '' };
}

/** O que falta para gravar a avaliação, na ordem da tela ('' = pode). */
export function problemaDaAvaliacao(a: Avaliacao, hoje: string): string {
  if (!a.notaFiscal.trim()) return 'Informe o número da nota fiscal.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.recebidoEm)) return 'Informe o dia do recebimento.';
  if (a.recebidoEm > hoje) return 'O dia do recebimento não pode ser depois de hoje.';
  if (a.prazoConforme === null || a.integridadeConforme === null || a.ocEcrConforme === null) {
    return 'Responda as três perguntas: Conforme ou Não Conforme.';
  }
  if (pedeTratativa(a) && !a.tratativa.trim()) {
    return 'Com duas ou mais "Não Conforme", escreva a tratativa: o que foi feito com a entrega.';
  }
  return '';
}

// ---------------------------------------------------------------------------
// As recusas do banco, em frase de gente (contrato §2)
// ---------------------------------------------------------------------------

export interface ErroDoBanco {
  code?: string;
  message: string;
  details?: string | null;
  hint?: string | null;
}

/**
 * A trava da emissão no banco (23514). A mensagem já é frase de gente ("A OC
 * … não pode ser emitida: <motivo>.") e a dica diz o que fazer: as duas vão
 * como vieram, sem prefixo que repita o "não pode ser emitida".
 */
export function fraseDaTravaDoBanco(e: ErroDoBanco): string {
  const dica = e.hint?.trim() ? ` ${e.hint.trim()}` : '';
  return `${e.message.trim().replace(/\.$/, '')}.${dica}`;
}

export function fraseDaRecusaDaQualificacao(e: ErroDoBanco): string {
  switch (e.code) {
    case '42501':
      return 'Só quem pode emitir OC qualifica uma empresa, e o seu perfil precisa ter nome. A qualificação não foi gravada.';
    case 'P0002':
      return 'Esta empresa não existe mais no banco. Recarregue a página. A qualificação não foi gravada.';
    case '22023':
      return `O banco recusou a qualificação: ${e.message}`;
    default:
      return `Falha ao gravar a qualificação: ${e.message}`;
  }
}

export function fraseDaRecusaDaEntrega(e: ErroDoBanco): string {
  switch (e.code) {
    case '42501':
      return 'Só quem pode emitir OC registra a entrega. A avaliação não foi gravada.';
    case 'P0002':
      return 'Esta OC não existe mais no banco. Recarregue a página. A avaliação não foi gravada.';
    case '40001':
      return 'Esta OC mudou desde que você abriu a tela. Recarregue a página e registre de novo. A avaliação não foi gravada.';
    case '55000':
      return 'Só OC emitida ou entregue recebe avaliação de entrega. A avaliação não foi gravada.';
    case '22023':
      return `O banco recusou a avaliação: ${e.message}`;
    default:
      return `Falha ao gravar a avaliação: ${e.message}`;
  }
}

export function fraseDaRecusaDaCiencia(e: ErroDoBanco): string {
  switch (e.code) {
    case '42501':
      return 'Só quem revisa as ECRs dá ciência de tratativa. A ciência não foi gravada.';
    case 'P0002':
      return 'Esta avaliação não existe mais no banco. Recarregue a página.';
    case '55000':
      return 'A ciência desta tratativa já foi dada, ou ela não tem tratativa. Recarregue a página.';
    case '22023':
      return 'Escreva a nota da ciência.';
    default:
      return `Falha ao gravar a ciência: ${e.message}`;
  }
}
