# D811 §3 — O desenho da parte C, revisto em uma página: o alcance de três valores, as palavras da ECR e os seis casos

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 15/10/2026, 17h4x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D811-B-conferida-a-trava-da-Data-agora-e-a-parte-C-volta.md`, §3 e §5
**Espero de volta:**
- a sua conferência;
- a resposta do Pedro sobre o documento sem prazo;
- a pergunta do §4.

Depois, o contrato do Banco é seu.
**Nada foi construído.**

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A regra, com a sua recomendação

- **A IA diz uma de três coisas sobre o documento:** "deste lote", "vale até dd/mm/aaaa" ou "vale para o produto, sem
  prazo". Quem anexou confere, e pode trocar.
- **"Deste lote"** fica na OC e no item.
- **As outras duas** ficam na empresa (a raiz) e na ECR.
- **Na dúvida** (a IA não diz, ou ninguém confere): é "deste lote".
- **O princípio:** o que já chegou como "deste lote", para aquela empresa e aquela ECR, continua sendo pedido.

⚠️ **Com a outra opção do Pedro**, sai o "vale para o produto": a IA diz "deste lote" ou "vale até", e o sem prazo é
lote. O que muda vai marcado com ⚠️.

## §2 — As palavras: a tela diz o que a ECR pede

- **A pergunta do carimbo:** "Veio o que a ECR 08 pede do fornecedor? (itens 1, 3)". Abaixo dela, a lista do "REGISTRO
  DO FORNECEDOR", linha por linha, como está.
- **A lista é da revisão que vale na Data da OC.** É a mesma regra do PDF da parte A (`registrosDaOc`).
- **"Certificado" só aparece quando vem do texto da ECR.** A tela nunca o escreve por conta própria.
- **No escritório:** a tela da qualificação mostra, por ECR, a lista da revisão vigente ao lado do que está guardado.
  Cada documento aparece com o alcance e a data. O comprador vê o que falta (o caso da 08).

## §3 — Os seis casos: a regra do "pede" mora no banco

**O banco responde, por entrega e por ECR,** nesta ordem. A primeira que valer decide:

| # | a regra | pede? | os casos |
|---|---|---|---|
| 1 | a seção, na revisão da Data da OC, diz "Não aplicável" | **nunca** | 15, 20 |
| 2 | a ECR pede a cada entrega (o §4) | **sempre**, mesmo com documento da empresa | 01, 02, 17 |
| 3 | já chegou um "deste lote" para essa empresa e essa ECR (o princípio) | **sempre** | 02 e 17 de novo, e qualquer outra |
| 4 | há um "vale até" com data no dia da entrega ou depois | não | 06 |
| 5 | há um "vale para o produto" ⚠️ | não | 19 |
| 6 | o resto: nada guardado, ou só o "vale até" vencido | **sim** | 06 vencida, 19 e 08 antes do primeiro |

- **A 19:** pede até a primeira FISPQ guardada como "vale para o produto"; depois, não (regra 5).
  - ⚠️ Com a outra opção, a FISPQ é lote: a regra 3 pede em toda entrega.
- **A 06:** pede até guardar a licença; de novo quando vence (regra 6). O aviso de 30 dias fica na qualificação.
- **A 08:** para depois do primeiro guardado (regra 4 ou 5). O que falta, o comprador vê na qualificação (§2).
- **O dia que conta é o da entrega.** O documento tem de valer quando o material chega.

**O que a tela pede do banco:** a `material_a_chegar` ganha, por ECR da entrega:
- `pede` (sim ou não);
- `porque`: a regra que decidiu, em frase de gente. Exemplos: "a ECR pede a cada entrega", "a licença venceu em
  dd/mm/aaaa";
- `o_que_pede`: as linhas do "REGISTRO DO FORNECEDOR" da revisão da Data da OC, com a revisão.
  - O celular do encarregado não carrega o catálogo das ECRs, e assim a regra da revisão fica num lugar só.

**Os seis casos viram teste no banco**, com as regras de 1 a 6. Do meu lado, um teste prova que a tela pergunta
quando o banco diz `pede`, e só nessa hora.

## §4 — A pergunta: como o banco sabe que a 01, a 02 e a 17 pedem a cada entrega?

- **Sem uma marca, a regra 2 não existe.** O princípio (regra 3) só pega depois do primeiro lote guardado.
  - Se a licença da 02 for guardada primeiro, nada pede a GCA da carga.
  - O mesmo com a 01: se o primeiro documento for da empresa, nada pede o certificado do lote.
- **A minha proposta:** um sim/não "a cada entrega" na revisão da ECR (`compras.ecr_revisoes`).
  - O Banco preenche hoje as três (01, 02 e 17), lendo o texto delas.
  - A tela da revisão da ECR mostra a marca, e quem revisa a ECR a mantém.
  - **São 3 das 20 ECRs, e não as 50 linhas de material.** A marca é do documento que diz "por lote", e não do item.
- Se o Pedro não quiser marca nenhuma, fica só o princípio, com o furo acima escrito.

## §5 — As listas com condição: a terceira resposta

**O carimbo tem três respostas por ECR:**
- **"Veio":** a foto, com a mesma câmera da nota. A IA diz o alcance, e o encarregado confere;
- **"Não veio":** fica registrado, e o escritório vê na fila (D811 §4.1);
- **"Não se aplica a esta entrega":** pede uma frase curta, por exemplo "é compensado" ou "o tubo não é desta lista".
  - Fica registrada e aparece na fila **como informação, e não como falta.**
  - É a saída do "exceto compensado" da 02, da 12 e da 13 por tipo de material, e do "desejável" da 04.
  - A tela não tenta adivinhar a condição pelo nome do item.

## §6 — O que eu preciso do Banco (no lugar do §4 da carta anterior)

1. **A tabela `compras.registros_do_fornecedor`:**
   - "registro", e não "certificado", pela palavra da ECR;
   - colunas: `documento_id`, `ecr_id`, `empresa_raiz_id`, `alcance` (`lote`, `vale_ate` ou `produto` ⚠️) e
     `valido_ate`;
   - onde chegou: `oc_id` e as posições;
   - a conferência: `lido_pela_ia`, `conferido_por` e `conferido_em`;
   - as travas:
     - `vale_ate` exige `valido_ate`;
     - `produto` não tem data;
     - `lote` exige `oc_id`.
2. **A resposta do carimbo** entra na `registrar_entrega`, como `registros: [{ecr_id, resposta, motivo, documento_id}]`.
   - `resposta` é `veio`, `nao_veio` ou `nao_se_aplica`;
   - o `motivo` é obrigatório no `nao_se_aplica`.
3. **A regra do "pede"** na `material_a_chegar`, como no §3, e a marca "a cada entrega" do §4.
4. **A `ler-documento` com a origem `registro-ecr`:** ela devolve `alcance` (os três, ou nulo), `valido_ate` e
   `confira`. Nulo vira lote, do lado da tela.
5. **Duas gravações, com a régua de quem pode:**
   - o "deste lote": o encarregado, só nas obras dele, e o comprador pelo "Anexar" na OC;
   - os outros dois: o comprador, na qualificação.
6. **O arquivo** vai pela `arquivar-documento`:
   - no recebimento, com `origem_item` `registro-ecr-08`;
   - na qualificação, com uma origem nova, ligada à empresa.

## §7 — O tamanho, sem os testes

| peça | linhas |
|---|---|
| a regra pura: a resposta do banco em tela, o alcance, a dúvida vira lote | ~120 |
| o carimbo: a lista da ECR, as três respostas, a foto, a leitura e a fila | ~290 |
| a qualificação: a lista ao lado do guardado, o "Anexar", o aviso | ~230 |
| as chamadas ao banco e às funções | ~120 |
| o estilo | ~60 |
| **total** | **~820** (⚠️ ~790 com a outra opção) |

**Dois ramos, cada um com a sua campainha**, como na D811 §5:
1. o recebimento;
2. a qualificação, com o "Anexar" na OC.

Se um passar de mil, a perícia vem antes da produção.

— Ordem_de_Compra
