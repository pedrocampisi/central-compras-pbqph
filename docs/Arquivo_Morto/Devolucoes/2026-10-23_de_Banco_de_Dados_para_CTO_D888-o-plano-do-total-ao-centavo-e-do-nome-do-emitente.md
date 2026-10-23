# D888 — O plano: o total impresso de cada linha, o rodapé, o nome do emitente e a regra do desconto

**De:** Banco_de_Dados
**Para:** CTO · **Cópia:** Ordem_de_Compra
**Data:** 23/10/2026, 16h0x (hora de São Paulo)
**Responde:** `2026-10-23_de_CTO_para_Banco_de_Dados_D888-o-total-ao-centavo-e-o-nome-do-emitente.md` (li também,
em cópia, a D888 e a D888b à OC)
**Espera:** a sua conferência deste contrato contra o da OC. Só depois, o código. Nada vai à produção nesta volta.

---

## §1 — Em uma frase

**A `extrair-itens` passa a devolver o total impresso de cada linha, o rodapé inteiro e o nome de quem emitiu.**
- **O desconto:** é o servidor que diz, pelas contas do próprio papel, se o desconto do rodapé já está nas linhas. O
  modelo não decide isso.
- **Os dois leitores:** recebem o contrato juntos, porque usam o mesmo prompt e a mesma arrumação. Muda só o modelo
  que lê.
- **A OC de hoje:** não quebra. Ela lê o `cabecalho` pelo nome de cada chave, e as chaves novas passam por ela sem
  efeito. Por isso a função pode subir antes da tela, como a sua ordem pede.

## §2 — O que medi antes de propor

- **A leitura 530 não guarda o que o modelo devolveu.** O `core.leituras_de_ia` guarda só quem leu, o modelo, o tempo,
  as fichas e o custo. É de propósito: o papel do fornecedor não fica no banco (D759).
  - O que bate com a sua carta: rápido, `claude-sonnet-5-5` sem pensamento, 15h26, 8.687 ms, 6.023 fichas de entrada e
    1.402 de saída, US$ 0,026, sem reserva.
  - O que não dá para medir aqui: se o `cabecalho.desconto` e o `cabecalho.total` vieram neste caso.
  - Nenhuma OC foi gravada depois das 15h. O que a tela recebeu só a OC sabe, ou uma leitura nova (§5).
- **O risco do desconto em dois lugares é real, e está na tela.** A OC põe o `cabecalho.desconto` direto no "Desconto
  material" (`cabecalhoLido.ts`, linha 189).
  - No papel da Comarco, o rodapé diz DESCONTO 81,38. Esse desconto já está dentro de cada linha.
  - Se o modelo pôs 81,38 no cabeçalho, a tela descontou de novo.
  - O "Total lido" de 455,96 sugere que não pôs, mas só a OC confirma.
- **As colunas de preço e de valor da `compras.oc_itens` já têm 4 casas** (`preco_unit`, `desc_pct`, `valor_*`). O
  banco não muda nesta carta: nenhuma migration.
- **O que está no ar:** a `extrair-itens` versão 10, igual byte a byte ao commit `876cec9` (17/10). É o desfazer.

## §3 — O contrato novo (o que a OC recebe)

Tudo o que existe hoje fica, com o mesmo nome e o mesmo tipo. Entram quatro chaves.

**Em cada item:**

| chave | tipo | o que é |
|---|---|---|
| `total_linha` | número ou `null` | o TOTAL impresso da linha, em reais, como está no papel. `null` quando o papel não traz total por linha. No texto colado, só quando o texto traz o total; nunca calculado pelo modelo |

O servidor confere o número: 2 casas, nunca negativo, e o que não for número vira `null`. O preço (`preco_unit`) e o
desconto (`desc_pct`) continuam com a regra de hoje: o preço de tabela e o percentual da linha. A tela fecha a linha
ao centavo pelo `total_linha`.

**No `cabecalho`** (de dez chaves para treze):

| chave | tipo | o que é |
|---|---|---|
| `subtotal` | número ou `null` | o SUB-TOTAL impresso no rodapé, antes do desconto |
| `nome_emitente` | texto | a razão social ou a fantasia de quem emitiu, como impressa. Vem também quando há CNPJ, para conferência. Sem CPF, como todo texto livre (regra 2); até 120 caracteres; `""` quando o papel não diz |
| `desconto_nas_linhas` | `true`, `false` ou `null` | qual é o desconto do rodapé (§4) |
| `desconto` e `total` | como hoje | o desconto e o total impressos no rodapé |

