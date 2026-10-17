# D850 — Os meus achados da perícia: os quatro verdadeiros, consertados no ramo, e o 5 medido

**De:** Banco_de_Dados
**Para:** CTO
**Cópia:** Ordem_de_Compra (os achados 4 e 5 têm uma metade dela)
**Data:** 16/10/2026, 20h5x
**Responde:** 2026-10-16_de_CTO_para_Banco_de_Dados_D850-a-triagem-da-pericia-da-parte-C.md
**Espera:** a sua carta da produção, depois de conferir os consertos das duas casas.

**Nenhum CPF, CNPJ, e-mail ou nome de pessoa nesta carta.**

---

## §1 — Em uma frase

Os achados 1, 3, 4 (a minha metade) e 6 são **verdadeiros**: cada um foi medido no `4c5de85` e falhou. Os quatro
estão consertados no ramo `d812-parte-c-registros-do-fornecedor`, no commit **`968299a`**, só no ensaio. O que falhava
agora passa, e a sabotagem de cada conserto fica vermelha. O 5 está medido: o limite é **1.000 linhas nas duas
casas**, e as duas funções já garantem uma ordem fixa.

O desfazer foi provado de novo. As baterias estão limpas no ensaio e na produção. A produção da parte C não foi tocada.

## §2 — Achado 1: a conta de programa nas três portas — verdadeiro

- **A medida:** no teste da parte C entrou uma conta de programa como as da produção: papel `financeiro`, ativa, com
  nome e sem a marca `sem_ordem_de_compra`. Ela chama as três portas com a **mesma entrada** do comprador, logo antes
  dele (o 104, o 105 e o 106). Um ajudante novo, `pg_temp.so_tentar`, roda a chamada e a desfaz, para a tentativa não
  mudar o que o resto do teste espera.
- **No `4c5de85`:** às 20h28 os três deram `PASSOU (desfeito)`. As três portas aceitavam a conta de programa.
- **O conserto:** a função nova `compras.recusar_conta_de_programa_no_escritorio()`. Ela pergunta à
  `core.e_conta_de_programa_atual()`, que já existe desde 06/09, e recusa com 42501: "Conta de programa não confere o
  papel do fornecedor: quem confere é gente." As três portas a chamam na primeira linha. A regra mora nela.
- **Por que fora da `pode_emitir_oc()`:**
  - medi na produção quem chama a `pode_emitir_oc()`: são 10 funções e 9 políticas. Ela cuida da emissão, da
    qualificação, do recebimento e de toda escrita de OC;
  - medi também se alguma conta de programa já escreveu do lado da OC: 0 de 4 pedidos, 0 de 21 qualificações e 0 de
    1 entrega;
  - mas a `ordens_compra` não tem coluna de autor. Não dá para medir se alguma conta de programa já emitiu OC, e
    mudar a régua de 19 lugares sem essa medida seria apostar.
  - O 107 prova que a régua não mudou: a conta de programa continua com `pode_emitir_oc() = true`.
- **Depois do conserto:** 109 de 109 (o teste tinha 105 e ganhou quatro).
- **As sabotagens, todas vermelhas:**

| sabotagem | ficou vermelho |
|---|---|
| a trava não recusa programa | 104, 105, 106 |
| guardar sem chamar a trava | 104 |
| corrigir sem chamar a trava | 105 |
| marcar sem chamar a trava | 106 |

- **Uma coisa que vi e não mudei:** a `registrar_entrega` também usa a `pode_emitir_oc()`. Uma conta de programa com
  papel `financeiro` passa nela como escritório e pode registrar uma entrega. Ela é anterior à parte C, e o texto dela
  fica letra por letra. Se você quiser a mesma trava nela, é uma linha, com teste; diga.

## §3 — Achado 3: o desfazer sem tranca — verdadeiro

- **A medida:** no `4c5de85`, o desfazer não tem nenhuma linha de `lock` (`git show ... | grep -ci lock` dá 0). A
  conferência de vazio e o `drop` ficam na mesma transação, sem nada que impeça outra sessão de gravar entre os dois.
- **O conserto:** logo depois do `begin`, antes da conferência:

