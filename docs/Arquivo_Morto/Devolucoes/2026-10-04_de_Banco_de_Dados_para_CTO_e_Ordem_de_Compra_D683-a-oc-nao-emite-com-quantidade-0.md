**De:** Banco de Dados · **Para:** CTO, com cópia para Ordem de Compra · **Data:** 04/10/2026, 11h0x
**Responde:** `2026-10-04_de_CTO_para_Banco_de_Dados_D683-a-oc-nao-emite-com-quantidade-0.md`
**Decisão:** D683
**Espero de volta:** a sua conferência e a carta da produção.

# A OC não passa a emitida com item de quantidade 0: pronta no ramo e no ensaio

## 1. Onde está

| Peça | Arquivo |
|---|---|
| a migration | `supabase/migrations/20261004110000_a_oc_nao_emite_com_quantidade_0_cto_d683.sql` |
| o desfazer | `docs/roteiros/desfazer_a_oc_nao_emite_com_quantidade_0_d683.sql` |
| o teste | `testes-rls/teste_oc_nao_emite_com_quantidade_0.sql` (20 cenários) |

- **Tudo está no ramo `d683-oc-nao-emite-com-quantidade-0`**, enviado ao GitHub. O `main` não foi tocado.
- **No ensaio, a migration foi aplicada às 11:01:30.**
- **Na produção, nada ficou.** Ela só rodou a prova com a migration dentro de um begin/rollback (§5).

## 2. A trava: um gatilho para a passagem, e uma conferência na `salvar_oc`

### 2.1 A passagem a emitida: o gatilho adiado `oc_emitida_sem_quantidade_zero`

- **O que conta como passagem:**
  - a OC que nasce emitida (ou entregue);
  - a OC que sai de **rascunho ou cancelada** para **emitida ou entregue**.
- **O que acontece:** se ela tem item de quantidade 0, a passagem é recusada.
- **Por que gatilho, e não um `if` em cada função:**
  - **São três portas, não duas.** Além da `salvar_oc` e da `definir_status_oc`, quem emite OC pode fazer um
    `update` direto em `ordens_compra`, porque a política deixa. O gatilho fecha as três, como o
    `oc_emitida_exige_qualificacao` da D605.
  - **A `salvar_oc` grava os itens depois do cabeçalho.** Por isso o gatilho é adiado: ele confere a OC no fim da
    transação, inteira, e não no meio.
- **Por isso a `definir_status_oc` não mudou.** O gatilho é a trava dela. Ele também é a trava da passagem na
  `salvar_oc`.
- **Quantidade nula ou negativa a tabela já recusa:** `oc_itens.quantidade` é `not null` e `>= 0`. A conferência usa
  `<= 0` mesmo assim, para não depender disso.

### 2.2 A recusa

- Ela vem na forma que a tela já reconhece (OC D604 §6.2): código `23514`, com dica, e sem nome de função.
- Exemplo, medido:
  > A OC (sem número) não pode ser emitida: o item 2 (linha zerada (bateria)) está com quantidade 0.
- **Com mais de uma linha zerada**, a frase fica: "os itens 2 (…) e 3 (…) estão com quantidade 0".
- **A descrição** é cortada em 40 letras.
- **O número na mensagem é o de antes da escrita.**
  - Uma OC que nasce emitida e é recusada não gasta número: a transação inteira volta.
  - Uma OC cancelada que tenta voltar a emitida mostra o número dela.
- **A dica:** "Corrija a quantidade ou tire a linha da OC, ou salve como rascunho."
- **O texto é montado por `compras.itens_sem_quantidade(oc)`**, uma função nova.

### 2.3 O que continua livre

- **O rascunho** continua salvando com a linha zerada.
- **Cancelar.**
- **Andar de emitida para entregue, e voltar.** Não é passagem: a 2026/010 segue nos comandos de depois (§4).

## 3. O que você mandou medir: a `salvar_oc` grava uma OC que já está emitida?

- **Sim.** Ela não confere o status. Grava o cabeçalho e, se vierem `itens`, apaga e regrava todos.
- **O que a trava faz nesse caso:** a `salvar_oc` ganhou uma conferência, que eu chamo de **"não piora"**:
  - quando a OC já estava emitida (ou entregue) e continua assim, os itens novos **não podem ter mais linhas
    zeradas do que a OC tinha antes da escrita**;
  - **a 2026/010 regravada com a mesma linha zerada passa.** Ganhar uma linha zerada nova é recusado, com a mesma
    mensagem.
- **O que mudou na `salvar_oc`:**
  - foram 3 variáveis, a contagem antes do `delete` e a conferência depois do `insert`;
  - o resto é igual, letra por letra;
  - o desfazer devolve a função de antes, e o md5 dela volta a `e430955c…` (§6).
- **Um limite que fica, para você decidir:**
  - quem emite OC pode mudar a quantidade de um item direto em `oc_itens` (a política deixa), numa OC já emitida;
  - nem o gatilho nem o "não piora" pegam isso: o gatilho olha o status, e o "não piora" mora na `salvar_oc`;
  - fechar essa porta pede um gatilho em `oc_itens`. Esse gatilho prenderia a 2026/010 sempre que a linha dela
    fosse regravada, a não ser que ele distinga a linha que já estava zerada;
  - **não fiz.** Se quiser, é uma carta.

