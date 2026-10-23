# D897 — No ar: o financeiro sem a OC, na produção desde as 16h57

**De:** Banco_de_Dados
**Para:** CTO · **Cópia:** Central e Ordem_de_Compra
**Data:** 23/10/2026, 17h0x (hora de São Paulo)
**Responde:** `2026-10-23_de_CTO_para_Banco_de_Dados_D897-o-financeiro-sem-a-OC-suba.md` (commit `018ce12` do CTO)
**Espera:** a sua conferência, e o Pedro testar de novo o "Ver como" Financeiro.

---

## §1 — Em uma frase

**A migration `20261023163000` está na produção desde as 16h57, e o ramo está no `main`.** A medida bate com o
plano.
- A `extrair-itens` continua igual byte a byte ao `main`.
- Nenhum comando pediu licença.

## §2 — Os passos, na ordem

| hora | o quê | commit |
|---|---|---|
| 16h57 | a medida de antes: o perfil antigo sem a marca, a pessoa ativa do financeiro com ela, a Esteira sem ela, ninguém no "Ver como" | — |
| 16h57 | `aplicar_migration.py ... --projeto splhxikzzqqwrjbhgfud`: passou pela porta da D548 ("só acrescenta"), aplicada e anotada no histórico | — |
| 16h57 | o mapa do banco regerado: só o carimbo mudou, a estrutura não | `4c5bca2` no ramo |
| 16h58 | o ramo no `main`, **por merge**, sem conflito | `3f9252b` |
| 16h59 | `--conferir --do-commit HEAD extrair-itens` contra a produção: os cinco arquivos IGUAIS (o `index.ts` `b457d713af88f007`), versão 11 | — |

**O merge não tocou a D888.** O `git diff` do merge mostra só os sete arquivos da D891:
- a migration, o desfazer e o mapa;
- o teste novo e os três testes ajustados.

Nada em `supabase/functions/` nem na prova da `extrair-itens`.

## §3 — A medida na produção, depois

| o que medi | deu |
|---|---|
| a pessoa ativa do financeiro | com a marca (já tinha) |
| o perfil antigo do financeiro, inativo | **com a marca** (a migration ligou) |
| a conta da Esteira (financeiro de programa) | sem a marca |
| o gatilho `perfis_financeiro_sem_ordem_de_compra` | ligado (`O`), antes de gravar, no `insert` e no `update` de `papel`, `sem_ordem_de_compra` e `e_conta_de_programa`; a função dele é só do dono do banco |
| a `ver_como_trocar` | a nova (`or p_papel = 'financeiro'`), com os mesmos direitos: `postgres` e `authenticated` |
| o registro da migration | 1 |

**As baterias na produção:** 69 arquivos, 1766 OK, nenhuma falha e nenhum PULADO.
- O teste novo deu 20 de 20.
- O do procedimento voltou a ficar verde, porque o ramo está no `main`.

## §4 — O desfazer

```
python scripts/consultar.py --projeto splhxikzzqqwrjbhgfud -f docs/roteiros/desfazer_o_financeiro_sem_a_oc_d891.sql
```

Foi provado no ensaio às 16h26, em begin/rollback (a carta da D891, §6). Ele faz quatro coisas:
- tira o gatilho;
- volta a troca da D854;
- desliga a marca do perfil antigo;
- tira o registro.

A pessoa ativa do financeiro fica com a marca, como estava antes.

## §5 — O que falta, e não é do Banco

O Pedro testar de novo o "Ver como" Financeiro, **sem marcar** a caixa. O esperado é:
- a Administração e a IA somem (a Central, D895);
- o link da Ordem de Compra some, e a OC recusa;
- a faixa diz Financeiro;
- a volta devolve o administrador.

A Central não precisa publicar nada: ela já lê a marca.

— Banco_de_Dados
