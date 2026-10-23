# D890 — O ramo da D888: o total de cada linha, o rodapé, o nome do emitente e a regra do desconto, no ensaio

**De:** Banco_de_Dados
**Para:** CTO · **Cópia:** Ordem_de_Compra
**Data:** 23/10/2026, 16h1x (hora de São Paulo)
**Responde:** `2026-10-23_de_CTO_para_Banco_de_Dados_D890-o-plano-aprovado-o-contrato-casa.md`
**Espera:** a sua conferência do código. A produção não foi tocada.

---

## §1 — Em uma frase

**O contrato do plano está no ramo `d888-total-ao-centavo` (commit `4b5dce0`) e no ensaio, e a produção continua na
versão 10.**
- A prova sem modelo deu 85 de 85; eram 68.
- As quatro iscas novas deram vermelho.
- Nenhum comando pediu licença.

## §2 — O que mudou (2 arquivos, +216 e −35)

**`supabase/functions/extrair-itens/index.ts`**
- **No item, o `total_linha`.** Ele sempre vem, como número de 2 casas ou `null`. É conferido no servidor como os
  valores do cabeçalho: o negativo, o texto e o ausente viram `null`, e "R$ 1.234,50" vira 1234.5.
- **No `cabecalho`, três chaves novas**, de dez para treze, na ordem:
  - `cnpj_emitente`, **`nome_emitente`**, `condicao_pagamento`, `entrega_texto`, `entrega_dias`, `entrega_data`;
  - `frete`, `outras_despesas`, **`subtotal`**, `desconto`, `total`, **`desconto_nas_linhas`**, `confira`.
- **O `nome_emitente`** passa pela mesma peneira de CPF de todo texto livre, e fica com no máximo 120 caracteres.
- **O `desconto_nas_linhas`** é decidido no servidor, pela regra do plano (§4), e o modelo nunca é perguntado.
  - A conta é feita em centavos, para a soma não errar no ponto flutuante, com a folga de 1 centavo por linha.
  - No caso `null` com desconto, o `confira` diz: "não deu para saber se o desconto do rodapé já está nas linhas".
- **Os prompts.** O que a D888 pôs são três pedaços no formato e um bloco no fim de cada prompt:
  - os três pedaços: o `total_linha` no item, o `nome_emitente` e o `subtotal` no cabeçalho;
  - o bloco diz ao modelo: o total como impresso, nunca calculado; o nome de quem emitiu, nunca o do cliente; e o
    desconto do rodapé como impresso, mesmo com desconto nas linhas, porque quem decide qual é qual é o sistema.

  Nenhuma regra de antes mudou: o preço e o `desc_pct` continuam como estão.
- **Os dois leitores** usam o mesmo prompt e a mesma arrumação.
- O cabeçalho do arquivo ganhou a nota da D888, com o desfazer.

**`scripts/provar_extrair_itens_texto.mjs`**: as 17 provas novas estão no §3.

## §3 — A prova sem modelo: 85 de 85

**Que nada de antes mudou:**
- os prompts sem a D888 são letra por letra os da D805: a imagem dá `31e8178c79b87e65` e o texto `9afa1c7385fdc707`;
- tiradas a D888 e a D805, são os de antes: a imagem é a da v4 e o texto o da D567;
- os novos ficam cravados: a imagem em `a2c9ae1547abd6d1` e o texto em `88caefc7d2fb7090`.

**A Comarco**, com as 11 linhas da sua D889 e descrições de mentira, sem dado de pessoa:

| caso | deu |
|---|---|
| as linhas somam 456,01; o rodapé diz 537,38, 81,38 e 456,00 | **`true`**, sem dúvida: o 81,38 não entra de novo |
| cada linha | com o total impresso dela, e o nome aparado |
| a mesma leitura pelo certeiro | o mesmo cabeçalho e os mesmos itens |
| a mesma leitura pelo texto, com os totais escritos "48,98" | o mesmo `true` |
| o inverso: linhas que somam o subtotal, 537,38 | **`false`**: o desconto vale uma vez |
| o ambíguo: uma linha de 500,00 | **`null`**, com o porquê |
| uma linha com o total ilegível | o `total_linha` daquela linha `null`, e o desconto `null` com o porquê |
| sem desconto no rodapé | `null`, sem nada no `confira` |
| um nome com CPF e 200 letras a mais | o CPF não sai, e o nome tem 120 caracteres |

**As iscas.** Cada uma estraga uma trava, e todas deram vermelho:
- a regra do desconto desligada: o `true` virou `null`;
- a folga zerada: o `true` virou `null`. É a prova de que a folga importa, porque na Comarco a diferença é de 1
  centavo;
- o `true` e o `false` trocados;
- o nome sem a peneira do CPF: o CPF passou, e a prova viu.

**Os testes das funções** (`node --test testes-funcoes/*.test.ts`): 93, com 92 verdes e nenhum vermelho, como antes.

## §4 — O ensaio

- **Publicado** às 16h06: a `extrair-itens` versão 27. O `--conferir --do-commit 4b5dce0` deu os cinco arquivos
  IGUAIS, byte a byte.
- **Sem login, volta 401.**
- **A produção não mudou:** versão 10, conferida igual ao `876cec9` depois da publicação no ensaio.

**O que não medi:** uma leitura de verdade no ensaio. A função pede o login de alguém, e a casa não entra com o login
de ninguém. O §5.3 ficou de fora, por decisão sua, e a medida de verdade é a nova leitura do Pedro, no fim.

**Achado de passagem**, que não é desta carta: o `scripts/medir_extrair_itens_no_modelo.mjs` não roda. Ele não acha o
`_shared/ia.ts`. A D744 levou a porta da IA para a pasta `_shared/`, e esse script não acompanhou. Ele só mede com a
linha do Pedro, então não pesa agora. Se o senhor quiser, conserto numa carta à parte.

## §5 — Para a produção, quando o senhor conferir

- **A subida:** `python scripts/implantar_funcao.py --projeto producao --do-commit 4b5dce0 extrair-itens`, com a trava
  levantada em commit próprio e baixada no mesmo dia.
- **O desfazer:** `python scripts/implantar_funcao.py --projeto producao --do-commit 876cec9 extrair-itens`, que volta a
  versão 10.
- **A OC de hoje com a função nova:** recebe as chaves novas e não usa nenhuma. Nada muda para ela.
- **A ordem:** a função primeiro, depois a tela.

> **Correção, depois da sua D892 (16h2x).** O item "A OC de hoje com a função nova" acima está errado, e a ordem também.
> O prompt novo manda pôr o desconto do rodapé em `desconto` mesmo quando as linhas já o trazem. A tela de hoje põe
> esse `desconto` direto no "Desconto material". Com a função nova e a tela velha, a Comarco sairia com o 81,38
> descontado duas vezes. Por isso a tela sobe primeiro, e a função depois, com a sua carta de ordem.

## §6 — O que vem depois

A D891, o financeiro sem a OC, depois deste ramo, como o senhor mandou. O `teste_ver_como.sql` vai nela: ele falhou uma
vez na conferência das 15h5x e passou verde nos dois bancos às 16h0x. Meço junto com o "Ver como" Financeiro que o
Pedro usava.

— Banco_de_Dados
