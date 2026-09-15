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
import type { Fornecedor } from './types';
import { formatarDocumento } from './destinatario';

/**
 * Quem entra na lista da OC: ativo E fornece material.
 *
 * `fornece_material` precisa ser exatamente `true`. `undefined` (o banco não
 * classificou) fica de fora de propósito: é o caso da linha sem bandeira
 * nenhuma e de qualquer cadastro que um dia entre sem passar pela tela desta
 * casa. Deixar o indefinido entrar seria repetir a lista suja com outro nome.
 */
export function fornecedoresParaOc(todos: Fornecedor[]): Fornecedor[] {
  return todos.filter((f) => f.ativo && f.fornece_material === true);
}

/** Os quatro últimos dígitos do CNPJ — "····0134". Vazio se não houver CNPJ. */
export function finalDoCnpj(cnpj: string | undefined): string {
  const d = (cnpj ?? '').replace(/\D/g, '');
  return d.length >= 4 ? `····${d.slice(-4)}` : '';
}

/**
 * Como o fornecedor aparece na lista.
 *
 * Só a razão social, na maioria dos casos. Quando a mesma razão social
 * aparece mais de uma vez na lista (filiais), entra um sufixo que as
 * distingue: a cidade/UF e o final do CNPJ. Os dois juntos porque cidade
 * sozinha empata (duas filiais na mesma cidade) e CNPJ sozinho não diz
 * nada a quem escolhe.
 *
 * `todos` é a lista EM QUE o fornecedor vai aparecer — a já filtrada — e
 * não a tabela inteira: uma filial que só presta serviço não deve fazer a
 * matriz ganhar sufixo numa lista em que a filial nem está.
 */
export function rotuloDoFornecedor(f: Fornecedor, todos: Fornecedor[]): string {
  const nome = f.razao_social.trim();
  const repete = todos.filter((o) => o.razao_social.trim() === nome).length > 1;
  if (!repete) return nome;

  const partes = [nome];
  const cidade = [f.endereco?.cidade, f.endereco?.uf].filter(Boolean).join('/');
  if (cidade) partes.push(cidade);
  const final = finalDoCnpj(f.cnpj);
  if (final) partes.push(final);
  return partes.join(' · ');
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
