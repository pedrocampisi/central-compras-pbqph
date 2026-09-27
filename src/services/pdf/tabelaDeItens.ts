/**
 * As linhas da tabela de itens do PDF da OC — separadas do jsPDF para o teste
 * ler sem desenhar.
 *
 * Campo por campo, e só estes: o que não está aqui não sai no PDF. Em
 * especial o "confira" da leitura de texto (CTO-D557), que é aviso da tela e
 * nunca vai ao fornecedor.
 */
import type { Item } from '../../domain/types';
import { computeItemTotal } from '../../domain/compute';
import { formatBrl, formatDate } from '../../domain/format';

export function corpoDaTabelaDeItens(itens: readonly Item[]): string[][] {
  return itens.map((it, i) => {
    const tot = computeItemTotal(it);
    return [
      String(i + 1),
      it.descricao ?? '',
      it.observacao ?? '',
      (Number(it.quantidade) || 0).toLocaleString('pt-BR'),
      it.unidade ?? '',
      formatBrl(it.preco_unit),
      `${Number(it.ipi_pct) || 0}%`,
      `${Number(it.desc_pct) || 0}%`,
      formatBrl(tot.total),
      it.prazo_entrega ? formatDate(it.prazo_entrega) : '—',
    ];
  });
}
