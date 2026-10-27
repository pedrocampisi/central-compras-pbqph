# D964 — A lista de Fornecedores abre com quem fornece material: no ar

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 27/10/2026, 11h23
**Responde:** `2026-10-27_de_CTO_para_Ordem_de_Compra_D964-a-lista-mostra-quem-fornece-material.md`

**Espero de volta:** nada. Se o Pedro preferir outro nome nos botões, é uma troca de texto.

**O banco não mudou.** Na produção, esta casa só leu: uma contagem das marcas, sem nome (§3).
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As fotos usam empresas
inventadas.

---

## §1 — Em uma frase

**No ar em `81e82d7b`, pacote `20261027142216-ee5d6c9` (main `ee5d6c9`, CI verde). O desfazer é `6bb4a34d`.**

## §2 — O que mudou

Um filtro novo fica ao lado de Todos, Ativos e Inativos. Ele diz **o que a empresa fornece:**

| botão | mostra |
|---|---|
| **Material** (a lista abre aqui) | a empresa em que alguma filial tem `fornece_material`: só material, ou os dois |
| **Serviço** | a empresa em que alguma filial tem `presta_servico`: só serviço, ou os dois |
| **Todas as empresas** | todas, inclusive as que não têm marca nenhuma |

- **A marca é a do banco,** já resolvida por filial pela `core.fornecedor_resolvido`. A tela não criou regra nova.
- **Todos, Ativos e Inativos continuam valendo junto.** Por exemplo, "Material" com "Inativos" mostra os
  fornecedores de material inativos.
- **Por que dois grupos de botões, e não um botão a mais no grupo de hoje:**
  - num grupo só, "Ativos" voltaria a misturar os prestadores;
  - e as empresas sem marca não teriam onde aparecer sem trazer os prestadores junto.
- **Os nomes que escolhi:**
  - "Material" e "Serviço" são as palavras do cadastro;
  - "Todas as empresas", por extenso, para não confundir com o "Todos" do lado, que quer dizer "ativos e inativos";
  - **as 6 empresas sem marca aparecem em "Todas as empresas".**
- **O filtro fica guardado ao trocar de aba,** como a busca.

## §3 — A medida

- **As marcas na produção, só lendo:**
  - medi agrupando pela empresa do banco, e deu 198 empresas;
  - o senhor contou 189, e a diferença está só no agrupamento: as **6 sem marca** e os **38 que fazem os dois**
    batem;
  - pela minha conta, "Material" mostra 115 empresas e "Serviço" mostra 115.
- **Os testes:** 5 novos em `ListaMostraMaterial.test.tsx`, um deles com a **isca**. A isca é a conta que parece
  certa ("material é quem não presta serviço"): ela tira quem faz os dois e põe quem não tem marca, e o teste a
  separa da conta certa.
- **Os 4 testes da ficha da empresa** testam o selo de todas as empresas. Eles passaram a abrir em "Todas as
  empresas".
- **A bateria:** 1353 testes verdes, o `typecheck` e o `eslint` limpos.
- **As sabotagens:** 8 de 8 vermelhas, rodadas numa pasta temporária tirada do commit (D963, prática 1). A pasta da
  casa não foi tocada.
- **A subida:** às 11h22, pelo PowerShell. Medido por fora: o `versao.txt`, a página, os sete arquivos
  `.js`/`.css` e o `sw.js` servidos são iguais ao pacote, byte a byte.

## §4 — As fotos

Em `docs/Capturas/2026-10-27_D964/`, as três posições do filtro em 1280 e em 375. Nenhuma tem rolagem de lado na
página: a tabela rola dentro dela, como antes.

Nenhum comando pediu licença.
