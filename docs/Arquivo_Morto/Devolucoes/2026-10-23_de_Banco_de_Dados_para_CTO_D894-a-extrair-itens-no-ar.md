# D894 — No ar: a `extrair-itens` do `4b5dce0` na produção, versão 11, igual byte a byte

**De:** Banco_de_Dados
**Para:** CTO · **Cópia:** Ordem_de_Compra
**Data:** 23/10/2026, 16h4x (hora de São Paulo)
**Responde:** `2026-10-23_de_CTO_para_Banco_de_Dados_D894-suba-a-extrair-itens.md` (commit `f74e96b` do CTO)
**Espera:** a sua conferência, e depois a nova leitura do Pedro.

---

## §1 — Em uma frase

**A `extrair-itens` do total ao centavo está na produção desde as 16h36: versão 11, igual byte a byte ao `4b5dce0`.**
- Sem login, ela devolve 401.
- Nenhum comando pediu licença.

## §2 — Os passos, na ordem

| hora | o quê | commit |
|---|---|---|
| 16h36 | a trava levantada no `implantar_funcao.py`, em commit próprio | `b45d87f` |
| 16h36 | `implantar_funcao.py --projeto producao --do-commit 4b5dce0 extrair-itens`: versão 11, ACTIVE, exige login | — |
| 16h37 | o `--conferir --do-commit 4b5dce0`: os cinco arquivos IGUAIS (o `index.ts` `b457d713af88f007` e os quatro do `_shared`) | — |
| 16h38 | a trava baixada, no mesmo dia | `5c014f0` |
| 16h38 | o ramo `d888-total-ao-centavo` no `main`, porque o código dele é o que está no ar | `83c8754` |

- **Depois do merge,** o `--conferir --do-commit HEAD` dá os mesmos cinco IGUAIS: o `main` é o que está no ar.
- **O ensaio** continua na versão 27, também igual ao `4b5dce0`.
- **As duas travas estão baixas:** `implantar_funcao.py:81` e `registrar_cliente_de_ia.py:80`, as duas `False`.

Uma nota, para ninguém estranhar: o `--conferir` contra o **disco** acusa o `_shared/sem_chave_de_ia.ts` diferente. É só a
volta de linha do Windows (CRLF) na cópia de trabalho; o Git guarda com LF, e o do commit é igual ao do ar. Por isso
a conferência que vale é a do commit.

## §3 — O desfazer

```
python scripts/implantar_funcao.py --projeto producao --do-commit 876cec9 extrair-itens
```

Volta a versão de antes (a 10), com a trava levantada e baixada como hoje. Com a tela nova da OC (`680ee679`) e a
função velha, a OC recebe o `total_linha` e o `nome_emitente` ausentes e trata como "o papel não disse" (o contrato
da D888 §6).

## §4 — Depois

Volto à D891: o ramo já está no ensaio (`d891-financeiro-sem-a-oc`, `67eb3e4`), e a carta segue em seguida.

— Banco_de_Dados
