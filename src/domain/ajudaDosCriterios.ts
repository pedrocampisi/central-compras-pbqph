/**
 * O "?" dos critérios da qualificação (CTO-D728 §3, pedido do Pedro: "O que
 * faz um fornecedor atende os critérios de qualidade?").
 *
 * FONTE: o PS.02 (Procedimento Sistêmico — Aquisição) vigente no SGQ, lido em
 * 05/10/2026: o item 2 (Qualificação de fornecedores, SiAC 8.4.1.1: a tabela
 * Categoria / Critérios internos Campisi / Regra de decisão, e o parágrafo
 * PSQ/SiMaC antes dela) e o item 5 (Laboratórios de controle tecnológico,
 * SiAC 8.4.1.1, Anexo 7). O documento é do SGQ: nada dele é copiado para cá,
 * só o que a tela diz.
 *
 * A REGRA: um critério só ganha "?" quando o PS.02 diz algo além da própria
 * pergunta. Onde ele só repete a pergunta, fica sem "?". Nada inventado. A
 * pergunta continua a da planilha (a régua da D604): o texto mora no banco,
 * em `compras.criterios_qualificacao`, e não muda aqui.
 *
 * A chave é a categoria e a ordem do critério (1 a 3), a mesma do banco.
 */

import type { Categoria } from './qualificacao';

type AjudaDosCriterios = Partial<Record<Categoria, Partial<Record<1 | 2 | 3, string>>>>;

const AJUDA: AjudaDosCriterios = {
  material: {
    // Item 2: "Qualidade/PSQ-ECR", e o parágrafo PSQ/SiMaC.
    1:
      'Atende quando o material dele cumpre a ECR daquele material (o que se exige na compra e no recebimento) e, se o ' +
      'produto tem PSQ (Programa Setorial da Qualidade, do PBQP-H), o fornecedor não aparece lá como não conforme. De ' +
      'fornecedor não conforme no PSQ a Campisi não pode comprar, e um certificado avulso não contorna essa proibição. ' +
      'Fonte: PS.02, item 2.',
  },
  controle_tecnologico: {
    // Item 5: "laboratório acreditado pela CGCRE/INMETRO para os ensaios contratados".
    1: 'A acreditação (ou o processo de acreditação) tem de valer para os ensaios que vão ser contratados. Fonte: PS.02, item 5.',
    // Item 5: a 17025 comprovada, e o laboratório que não é acreditado nem está em processo.
    2:
      'Atende o laboratório que comprova a ABNT NBR ISO/IEC 17025, inclusive uma instituição de pesquisa ou de ensino. Se ele não é ' +
      'acreditado nem está em processo, a Campisi avalia as instalações, a competência da equipe e a calibração dos ' +
      'equipamentos (Anexo 7 do SiAC), e o requalifica a cada 12 meses. Fonte: PS.02, item 5.',
    // Item 5: "empresa de controle tecnológico com SGQ ISO 9001 cujo escopo inclua os ensaios".
    3: 'A ISO 9001 tem de ter no escopo os ensaios que vão ser contratados. Fonte: PS.02, item 5.',
  },
};

/** O "?" do critério `ordem` (1 a 3) da categoria; `null` quando o PS.02 não diz nada além da pergunta. */
export function ajudaDoCriterio(categoria: Categoria, ordem: number): string | null {
  return AJUDA[categoria]?.[ordem as 1 | 2 | 3] ?? null;
}
