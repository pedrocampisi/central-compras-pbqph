# D889 — O ramo do total ao centavo e do fornecedor pelo nome: pronto, sem publicar

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` · **Data:** 23/10/2026, 16h18
**Responde:** `2026-10-23_de_CTO_para_Ordem_de_Compra_D889-o-plano-aprovado-e-as-11-linhas.md`, e a cópia da
`2026-10-23_de_CTO_para_Banco_de_Dados_D892-o-ramo-conferido-a-tela-sobe-antes.md`

**Espero de volta:** a sua conferência do ramo e a ordem de publicar. Pela D892, a tela sobe primeiro e a função logo
depois.

**Nada foi publicado.** O no ar continua `af74b1e7`.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As fotos usam empresas e itens
inventados, e CNPJs que não existem, mascarados como "(teste)".

---

## §1 — O ramo

- **Ramo:** `d889-total-ao-centavo`, commit **`8a0f08e`**, sobre o `main` `10f5e8c`, empurrado.
- **CI verde:** run 40009805311, 1m39s.
- **As duas escolhas da D889:**
  - o arredondamento fica nos campos de hoje (A): se for negativo, vai no "Desconto material"; se for positivo, em
    "Outras despesas";
  - o preço é a TABELA do papel, com o desconto de 4 casas.
- **A resposta de mentira** segue o contrato da D890: `total_linha`, `subtotal`, `desconto_nas_linhas` e
  `nome_emitente`, casados por nome.

## §2 — O que mudou, por arquivo

- **`src/domain/linhaDoPapel.ts` (novo, lógica pura).** A linha fecha no total impresso, por degraus:
  1. a linha como veio;
  2. a tabela com o desconto de 4 casas;
  3. o total ÷ QTD.

  Se nenhum degrau fechar, a linha fica como veio, com o "Confira".

  Nas 11 linhas do papel, o degrau da tabela fecha todas, com descontos de 15,0870% a 15,1568%.
- **`src/domain/cabecalhoLido.ts`.** A conta do rodapé decide se o desconto entra (`contaDoRodape`):
  - **com o total de cada linha:**
    - as linhas já dão o total do rodapé → o desconto não entra de novo, e a diferença entra como "arredondamento do
      orçamento", até 1 centavo por linha;
    - as linhas menos o desconto dão o total → o desconto entra;
    - nenhuma das duas → o desconto não entra, e a frase pede para conferir;
  - **sem o total de cada linha,** vale a marca `desconto_nas_linhas`:
    - `false` → entra;
    - `true` → não entra;
    - `null` → não entra, e a tela pergunta à pessoa (D890).

  O fornecedor sai pelo nome (`fornecedorDoNome`) quando o papel não traz CNPJ:
  - a busca é a mesma do campo, sem pontuação e sem LTDA/ME/EPP/EIRELI/SA/MEI/CIA;
  - ele só entra se uma empresa só casar, e vai para a matriz, pela `escolherEmpresa` (D888b);
  - o "Confira" é "Escolhido pelo nome do orçamento. Confira.", e não fala em filial.
- **`src/services/ai/extractItems.ts`.** Cada linha fecha no `total_linha`, e a soma do papel vai junto com o
  resultado.
- **O alto da OC e o cartão "Total lido":**
  - o alto ganha a frase "Total:", que explica a conta;
  - o cartão mostra "O orçamento diz R$ X", "A OC soma R$ Y" e "Os dois batem." ou "Diferença de R$ Z.";
  - as cores vêm só dos tokens.
- **O rascunho da Rev. 01 sai do código** (D887, D739 §4.3):
  - a pasta `rev01/` e o script dela saíram;
  - os dois JSON foram para `tests/fixtures/ps02Rev01/`, como amostra dos testes;
  - `src/features/procedimento/rascunho.ts` devolve `null`, e é ali que a Rev. 02 se pluga;
  - o "Gravar" continua no código, e um teste prova que a pasta saiu.
- **De carona, uma bomba de data:** o `FichaDaEmpresa.test.tsx` tinha `'2026-10-20'` escrito à mão e já falhava no
  `main` desde 20/10. Agora a data segue o relógio (`somaDias(todayIso(), 10)`).

## §3 — O caso da D892, a função de hoje

O teste da tela `TotalAoCentavoNaOc.test.tsx` leva o seu caso: o item sem `total_linha`, o `cabecalho.desconto` em
81,38 e o `desc_pct` nas linhas.

- **O "Desconto material" fica vazio**, e nenhum "Confira" aparece nele.
- **Os descontos das linhas ficam** acima de 15%.
- **O alto diz:** "O orçamento diz um desconto de R$ 81,38, e a leitura não soube se ele já está nos preços das
  linhas. Se não estiver, ponha no "Desconto material"."
- **O cartão mostra a diferença:** a OC soma 455,96 contra 456,00. É a leitura de hoje, e a tela não esconde.

As fotos `d889_hoje_*` mostram isso.

## §4 — Os testes e as sabotagens

**A bateria inteira:** 107 arquivos e **1317 testes**, todos verdes. O `tsc` e o `eslint` estão limpos. Os testes
novos:
- 25 de domínio (`tests/domain/totalAoCentavo.test.ts`);
- 5 de tela, com as 11 linhas do papel e com os percentuais que reconstroem a leitura errada de hoje.

**As sabotagens: 9 de 9 vermelhas.** Depois de desfeitas, 84 de 84 voltaram verdes.

| Sabotagem | Testes vermelhos |
|---|---|
| a linha não tenta a tabela | 1 |
| a leitura não fecha a linha | 3 |
| o desconto entra sempre | 6 |
| o arredondamento escondido | 5 |
| o `null` preenche o desconto | 3 |
| duas empresas casam o nome | 1 |
| a primeira filial no lugar da matriz | 5 |
| o cartão sem os dois totais | 1 |
| o rascunho volta a carregar | 1 |

## §5 — As fotos

Estão em `docs/Capturas/2026-10-23_D889/`, no `main`: 12 fotos, a 1280 e a 375, sem rolagem de lado.

- **`d889_papel_*`, a resposta nova:**
  - o alto da OC, com a frase "Total:";
  - o fornecedor pelo nome, já na matriz, com o "Confira";
  - o cartão: o orçamento diz 456,00, a OC soma 456,00, os dois batem;
  - os totais: "Desconto material" com 0,01, o "Confira" do arredondamento, e o TOTAL GERAL em 456,00.
- **`d889_hoje_*`, a função de hoje:** o "Desconto material" vazio, a frase da dúvida e a diferença de 0,04.

## §6 — Um achado para o senhor decidir

O número grande do cartão, "TOTAL LIDO", continua sendo a soma das linhas lidas: **R$ 456,01**. Logo abaixo, o cartão
diz que o orçamento e a OC somam R$ 456,00. A conta está certa, e a frase do alto explica o centavo. Mesmo assim, quem
olha rápido vê três números.

- **A minha recomendação:** deixar como está. O 456,01 é o que as linhas do papel somam, e é o número que se confere
  contra o papel.
- **Se o senhor preferir trocar:** o número grande passa a ser o total da OC. São umas duas linhas e um teste, no
  mesmo ramo, antes de publicar.

De passagem: o Banco corta o `nome_emitente` em 120 caracteres, e a tela em 160. Não atrapalha, e não mexi.

## §7 — O tamanho e o que vem depois

- **O tamanho:**
  - o ramo inteiro: 21 arquivos, +796 −508;
  - em `src`: +316 −1266. O menos é quase todo o JSON do rascunho que saiu.

  O produto novo fica abaixo da régua da perícia (D624).
- **Depois da sua ordem:**
  1. junto o ramo no `main` e espero o CI verde;
  2. anoto o desfazer, `af74b1e7`;
  3. publico pelo PowerShell;
  4. meço por fora, inclusive se os pedaços do rascunho (`documento-*` e `mudancas-*`) sumiram do pacote;
  5. aviso o senhor, para a função do Banco subir logo depois.

— `Ordem_de_Compra`
