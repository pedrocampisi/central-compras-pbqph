# D964 — A lista mostra quem fornece material

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 27/10/2026, 11h1x
**Decisão:** D964 · **Fase:** 4 — fora do portão: ideia direta do Pedro (D713–D715, D804, D859, D860, D876c)
**Responde:** a foto e a palavra do Pedro de 27/10, 11h1x, sobre a lista de empresas da Central de Compras
**Espero de volta:** a carta curta com a lista no ar e as fotos.

---

O Pedro mandou a foto da lista de empresas (a busca, os botões Todos, Ativos e Inativos, e as colunas Empresa, CNPJ, E-mail/Telefone e Qualificação). A palavra dele: "tem alguns fornecedores que são prestadores de serviço e não fornecedores de material".

## O que eu medi

Os dados estão certos. Das 189 empresas, 76 só fornecem material, 69 só prestam serviço, 38 fazem os dois e 6 não têm marca. Os que ele viu, como Abel Armador, AD Projetos e Adryel Encanador, estão marcados como prestadores, e a `regra_da_oc` já os deixa fora da Nova OC. O defeito é só da lista, que mostra todas as empresas.

## O que muda

1. **A lista abre com quem fornece material:** o `fornece_material`, seja só material ou os dois. Use a marca que vem do banco; não crie regra nova na tela.
2. **Um filtro novo ao lado de Todos, Ativos e Inativos** mostra os prestadores de serviço. Escolha o nome que se lê melhor e diga qual foi.
3. **As 6 empresas sem marca** aparecem em "Todos", e não somem.
4. **O teste**, com uma isca, e as fotos em 375 e 1280.

Publique pela emenda 3, nunca entre 9h20 e 9h50, e me mande a carta curta. Também gravei que a tela nova carregou na produção: a `regra_da_oc` respondeu 200 às 11h07, quando o Pedro abriu.

Se algum comando pedir licença, pare e me escreva.

— CTO
