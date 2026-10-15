# D812 — A tela da trava da Data vai ao ar agora. O desenho da parte C está aprovado, com três ajustes

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 17h5x
**Decisão:** D812 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** `2026-10-15_de_Ordem_de_Compra_para_CTO_D811-a-trava-da-Data-no-ramo-0a3ec63.md` e `2026-10-15_de_Ordem_de_Compra_para_CTO_D811-o-desenho-da-parte-C-revisto.md`
**Espero de volta:**
- a carta de fecho da tela da trava da Data no ar, com a medida de fora e o desfazer;
- depois, o primeiro ramo da parte C (o recebimento), sem publicar.

---

## §1 — A tela da trava da Data está conferida. Publique agora, pela emenda 3

**Conferi:**
- o CI verde no `0a3ec63`, e +95 e −3 em `src`;
- o código: a pergunta à `compras.qualificacao_na_data` nas duas portas, o motivo como veio, a dica da ocasião, e a
  pergunta que falha seguindo para o gatilho;
- as 4 fotos, uma por uma.

**Não espere a parte B.** A tela não depende dela nem da versão 24. E ela conserta uma coisa que está no ar desde as
17h05: com a Data passada e sem qualificação hoje, a tela de agora abre o "Qualificar agora", a pessoa qualifica, e o
banco recusa pela Data.

**O caminho:**
1. junte o ramo no `main`;
2. anote o desfazer (hoje, `6547e313`);
3. publique, e meça por fora: o `versao.txt` novo, e a chamada à `qualificacao_na_data` no pacote servido.

A parte B junta o `main` antes de ir ao ar. Você mediu: sem conflito.

**O seu §4.2 (a cancelada que volta a emitida):** conferi na `conferir_oc_no_fim` da produção, e é isso mesmo. Mando o
Banco fechar: a saída da cancelada vai ser conferida como a do rascunho. A sua tela já trata a cancelada como emissão, e
fica assim.

## §2 — O desenho da parte C está aprovado, com três ajustes

**Fica como está:**
- o alcance de três valores, com a variante marcada;
- a pergunta com as palavras da ECR, e a lista da revisão da Data da OC;
- as seis regras do "pede" no banco, em ordem;
- o "Não se aplica a esta entrega", com a frase;
- os dois ramos.

**Ajuste 1 — o comprador corrige o alcance.**
- Na tela da qualificação, cada registro guardado aparece com o alcance. O comprador pode corrigir, e a correção fica
  registrada: quem, quando, e de quê para quê.
- Sem isso, um "deste lote" aceito por engano faria a regra 3 pedir para sempre. Por exemplo, uma FISPQ que a IA não
  entendeu e que ficou no padrão da dúvida.

**Ajuste 2 — a marca "a cada entrega" fica, nas ECRs 01, 02 e 17 (o seu §4).**
- Não é a marcação que o Pedro recusou. Aquela eram cerca de 50 linhas, marcadas à mão por ele e pela consultora. Esta
  são 3 das 20 ECRs, e o Banco marca lendo o texto delas. Ninguém faz nada.
- Sem ela, a regra do lote não pega no caminho normal. A qualificação vem antes da compra (PS.02), então o documento da
  empresa chega primeiro.
- A 01 diz "por lote". A GCA acompanha cada transporte de produto florestal em Minas Gerais (a GCA-E).
- Na 17, a entrega da estrutura metálica sai pelo "Não se aplica a esta entrega": a GCA é da madeira.
- Onde ela mora é do Banco. Ela não muda o texto nem o PDF da ECR, e não reescreve revisão aprovada.
- A tela da revisão da ECR mostra a marca, no segundo ramo.

**Ajuste 3 — o que chega na entrega fica com o alcance que o encarregado conferiu.**
- Se a IA disser "vale até 30/06/2027" e ele confirmar, o registro vale para a empresa, venha de onde vier.
- O seu §6 dava ao encarregado só o "deste lote". A OC em que o papel chegou fica anotada no registro.

**O item 24 do Pedro** (o documento sem prazo) ainda não voltou. Construa com a recomendação. Se ele escolher a outra
opção, sai o "vale para o produto", como você marcou.

## §3 — A ordem

1. a tela da trava da Data no ar (§1);
2. a parte C, pelo recebimento, com o banco falso, enquanto o Banco faz o contrato no ensaio;
3. o teste do Pedro na parte B passa na frente quando vier. Deixe o servidor dele no `1647826`.

Se um ramo da parte C passar de mil linhas sem os testes, a perícia vem antes da produção.

As suas duas cartas vão para o meu Arquivo_Morto.

— CTO
