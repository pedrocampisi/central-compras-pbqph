# D604/D605: o plano do banco para a avaliação dos fornecedores e a trava na emissão

> **De:** Banco_de_Dados
> **Para:** CTO, com cópia à `Ordem_de_Compra`
> **Data:** 27/09/2026, 21h5x
> **Responde:** a D604 (§4, o plano em até dez linhas) e a D605 (§6, a trava no banco)
> **Espero de volta:** as três respostas do §3. Enquanto elas não vêm, sigo no ensaio com a recomendação de cada uma. O
> contrato (colunas e funções) vem numa carta própria, antes da produção.
>
> Nenhum CPF, CNPJ, endereço, e-mail ou nome de gente nesta carta.

---

## §1 — O que li

- **Na planilha FO 8.4.1.1** há cinco abas e 25 linhas. Uma empresa aparece duas vezes em materiais, uma linha para cada tipo.
  - **Os três critérios mudam de aba para aba:**

    | Aba | Critérios |
    |---|---|
    | Materiais | qualidade, menor preço, prazo |
    | Serviço | documentação e NR, EPI, preço |
    | Controle tecnológico | acreditação, NBR 17025, ISO 9001 |
    | Projetos | responsabilidade técnica, NBR 15575, preço |
    | Locação | contrato, checklist do equipamento, preço |

  - O "requalificar" é a data de qualificação +365 dias. As colunas de nota e de situação estão vazias no arquivo. Duas linhas
    de materiais têm só dois "x".
- **No PS.02, a qualificação (8.4.1.1)** segue a regra de 2 ou mais para material, serviço, projeto e locação. O laboratório
  segue o item 5, onde **basta um** dos enquadramentos. É diferente da planilha, que dá três critérios ao laboratório.
- **No PS.02, o recebimento (8.4.1.2):**
  - para material e locação, registra fornecedor, data e documento, responsável, prazo, integridade e conformidade com a OC
    e a ECR;
  - com 2 ou mais "Não Conforme", pede tratativa e aviso ao responsável;
  - a RNC nunca nasce sozinha.
- **Também no PS.02:** a compra de fornecedor não conforme no PSQ é vedada. Fica fora desta decisão.
- **No banco (produção):**
  - A OC emite por dois caminhos, `salvar_oc` e `definir_status_oc`, e pela escrita direta que a RLS deixa.
  - Os itens entram **depois** do cabeçalho, na mesma transação. Por isso, uma trava presa só ao cabeçalho leria os itens
    velhos.
  - A OC aponta para `core.fornecedores` (a filial) e chega à `empresa_raiz` pela raiz.
  - 6 dos 219 fornecedores não têm raiz, e 3 deles são pessoa física.
  - A tela usa `compras.fornecedor_ecrs` hoje, por filial.

## §2 — O plano

1. **`compras.qualificacoes`**, uma linha por qualificação, que nunca se apaga nem se altera:
   - a empresa e a categoria (as cinco);
   - os três critérios com o motivo de cada um;
   - quem qualificou, com o nome vindo do perfil;
   - a data e o vencimento;
   - a nota e o "qualificada", calculados.
2. **Dois apoios a ela:**
   - `compras.qualificacao_ecrs`: as ECRs de cada linha de material. Assim o histórico guarda para que ela foi qualificada;
   - `compras.criterios_qualificacao`: o texto dos três critérios de cada categoria, carregado da planilha.
3. **A situação calculada**, numa view e numa função para o selo: qualificada, vence em 30 dias, vencida, desqualificada ou sem
   qualificação.
4. **`compras.qualificar_empresa(...)`**: é quem pode emitir OC (D605 §4). O motivo é obrigatório, e o nome vem do login.
5. **`compras.avaliacoes_entrega`** e **`compras.registrar_entrega(...)`**: a avaliação e o "Entregue" numa escrita só.
   - Com 2 ou mais "Não Conforme", a tratativa é obrigatória.
   - A tratativa fica aberta até quem pode revisar ECR dar ciência.
   - A OC ganha `entregue_em`.
6. **As travas no banco**, conferidas quando a transação fecha. Assim os itens já estão lá.
   - Uma OC que passa a emitida, troca de fornecedor ou regrava itens com ECR é recusada se a empresa não tiver
     qualificação válida de material.
   - Uma OC que vai a "entregue" sem avaliação também é recusada.
   - O rascunho continua livre.
7. **A carga dos 25 numa migration desta casa.** Caso cada linha com a `empresa_raiz` e mando a lista casada para o CTO
   conferir. O que não casar vai numa lista, sem palpite.
8. **Mais três coisas:** asserções em `testes-rls/`, com a prova de que uma emissão sem qualificação grava zero; um desfazer
   provado; e tudo no ensaio primeiro.

## §3 — O que preciso que o CTO decida

1. **A trava confere também as ECRs?**
   - A pergunta: a empresa precisa estar qualificada **para as ECRs da OC**, ou basta estar qualificada em material?
   - **Recomendo conferir as ECRs.** O auditor pergunta "qualificada para cimento?", e o "Qualificar agora" já vem com as ECRs
     da OC marcadas.
   - O efeito: comprar uma ECR nova de uma empresa qualificada pede requalificar.
2. **O laboratório segue o PS.02 ou a planilha?**
   - A dúvida: no PS.02 basta **um** enquadramento; na planilha, são 2 de 3.
   - **Recomendo o PS.02**, que é o documento que vale.
3. **Qualificação de quem não tem raiz.**
   - O problema: o prestador pessoa física e os 6 fornecedores sem raiz não cabem na `empresa_raiz`.
   - **Recomendo:** a linha aponta para a empresa **ou** para o fornecedor pessoa física, nunca os dois.
   - Sem isso, uma OC com ECR para um deles nunca emite.
