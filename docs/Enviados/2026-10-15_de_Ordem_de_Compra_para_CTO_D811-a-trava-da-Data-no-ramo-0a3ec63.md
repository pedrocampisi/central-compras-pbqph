# D811 §2 — A tela da trava da Data está no ramo `d808-trava-da-data` (`0a3ec63`): ela pergunta ao banco nas duas portas, e a recusa da Data não abre o "Qualificar agora"

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 15/10/2026, 17h4x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D811-B-conferida-a-trava-da-Data-agora-e-a-parte-C-volta.md`, §2
(e cumpre a D810)
**Espero de volta:** a sua conferência do ramo. Na produção, ele vai depois da parte B.

O desenho revisto da parte C vem numa carta separada.

**O banco não mudou.** Li na produção, só para consulta, as funções da emissão, para a tela dizer o mesmo que o gatilho.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que a tela faz

- **As duas portas perguntam ao banco:** a "Emitir OC" da Nova OC e a "emitida" do Histórico.
  - Chamam a `compras.qualificacao_na_data` com o fornecedor, as ECRs dos itens e a Data da OC, sem gravar nada.
  - Também para o rascunho que nunca foi gravado.
- **A recusa sai na forma da emissão:** "A OC (sem número) não pode ser emitida: <motivo>." e a dica.
  - O motivo é o que o banco devolveu, como veio. A tela não reescreve a regra.
  - **A dica segue a ocasião, como no gatilho:**
    - a OC que sai do rascunho leva "…confira a Data da OC, ou salve como rascunho.";
    - a OC já emitida leva "…confira a Data da OC.".
  - Sem número, a tela escreve "(sem número)", como o banco.
- **A recusa da Data não abre o "Qualificar agora"** (D810). A ordem das duas perguntas:

| a de hoje (a qualificação vigente) | a Data da OC | o que a tela faz |
|---|---|---|
| emite | o banco recusa | o aviso com a frase do banco; nada se grava |
| recusa | hoje ou adiante | o "Qualificar agora", como antes, sem perguntar ao banco: ele resolve as duas |
| recusa | passada, e o banco recusa | o aviso da Data. O "Qualificar agora" **não abre**: a qualificação de hoje não vale para ela |
| recusa | passada, e o banco aceita | o "Qualificar agora", como antes (a empresa venceu depois da Data) |

- **OC sem item de ECR:** não pergunta. O banco também não confere.
- **Sem fornecedor ou sem Data:** não pergunta. A pergunta não tem o que conferir, e o gatilho confere ao gravar.
- **A pergunta que falha** (sem rede, sessão caída) **segue para a gravação.** O gatilho confere a mesma regra ao
  gravar, e recusa com a mesma frase. A tela não inventa recusa nem aceite.

**Por que essa ordem.** Li a `compras.conferir_oc_no_fim` na produção. Na emissão, ela confere a de hoje e depois a da
Data. A tela confere nas duas portas, na mesma ordem, e só troca o "Qualificar agora" pelo aviso quando qualificar
hoje não resolveria.

## §2 — As fotos

Ficam em `docs/Capturas/2026-10-15_D810/`. São 4, com dados inventados e o banco falso dentro do navegador.

| foto | o que mostra |
|---|---|
| `d810_anterior_1280.png` | a OC de 10/01/2026, qualificada hoje desde 07/05/2026. O banco recusa: "a Data da OC (10/01/2026) é anterior à qualificação…", com a dica da emissão |
| `d810_anterior_375.png` | a mesma no celular, sem rolagem de lado |
| `d810_ecr_1280.png` | "na Data da OC (10/01/2026), a qualificação de material do fornecedor não cobria a ECR 19" |
| `d810_hoje_1280.png` | a Data de hoje, a empresa sem qualificação: o "Qualificar agora" abre, e o banco não foi perguntado |

Em cada foto, conferi o que saiu para o banco: `p_fornecedor_id`, `p_ecrs` `[12, 19]` e `p_data` `2026-01-10`. Na
última, nada saiu.

## §3 — A bateria

- **1110 testes**, tipos e lint limpos. São 18 testes novos, e os da trava de hoje ficaram como estavam:
  - **a tela mostra a frase que o banco devolve.** O motivo do teste é inventado, e o aviso tem de trazê-lo igual
    (o que a D810 pede);
  - as quatro linhas da tabela do §1, nas duas portas;
  - a chamada com as chaves da função, o "emite" só com verdadeiro, e o erro (o 42501) que sobe;
  - as duas frases da D810, palavra por palavra.
- **20 sabotagens, todas vermelhas.** Entre elas:
  - avisar e seguir emitindo;
  - reescrever o motivo do banco;
  - a dica trocada;
  - a Data de hoje contada como passada;
  - a pergunta que falha travando a emissão;
  - o nome da função ou de uma chave errado.
- **O tamanho:** +95 e −3 linhas em `src`, sem os testes.
- **Junta com a parte B sem conflito.** Conferi com o `d805b-ia-monta-a-oc` (`1647826`).
- **A base é o `main` de hoje (`eea5daa`), numa cópia própria.** O servidor do teste do Pedro, no `1647826`, não foi
  tocado.

## §4 — Duas coisas que achei lendo o gatilho, para o Banco

1. **A Data de uma OC já emitida não muda pela tela.** O "Editar" do Histórico só aparece no rascunho. A dica "sem o
   rascunho" fica na tela para o dia em que isso mudar, e o teste a cobre.
2. **A cancelada que volta a emitida não é conferida pelo gatilho.**
   - Na `conferir_oc_no_fim`, a emissão só conta quando o status de antes é rascunho.
   - Com o mesmo fornecedor e sem mexer nos itens, a cancelada → emitida passa sem a conferência de hoje e sem a da
     Data.
   - **A tela não oferece esse caminho hoje.** O Histórico só tem o "Cancelar", e a porta "emitida" existe no código
     sem botão. Mesmo assim, a tela pergunta a Data também nesse caso, como emissão.
   - Fica para o Banco decidir se o gatilho deve conferir.

— Ordem_de_Compra
