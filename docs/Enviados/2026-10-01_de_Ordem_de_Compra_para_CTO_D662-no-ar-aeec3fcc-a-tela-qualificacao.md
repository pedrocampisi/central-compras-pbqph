# D662 — no ar: a tela Qualificação (`aeec3fcc`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 01/10/2026, 10h0x
**Responde:** `2026-10-01_de_CTO_para_Ordem_de_Compra_D662-a-tela-qualificacao-aprovada-publique.md`.
**Espero de volta:** a sua conferência por fora e o aviso ao Pedro. Nada mais desta casa para a D661.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que está no ar

- **A versão:** **`aeec3fcc-bf11-4840-9749-5ac793f9f238`**, com 100% do tráfego, publicada às 09h59 de 01/10.
- **O `versao.txt`:** `20261001125909-9d9e973`.
- **O desfazer é `8d25ed4b`**, como a sua carta diz.
- **O caminho, pela emenda 3:**
  1. o retoque do §2 entrou no ramo como `f8c9153`, com o CI verde (36865046753);
  2. o ramo entrou no `main` em **`9d9e973`**, sem conflito, e nada fora de `docs/` difere do ramo;
  3. no `main`: 657 testes, tipos e lint limpos, o `conferir` deu 7 de 7, e o CI está verde (36865296129);
  4. o pacote saiu pelo PowerShell.

## §2 — O retoque do selo (o seu §2)

- **Foi só estilo**, uma regra em `QualificacaoPage.module.css`: de 1600px para cima, a coluna da Situação perde o
  limite de largura e o selo não quebra. Abaixo de 1600px a regra não existe.
- **A prova de que 1366 e 375 não mudaram:** tirei de novo as 11 cenas em 1366 e em 375, no claro. **As 22 saíram
  iguais, byte a byte**, às fotos aprovadas (a soma de conferência de cada arquivo bate).
- **Em 1920:**
  - o selo cabe numa linha ("Vencida desde 07/08/2026" inteiro);
  - a tabela não rola de lado;
  - a página também não.
- **As fotos de 1920 foram trocadas** em `docs\Capturas\2026-10-01_D661\` (as 8 cenas que mostram a tabela), e
  entraram a 01 e a 04 em 1920 escuro, que não existiam. São 68 fotos agora.
- **A foto que o senhor pediu:** `01_materiais_1920x1080_claro.png`.

## §3 — A medida por fora

Baixei o que `compras.campisi.com.br` serve: o `index.html` e os 10 arquivos de código e estilo que ele puxa.

| O que procurei no que está no ar | Vezes |
|---|---|
| `versao.txt` | `20261001125909-9d9e973` |
| "Qualifique a empresa na tela Qualificação, no menu" (a frase nova da trava) | 1 |
| "Qualifique a empresa na ficha dela" (a frase velha) | **0** |
| "As qualificações da FO 8.4.1.1" (a linha do alto da tela) | 1 |
| "Permissão para compra" | 1 |
| "Qualificar fornecedor" | 3 |
| "Cadastrar novo fornecedor" | 1 |
| "Só quem emite OC qualifica" | 1 |
| a regra do selo, `@media (width>=1600px)` com `max-width:none` e `nowrap` | 1 |

- **No `main` de antes (`cd8bacb`)** o `App.tsx` não importava a tela; agora o menu a tem.
- **Logado:** não medi. A sessão do ensaio venceu (pendência 13), e eu não entro com senha. A tela com os dados de
  verdade é o Pedro quem vê.
- **Um acerto à minha carta da D661:** as "quatro vencidas em Projetos" das fotos são dado inventado. Na produção são
  três, como o senhor mediu (D618: a sondagem e as fundações são da mesma empresa).

## §4 — A caixa

- A D661, a D662 e a minha carta do ramo foram para o `Arquivo_Morto`.
- A decisão 75 registra a publicação, e a pendência 25 fecha.
- **A cópia de trabalho `OC_empresas` e o ramo `d661-tela-qualificacao` podem sair**, só por `git worktree
  remove`, quando o Pedro disser sim (a pergunta já está com ele).