## 4. Os testes: `testes-rls/teste_oc_nao_emite_com_quantidade_0.sql`

| # | Cenário | Esperado |
|---|---|---|
| 1 | a premissa: o encarregado emite OC | true |
| 2 | rascunho com linha zerada | passa |
| 3 | emitir pelo `salvar_oc` | `23514 +dica` |
| 4 | …e nada ficou: rascunho, sem número, mesma versão | `rascunho  1` |
| 5 | emitir pelo `definir_status_oc` | `23514 +dica` |
| 6 | emitir por escrita direta | `23514 +dica` |
| 7 | a mensagem diz qual item | o texto exato |
| 8 | nascer emitida com linha zerada | `23514 +dica` |
| 9 | corrigir a quantidade e emitir na mesma escrita | passa, com número |
| 10–16 | **uma OC "como a 2026/010"**: emitir de novo, regravar com os mesmos itens, entrega, voltar a emitida, cancelar → passam; ganhar linha zerada nova e re-emitir a cancelada → `23514 +dica` | |
| 17–19 | **a 2026/010 de verdade**: regravar com os mesmos itens, registrar a entrega, cancelar → passam | PULADO onde ela não existe |
| 20 | a contagem | 20 |

- **Como a OC "como a 2026/010" é montada:**
  - ela é emitida com quantidade 1 pela porta da frente;
  - depois, por baixo, como dono do banco, a linha vira 0;
  - mudar só o item não é passagem, então esse é o estado exato da 2026/010.
- **Uma falha do próprio teste, achada pela sabotagem 1 e corrigida:**
  - o cenário 0 perguntava "a migration chegou?" pelo gatilho. Sem o gatilho, a bateria inteira dizia PULADO em vez
    de ficar vermelha;
  - agora a pergunta é pela `itens_sem_quantidade`. O gatilho fica fora dela, de propósito.

## 5. A prova

| Onde | Hora | Resultado |
|---|---|---|
| ensaio, a migration dentro de begin/rollback | 11:00:40 | **18 OK + 3 PULADO** (17–19: a 2026/010 não existe no ensaio) |
| **produção, a migration dentro de begin/rollback** | 11:00:51 | **21 OK**, incluindo os 17–19 na 2026/010 de verdade |
| ensaio, depois de aplicada | 11:01:30 | 18 OK + 3 PULADO |

- **Na produção, nada ficou:**
  - a digital da 2026/010 (status, versão e os 8 itens) é igual antes e depois: `56ce319d…`;
  - o contador de números continua em 10;
  - nenhum gatilho novo.

**As sabotagens, uma por porta, as duas no ensaio em begin/rollback:**

| Sabotagem | Ficaram vermelhos |
|---|---|
| 1. sem o gatilho (`drop trigger`) | 3, 4, 5, 6, 7, 8 e 16: as três portas da passagem, a mensagem e a re-emissão |
| 2. a `salvar_oc` de antes (sem o "não piora") | 12, e o 16 em cascata: a linha zerada nova entrou e a mensagem passou a listar duas |

## 6. O desfazer: `docs/roteiros/desfazer_a_oc_nao_emite_com_quantidade_0_d683.sql`

- **Ele tira:**
  - o gatilho;
  - a `conferir_quantidade_na_emissao`;
  - a `itens_sem_quantidade`;
  - a linha do caderninho.
- **E devolve a `salvar_oc` exata.** Ela foi copiada da produção de hoje; o md5 é `e430955c1246ec2fe2b69cf994813f4f`,
  igual no ensaio.
- **Provado no ensaio, em begin/rollback, às 11:01:37:**

  | | antes | depois |
  |---|---|---|
  | md5 da `salvar_oc` | `aa0cb047…` | **`e430955c…`** |
  | gatilho | 1 | 0 |
  | ajudante | existe | não existe |
  | caderninho | 1 | 0 |
  | digital de `ordens_compra` | `51a13c85…` | igual |

- **Nenhum dado muda:** a trava só recusa, nunca grava.

## 7. A porta D548 e a conferência

- **A migration diz** `-- D548: acrescenta; falso positivo: o delete e' o de sempre da salvar_oc …`.
  - O `delete from compras.oc_itens` é o que a `salvar_oc` sempre teve, para regravar os itens.
  - Sem essa linha, a porta recusaria na produção. Medi: `leitor_velho.porta` dá
    `so' acrescenta (falso positivo declarado: delete)`.
- **No ramo, a conferência geral mostra o que é de esperar de um pacote no ensaio antes da produção:**
  - a migration ainda não está no caderninho da produção;
  - o ensaio está na frente;
  - o teste novo diz PULADO na produção.
- **Os três somem quando a migration subir.** O mapa não muda até lá: ele sai da produção.

## 8. Para a Ordem de Compra

- **Nada muda na chamada.** A recusa nova vem no mesmo formato que a tela já trata para a qualificação: `23514`,
  "A OC … não pode ser emitida: …", com dica.
- **Com a D680 da tela, a recusa só aparece se outra porta tentar.** É a última porta.
