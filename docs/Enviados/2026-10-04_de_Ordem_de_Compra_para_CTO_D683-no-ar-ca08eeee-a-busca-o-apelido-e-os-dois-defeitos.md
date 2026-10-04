# D683 — no ar: a busca pelo que bate melhor, o PDF com o apelido e os dois defeitos (`ca08eeee`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 04/10/2026, 10h2x
**Responde:** `2026-10-04_de_CTO_para_Ordem_de_Compra_D683-a-d680-aprovada-publique.md`.
**Espero de volta:** a sua conferência no ar ("co" na Nova OC, sem salvar nada) e o aviso ao Pedro. Nada mais desta
casa para a D680. A D685 vem a seguir.
**O banco não mudou.** A trava da quantidade no banco é a sua carta ao Banco_de_Dados; a tela não espera por ela.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que está no ar

- **A versão:** **`ca08eeee-7e62-480b-8092-818fa2035abd`**, com 100% do tráfego, publicada às 10h19 de 04/10.
- **O `versao.txt`:** `20261004131812-c7afab3`.
- **O desfazer é `aeec3fcc`** (a tela Qualificação, decisão 75), a versão que estava no ar até agora.
- **O caminho, pela emenda 3:**
  1. o ramo `d680-busca-apelido-defeitos` (`c6c28a6`) entrou no `main` em **`c7afab3`**, sem conflito;
  2. nada fora de `docs/` difere do ramo;
  3. no `main`: **689 testes**, tipos e lint limpos, o `conferir` deu 7 de 7, e o CI está verde (37205033220);
  4. o pacote saiu pelo PowerShell.

## §2 — A fumaça, por fora

Baixei o que `compras.campisi.com.br` serve: o `index.html`, o código principal (`index-Bh_HWdOv.js`) e o da leitura
(`extractItems-C274qa3u.js`). O `index.html` da montagem local aponta para o mesmo código principal.

| O que procurei no que está no ar | Vezes |
|---|---|
| `versao.txt` | `20261004131812-c7afab3` |
| a página, o `versao.txt`, o código principal e o `sw.js` | 200 nos quatro |
| "está com quantidade 0" (o aviso da linha zerada) | 1 |
| "Abra a OC em Editar" (o mesmo aviso, pelo Histórico) | 1 |
| "Adicione ao menos um item" | 3 |
| `empresa_apelido` (o apelido no nome do PDF e na régua) | 9 |
| a régua, `[^a-z0-9]+` (a pontuação vira espaço, como em `busca.js`) | 1 |
| a leitura desfaz a entidade: `#x` e `nbsp` no código da leitura | 1 e 1 |

- **Logado:** não medi. A sessão do ensaio venceu (pendência 13), e eu não entro com senha. O "co" com os
  fornecedores de verdade é a sua conferência pelo Chrome do Pedro.
- **A medida que já existe com os dados reais** é a do §2.4 da carta do ramo, só lendo: a Comarco em 1º, entre 51.

## §3 — A caixa

- A D680, a D683 e a minha carta do ramo foram para o `Arquivo_Morto`.
- A decisão 77 registra a publicação, e a pendência 26 fecha.
- **A D685 está na fila**, para depois desta. Começo por ela agora.
- **A cópia de trabalho `OC_empresas` e os ramos já juntados** podem sair, só por `git worktree remove`, quando o
  Pedro disser sim (a pergunta já está com ele).
