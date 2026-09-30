# D644 §4 — os três retoques prontos no ramo, esperando a sua linha

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 29/09/2026, 23h4x
**Responde:** `2026-09-29_de_CTO_para_Ordem_de_Compra_D644-fotos-aceitas-publique-e-tres-retoques-depois.md`, §4.
A publicação da D641/D643 foi na outra carta (`d7e5e46e`).
**Espero de volta:** a sua linha sobre as fotos. **Nada foi publicado.**
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** Os dados das fotos são inventados.

---

## §1 — O ramo

- **Ramo:** `d644-retoques`, a partir do `main` publicado (`b80f35a`).
- **Commit:** `5fb2b5d`. **CI verde** (execução 36660869777).
- **Tamanho fora de `docs/`:** 6 arquivos, +102 −9. Sem perícia, como a §4 diz.
- **Bateria:** 614 testes, todos verdes (eram 609: 5 novos); tipos, lint e build limpos (build pelo PowerShell).

## §2 — Os três retoques

**1. As colunas não andam.**
- A tabela de Fornecedores passou a ter layout fixo, com as larguras declaradas:
  - CNPJ 170px;
  - contato 240px;
  - qualificação 190px;
  - ativo 120px;
  - ações 80px;
  - a empresa fica com o resto.
- Abaixo de 1000px, a tabela rola dentro da própria caixa, como já rolava a 768 e a 375.
- **Medido nas fotos, a posição x do cabeçalho:**

| Largura | Fotos | Empresa | CNPJ | Contato | Qualificação | Ativo | Ações |
|---|---|---|---|---|---|---|---|
| 1366 | `01`, `04`, `06` | 288 | 526 | 696 | 936 | 1126 | 1246 |
| 1920 | `01`, `04`, `06` | 288 | 1080 | 1250 | 1490 | 1680 | 1800 |

  Nas três fotos de cada largura, os seis números são os mesmos, no claro e no escuro.
- **Um ponto para você decidir.** Na `04`, a linha menor da empresa ainda passa por baixo dos cabeçalhos "CNPJ" e
  "E-mail / Telefone".
  - **Por quê:** a linha da empresa com filiais usa as três primeiras colunas (ela não tem CNPJ nem contato próprios;
    eles moram nas filiais).
  - **Agora isso não muda de uma cena para outra.** O cabeçalho é o mesmo na lista, na busca e no filtro.
  - **A alternativa:** prender a empresa só na primeira coluna. Com 238px a 1366, a linha menor quebraria em três ou
    quatro linhas. Se preferir assim, é uma troca pequena.

**2. O cartão "Fornecedores" do Dashboard conta empresas.**
- Conta empresas com alguma filial ativa, pelo mesmo `agruparPorEmpresa` da lista (a regra da D501).
- Nas fotos, ele diz **5**:
  - a lista tem 6 empresas;
  - uma delas tem todas as filiais inativas.
- **Antes dizia 10, contando filiais.**

**3. A busca do Catálogo ECR no escuro.**
- A caixa solta (estilo no próprio elemento, sem fundo) virou a mesma barra de busca das outras listas (`ListToolbar`),
  com as cores do tema.
- **Medido nas fotos:** o fundo da caixa é `rgb(18, 36, 47)` no escuro e `rgb(255, 253, 248)` no claro, o mesmo da
  busca de Fornecedores.

## §3 — A prova

**Um teste para cada retoque:**
- **Colunas:**
  - as seis colunas declaradas são as mesmas na lista, na busca com a empresa fechada e no filtro;
  - a tabela é de layout fixo e cada coluna de dado tem largura em px.
- **Cartão:**
  - três filiais da mesma empresa mais uma filial sem empresa dão 2;
  - a empresa com todas as filiais inativas não conta.
- **Catálogo:** a busca tem nome, não tem estilo solto e ainda filtra.

**Sabotagens:** todas reprovaram, e os arquivos voltaram ao byte (sha igual).

| Sabotagem | Resultado |
|---|---|
| a tabela volta ao layout automático | 1 vermelho |
| sem as colunas declaradas | 2 vermelhos |
| o cartão volta a contar filiais | 1 vermelho |
| o cartão conta empresas ativas e inativas | 1 vermelho |
| a caixa solta de volta no Catálogo | 1 vermelho |

## §4 — As fotos

**Onde:** `docs/Capturas/2026-09-29_D644/` no ramo. São 28:
- `01`, `04` e `06` de Fornecedores em 1920 e 1366, no claro e no escuro (12);
- o Dashboard (`11`) e o Catálogo (`16`) nas quatro larguras, no claro e no escuro (16).

**A medida em todas:**
- título uma vez;
- sem rolagem de lado;
- nada fora da moldura;
- nenhum texto sobre outro.
