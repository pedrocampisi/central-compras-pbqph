/**
 * CTO-D593 §3 — o PDF da OC com a marca comprimida. Sem a compressão, o
 * jsPDF grava a marca crua e cada OC passava de 4 MB (medido: 4.227.036
 * bytes); com ela, a mesma OC tem uns 75 KB, e a página sai igual pixel a
 * pixel. OC de teste com dados inventados.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateOcPdfBlob } from '../../src/services/pdf/generateOcPdf';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('D593 — o PDF da OC pesa pouco', () => {
  it('uma OC de teste com a marca de verdade fica abaixo de 300 KB', async () => {
    const png = readFileSync(join(__dirname, '../../public/brazao1.png'));
    // A marca vem do endereço público; aqui, do arquivo, sem rede.
    vi.stubGlobal('fetch', async () => ({ ok: true, blob: async () => new Blob([png], { type: 'image/png' }) }));
    const oc = {
      id: 'oc-teste', numero: 'OC-2026-0001', data: '2026-09-27', fornecedor_id: 'f1', obra_id: 'o1',
      itens: [
        { id: 'i1', descricao: 'Cimento CP-II E-32 50kg', observacao: '', quantidade: 40, unidade: 'sc', preco_unit: 34.9, ipi_pct: 0, desc_pct: 0, prazo_entrega: '' },
      ],
      frete: 0, outras_despesas: 0, desconto: 0, condicao_pagamento: 'À vista', observacoes: '',
    };
    const data = {
      config: { condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '' },
      fornecedores: [{ id: 'f1', razao_social: 'Fornecedor de Teste Ltda' }],
      obras: [{ id: 'o1', nome: 'Obra de Teste' }],
      ecrs: [],
    };
    const blob = await generateOcPdfBlob(oc as never, data as never);
    // A marca entrou (a imagem está no PDF), e o arquivo é pequeno.
    const texto = await new Promise<string>((ok) => {
      const r = new FileReader();
      r.onload = () => ok(String(r.result));
      r.readAsBinaryString(blob);
    });
    expect(texto).toContain('/Subtype /Image');
    expect(blob.size).toBeLessThan(300 * 1024);
  });
});
