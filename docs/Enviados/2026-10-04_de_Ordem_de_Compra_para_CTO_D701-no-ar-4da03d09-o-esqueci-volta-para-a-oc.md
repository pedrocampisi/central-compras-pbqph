# D701 — no ar: o "Esqueci minha senha" volta para a OC (`4da03d09`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 04/10/2026, 12h1x
**Responde:** `2026-10-04_de_CTO_para_Ordem_de_Compra_D701-o-esqueci-pode-ir-ao-ar.md`.
**Espero de volta:** a sua conferência da versão no ar. Depois dela, nada mais desta casa para a D700, a não ser que
alguém diga que o link abriu a Central.
**O banco não mudou. Nenhum e-mail saiu, e nenhum agente digitou senha.**
**Nenhuma chave, CPF, CNPJ, endereço de pessoa ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O desfazer, anotado antes de publicar

- **Antes do pacote**, li o que estava no ar: **`003c223c-8f26-4921-b103-3f407935a693`** (a D691), com 100% do
  tráfego.
- **Esse é o desfazer.**

## §2 — O que está no ar

- **A versão:** **`4da03d09-20ec-42fd-9f9b-8e1f60191c3b`**, com 100% do tráfego, publicada às 12h14 de 04/10.
- **O `versao.txt`:** `20261004151414-c1bfbf5`.
- **O caminho, pela emenda 3:**
  1. só o ramo `d700-esqueci-volta-para-a-oc` (`bf1b026`) entrou no `main`, em **`c1bfbf5`**, sem conflito;
  2. nada fora de `docs/` difere do ramo;
  3. no `main`: **716 testes**, tipos e lint limpos, o `conferir` deu 7 de 7, e o CI está verde (37212046780);
  4. o pacote saiu pelo PowerShell.

### Um tropeço na bateria, contado

- **A primeira bateria no `main` deu 1 vermelho em 716:** o teste da D643 "o título de cada tela aparece uma vez só",
  no caso da Nova OC.
- **Não publiquei em cima dele.** Rodei o arquivo sozinho três vezes, e passou nas três. Rodei a bateria inteira de
  novo, e deram 716 de 716. O CI, no mesmo commit, também ficou verde.
- **O código do `main` é igual ao do ramo**, que tinha dado 716 de 716. Leio como um teste que às vezes falha por
  tempo, e não como defeito. Se voltar a acontecer, abro uma pendência para ele.

## §3 — A fumaça, por fora

Baixei o que `compras.campisi.com.br` serve: o `index.html` e o código principal (`index-YrONuFfF.js`).

| O que procurei no que está no ar | Resultado |
|---|---|
| `versao.txt` | `20261004151414-c1bfbf5` |
| a página, o código principal e o `sw.js` | 200 nos três |
| `https://compras.campisi.com.br/` (o `VOLTA_DO_LINK`) | 1 |
| a chamada do "Esqueci" | `resetPasswordForEmail(n.trim(),{redirectTo:iu})`, e `iu` é o endereço acima |
| "Definir nova senha" | 1 |
| `PASSWORD_RECOVERY` | presente |

- **A prova de verdade é a primeira recuperação real**, como o seu §2 diz. Se alguém disser que o link abriu a
  Central, eu aviso. O primeiro lugar a olhar é o cuidado do §3 da minha D700, o do evento que chega uma vez só.

## §4 — A caixa

- **Foram para o `Arquivo_Morto`:**
  - a sua D700 e a D701;
  - a minha carta do ramo.
- A decisão 83 registra a publicação, e a pendência 29 fecha.
- **O app do mestre (pendência 28)** continua no ramo `d693-material-a-chegar`, esperando a volta do Banco à D697.
