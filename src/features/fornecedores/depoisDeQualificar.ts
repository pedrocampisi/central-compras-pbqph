/**
 * O que vem depois de gravar uma qualificação, igual na ficha da empresa e na
 * tela Qualificação (CTO-D661): recarrega do banco e diz, em uma frase, o que
 * o banco gravou — a situação nova, ou a nota que desqualificou.
 *
 * E o PDF dos qualificados (a folha do auditor, D604 §3.5), com o mesmo
 * gerador, de Fornecedores e da tela Qualificação.
 */

import { hojeEmSaoPaulo } from '../../domain/ecr';
import { secoesDosQualificados } from '../../domain/folhasDoAuditor';
import { linhasDoDia, textoDoSelo } from '../../domain/qualificacao';
import type { Fornecedor } from '../../domain/types';
import { baixarPdfDosQualificados } from '../../services/pdf/generateFolhasDoAuditor';
import type { DadosDaQualificacao, QualificacaoGravada } from '../../services/supabase/qualificacao';
import { recarregarDados } from '../../services/supabase/sync';
import type { ToastTone } from '../../stores/useUiStore';

type Avisar = (mensagem: string, tom?: ToastTone) => void;

export async function depoisDeQualificar(categoria: { nome: string }, r: QualificacaoGravada, avisar: Avisar) {
  try {
    await recarregarDados();
  } catch {
    avisar('A qualificação foi gravada, mas a tela não recarregou. Recarregue a página.', 'warning');
    return;
  }
  avisar(
    r.qualificada
      ? `${categoria.nome}: ${textoDoSelo({ situacao: r.situacao, qualificadaEm: null, venceEm: r.venceEm, ecrs: [] })}.`
      : `${categoria.nome}: nota ${r.nota} (o mínimo é ${r.minimo}) — a empresa ficou desqualificada.`,
    r.qualificada ? 'success' : 'warning',
  );
}

/** A folha do auditor: a FO 8.4.1.1 tirada do sistema, inteira, com a situação do dia do clique (B3). */
export async function pdfDosQualificados(
  qualificacoes: DadosDaQualificacao | null,
  fornecedores: readonly Fornecedor[],
  avisar: Avisar,
) {
  if (!qualificacoes) {
    avisar('As qualificações não carregaram. Recarregue a página para gerar o PDF.', 'warning');
    return;
  }
  try {
    const hoje = hojeEmSaoPaulo();
    await baixarPdfDosQualificados(
      secoesDosQualificados(linhasDoDia(qualificacoes.linhas, hoje), qualificacoes.categorias, fornecedores),
      hoje,
    );
  } catch (err) {
    avisar(`Erro ao gerar o PDF: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
  }
}