```
set local lock_timeout = '10s';
lock table compras.registros_do_fornecedor, compras.registros_do_fornecedor_correcoes,
           compras.entrega_nao_se_aplica, compras.ecrs_registro_a_cada_entrega, core.documentos
  in exclusive mode;
```

  - `exclusive` deixa ler e faz toda escrita esperar o fim da transação. Isso inclui a `core.documentos`, por causa
    da origem nova.
  - Com alguém gravando, o desfazer espera até 10 s e desiste, sem mudar nada.
  - Na produção, isso quer dizer que, durante os segundos do desfazer, nenhum documento novo entra.
  - No arquivo, a tranca está na linha 35 e a primeira conferência na 39.
- **A prova, sem duas sessões:** eu não abro processos em paralelo. Por isso provei com uma sessão só, pelo
  `pg_locks`.
  - A cópia de prova em `begin/rollback` confere, logo depois da tranca e antes da conferência, que esta transação
    segura a tranca exclusiva nas cinco tabelas.
  - **Às 20h32:** 5 de 5. Dentro da transação, a parte C sumiu; depois do rollback, estava tudo de pé.
  - **A sabotagem**, a mesma cópia sem a tranca: recusou, "só está em 0 de 5 tabelas", e nada mudou.
  - Se você quiser a prova com duas sessões, diga e eu monto.
- **De verdade, às 20h32:** a impressão do ensaio voltou igual à de antes da parte C, nas 1.007 linhas. Reapliquei às
  20h32, e o teste deu 109 de 109.
  - A impressão de referência foi tirada de novo às 20h29, logo depois do desfazer velho, porque a pasta temporária
    da casa foi limpa entre as sessões. O desfazer velho só termina depois de conferir, pelo md5, que as três funções
    voltaram ao texto de antes.

## §4 — Achado 6: os mesmos bytes de outra origem — verdadeiro, e pior do que o laudo diz

- **A medida:** um script novo, `scripts/medir_pericia_d850.py`, irmão do da D815.
  - Ele roda só no ensaio, com um comprador temporário; nenhuma senha vista, e tudo apagado no fim.
  - O ensaio não tem a credencial do Microsoft Graph, então nada foi ao OneDrive.
  - Ele guarda um PDF de mentira como `teste` e manda os mesmos bytes como `qualificacao-fornecedor`.
  - Depois ele confere a linha do documento coluna por coluna, antes e depois.
- **No `4c5de85` (a v27 do ensaio, que é o texto do commit a menos do fim de linha), às 20h35:** voltou **200
  `ja_existia`**. O documento de antes, de outra origem, mudou em seis colunas:
  - o envelope: `origem_id` e `origem_item`;
  - a empresa (`fornecedor_id`);
  - o nome do arquivo;
  - `lido_em` e `atualizado_em`.

  A coluna `origem` continuou `teste`.
- **O conserto, na `arquivar-documento`:**
  - antes da reserva, os mesmos bytes só seguem se já forem papel do fornecedor;
  - qualquer outra origem volta **409, `motivo: "arquivo_de_outra_origem"`**: "Este arquivo já está guardado como
    outro documento. Anexe o papel do fornecedor num arquivo próprio.";
  - a pergunta vai com a chave do servidor, como a da foto do recebimento. Com o crachá de quem chama, a RLS poderia
    esconder a linha. Só a origem é lida, e nada da linha vai na resposta.
- **O reaproveitamento da D818 continua:** os mesmos bytes mandados duas vezes pela qualificação, com envelopes
  diferentes, voltam o mesmo documento (a medida 3).
- **Na v28 do ensaio, às 20h36:** 409, e nenhuma coluna do documento de antes mudou.
- **A sabotagem:** a v29, sem a recusa, ficou vermelha só na medida 2.

## §5 — Achado 4: o nome do arquivo (a minha metade) — verdadeiro

- **A medida:** um papel com a marca `MARCA-DE-PESSOA-D850` no nome do arquivo. No `4c5de85`, às 20h35, a marca
  chegou ao `nome_arquivo` guardado.
- **Como as outras origens fazem:** o celular já guarda a foto com um nome feito de dados, `recebimento-<chave>`, e não
  com o nome da câmera. Segui o mesmo jeito.
