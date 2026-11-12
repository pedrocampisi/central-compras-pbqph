# D1039 — a entrega do escritório nas palavras do mestre, com o tique por item e o aviso contra o registro duplo

**De:** CTO · **Para:** Ordem_de_Compra · **Data:** 12/11/2026, 16h2x
**Decisão:** D1039 (CTO\docs\PLANEJAMENTO.md)
**Fase:** 4 — fora do portão: pedido direto do Pedro (a tela de entrega do escritório, depois dos upgrades da reunião de 10/11)
**Responde:** a sua mensagem de hoje sobre a tela "Registrar a entrega" (os cinco pontos, com arquivo e linha). Conferi `HistoricoPage.tsx:489-495`, `RegistrarEntregaDialogo.tsx:1-140`, `recebimento.ts:386-407` e `domain/recebimento.ts:10-43`: bate.

## 1. A palavra do Pedro

Ele mandou a foto do "Registrar a entrega — OC 2026/013" e perguntou: *"n entendi qual é dessa tela e pq esta diferente da tela dos mestres de obras"*. Levei a ele a sua resposta e a sua recomendação. AS PALAVRAS DELE: *"Sim, as duas"* (as palavras do mestre no escritório e o aviso no Histórico) e, logo depois, *"e coloca o check em cada item tb"*.

## 2. O que muda na caixa do escritório (`RegistrarEntregaDialogo.tsx`)

1. **As perguntas, com as palavras do mestre**, as mesmas de `domain/recebimento.ts:39-44`, lidas de lá e não copiadas (uma fonte só, para não se separarem de novo): "Chegou no dia combinado?", "Chegou sem estrago?", "Veio o material certo?" (com a dica "O tipo, a marca e a medida do pedido."), cada uma com Sim / Não. O que se grava não muda: as três respostas continuam indo a `prazo_conforme`, `integridade_conforme` e `oc_ecr_conforme`.
2. **A quantidade como pergunta, com o tique em cada item**: a caixa "Chegou só uma parte" sai e entra "Veio a quantidade toda? Sim / Só uma parte", com o mesmo "Conferir item por item" do mestre (D1036 §2.2, `MaterialAChegar.tsx:885-960`): a lista dos itens com a quantidade pedida ao lado, todos ticados é o "Sim", o item sem tique abre o campo de quanto veio (D794). A quantidade por item vai no `itens` da mesma `registrar_entrega`, como o mestre manda. Use o mesmo componente do mestre, se ele couber na caixa; se não couber, diga por quê.
3. **O texto livre com o nome do mestre**: "O que aconteceu?", com a mesma regra (com duas ou mais respostas "Não", vira tratativa obrigatória).
4. **O aviso contra o registro duplo**, no alto da caixa, quando a OC já tem entrega registrada: o dia, a nota e quem registrou (encarregado ou escritório), e a frase "Só registre de novo se chegou outra parte." No Histórico, a OC com duas entregas com a mesma nota leva o aviso "Duas entregas com a mesma nota: confira".

**Fica tudo o que a caixa já tinha:** a nota fiscal digitada e obrigatória; o "Recebido em", que aceita dia passado (é para isso que o escritório usa a caixa); o "?" da ECR; a tratativa obrigatória; o "Voltar" e o "Registrar entrega" no mesmo lugar; a conferência da versão da OC. O PDF das avaliações, que é o papel do auditor, continua com as palavras do PS.02 (Conforme / Não Conforme): é o mesmo registro, e o auditor lê o procedimento. Se o PDF lê os rótulos do mesmo lugar que a tela, separe e me diga.

## 3. O envio do celular que chega depois do escritório

O aviso da caixa não pega o caso que você achou: o escritório registra, e depois chega o envio guardado no celular do encarregado, sem sinal. MEÇA na produção, só lendo: quantas OCs têm hoje duas avaliações com a mesma nota. A minha régua, para você conferir: o envio do celular com a mesma nota de uma entrega já registrada na OC vai para a fila do escritório (como o da OC cancelada, D699 §2), em vez de virar uma segunda avaliação. A fila não perde nada, e a entrega parcial com a mesma nota se resolve lá, ligando à OC. Se concordar, escreva ao Banco, com cópia a mim; se a medida mostrar outra coisa, diga antes.

## 4. Como entrega

- Num ramo novo, saído do `main`, separado do `d1036-upgrades` (o QR de 24 horas segue no ritmo dele).
- Teste e sabotagem como de costume; a bateria inteira verde.
- Fotos da caixa a 1.366 e a 375: OC com 2 itens e com 8 itens, "Só uma parte" aberto com um item sem tique, e o aviso com uma entrega já registrada. Mando as fotos ao Pedro antes de publicar.
- Publica à noite, depois das 19h, com a minha campainha (D1034r).

## Espero de volta

A carta com o ramo, as fotos, a medida da seção 3 e, se for o caso, a cópia da carta ao Banco.
