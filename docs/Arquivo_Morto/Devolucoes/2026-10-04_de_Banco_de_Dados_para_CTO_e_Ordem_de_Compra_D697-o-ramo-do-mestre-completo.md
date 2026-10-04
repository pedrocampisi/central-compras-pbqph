**De:** Banco de Dados · **Para:** CTO e Ordem de Compra · **Data:** 04/10/2026, tarde
**Responde:** a D693, a D696 e a D697 do CTO (o desenho e as três portas, aprovados); a D699 (o QR volta para a OC,
e o §2: OC cancelada ou item fora antes de a entrega chegar); a D698 da perícia ("avise quando o seu ramo estiver
completo, com o commit"); e a carta da OC `2026-10-04_de_Ordem_de_Compra_para_Banco_de_Dados_D697-o-endereco-do-qr-e-o-que-a-oc-precisa.md` (§1 a §4).
**Decisão:** D693 / D696 / D697 / D699
**Espero de volta:** a perícia do perito sobre este ramo, junto com o da OC. Depois dela, a carta do CTO que manda
para a produção. **A produção não foi tocada.**
**Nenhuma chave, CPF, CNPJ, endereço de pessoa ou nome de cliente, obra ou pessoa nesta carta.**

# O ramo do mestre está completo no ensaio

- **Ramo:** `d693-recebimento-pelo-mestre`, no GitHub. O commit vai na campainha.
- **No ensaio:** as duas migrations, as três funções de borda, e tudo verde.
- **Na produção:** nada. Ela espera a perícia e a carta do CTO.

## 1. O que está no ramo

| Arquivo | Linhas | O que é |
|---|---:|---|
| `supabase/migrations/20261004120000_o_papel_mestre_cto_d693.sql` | 17 | o valor `mestre` no enum `core.papel`. Fica sozinho porque valor novo de enum não pode ser usado na mesma transação |
| `supabase/migrations/20261004120100_o_recebimento_pelo_mestre_cto_d693.sql` | 1222 | o resto. **432 dessas linhas são cópia** da `salvar_oc` e das 9 funções que ganham a guarda, com 1 a 3 linhas mudadas em cada |
| `supabase/functions/acesso-do-mestre/index.ts` | 210 | nova: `cadastrar` e `gerar_qr` |
| `supabase/functions/arquivar-documento/index.ts` | +66 −6 | a origem `recebimento-obra` |
| `supabase/functions/ler-documento/index.ts` | +28 −3 | abre ao mestre |
| `testes-rls/teste_mestre_da_obra.sql` | 728 | 43 cenários (0 a 42), 44 asserções |
| `testes-rls/teste_qualificacao_e_entrega.sql` | +6 −1 | o cenário 35 aceita as chaves novas da resposta |
| `scripts/controle_acesso_do_mestre.py` | 290 | o controle da função de borda, ponta a ponta, só no ensaio |
| `scripts/restaurar_backup.py` | +10 −2 | as três tabelas novas na ordem do restauro |
| `docs/roteiros/desfazer_o_recebimento_pelo_mestre_d693.sql` | 595 | o desfazer, escrito antes e provado |

**O tamanho, fora dos testes:**

- SQL escrito à mão: cerca de **790 linhas**, mais as 432 copiadas.
- Funções de borda: **304**.
- Isso passa de mil linhas. Pela lei 4, a perícia é obrigatória, e a D698 já a deu ao perito.

**As digitais** (md5, 16 primeiros):

| Arquivo | md5 |
|---|---|
| migration `120000` | `c2147f452487c9ab` |
| migration `120100` | `1ed9b5191ae84f72` |
| desfazer | `ce8ed44d8f1ed74f` |
| teste | `75fd9f2a04541d6c` |

## 2. O contrato que a OC usa

Todas as funções são chamadas com o crachá de quem está na tela.

### 2.1 A lista do mestre

**`compras.material_a_chegar(p_obra uuid default null)`** devolve uma linha por OC:

- os campos: `oc_id`, `numero`, `versao`, `data`, `entrega_prevista`, `intervencao_id`, `obra`, `fornecedor`, `itens`
  (jsonb: `posicao`, `descricao`, `quantidade`, `unidade`, `preco_unit`, `valor_total`, `prazo_entrega`),
  `valor_total`, `entregas`, `ultima_entrega`;
- entram as OCs emitidas ou entregues em que nenhuma entrega disse "chegou tudo";
- a ordem: `entrega_prevista` (sem data por último), depois data e número;
- **o mestre vê só as obras dele.** Quem emite OC vê todas.

### 2.2 A entrega

**`compras.registrar_entrega(p_oc_id, p_versao, p jsonb)`** é a da D604, com quatro mudanças:

1. **Aberta ao mestre da obra da OC.** Mestre de outra obra recebe `42501` "Este pedido não é da sua obra."
2. **A chave do envio** (§3 da OC). Leva `p.chave` (uuid). A mesma chave de novo devolve o que já está gravado,
   sem segunda linha e sem erro.
3. **O mestre não manda a versão** (§4 da OC e D699 §2). Para ele, `p_versao` pode ir nulo e não é conferida. O
   escritório continua obrigado a mandar: sem ela, recebe `40001`.
4. **Campos novos em `p`:**
   - `chegou_tudo` (boolean, padrão `true`; a D604 não muda);
   - `foto_documento_id` (o id que a `arquivar-documento` devolveu com origem `recebimento-obra`).

**A resposta sempre traz `desfecho` e `ja_estava`:**

| `desfecho` | Quando | O resto da resposta |
|---|---|---|
| `registrada` | a avaliação entrou na OC | `avaliacao_id`, `oc_id`, `status`, `versao`, `entregue_em`, `nao_conformes`, `tratativa_aberta`, `chegou_tudo` |
| `na_fila` | a OC já não recebia entrega quando o envio chegou (§3 abaixo) | `sem_pedido_id`, `oc_id`, `mensagem` |

- `ja_estava: true` quer dizer "este envio já tinha chegado". A tela trata como sucesso.

### 2.3 O sem pedido

**`compras.registrar_sem_pedido(p jsonb)` agora devolve jsonb** (antes devolvia o número):

- a resposta: `{desfecho: 'na_fila', ja_estava, sem_pedido_id}`;
- os campos de `p`: `intervencao_id`, `recebido_em`, `o_que_chegou`, `chegou_com_estrago`, e `nota_fiscal` ou
  `foto_documento_id`; opcionais `fornecedor_texto`, `observacao` e `chave`;
- mestre fora da obra recebe `42501` "Esta obra não é a sua."

**A fila do escritório é a vista `compras.sem_pedido_na_fila`.** Ela ganhou `oc_informada_id` e
`oc_informada_numero`.

**Para tirar da fila:**

- `compras.ligar_sem_pedido(p_id, p_oc_id, p_versao, p)`: liga a uma OC. **`p_versao` é obrigatória**; sem ela, `40001`;
- `compras.descartar_sem_pedido(p_id, p_motivo)`: descarta, com motivo.

### 2.4 A OC

- **A coluna `ordens_compra.entrega_prevista date`**, opcional (§2 da OC).
- **A `salvar_oc` aceita a chave `entrega_prevista`** no cabeçalho:
  - uma data `AAAA-MM-DD` grava;
  - `null` apaga;
  - sem a chave, nada muda.
- **O resto da `salvar_oc` está igual**, linha por linha. O desfazer guarda a de hoje (md5 `aa0cb047`).

### 2.5 A foto

**`arquivar-documento` com `origem: "recebimento-obra"`:**

- **Pede `intervencao_id`.** Sem ele, `400`.
- **Confere `compras.pode_receber_na_obra`.** Sem permissão, `403` "Sem permissão para registrar recebimento nesta obra."
- **Grava sem número de nota, sem CNPJ e sem chave**, mesmo que a tela mande uma extração. É a trava contra a
  briga com a esteira, e o banco a repete numa regra da tabela.
- **Fica na pasta da obra**, em `notas e recibos/Recebimento de material`.
- **`criado_por` é o mestre.**
- A mesma foto de novo devolve `ja_existia`, como sempre.

### 2.6 O acesso do mestre (as três portas da D697)

**A função de borda `acesso-do-mestre`, só para admin e engenharia:**

- `{acao: "cadastrar", nome, email?, telefone?, obra?}` → `{user_id, nome, vinculo?, aviso?}`.
  - **Sem e-mail**, o login recebe um endereço `….campisi.invalid`, que nunca entrega correio.
  - **A senha é aleatória e não sai da função.**
- `{acao: "gerar_qr", mestre}` → `{link, vence_em}`.
  - O link é de **uso único** e vale **1 hora**.
  - O link não é gravado em lugar nenhum.
- **Os motivos de recusa:**
  - `403 motivo: "sem_permissao"` quando quem chama não é admin nem engenharia;
  - `motivo: "recusado_pelo_banco"` quando o banco recusa (`42501`→403, `55000`→409, `22023`/`23505`/`P0002`→400).

**Pela tela, as funções do banco:**

- `core.desligar_mestre(p_mestre, p_motivo)`: o motivo é obrigatório e o efeito é imediato;
- `core.religar_mestre(p_mestre)`;
- `core.por_mestre_na_obra(p_mestre, p_obra)`: devolve o id do vínculo; repetir não duplica;
- `core.tirar_mestre_da_obra(p_id, p_motivo)`;
- `core.pode_gerir_mestre()`: para a tela saber se mostra os botões.

**O registro `core.acesso_do_mestre`:**

- guarda `cadastrado`, `qr_gerado`, `desligado` e `religado`, com quem e quando;
- só admin e engenharia leem;
- ninguém muda nem apaga.

**Uma decisão minha: o `criar_usuario.py` não ganhou o papel `mestre`.**

- A única porta de entrada do mestre é a função de borda, e é ela que escreve no registro.
- Uma segunda porta deixaria mestre sem registro.

## 3. A D699 §2: o que acontece se a OC mudou antes de a entrega chegar

**A régua do CTO está cumprida:** a entrega vai para o escritório resolver, e nunca some.

### OC cancelada, ou voltada a rascunho

- **A entrega do mestre não é recusada.** Ela vira um **recebimento sem pedido, na fila do escritório**, com a OC
  anotada (`oc_informada_id`).
- **Nada se perde:**
  - o dia e a nota;
  - a foto;
  - o estrago, tirado da resposta de integridade;
  - as três respostas do mestre e a observação, escritas na observação.
- **A resposta é `desfecho: 'na_fila'`**, com uma `mensagem` pronta para a tela, por exemplo:
  "A OC 2026/0xx foi cancelada antes deste recebimento chegar. Ele foi para o escritório resolver."
- **O escritório decide pela fila:** liga a outra OC, ou descarta com motivo.
- **O mesmo envio de novo** devolve `na_fila` com `ja_estava: true`, sem segunda linha (cenário 39).

### O item saiu da OC

- **Não muda nada no banco.** A avaliação de entrega é da OC inteira, não de item, e entra como sempre.
- O escritório vê a entrega na OC e lê a observação do mestre.

### O escritório editou a OC (versão nova)

- **Também não muda nada:** para o mestre, a versão não é conferida.

## 4. Para a OC: as respostas do §1 ao §4

**§1, o endereço.** Lido do servidor hoje, 04/10:

- a lista do Auth da produção tem `https://compras.campisi.com.br/**`;
- o `redirect_to` do QR é `https://compras.campisi.com.br/`, a raiz;
- não precisou de endereço novo.

**§2, a entrega prevista.** Feito, como está no §2.4 acima. A `material_a_chegar` devolve o campo e ordena por ele.

**§3, a chave do envio.** Feito, nas duas funções:

- o índice é único em cada tabela;
- a chave é procurada **de quem chama**;
- a mesma chave devolve `ja_estava: true`.

**§4, a tabela da fila.** Confirmo, com dois acréscimos:

| Resposta | O que a fila faz |
|---|---|
| sem resposta, tempo esgotado, `5xx`, `40001`, `40P01`, `57014` | guarda e tenta de novo |
| **`23505`** | **tenta de novo uma vez.** É o mesmo envio chegando duas vezes ao mesmo tempo; a nova tentativa recebe `ja_estava`. Se vier `23505` outra vez, para |
| `42501`, `55000`, `22023`, `23514`, `P0001`, `P0002` e outro código com mensagem | para de tentar e mostra a mensagem |

**As mensagens que o mestre vê**, escritas como o canteiro fala:

- "Este pedido não é da sua obra." (entrega);
- "Esta obra não é a sua." (sem pedido);
- "Seu acesso foi desligado. Fale com o engenheiro da obra." (qualquer coisa, depois de desligado);
- as de falta de dado (`22023`), por exemplo "Falta o numero da nota.".

**Um caso para a tela decidir:**

- Se o mestre for tirado da obra com envio guardado, o envio volta `42501` e para.
- O que ficou no celular não está no banco.
- **Sugiro que a tela mantenha esse envio à vista**, com a mensagem, para ele mostrar ao engenheiro, em vez de apagar.

## 5. As provas

**Todas no ensaio.**

### O teste

`testes-rls/teste_mestre_da_obra.sql`:

- **no ensaio: 44 OK, 0 FALHOU** (43 cenários, do 0 ao 42; o 1 confere duas vezes);
- **na produção, sozinho:** só o cenário 0, `PULADO`. As funções não existem lá, e o teste diz isso em vez de ficar
  vermelho.

### As nove sabotagens

Todas ficaram vermelhas:

| Sabotagem | Cenários vermelhos |
|---|---|
| QR para quem não é mestre | 4 |
| o `tem_acesso` de antes | 13, 22, 34 |
| sem a guarda nas 9 funções | 23 |
| entrega em qualquer obra | 15, 26, 32, 40 |
| a lista com todas as obras | 14, 17, 19, 31, 32 |
| foto com número de nota | 36 |
| `core.equipe` inteira para o mestre | 22 |
| desligar qualquer perfil | 28, 34 |
| sem a chave do envio | 37, 38, 39 |

### O controle da função de borda

`scripts/controle_acesso_do_mestre.py`: **10 de 10 no ensaio.**

- **Cadastro:** com e-mail e sem e-mail.
- **QR:** o link entra uma vez; o segundo uso dá `otp_expired`.
- **O que o mestre consegue:** lê a lista e arquiva a foto. A foto fica sem identidade de nota, mesmo com extração
  mandada junto. Na obra que não é dele, recebe 403.
- **O link não fica em lugar nenhum:** o pedaço do token aparece **0 vezes no banco e 0 nos logs da função**.
- **A limpeza** apaga tudo o que o controle criou, até o arquivo no storage.

**A sabotagem da borda:** tirei a pergunta `pode_gerir_mestre` da função.

- O controle ficou vermelho em dois pontos (1 e 6), porque a recusa passou a vir com `recusado_pelo_banco`.
- **O banco recusou do mesmo jeito.** É a segunda trava, e ela segurou.
- Desfeita, e a função publicada de novo, igual ao disco.

### O desfazer

`docs/roteiros/desfazer_o_recebimento_pelo_mestre_d693.sql`, **provado no ensaio, dentro de rollback:**

- **As 12 funções voltam iguais.** As 14 digitais conferem: as 12 funções, a vista `core.equipe` e a regra da
  origem.
- Não sobra nada.
- **Ele se recusa a rodar se houver dado**, e isso também foi provado (com a "OC com entrega_prevista"). Os casos:
  - perfil `mestre`;
  - linha nas tabelas novas;
  - avaliação com campo novo;
  - `entrega_prevista` preenchida;
  - documento `recebimento-obra`.
- **O valor `mestre` do enum não sai** (o Postgres não tira valor de enum). Sem uso, ele não dá acesso a nada.

### O teste da D604

`teste_qualificacao_e_entrega.sql` tem **0 falhas** nos dois projetos. O cenário 35 aceita as três chaves novas da
resposta quando a `material_a_chegar` existe.

### Versões no ensaio

- `acesso-do-mestre` v3;
- `arquivar-documento` v10;
- `ler-documento` v1.

## 6. O que o perito precisa saber

1. **O caminho do mestre na `ler-documento` não foi provado no ensaio.**
   - O ensaio não tem a chave do modelo, e a função devolve `503` antes de chegar na porta.
   - O código está no ramo. A prova é na produção, no dia da publicação.
2. **Se o `generateLink` falhar depois de o banco registrar o pedido, o evento `qr_gerado` fica no registro.** Escolha
   minha: o pedido aconteceu.
3. **O log do próprio Auth guarda a chamada `/verify` com o token já gasto.** Esse log é da plataforma, não da
   função, e eu não tenho como apagar. Vale pouco: o token é de uso único e vence em 1 hora.
4. **Gerar um QR novo não derruba a sessão que o mestre já tem.** Para isso é `desligar_mestre`.
5. **A `itens_sem_quantidade` agora recusa o mestre**, como as outras 8.
   - O gatilho da D683 a chama no fim da transação.
   - Na vida real, a única escrita do mestre na OC é emitida→entregue, que sai antes da chamada.
   - Só pesa em teste com dois crachás na mesma transação: o teste fecha os gatilhos como o encarregado.
6. **A produção precisa, na ordem:**
   1. as duas migrations;
   2. as três funções de borda;
   3. o teste;
   4. o controle da borda, que hoje só roda no ensaio e ganharia uma versão de produção com limpeza.

   O roteiro vem na carta da publicação.

**E a D698 do backup:** a carta do desenho (o §3, os sete pontos) vem em seguida, separada deste ramo.
