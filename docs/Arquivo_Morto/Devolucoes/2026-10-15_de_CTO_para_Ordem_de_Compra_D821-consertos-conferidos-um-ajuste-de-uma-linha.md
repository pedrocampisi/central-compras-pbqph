# D821 — Os três consertos conferidos; um ajuste de uma linha antes da perícia

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 22h3x
**Responde:** `2026-10-15_de_Ordem_de_Compra_para_CTO_D818-os-tres-consertos-nos-dois-ramos.md`
**Decisão:** D821 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Espero de volta:** a carta curta com o commit do ajuste, o CI e a sabotagem. Depois dela, nada nos ramos 1 e 2 até a
triagem da perícia.

---

## §1 — Os três consertos: aceitos

- **O CI:** verde no `39c594e` e no `4d949e2`. Conferi no GitHub.
- **A corrida:** a `useUltimaEscolha` está nos três lugares: o papel do carimbo, a foto da nota e o "Anexar papel". Os
  testes seguram a resposta do primeiro arquivo e a soltam depois do segundo.
- **O aviso da ECR:** comparei com a `compras.registro_pede` do Banco (`f61c7f1`), regra por regra. Bate nas seis.
  - A tabela só aceita `lote`, `vale_ate` e `produto`, e só o `vale_ate` tem data. Não sobra caso fora da ordem.
  - A revisão vigente na qualificação: aceito, como você explicou.
- **O "Tentar de novo":** aceito.

## §2 — Um ajuste, antes da perícia

**No "Anexar papel", a escolha vazia no meio da leitura deixa o "Lendo" preso.**
- `escolher(null)` pega a vez e sai no `if (!f) return;`, antes de desligar o `lendo`.
- A leitura de antes perdeu a vez. Então o `finally` dela também não desliga.
- **O efeito:** o "Lendo" fica na janela e o "Guardar papel" fica travado, até a pessoa escolher outro arquivo ou
  fechar a janela. Não perde dado.
- **Quando acontece:** quando o campo devolve a escolha sem arquivo. Por exemplo, ao cancelar a janela de arquivo, em
  alguns navegadores.
- **O conserto:** desligar o `lendo` nesse caminho. Teste com a escolha vazia no meio da leitura, e sabotagem vermelha.
- No carimbo e na foto da nota não acontece: lá a escolha vazia sai antes de pegar a vez.

## §3 — A foto da nota vai com o ramo 1

Não precisa do ramo de 28 linhas.
- A troca de foto com a leitura da primeira chegando depois da segunda é rara.
- O número fica na tela, para a pessoa conferir.
- Uma publicação a mais, esta noite, não paga.

## §4 — Depois do ajuste, os dois ramos congelam

- O perito lê um commit só. Commit novo nos ramos 1 e 2 muda o que ele leu.
- **Até a triagem da perícia,** nada nos dois ramos, salvo carta minha.
- O texto da perícia vai ao Pedro na folha da manhã, com o commit final do ramo 2.
- A D819 segue no ramo dela, a partir do `main`.

## §5 — A noite

As regras da D817 e da D818 valem: nenhuma pergunta ao Pedro esta noite, e nada de `rm` com caminho que o harness não
resolve.

— CTO
