# D900 — No ar em d4960d22: a coluna PRAZO dos itens saiu da Nova OC e do PDF

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 23/10/2026, 18h27
**Responde:** `2026-10-23_de_CTO_para_Ordem_de_Compra_D900-tire-a-coluna-prazo-dos-itens.md`

**Espero de volta:** a sua conferência por fora.

**O banco não mudou.** A coluna `compras.oc_itens.prazo_entrega` fica como está, sem migration.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As fotos usam uma OC, uma
obra e um fornecedor inventados, sem CNPJ.

---

## §1 — O que saiu

- **A Nova OC:** a coluna PRAZO da tabela de itens saiu, com o cabeçalho e o campo do "Ex: 7 dias"
  (`NovaOcPage.tsx`).
- **O PDF da OC:**
  - a coluna "Prazo" da tabela de itens saiu (`generateOcPdf.ts` e `tabelaDeItens.ts`);
  - os 19 mm dela foram para a Descrição, que passa de 56 para 75 mm, e a tabela continua com 190 mm;
  - com a coluna, foi junto o `formatDate`, que formatava o texto livre como data (o defeito escondido da sua medida).
- **A gravação:** o `linhasDosItens` (o `salvar_oc`) não manda mais o `prazo_entrega`. A coluna fica vazia no banco.
- **O que fica, de propósito:**
  - o "Prazo de entrega — Conforme / Não Conforme" do recebimento, do Histórico, do app do encarregado e das folhas
    do auditor;
  - a "Entrega prevista" do alto da OC;
  - a leitura do campo antigo no tipo do item. O `normalize`, o esquema do arquivo velho e a leitura do banco
    continuam aceitando o campo, e por isso uma OC antiga, com prazo no item, ainda abre e gera o PDF.

## §2 — As provas

- **Os testes novos** (`tests/components/SemPrazoPorItem.test.tsx`, 4 testes):
  - a tabela da Nova OC tem as 11 colunas, sem o PRAZO e sem o "Ex: 7 dias", e a "Entrega prevista" continua;
  - a linha do PDF vai até o Total, com 9 células, e o prazo antigo não sai;
  - o PDF de uma OC antiga, com `prazo_entrega` no item, continua saindo, sem "Prazo" e sem a data;
  - a gravação não leva o `prazo_entrega`.
- **Um teste velho mudou:** a lista de colunas do `salvar_oc`, em `leituraDeTexto.test.ts`, perdeu o `prazo_entrega`.
- **As sabotagens: 4 de 4 vermelhas.** Restauradas, todas voltaram verdes.

  | Sabotagem | Testes vermelhos |
  |---|---|
  | a coluna volta na tela | 1 |
  | o prazo volta na linha do PDF | 1 |
  | o cabeçalho do PDF volta com "Prazo" | 1 |
  | o prazo volta para o banco | 2 |
- **A bateria inteira:** 108 arquivos e **1322 testes**, todos verdes. O `tsc` e o `eslint` estão limpos.
- **O tamanho:** em `src`, 4 arquivos, +7 −17. No total, 6 arquivos, +101 −18.

## §3 — A subida (emenda 3, sem a conferência do ramo, como mandou a D900)

1. **O ramo:** `d900-sem-prazo-por-item`, commit `9993fe6`. Ele entrou no `main` em avanço direto, e o CI ficou verde
   (run 40026528368, 1m48s).
2. **A publicação:** pelo PowerShell, com `pnpm run deploy`.
   - **No ar:** **`d4960d22-5ceb-43b1-be12-a1b5e10bb8e7`**, pacote **`20261023212630-9993fe6`**.
   - **O desfazer:** **`680ee679`**, que era o no ar até agora (eu medi o `versao.txt` antes de subir).

## §4 — A medida por fora (`compras.campisi.com.br`, sem cache)

- **A versão:** o `versao.txt` responde `20261023212630-9993fe6`.
- **O código servido** (`index-1TJz41A-.js`):
  - o cabeçalho do PDF acaba em `Desc%`, `Total`, sem `Prazo`;
  - a tabela da tela vai do `Desc%` direto ao `Total`;
  - nenhum "Ex: 7 dias".
- **O que fica:** "Entrega prevista" e "Prazo de entrega" continuam lá.

## §5 — As fotos

Estão em `docs/Capturas/2026-10-23_D900/`:
- `d900_tela_itens_1280.png` e `d900_tela_itens_375.png`: a tabela de itens da Nova OC sem a coluna;
- `d900_pdf_pagina1.png`: a página 1 do PDF, desenhada pelo pdf.js. O item 1 tem prazo antigo no dado, e ele não
  aparece.

## §6 — As cópias que chegaram

Na minha `Devolucoes` chegaram cinco cartas em cópia. Ficam de ciência e vão ao arquivo morto:
- a D891 e a D897 do Banco (o financeiro sem a OC, no ensaio e no ar);
- a D891 e a D895 da Central (o "ver como");
- a D894 do Banco (a `extrair-itens` na versão 11).

Nenhuma pede nada a esta casa. Uma delas confirma um fato: com a função nova no ar, a tela da OC já recebe o
`total_linha` e o `nome_emitente`.

— `Ordem_de_Compra`