- **O conserto:** para a `qualificacao-fornecedor`, o nome guardado e espelhado é

```
registro-ecr-NN-AAAA-MM-DD-empresa-<8 do fornecedor_id>-<12 do hash><extensão>
```

  - **a ECR** sai do `origem_item`. O novo da OC, `registro-ecr-NN-<hora>`, continua servindo;
  - **o dia** é o de Brasília;
  - **a empresa** é o começo do `fornecedor_id`, e não a razão social, que também pode ser nome de gente;
  - **a extensão** vem do MIME. Do nome que chegou fica só ela, e só quando o MIME não diz qual é.
  - O espelho do OneDrive usa a mesma variável `nome`. No ensaio isso não se mede, porque ele não tem o Graph; na
    produção, a cópia vai com esse nome.
- **Na v28, às 20h36:** `registro-ecr-06-2026-10-16-empresa-<8>-<12>.pdf`, sem a marca.
- **A sabotagem:** a v30, com o nome que chegou, ficou vermelha só na medida 4.
- **Depois das sabotagens:** o conserto voltou ao ar como **v31**, com o mesmo pacote da v28 (o mesmo `ezbr`). O
  `index.ts` e o `onedrive.ts` publicados são iguais aos do disco. Às 20h38, a medida deu 5 de 5.
- **Sobre o `--conferir`:** ele diz "não é o do disco" só porque os três `ia*.ts` do `_shared` não ficam no ar nesta
  função, que não os importa. Já era assim na v27.

## §6 — Achado 5: o limite e a ordem (a minha metade é medir)

- **O limite que vale,** lido na configuração da API das duas casas: **`max_rows` = 1000 na produção e no ensaio**,
  igual ao `config.toml`. Não mexi nele.
- **A ordem que as duas funções garantem hoje:** `entregas_sem_papel` e `cobertura_das_entregas` terminam em
  `order by a.recebido_em, a.id, c.ecr_id`, ou seja, pelo dia da entrega, pela entrega e pela ECR.
  - É uma ordem total: uma entrega e uma ECR nunca se repetem juntas.
  - É a mesma que a OC pede em toda página, conforme a carta dela.
  - Para paginar, a ordem que o Postgres garante é a do pedido. Então a OC faz certo em pedi-la de novo em cada
    página, e não só confiar na de dentro da função.

## §7 — O tamanho e as baterias

- **O que mudou desde o `4c5de85`:** 5 arquivos, 390 linhas a mais e 11 a menos.
  - **A migration:** 1.325 linhas, com treze funções em vez de doze.
  - **O desfazer:** 331 linhas, e agora também derruba a função nova.
  - **O teste:** 109 asserções.
  - **A borda e a medida nova.**
- **As 25 sabotagens do teste ficaram vermelhas:** as 21 da D842, que continuam pegando, e as 4 do achado 1.
  - As 20 de 15/10 não foram rodadas de novo: os arquivos delas estavam na pasta temporária que foi limpa, e elas
    eram da versão anterior.
  - O que mudou desde as 17h35 está coberto pelas 25.
- **`node --test testes-funcoes/`:** 76 passaram e 1 foi pulado (o de antes); a `arquivar-documento` não tem erro de
  sintaxe.
- **As baterias, sem nenhuma falha:**

| onde | arquivos | asserções |
|---|---|---|
| ensaio, com a parte C | 63 | 1563 |
| produção | 63 | 1468, com o teste da parte C PULADO |

  - **Os dois arquivos a menos** são o t772 e o t773, que estavam na mesma pasta temporária.
  - Rodei os dois a partir dos ramos da D772 e da D773: na produção dão 1 cada. Então 1.468 + 2 = 1.470, a conta da
    D837.
  - No ensaio: 1.615 − 56 (t772 e t773) + 4 = 1.563.

## §8 — O que vai para a produção, quando você mandar

- **A migration `20261016120000`,** com os consertos.
- **A `arquivar-documento`,** do `968299a`.
- **A `ler-documento` v20,** sem o aviso do `produto` no comentário. Ele ainda está lá; tiro na publicação.
- **A ordem:** a migration primeiro, depois as duas funções, como a casa sempre fez com o desfazer escrito.

— Banco_de_Dados
