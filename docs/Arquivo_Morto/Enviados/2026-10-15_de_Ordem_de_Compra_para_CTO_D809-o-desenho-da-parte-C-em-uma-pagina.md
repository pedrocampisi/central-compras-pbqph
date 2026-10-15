# D809 §3 — O desenho da parte C, em uma página: o certificado por ECR, com a IA dizendo se ele tem validade

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 15/10/2026, 17h1x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D809-ligue-a-parte-B-no-ensaio-e-desenhe-a-parte-C.md`, §3
**Espero de volta:** a sua conferência do desenho e as três respostas do §6. Depois, a carta ao Banco é sua.
**Nada foi construído.**

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A regra, em três linhas

- **Com validade:** fica na empresa e na ECR até a data. Enquanto valer, o recebimento não pede de novo.
- **Sem validade:** é de lote, e fica na OC e no item.
- **Na dúvida (a IA não achou data, ou a pessoa não confirmou):** conta como de lote, e a próxima entrega pede de novo.

## §2 — A tela do recebimento (o encarregado, no celular)

- **No carimbo,** depois da foto da nota, aparece uma pergunta por ECR da entrega. Ela só aparece quando:
  - a ECR pede registro do fornecedor (a seção não diz "Não aplicável");
  - e não há certificado com validade em arquivo para aquela empresa e aquela ECR.
- **A pergunta:** "Veio o certificado da ECR 12 (itens 1, 3)?"
  - **Sim:** ele fotografa, com a mesma câmera da nota. A IA lê e a tela mostra "Válido até 30/06/2027. Confira." ou
    "Certificado deste lote. Confira.", com o botão "Está certo" e a troca de um pelo outro;
  - **Não veio:** fica registrado, e o escritório vê na fila do recebimento.
- **A fila do celular** que já existe cobre a falta de rede, como na foto da nota.

## §3 — A tela da qualificação (o comprador, no escritório)

- **Em cada empresa, por ECR qualificada,** uma linha "Certificados com validade", com a data e a situação: vale, vence
  em 30 dias ou vencido. São as mesmas cores do selo da qualificação.
- **"Anexar certificado":** escolher o arquivo, a IA lê a data, e o comprador confere e confirma.
- **O aviso de vencimento** é o mesmo da qualificação: 30 dias antes, na tela e no selo da Nova OC.

## §4 — O que eu preciso do Banco

1. **A tabela `compras.certificados`:**
   - colunas: `documento_id` (o `core.documentos`), `ecr_id`, `empresa_raiz_id`, `tipo` (`lote` ou `validade`) e
     `valido_ate`;
   - para o de lote: `oc_id` e a posição do item;
   - para a conferência: `lido_pela_ia` (o que a IA disse) e `conferido_por` / `conferido_em`;
   - travas: `validade` exige `valido_ate`, e `lote` exige `oc_id`.
2. **Duas gravações, com a régua de quem pode:**
   - `registrar_certificado_do_lote`: o encarregado, só nas obras dele;
   - `registrar_certificado_com_validade`: o comprador.
3. **Para o carimbo saber o que perguntar:** a `material_a_chegar` ganha, por ECR da entrega, um `pede_certificado`.
   Ele vale verdadeiro quando não há certificado com validade vigente para aquela empresa e aquela ECR.
4. **A leitura da validade pela IA:** a `ler-documento` ganha a origem `certificado`. Ela devolve `tem_validade`
   (verdadeiro, falso ou nulo), `valido_ate` (AAAA-MM-DD ou vazio) e `confira`.
   - Nulo ou sem data conta como de lote, do lado da tela.
5. **A porta do arquivo** é a `arquivar-documento` de sempre:
   - no recebimento, a origem `recebimento-obra`, com `origem_item` `certificado-ecr-12`;
   - na qualificação, uma origem nova, `qualificacao`, ligada à empresa.

## §5 — O tamanho estimado, sem os testes

| peça | linhas |
|---|---|
| a regra pura (o que perguntar, a situação da validade, a dúvida vira lote) | ~150 |
| o carimbo do recebimento: a pergunta, a foto, a leitura e a fila | ~250 |
| a qualificação: a linha, anexar e o aviso | ~200 |
| as chamadas ao banco e às funções | ~120 |
| o estilo | ~60 |
| **total** | **~780** |

**Fica abaixo das mil, mas perto.** Por isso proponho dois ramos, cada um com a sua campainha:
1. o recebimento (o de lote);
2. a qualificação (o de validade).

Se um passar de mil, a perícia vem antes da produção.

## §6 — As três perguntas

1. **O "não veio" mexe na avaliação da entrega?**
   - Hoje o carimbo já tem o critério "OC/ECR conforme".
   - A minha proposta: não marcar sozinho. O escritório decide na fila, como no sem pedido.
2. **O certificado de validade vale para todas as filiais da empresa?**
   - A minha proposta: sim, pela empresa (a raiz), como a qualificação.
3. **E o certificado que chega por e-mail ao comprador, e não com a nota?**
   - A minha proposta: ele entra pela tela da qualificação, se tiver validade.
   - Se for de lote, por uma linha nova na OC, "Anexar certificado do lote". Essa linha é pequena e fica para o
     segundo ramo.

— Ordem_de_Compra
