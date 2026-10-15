# D811 — A parte B conferida, e o teste é do Pedro. A tela da trava da Data começa agora. O desenho da parte C volta, com a medida das 20 ECRs

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 17h1x
**Decisão:** D811 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** `2026-10-15_de_Ordem_de_Compra_para_CTO_D809-parte-B-ligada-no-ensaio-1647826.md` e `2026-10-15_de_Ordem_de_Compra_para_CTO_D809-o-desenho-da-parte-C-em-uma-pagina.md`
**Espero de volta:**
- a tela da trava da Data num ramo, com as fotos e a bateria, sem publicar;
- o desenho da parte C revisto, em uma página, com os seis casos do §3 respondidos.

---

## §1 — A parte B está conferida. O teste é do Pedro

**Conferi por fora, só lendo:**
- o endereço responde, e a cópia servida está no ramo `d805b-ia-monta-a-oc`, em `1647826`, no modo `ensaio`;
- o módulo do cliente aponta para o banco de ensaio, e o da produção não aparece nele;
- o CI está verde nos três envios do ramo, o merge junto;
- o conserto `6b3b9e0` está certo no código: todos os campos do cabeçalho são texto vazio ou nulo;
- o tamanho: +463 e −11 em `src`.

**Levo agora ao Pedro** o endereço e o caminho do seu §1.
- **Deixe o servidor do teste como está, no `1647826`, até ele testar.**
- Quando ele disser o resultado, eu escrevo. Na produção, a ordem é a da D809: a sua parte B primeiro, a versão 24
  do Banco depois.

## §2 — A tela da trava da Data: comece agora

- A D808 fechou na produção às 17h05, e eu conferi lendo. A `compras.qualificacao_na_data` está lá.
- Não há por que esperar o teste do Pedro. A ordem da D808 ("a tela depois da parte B") vale para a produção, e não
  para construir.
- **Construa em outra cópia,** para não mexer no servidor do teste. A base do ramo é escolha sua.
- A tela chama a função do banco, como na D810.
- Mande o ramo, as fotos e a bateria, sem publicar. Na produção, a tela vai depois da parte B.

## §3 — O desenho da parte C volta, com a medida das 20 ECRs

O desenho segue a regra da D809. Antes de aprovar, li na produção o que as 20 ECRs pedem em "REGISTRO DO FORNECEDOR":

| o que a ECR pede ao fornecedor | ECRs |
|---|---|
| nada ("Não aplicável") | 15, 20 |
| a FISPQ, a ficha de segurança do produto | 05, 07, 14, 18, 19 |
| licença ou guia ambiental (GCA, IEF, CDL, licença de extração) | 02, 06, 17 |
| a carta traço do concreto | 03 |
| certificado ou laudo de ensaio do produto | 04, 08, 09, 10, 11, 12, 13, 14, 16 |
| certificado "por lote", escrito assim | 01 |

- Oito ECRs listam mais de um item: a 02, a 04, a 08 (nove certificados), a 10, a 12, a 13, a 14 e a 16. Na 12 e na
  13, a lista é por tipo de material.
- Nenhuma das 20 "INSPEÇÃO DO RECEBIMENTO" fala do registro do fornecedor.

**Três furos, e o que muda:**

1. **A palavra.** A tela diz o que a ECR pede, com as palavras dela: a lista do "REGISTRO DO FORNECEDOR" da revisão
   que vale na Data da OC, a mesma regra do PDF da parte A. "Certificado" só onde a ECR diz certificado.
2. **O documento sem prazo.** A FISPQ e o laudo não têm validade, mas também não são do lote. Pela regra da D809, o
   recebimento pediria a FISPQ em toda entrega de cimento. Levei ao Pedro a minha recomendação:
   - a IA diz uma de três coisas: "deste lote", "vale até dd/mm/aaaa" ou "vale para o produto, sem prazo";
   - as duas últimas ficam na empresa e na ECR;
   - na dúvida, lote, e quem anexou confere.

   **Desenhe com a recomendação, e marque o que muda se ele escolher a outra** (o que não tem validade continua
   lote). A resposta dele vem numa carta curta.
3. **A ECR com mais de um item.** Um documento guardado não pode calar a ECR inteira. A regra do "pede" mora no
   banco, e não na tela (a lição da D810). Ela tem de responder a estes seis casos, que viram teste:

| caso | o recebimento pede? |
|---|---|
| ECR 15 e 20 ("Não aplicável") | nunca |
| ECR 01 (aço, "por lote" na ECR) | em toda entrega, mesmo com documento da empresa guardado |
| ECR 02 e 17 (a GCA, que acompanha cada carga de madeira) | em toda entrega, mesmo com a licença da empresa guardada |
| ECR 19 (cimento, a FISPQ) | até a primeira FISPQ guardada; depois, não. Com a outra opção do Pedro: em toda entrega |
| ECR 06 (areia e brita, a licença com validade) | até guardar; de novo quando vence; o aviso de 30 dias fica na qualificação |
| ECR 08 (nove certificados) | pode parar depois do primeiro guardado. A tela da qualificação mostra, por ECR, a lista da ECR ao lado do que está guardado, e o comprador vê o que falta |

- O caso da 02 e da 17 pede um princípio: o que já chegou como do lote, para aquela empresa e aquela ECR, continua
  sendo pedido.
- **As listas com condição** (o "exceto compensado" da 02, a 12 e a 13 por tipo de material, o "desejável" da 04)
  precisam de uma saída que não seja "não veio". Diga como a tela trata isso.

## §4 — As suas três perguntas: aceitas

1. **O "não veio" não mexe sozinho na avaliação da entrega.** O escritório decide na fila. É o que 17 das 20 ECRs
   dizem no "Atenção": a divergência vai a compras, e a mercadoria só se rejeita com a autorização de compras e do
   planejamento da obra.
2. **O documento que vale além do lote vale para a empresa toda (a raiz),** como a qualificação
   (`compras.qualificacoes.empresa_raiz_id`).
3. **O que chega por e-mail:** o que vale além do lote entra pela tela da qualificação; o do lote, pelo "Anexar" na
   OC, no segundo ramo.

## §5 — O resto fica como está

- **A ordem da construção:** a parte C começa depois da parte B no ar e da tela da trava da Data, em dois ramos. Se
  um passar de mil linhas sem os testes, a perícia vem antes da produção.
- **O contrato do Banco** sai de mim, depois da resposta do Pedro e do seu desenho revisto. No desenho:
  - troque o `tipo` (lote ou validade) pelo alcance de três valores;
  - diga o que a tela pede do banco para os seis casos.

As suas duas cartas vão para o meu Arquivo_Morto.

— CTO
