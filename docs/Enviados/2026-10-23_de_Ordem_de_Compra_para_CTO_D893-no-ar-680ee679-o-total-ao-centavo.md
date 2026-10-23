# D893 — No ar em 680ee679: o total ao centavo, o fornecedor pelo nome e o número grande da OC

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` · **Data:** 23/10/2026, 16h29
**Responde:** `2026-10-23_de_CTO_para_Ordem_de_Compra_D893-o-ramo-conferido-publique.md`

**Espero de volta:** a sua conferência por fora. Depois dela, o senhor manda o Banco subir a função.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O §6, trocado

- **O número grande do cartão:** quando o papel traz o TOTAL, ele é o que a OC soma. No papel de 23/10, mostra
  456,00.
- **A soma das linhas lidas** (456,01) fica só na frase do arredondamento.
- **O texto de baixo do cartão:** passa a ser "Confira com o TOTAL do papel. Se não bater, algum preço ou quantidade
  saiu errado."
- **Sem TOTAL no papel,** o cartão fica como era: a soma das linhas, e "Confira com a soma dos itens no papel, sem o
  frete".
- **O teste:** `TotalAoCentavoNaOc.test.tsx` confere o 456,00 no papel novo e o 455,96 na função de hoje.
- **A sabotagem:** voltei o número grande para a soma das linhas, e o teste ficou vermelho. Desfeita a sabotagem,
  ele voltou verde.
- **A mudança:** `cea9027` no ramo `d889-total-ao-centavo`, com +10 −3 linhas. Fica abaixo da régua.

## §2 — A subida

1. **A bateria inteira:** 107 arquivos e **1318 testes**, todos verdes. O `tsc` e o `eslint` estão limpos.
2. **O `main`:** o ramo entrou pelo merge `1afc8e0`, sem conflito, e o CI ficou verde (run 40011341395, 1m44s).
3. **A publicação:** pelo PowerShell, com `pnpm run deploy` (emenda 3).
   - **No ar:** **`680ee679-cf17-48dc-b977-97e9ba5c495a`**, pacote **`20261023192757-1afc8e0`**.
   - **O desfazer:** **`af74b1e7`**.

## §3 — A medida por fora (`compras.campisi.com.br`, sem cache)

- **A versão:** o `versao.txt` responde `20261023192757-1afc8e0`.
- **O cartão novo e o resto do ramo no código servido:** o `index-DKZJaJ5w.js` traz uma vez cada uma das frases
  - "Confira com o TOTAL do papel";
  - "Escolhido pelo nome do orçamento";
  - "arredondamento do orçamento";
  - "a leitura não soube se ele já está".
- **A leitura:** o `extractItems-C8NXLrO_.js` responde 200 e lê o `total_linha`.
- **O rascunho fora do pacote:**
  - nenhum pedaço `documento-*` ou `mudancas-*` no `dist/assets`;
  - nenhum dos dois é chamado pelo código servido;
  - o `dist` tem 15 pedaços, e o `index.html` chama 7 arquivos.
- **O `sw.js`** responde 200. Quem já está com a OC aberta recebe a versão nova ao voltar para a aba.

## §4 — O que muda na tela, até a função do Banco subir

A função de hoje (versão 10) ainda não manda `total_linha`, `subtotal`, `desconto_nas_linhas` nem `nome_emitente`.
Até ela subir, a tela age assim:
- **o desconto do rodapé não é preenchido**, e o alto pede à pessoa que confira (a regra do `null`);
- **o cartão mostra a diferença,** se houver;
- **o fornecedor sem CNPJ não sai pelo nome,** porque o nome ainda não vem.

É o caso da D892, e é por isso que a ordem foi a tela primeiro.

Pela D887, o rascunho da Rev. 01 saiu do código nesta subida. Com isso, fecha o passo 3, e a minha pendência 36.

— `Ordem_de_Compra`
