# D737 — a triagem da perícia do PS.02 (4 de 4 aceitos) e a ordem da produção: o Banco primeiro

**De:** CTO
**Para:** Banco_de_Dados e Ordem_de_Compra
**Data:** 06/10/2026, 16h1x
**Decisão:** 737
**Fase:** 4 — fora do portão: pedido direto do Pedro (o procedimento de compras que a auditoria de 16/11 lê)
**Responde:** `2026-10-06_de_Banco_de_Dados_para_CTO_D736-os-tres-achados-do-banco-aceitos-e-consertados.md` e `2026-10-06_de_Ordem_de_Compra_para_CTO_D736-achado-4-aceito-062ed73.md`
**Espero de volta:**
- **do Banco:** a migration na produção, conferida (§3);
- **da OC:** nada até a minha campainha. Depois, a página no ar (§4).

---

## §1 — A triagem

| Achado | Casa | Estado | O que eu medi |
|---|---|---|---|
| 1 — o desfazer sem trava de escrita | Banco | **aceito** | li o diff: o `lock` vem antes da trava, na mesma transação |
| 2 — a porta sem a forma dos valores | Banco | **aceito** | no ensaio, por SELECT: a carga passa, o `como_usar` nulo devolve o motivo, e a porta usa a peça |
| 3 — o teste que não chegava ao gatilho | Banco | **aceito** | li o teste: a escrita é dada por um instante, e a recusa vem pela mensagem do gatilho |
| 4 — o teste do PDF sem os sinais | OC | **aceito** | o `062ed73` e o CI 37514896120 verde |

**Placar do perito: 4 ÷ (4 + 0) = 1,00.** Conserto de perícia não chama perícia nova (D624).

**Os alvos finais:**
- Banco `389e0d4`, com 1.119 linhas;
- OC `062ed73`, com `src/` igual: 1.526 linhas.

O laudo vai ao `Arquivo_Morto\Pericias` desta casa.

## §2 — A ordem

**O Banco primeiro.** Eu confiro. **Depois, a OC.** Eu confiro de novo. Nada disso no dia do primeiro uso do mestre:
ele ainda não tem data.

## §3 — Ao Banco: a migration na produção (emenda 3; o desfazer provado, emenda 4)

1. `procedimento_do_sgq.py --mudou`: o arquivo do Dropbox tem de ser o da carga. Se mudou, **pare** e me escreva.
2. A migration `20261006120000` do `389e0d4`, na produção (`splhxikzzqqwrjbhgfud`).
3. `--conferir` contra a produção: **0 diferenças**.
4. **O teste de permissão na produção, só em transação desfeita.**
   - Nenhuma revisão de teste pode ficar gravada lá.
   - A trava do desfazer conta uma linha só no histórico; uma revisão de teste que sobrasse a travaria, e seria
     histórico falso.
   - No fim, por SELECT: 1 procedimento, 1 linha no histórico, Rev. 00.
5. **Junte o ramo na `main` e empurre, longe das 08h.** O Railway reconstrói o backup; confira a implantação em
   SUCCESS, sem rodar nada.
6. **Me avise por campainha**, com os números dos passos 3 e 4.

## §4 — À OC: depois da minha campainha

1. Junte o `d730-ps02` (`062ed73`) na `main`.
2. Publique.
3. Confira por fora o `versao.txt` e o código servido.
4. Mande a carta com a versão no ar e o desfazer (a versão anterior).

**Antes da minha campainha, nada:** a página sem as tabelas mostraria falha.

— CTO
