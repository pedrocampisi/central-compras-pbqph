/**
 * O título de cada critério no cabeçalho da Qualificação (CTO-D1034n).
 *
 * No ar, os três critérios de Materiais apareciam como "O", "Preço" e "O": a
 * regra antiga pegava a primeira palavra da pergunta, e a pergunta começa por
 * "O fornecedor…". Agora o título é escolhido critério por critério, à mão,
 * a partir do texto de verdade do banco (`compras.criterios_qualificacao`,
 * migração D604 do Banco_de_Dados, lido em 10/11/2026). Uma palavra que diz o
 * que o critério é; duas, em duas linhas, quando uma não basta. Nunca artigo,
 * nunca reticências. A pergunta inteira continua no "?" do título.
 *
 * A chave é a categoria e a ordem (1 a 3), a mesma do banco. Se o banco mudar
 * o texto de um critério, o título daqui continua até alguém o trocar; se
 * aparecer uma categoria ou ordem que não está aqui, a tela mostra
 * "Critério N". A trava `TitulosDosCriterios` confere as cinco categorias.
 */

import type { Categoria } from './qualificacao';

/** O texto de cada critério no banco, lido em 10/11/2026: a régua da trava e da página de prova. */
export const PERGUNTAS_DOS_CRITERIOS: Record<Categoria, readonly [string, string, string]> = {
  material: [
    'O fornecedor atende no critério de qualidade?',
    'O fornecedor tem o menor preço de mercado?',
    'O fornecedor consegue atender conforme o prazo estipulado pela construtora?',
  ],
  servico: [
    'O fornecedor possui todas as documentações de contratação do pessoal e treinamentos de NR?',
    'O fornecedor fornece EPI para os colaboradores?',
    'O fornecedor possui menor preço do mercado?',
  ],
  controle_tecnologico: [
    'O laboratório é acreditado ou está em processo de acreditação pelo CGCRE/INMETRO?',
    'O laboratório atende aos requisitos da ABNT NBR ISO/IEC 17025?',
    'O laboratório possui certificação ABNT NBR ISO 9001?',
  ],
  projeto: [
    'O fornecedor possui todas as documentações de responsabilidade técnica?',
    'O fornecedor possui conhecimento da ABNT NBR 15575?',
    'O fornecedor possui menor preço do mercado?',
  ],
  locacao: [
    'O fornecedor possui contrato de locação do equipamento?',
    'O fornecedor possui check list de verificação do equipamento locado?',
    'O fornecedor possui menor preço do mercado?',
  ],
};

export const TITULOS_DOS_CRITERIOS: Record<Categoria, readonly [string, string, string]> = {
  material: ['Qualidade', 'Preço', 'Prazo'],
  servico: ['Documentos e NR', 'Fornece EPI', 'Preço'],
  controle_tecnologico: ['Acreditação', 'ISO 17025', 'ISO 9001'],
  projeto: ['Responsabilidade técnica', 'NBR 15575', 'Preço'],
  locacao: ['Contrato', 'Check list', 'Preço'],
};

/** O título do critério `i` (0 a 2) da categoria, para o cabeçalho e o nome no cartão. */
export function tituloDoCriterio(categoria: Categoria, i: number): string {
  return TITULOS_DOS_CRITERIOS[categoria]?.[i] ?? `Critério ${i + 1}`;
}