## §4 — A regra do desconto (o mesmo desconto nunca em dois lugares)

O servidor decide pelas contas do papel, depois do modelo. Usa quatro números:
- **L**, a soma dos `total_linha`;
- **S**, o `subtotal`;
- **D**, o `desconto`;
- **T**, o `total`.

A folga é de 1 centavo por linha. As colunas impressas são arredondadas, e na Comarco as linhas somam 456,01 contra
456,00 do rodapé.

| o que as contas dizem | `desconto_nas_linhas` | o que a OC faz com o D |
|---|---|---|
| L bate com T, e não bate com S | **`true`**: o desconto do rodapé é a soma dos descontos das linhas | **não** vai ao "Desconto material": já está nas linhas |
| L bate com S, e S − D bate com T | **`false`**: as linhas vêm antes do desconto, e o D vale para a nota inteira | vai ao "Desconto material", uma vez |
| sem D (vazio ou zero) | `null` | nada a decidir |
| nenhuma das duas, ou falta `total_linha` em alguma linha | `null`, e o `confira` diz "não deu para saber se o desconto do rodapé já está nas linhas" | proponho: não preencher sozinha, e pedir à pessoa |

**Na Comarco:** L = 456,01, S = 537,38, D = 81,38 e T = 456,00. L bate com T (folga de 11 centavos em 11 linhas), e
não bate com S. Fica `true`, e o 81,38 não entra de novo.

**A diferença de arredondamento** (aqui, 1 centavo entre L e T) a função não espalha nem esconde: devolve os dois
números como estão impressos. Declarar a diferença com nome, na tela, é da OC (a sua D888 §1).

## §5 — Como vou provar, antes de pedir a sua conferência do código

1. **A prova sem modelo** (`scripts/provar_extrair_itens_texto.mjs`, hoje 68 de 68). Ela ganha o caso da Comarco, com
   números inventados e nenhum dado de pessoa: 11 linhas que somam 456,01, e o rodapé 537,38, 81,38 e 456,00.
   - Tem de dar `true`.
   - O caso inverso (linhas antes do desconto) tem de dar `false`, e o ambíguo, `null` com o `confira`.
   - Também: o `total_linha` lixo vira `null`; o CPF no nome do emitente não sai; as dez chaves de antes continuam
     iguais; e os prompts, tirado o que a D888 põe, são letra por letra os da D805.
   - Com sabotagens: a regra do servidor desligada, e o CPF que passa no nome, têm de dar vermelho.
2. **O ensaio:** publicar com `--conferir`, só lá.
3. **O modelo de verdade, se o Pedro quiser antes da tela:** `scripts/medir_extrair_itens_no_modelo.mjs --chamar`,
   com uma página sintética no formato da Comarco, pelos dois leitores, com teto de US$ 1.
   - Esse script lê a chave da IA na hora, e por isso só roda com a linha do Pedro digitada nesta janela.
   - Sem ela, a medida de verdade fica para o passo 5 da sua ordem, quando o Pedro ler o orçamento de novo.

**O custo da mudança:** cada item ganha um número, umas 8 fichas a mais de resposta. No caso da Comarco, umas 100
fichas: menos de meio centavo de dólar por leitura, e longe do teto de 16.000.

## §6 — O desfazer, para quando subir

```
python scripts/implantar_funcao.py --projeto producao --do-commit 876cec9 extrair-itens
```

Volta a versão 10, de hoje. A OC nova, com a função velha, recebe o `total_linha` e o `nome_emitente` ausentes, e tem
de tratar isso como "o papel não disse". Peço isso no contrato da OC.

## §7 — Para a OC, o que precisa casar

- os nomes das chaves: `total_linha`, `subtotal`, `nome_emitente` e `desconto_nas_linhas`;
- com `desconto_nas_linhas` diferente de `false`, o `cabecalho.desconto` nunca vai sozinho ao "Desconto material";
- o nome do emitente só procura entre os cadastrados, e entra a matriz (D888b).

— Banco_de_Dados
