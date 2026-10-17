# D857 — Palavra do Pedro: complete a Rev. 01 do PS.02 com o papel do fornecedor (a parte C) antes de ele gravar

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 17/10/2026, 10h5x
**Decisão:** D857 · **Fase:** 4 — fora do portão: pedido direto do Pedro (o PS.02 no sistema, D730)
**Responde:** — (é pedido do Pedro, feito na janela do CTO)
**Espero de volta:** a carta com o rascunho completo, as fotos e a prova (§4), para eu aprovar antes de publicar.

---

## §1 — A palavra

Perguntei ao Pedro se a OC podia completar a Rev. 01 do PS.02 com o papel do fornecedor antes de ele gravar. Ele
respondeu na janela do CTO, às 10h5x: *"Pode"*.

## §2 — Por quê

O rascunho da Rev. 01 (`src/features/procedimento/rev01/`) é de 13/10 (D800). Ele descreve o recebimento pelo app do
encarregado (as quatro perguntas e a nota) e o "Entregue" do Histórico. Não diz nada sobre o papel do fornecedor que a
ECR pede.

A parte C mudou exatamente isso, e está no ar desde 16/10, 21h47 (D853). É o ponto que o auditor do PBQP-H mais olha:
a avaliação no recebimento, o 8.4.1.2. Gravada hoje, a Rev. 01 nasceria atrasada e pediria uma Rev. 02 logo depois. O
Pedro vai ler e gravar uma vez só, com o texto completo.

## §3 — O que entra no rascunho

O texto descreve o que o sistema faz hoje na produção, e nada mais. Confira cada frase no código do `main`.

1. **O recebimento e a avaliação do fornecedor (a seção 3).** Entra um parágrafo sobre o registro do fornecedor:
   - a ECR diz, na seção "Registro do fornecedor", o papel que o fornecedor tem de mandar;
   - o papel chega digital ao escritório. Quem emite OC anexa:
     - em Recebimentos, na lista "Entregas sem papel do fornecedor";
     - ou pela OC, no Histórico;
     - ou pela qualificação da empresa;
   - quando o papel não cabe numa entrega, quem emite OC marca "Não se aplica a esta entrega", com o motivo. A marca não
     se desfaz e guarda quem marcou e quando;
   - o encarregado pode anexar pelo app, se o papel veio com o caminhão. Se não veio, não faz nada: o escritório cuida;
   - o alcance do papel: nas ECRs 01, 02 e 17, um papel para cada entrega; o papel que vale até uma data cobre as
     entregas até ela;
   - o PDF das avaliações tem a coluna "Registro do fornecedor".
2. **As responsabilidades (a seção 0).** Na frase de quem emite as OCs, junte que ele resolve, em Recebimentos, as
   entregas sem papel do fornecedor.
3. **O fluxo.** No passo "5 · Recebimento", junte o papel do fornecedor, no escritório.
4. **Os registros (a seção 5).** Se couber, junte o registro do fornecedor guardado por ECR.
5. **As mudanças marcadas.** Cada trecho novo entra no `mudancas.json`, marcado como os outros, e o resumo da revisão
   (a seção 6) diz que o papel do fornecedor entrou.

Mantenha as palavras que o rascunho já usa: "app do encarregado" e "Encarregado de obra".

## §4 — A ordem

1. **Construa num ramo novo.** Rode os testes. Se algum teste conferir o texto do rascunho, acerte-o.
2. **Mande as fotos** da página do procedimento a 375 e a 1280, com os trechos novos marcados. Mande também o PDF
   gerado, se mudar.
3. **Escreva a carta** com o ramo, os testes, as fotos e a lista de cada frase nova com o lugar no código que a sustenta.
4. **Publique depois da minha aprovação** (emenda 3). Quem grava a Rev. 01 é o Pedro, na tela, como sempre.

**O banco não muda.** A revisão só entra no banco quando o Pedro aperta "Gravar a Rev. 01".

— CTO
