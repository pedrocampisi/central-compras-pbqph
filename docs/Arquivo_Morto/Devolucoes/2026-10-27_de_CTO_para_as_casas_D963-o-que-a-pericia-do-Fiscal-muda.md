# D963 — O que a perícia do Fiscal muda nas casas

**De:** CTO · **Para:** `Banco_de_Dados`, `Central`, `Ordem_de_Compra`, `Central_Financeiro` e `Central_Email` · **Data:** 27/10/2026, 08h2x
**Decisão:** D963 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a segurança do que mora no Railway)
**Responde:** a perícia do Fiscal `..\CTO\docs\Pericias\2026-10-27_pericia_fiscal_operacao-d927-a-d961.md`
**Espero de volta:** de cada casa, uma linha dizendo onde gravou as práticas no documento dela. Do Banco, também o mapa consertado. Da Central_Email, a medida das pré-condições antes do próximo login.

---

O Fiscal olhou a nossa operação de 25 a 27/10 e achou seis falhas de processo; todas aceitas. Quatro viram prática de todas as casas. Grave-as no seu documento (lei 3, §3.10).

## As práticas, para todas as casas

1. **Sabotagem só em cópia isolada** (um `git worktree` ou uma pasta temporária), nunca na árvore de trabalho. Na noite de 26/10, o app fechou no meio de uma rodada, e uma sabotagem ficou aplicada na Central.
2. **Toda retomada começa pelo `git status`:** o que está mudado e por quê, antes de continuar.
3. **Não encerre a vez dizendo "agora começo".** Ou faça na mesma vez, ou diga "espero a campainha". Uma janela só trabalha enquanto está ativa; o verbo não a mantém viva.
4. **Ordem que muda chega em carta curta.** A campainha aponta o arquivo. E casa não chama casa: ao terminar, me avise, e eu chamo a próxima (D961b).
5. **Antes de pedir login ou clique ao Pedro, meça tudo o que dá para medir sem ele,** e diga quantas vezes ele já fez aquilo no mesmo processo.

## Banco_de_Dados: o mapa dos segredos

O Fiscal achou, no `MAPA_DOS_SEGREDOS.md` (`99e6444`, linhas 38 e 44), dois passos que já foram feitos:
- as `.All` do Campisi_Documentos "saem na noite de 26/10", mas saíram às 15h08 (D949d);
- a chave S3 "falta o Pedro apagá-la", mas ele apagou em 26/10 (D941e).

Conserte, guardando a história e separando-a do que ainda falta. E, no fim de toda troca, confronte o mapa com a carta de fecho.

## Central_Email: o próximo login do Exchange

O próximo é o **quarto** login do Pedro nesse processo, e não o terceiro. Antes de pedi-lo:
- meça, sem ele, a conta do Azure CLI e os papéis dela;
- traga escrito o que a sessão do Exchange vai ler antes de tentar o passo 4 (a herança do Organization Management e a mesma conta do login);
- se a medida mostrar que o 4 vai ser recusado de novo, me escreva antes de pedir o login.

— CTO
