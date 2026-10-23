# D888 — O plano: cada linha fecha no total impresso, a OC fecha no rodapé, e o fornecedor sai pelo nome, na matriz

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` · **Data:** 23/10/2026, 15h49
**Responde:** `2026-10-23_de_CTO_para_Ordem_de_Compra_D888-o-total-ao-centavo-e-o-fornecedor-pelo-nome.md` e a correção
`2026-10-23_de_CTO_para_Ordem_de_Compra_D888b-a-matriz-sem-confira-a-filial.md`

**Espero de volta:**
- a sua aprovação, com as duas escolhas do §4;
- as 11 linhas do papel (QTD, VALOR TABELA, TOTAL), sem dado de pessoa, para o teste e para a medida de cada linha.

**Nada foi gravado.** Não li a linha 530 do `core.leituras_de_ia`: o conector desta sessão não enxerga a produção hoje.
O que digo da leitura vem do código da `extrair-itens` e das suas contas.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que medi, só lendo

- **A conta da linha** (`src/domain/compute.ts`) é qtd × preço × (1 − desc/100) × (1 + IPI/100). Ela não guarda nem
  arredonda a linha, e o "TOTAL GERAL" soma as linhas sem arredondar.
- **O desconto pode ter entrado duas vezes.** A tela põe o `cabecalho.desconto` no "Desconto material" sem mais nada
  (`preencherDoCabecalho`). O prompt da `extrair-itens` manda pôr ali "o desconto do orçamento inteiro, como impresso",
  e o de cada linha no `desc_pct`. Neste papel, o "DESCONTO 81,38" do rodapé **é** a soma dos descontos das linhas.
  - Se a leitura mandou os dois, o "TOTAL GERAL" da OC deu cerca de 374,58.
  - Só a linha 530 diz se foi assim. Peço ao Banco que meça.
- **O cartão "Total lido"** fica no alto, no campo da leitura, e só mostra a soma dos itens lidos.
  - A comparação com o total do papel (`ConferenciaDoTotal`) existe, mas fica embaixo, na caixa dos totais da OC.
  - E ela só aparece quando o `cabecalho.total` vem.
  - O Pedro olhou o cartão do alto, e ali o total do papel não está. Se o `total` veio, quem diz é a linha 530.
- **O fornecedor** sai só pelo CNPJ (`fornecedorDoCnpj`). A busca do campo Fornecedor (`opcoesDeEmpresa`
  e `filtrarOpcoes`) acha a empresa pelo apelido, pela razão social e pela fantasia de qualquer filial, com todas as
  palavras digitadas. A matriz sai da `escolherEmpresa` com a `filialPrincipal` (D549).

## §2 — O plano (a tela)

1. **A linha fecha no TOTAL impresso dela.** Quando o item traz o total da linha, o preço continua o VALOR TABELA do
   papel, e o `desc_pct` é calculado com 4 casas para que a linha dê o total impresso.
   - A tela confere a linha ao centavo.
   - Se não fechar, tenta o preço = total ÷ QTD com 4 casas e o desconto 0.
   - Se nem assim fechar, a linha fica com o "Confira" e o porquê.
   - Sem o total da linha (a leitura de hoje, ou o texto colado), tudo fica como hoje.
2. **O desconto nunca entra duas vezes.** Se as linhas fechadas somam o TOTAL do rodapé, o desconto do rodapé já está
   nelas. Então o "Desconto material" não recebe nada, e o aviso diz: "O desconto do orçamento (R$ 81,38) já está nos
   preços das linhas." O desconto só vai ao "Desconto material" quando as linhas menos ele dão o TOTAL. Essa conta é da
   tela e vale mesmo se a leitura errar a marca do §3.
3. **A OC fecha no TOTAL do rodapé.** Se as linhas do papel e o rodapé diferem em até 1 centavo por linha (aqui, 456,01
   contra 456,00), a diferença entra declarada como "arredondamento do orçamento", com a frase: "As linhas do orçamento
   somam R$ 456,01 e o total dele diz R$ 456,00." Ela nunca se espalha pelas linhas. Com diferença maior, nada se
   ajusta: a conferência mostra que difere.
4. **O cartão "Total lido"** põe os dois números lado a lado, "O orçamento diz" e "A OC soma", quando o papel traz o
   total. A conferência de baixo fica.
5. **O fornecedor pelo nome, só sem CNPJ.** Com CNPJ, vale o CNPJ, como hoje.
   - Sem CNPJ, o `nome_emitente` passa pela mesma busca do campo Fornecedor, só entre as empresas cadastradas.
   - Se uma empresa só casa, entra a matriz pela `escolherEmpresa`, como na escolha à mão. O aviso é "Escolhido pelo
     nome do orçamento. Confira."
   - Se nenhuma ou mais de uma casa, o campo fica vazio e a frase diz por quê. A IA nunca cadastra.
6. **De carona,** o rascunho da Rev. 01 sai do código (a sua D887, D739 §4.3). É a próxima publicação.

## §3 — O contrato que proponho ao Banco (os nomes são dele)

| onde | a chave | o que é |
|---|---|---|
| cada item | `total_linha` | o TOTAL da linha, como impresso, em reais; `null` se o papel não traz |
| `cabecalho` | `subtotal` | o SUB-TOTAL do rodapé, como impresso |
| `cabecalho` | `desconto_nas_linhas` | `true` quando o desconto do rodapé é a soma dos das linhas |
| `cabecalho` | `nome_emitente` | a razão social ou a fantasia de quem emitiu, como impressa (também com CNPJ, para conferência) |

O `desconto` e o `total` ficam como estão. A versão de hoje, sem essas chaves, segue com a tela de hoje, e isso tem
teste.

## §4 — Duas escolhas suas

1. **Onde mora o arredondamento.**
   - **A (recomendo agora):** no "Desconto material" quando a diferença é para menos, e em "Outras despesas" quando é
     para mais. O "Confira" dá o nome e a origem. O banco não muda, mas o PDF da OC mostra só o rótulo do campo.
   - **B:** uma coluna própria, "Arredondamento", na OC e no PDF. Isso pede o Banco (a coluna e a `salvar_oc`).
2. **O preço da linha:** a tabela com o desconto de 4 casas (recomendo, porque é o que o papel mostra) ou o preço
   líquido (total ÷ QTD), com o desconto 0.

## §5 — O tamanho e as provas

- **O tamanho:** cerca de 160 linhas de produto (o domínio, o cartão e o alto da OC) e 250 de teste, mais a saída do
  rascunho. Fica abaixo da régua da perícia (D624); se o senhor quiser perito, vai junto.
- **Os testes:**
  - o caso da Comarco: as 11 linhas fechando ao centavo, o 456,01 contra 456,00 declarado e o desconto uma vez só;
  - a leitura de hoje sem as chaves novas;
  - o fornecedor pelo nome com uma, nenhuma e duas empresas;
  - as sabotagens.
- **A ordem:** a `extrair-itens` primeiro e a tela depois, como na D865.

— `Ordem_de_Compra`
