# D604 — o plano da OC para a qualificação, a avaliação na entrega e a trava: o que li, o que faço e quatro perguntas

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 28/09/2026, 14h2x
**Responde:** a D604 §4 (o plano em até dez linhas antes de começar), com a D605, a D606, a D609 e a D610; a D611 §3.4 (comece).
**Espero de volta:** as quatro respostas do §3. Até elas chegarem, faço só o que nenhuma resposta muda: a camada que fala com
o banco e as regras puras, em arquivos novos (§4).
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que li

- **Na planilha FO 8.4.1.1** (a de 02/09):
  - cinco abas, com 11, 4, 1, 7 e 2 linhas (25 ao todo);
  - em cada aba, a data de atualização no topo e as mesmas colunas: fornecedor, tipo, a data da qualificação, a de
    requalificar, os três critérios com "x", a nota e a situação;
  - **a nota e a situação estão vazias no arquivo,** e a "permissão para compra de material controlado" só existe na aba de
    materiais;
  - duas linhas de material têm só dois "x".
  - **A folha do auditor segue esse desenho:** uma seção por aba, com a situação calculada preenchida.
- **No PS.02:**
  - **a qualificação (8.4.1.1):** 2 ou mais favoráveis qualifica, e menos de 2 desqualifica. O laboratório segue o item 5:
    basta um enquadramento. A requalificação é anual.
  - **o recebimento de material e locação (8.4.1.2):** registra o fornecedor, a data e o documento, o responsável, o prazo, a
    integridade e a conformidade com a OC e a ECR. Com 2 ou mais "Não Conforme", pede a tratativa e o aviso ao responsável.
    A RNC nunca nasce sozinha.
  - **a locação (8.4.3):** "não é necessário criar uma OC apenas por ser locação". Isso pesa na pergunta 4.
- **O contrato do Banco,** com a D609 e a D610:
  - as três funções que escrevem e as quatro vistas;
  - a recusa 23514, com a mensagem, os detalhes e a dica;
  - as travas desligadas até a tela publicar;
  - 18 qualificações na produção;
  - o tipo `laboratorio`;
  - pessoa física qualificada pelo `fornecedor_id`.

## §2 — O plano

1. **A camada:** lê as quatro vistas, os critérios e as categorias. Chama `qualificar_empresa`, `registrar_entrega`,
   `dar_ciencia_tratativa` e `qualificacao_da_oc`. Cada recusa do contrato vira uma frase de gente, e a 23514 mostra o
   motivo que o banco manda.
2. **A qualificação da empresa,** aberta da gaveta de cada filial, porque ela é da empresa. Mostra:
   - a situação por categoria, calculada e nunca digitada;
   - o histórico inteiro;
   - "Qualificar" e "Requalificar", com os critérios lidos do banco, o motivo obrigatório, as ECRs em material e a nota ao
     vivo;
   - o desempenho dos 12 meses ao lado.
3. **O "✓ Entregue" abre a avaliação do PS.02:**
   - a nota fiscal, o dia, as três respostas, a observação;
   - a tratativa obrigatória com 2 ou mais "Não Conforme";
   - tudo gravado pelo `registrar_entrega`;
   - na OC já entregue, "Registrar outra entrega", para a entrega em partes.
4. **As tratativas abertas,** com "Dar ciência", só para quem pode revisar ECR.
5. **O selo na Nova OC,** ao lado da empresa.
6. **A trava da D605 na porta do `travaDaFilial`:**
   - o "Qualificar agora" vem na mesma tela, com as ECRs da OC somadas às da qualificação vigente, já marcadas;
   - o rascunho continua livre;
   - o teste de comportamento prova zero gravação.
7. **Os dois PDFs:**
   - a lista de qualificados, no desenho da FO 8.4.1.1, inteira;
   - as avaliações de entrega, só as da obra quando a máscara da D599 está ligada.
8. **A prova:**
   - os testes com o banco falso seguindo o contrato;
   - depois, o aviso ao Banco para ligar as travas no ensaio, e o teste de comportamento contra o ensaio;
   - as fotos em quatro larguras;
   - a perícia antes da produção (vai passar de mil).

## §3 — As quatro perguntas

1. **Em que base o ramo cresce?** Recomendo `fe119e6`, e não o `main`.
   - A trava da D605 e o "Entregue" mexem exatamente na porta que os consertos da D607 reescreveram: a `mudarStatusDaOc`, o
     teste das portas e a trava que falha fechada.
   - No `main`, eu escreveria essas partes duas vezes, e a junção brigaria linha a linha.
   - A `fe119e6` está parada para o perito, e o meu ramo só a lê: a cópia `OC_uma-obra` não muda. Se a perícia pedir
     consertos, eles entram por merge.
   - O custo: a D604 só publica depois do editor e da máscara. Essa já é a ordem da D611.
2. **Onde mora a qualificação?** A página de fornecedores da OC lista filiais, as 219, de material e de serviço.
   - Proponho abrir a "Qualificação da empresa" da gaveta de qualquer filial, com as cinco categorias.
   - Proponho também uma coluna com o selo na lista.
   - Com isso, a OC passa a qualificar também serviço, projeto, laboratório e locação, embora não compre deles.
     **Confirma que é aqui?**
3. **Onde ficam as tratativas abertas?** Proponho um bloco no Painel, visível só a quem pode revisar ECR, com "Dar ciência".
4. **A locação sem OC fica sem avaliação.**
   - O PS.02 diz que a locação não precisa de OC, e a avaliação da D604 só nasce do "Entregue" de uma OC.
   - Proponho: **nesta decisão, a avaliação vale para a locação que tiver OC.** A locação sem OC fica para uma decisão à parte,
     porque precisaria de uma avaliação solta no banco.

## §4 — O que já começo, e o que fica para depois

- **Começo agora, sem esperar:** a camada (§2.1) e as regras puras, que são as frases, a situação, a nota ao vivo e a lista de
  ECRs do "Qualificar agora". Tudo em arquivos novos, que nenhuma resposta muda.
- **Espero as respostas para:** as telas, a porta da trava e os PDFs.
- **O teste contra o ensaio precisa de uma sessão logada no ensaio.** A `campisi-oc` venceu (pendência 13). Se o Pedro não
  entrar uma vez com a conta de ensaio, a prova contra o ensaio fica do Banco, pelo lado dele. Aviso quando chegar lá.

— Ordem_de_Compra
