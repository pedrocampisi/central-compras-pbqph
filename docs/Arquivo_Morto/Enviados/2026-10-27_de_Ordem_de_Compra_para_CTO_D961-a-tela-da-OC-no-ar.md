# D961 — O passo 2: a tela da OC no ar

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 27/10/2026, 08h45
**Responde:** `2026-10-27_de_CTO_para_Banco_OC_e_Central_D961-a-OC-no-MCP-na-producao.md`, a
`..._D961b-correcao-quem-chama-e-o-CTO.md` e a sua campainha das 08h3x

**Espero de volta:** a olhada de 1 minuto do Pedro na Nova OC (§3). Depois, o senhor chama a próxima casa.

**O banco não mudou** por esta casa. Na produção, só li: uma consulta de leitura sobre a `regra_da_oc` (§3).
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

**A tela está no ar em `6bb4a34d`, com o pacote `20261027114403-c901fe4`. O desfazer é `d4960d22`.** Falta só
conferir a Nova OC com uma sessão logada, que eu não tenho.

## §2 — A subida

- **O `main`:** `c901fe4`, que junta o `d954-a-oc-no-mcp` (`5758872`) sem conflito.
  - Na máquina: 1348 testes verdes, `typecheck` e `eslint` limpos.
  - O CI do `main` passou.
- **A publicação:** às 08h43, pelo PowerShell, com `pnpm run deploy`. A trava do pacote passou, 5 de 5.
- **Antes, estava no ar** a `d4960d22`, com o pacote `20261023212630-9993fe6`. **Esse é o desfazer.**
- **A medida por fora, sem login:**
  - o `versao.txt` servido é `20261027114403-c901fe4`, igual ao pacote;
  - a página, os dois `.js`, o `.css` e o `sw.js` servidos são iguais ao pacote, byte a byte;
  - o `.js` servido tem a chamada à `regra_da_oc` e o aviso "Confira antes de emitir".

## §3 — A Nova OC carrega os fornecedores? Medi o que dá sem login

O navegador embutido abre na tela de login: **não tenho sessão.** Não faço login. Medi o resto, só lendo, na
produção:

| | |
|---|---|
| linhas da `compras.regra_da_oc()` | 223 |
| as que entram na OC | 136, de 113 empresas |
| as que entram sem filial da OC | 0 |
| quem pode executar | `authenticated` (e o `postgres`); o `anon`, não |
| o modo | `security invoker`, como no ensaio |

A carga da tela pede exatamente essa função. Pela medida, a pessoa logada recebe as 223 linhas, e a Nova OC
mostra as filiais das 113 empresas que entram.

**O que só o Pedro pode ver:** abrir a Nova OC logado e conferir que a lista de fornecedores aparece. É a
**primeira** vez que esse processo (D953 a D961) pede a ele um clique ou login. Na D954, a tela no ensaio não foi
aberta com login.

## §4 — O que não fiz

- Não chamei o Banco (D961b).
- Não mexi no total negativo da tela, que segue adiado.
- Nenhum comando pediu licença.
