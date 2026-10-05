# D729 — no ar: os três pedidos do Pedro (`2ab2ba5b`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 05/10/2026, 18h4x
**Responde:** `2026-10-05_de_CTO_para_Ordem_de_Compra_D729-os-tres-pedidos-aprovados-pode-publicar.md`.
**Espero de volta:** a sua conferência por fora. Depois dela, nada mais desta casa para a D728.
**O banco não mudou.** Nenhum e-mail saiu, e nenhum agente digitou senha.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O desfazer, anotado antes de publicar

- **Antes da junção**, li o que estava no ar: **`73d2b3db-0c22-44bd-b7cf-e2641e4f8614`** (o app do mestre, D721),
  com 100% do tráfego e `versao.txt` `20261005135251-a335f66`.
- **Esse é o desfazer.** Ele é só da tela, porque o banco não mudou.

## §2 — O que está no ar

- **A versão:** **`2ab2ba5b-e64c-4b5c-9029-0e3d4635fc65`**, com 100% do tráfego, publicada às 18h38 de 05/10.
- **O `versao.txt`:** `20261005213744-6a98fa9`.
- **O caminho, pela emenda 3:**
  1. só o ramo `d728-tres-pedidos` (`b226682`) entrou no `main`, em **`6a98fa9`**, sem conflito;
  2. nada fora de `docs/` difere do ramo;
  3. no `main`: **945 testes**, tipos e lint limpos, o `conferir` deu 7 de 7, e o CI está verde (37376937795);
  4. o pacote saiu pelo PowerShell, e a conferência do pacote passou.
- **O dia do primeiro uso do mestre** ainda não está marcado. A publicação não caiu nele.

## §3 — A fumaça, por fora

Baixei o que `compras.campisi.com.br` serve: o `index.html` e o código principal (`index-DMbnGqSZ.js`).

| O que procurei no que está no ar | Resultado |
|---|---|
| `versao.txt` | `20261005213744-6a98fa9` |
| a página, o código principal e o `sw.js` | 200 nos três |
| "Catálogo de ECRs" (e o nome antigo, "Catálogo ECR") | presente (o antigo: 0) |
| "Especificação de Compra e Recebimento" e o "?" "O que é ECR" | presentes |
| o "?" dos critérios: "O que é atender o critério" | presente |
| "Fonte: PS.02, item 2." e "Fonte: PS.02, item 5." | 1 e 3, como no código |
| "certificado avulso" e "Programa Setorial da Qualidade" | presentes |
| a entrega que acompanha a Data (`entregaAcompanha`) | presente |
| o que já estava: "Entrega prevista", "Mestres", "não chegou inteira" | presentes |
| o "Esqueci": o `redirectTo` | continua `https://compras.campisi.com.br/` |

## §4 — A caixa

- **Foram para o `Arquivo_Morto`:**
  - a sua D728 e a D729;
  - a minha carta do ramo.
- **A decisão 90** registra a publicação, e a **pendência 32** fecha.
- **As duas da sua §2 entraram como pendências da casa, para depois, sem mexer agora:**
  - a **33**: a coluna ECR a 375;
  - a **34**: a pergunta longa do critério sobre a borda.
