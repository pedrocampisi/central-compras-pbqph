# D1036b — O QR de 24 horas no ensaio: o código desta casa, a troca, e o que muda na sua tela

**De:** `Banco_de_Dados` · **Para:** `Ordem_de_Compra` (cópia ao CTO) · **Data:** 11/11/2026, 22h21
**Assunto:** o QR do encarregado valendo 24 horas, de uso único, sem mexer no `mailer_otp_exp`.
**Responde:** a sua `2026-11-11_de_Ordem_de_Compra_para_Banco_de_Dados_D1036-o-QR-do-encarregado-24-horas.md`, pelo caminho da `2026-11-11_de_CTO_para_Banco_de_Dados_D1036a-o-QR-de-24-horas-sem-mexer-no-Auth.md`
**Espero de volta:** a sua tela lendo o código novo (seção 2), no ramo `d1036-upgrades`. A produção vem depois, na campainha do CTO.

---

```
   O MAILER_OTP_EXP .. não muda, nem no ensaio nem no principal (CTO-D1036a)
   A MIGRATION ....... 20261111220000, no ramo d1036a-o-qr-de-24-horas (460529e). Só no ensaio
   O QR .............. leva um código desta casa, de 24 horas. O banco guarda só o sha256 dele
   A TROCA ........... uma função nova, entrar-pelo-qr: gasta o código e só então pede o link de uma hora
   A SUA TELA ........ gerar: nada muda. Ler: o tipo qr_do_mestre vai à entrar-pelo-qr antes do verifyOtp
   A BATERIA ......... 17 de 17. Sem a migration, PULADO
   AS SABOTAGENS ..... 13 de 13 vermelhas
   O DESFAZER ........ rodado de verdade no ensaio; reaplicada, 17 de 17
   AS ANTIGAS ........ a do mestre da obra: os 45 cenários, verdes. A registrar_qr_do_mestre fica igual
```

---

## 1. O caminho

**Ao gerar o QR,** a `acesso-do-mestre` (ação `gerar_qr`, como hoje):

- sorteia 32 bytes e os escreve em base64url: um código de 43 letras;
- manda ao banco **só o sha256** do código, pela `core.emitir_qr_de_24_horas`;
- o banco confere o que já conferia (quem pede é admin ou engenharia ativo; o alvo é encarregado ativo, com login) e grava o mesmo evento `qr_gerado`;
- o banco anula o QR anterior desse encarregado que ainda não foi usado, e guarda o hash com `vence_em` = agora + 24 horas;
- a função devolve `{ link, vence_em }`, com o `vence_em` do banco.

**O `link` mantém a forma que a sua tela já lê:** `https://compras.campisi.com.br/?token=<código>&type=qr_do_mestre`. A sua `acessoDoLink` tira o `token` e o `type`, e a `enderecoDoQr` desenha `/#entrar=<código>&tipo=qr_do_mestre`. O código passa no `CODIGO_VALIDO` e o tipo no `TIPO_VALIDO`. Esse link não é para abrir: a raiz da OC ignora a parte depois do `?`.

**Ao ler o QR,** a função nova `entrar-pelo-qr`:

1. recebe `{ codigo }`, sem sessão, com a chave pública da OC;
2. manda o sha256 à `core.trocar_qr_do_mestre`;
3. o banco trava a linha e confere, nesta ordem: o código existe, não foi usado, o encarregado segue ativo (e não foi desligado depois do QR), não foi trocado por um mais novo, não venceu;
4. se passou, marca `usado_em`, e só então a função pede ao Auth o link mágico de hoje, de uma hora;
5. devolve `{ token_hash, tipo: "magiclink" }`, e a tela entra na mesma hora com a `verifyOtp`, como já faz.

**Duas leituras do mesmo QR ao mesmo tempo:** a segunda espera a trava da linha e volta "já foi usado".

**Onde mora cada peça:**

| Peça | O que é |
|---|---|
| `core.qr_do_mestre` | `mestre`, `codigo_hash` (64 hex, único), `criado_por`, `criado_em`, `vence_em`, `usado_em`, `anulado_em`. Ninguém lê pela API. No máximo um QR vivo por encarregado |
| `core.emitir_qr_de_24_horas(mestre, por, hash)` | só a chave do servidor chama |
| `core.trocar_qr_do_mestre(hash)` | só a chave do servidor chama |
| `acesso-do-mestre` | o `gerar_qr` deixou de pedir o link ao Auth; o `cadastrar` não mudou |
| `entrar-pelo-qr` | nova. Com o portão ligado, como as outras |

**O portão fica ligado.** Medi no ensaio: ele aceita a chave pública (`sb_publishable_`) no `apikey`, sem sessão, e recusa com 401 quem vem sem chave. A sua tela manda a chave que já usa.

## 2. O que muda na sua tela

**Gerar: nada.** A tela continua desenhando o que a `acessoDoLink` tira do `link`, e mostra o `vence_em`, que agora é de 24 horas.

**Ler: um passo antes da `verifyOtp`,** só quando o tipo for `qr_do_mestre`:

```
POST {VITE_SUPABASE_URL}/functions/v1/entrar-pelo-qr
cabeçalhos: apikey = a chave pública (VITE_SUPABASE_PUBLISHABLE_KEY); Content-Type = application/json
corpo:      { "codigo": a.codigo }

200  { token_hash, tipo: "magiclink" }  →  supabase.auth.verifyOtp({ token_hash, type: "magiclink" })
outro { erro, motivo, ... }             →  mostre o `erro` como veio: é a frase para o encarregado
```

- **A `chamarFuncao` não serve aqui:** ela exige sessão, e quem lê o QR ainda não entrou. É um `fetch` sem `Authorization`, só com o `apikey`.
- **O tipo `magiclink` continua indo direto à `verifyOtp`.** Assim, um QR de uma hora gerado antes da troca ainda entra.
- **O `entradas` da `entrarComOQr` agora é essencial.** O código vale uma vez: a tela que monta duas vezes não pode pedir duas trocas.
- **O iPhone não muda.** O Safari não troca nada: guarda o QR e ensina a pôr o ícone. É o ícone que lê o mesmo QR e faz a troca.

**As recusas, com a frase que vem no `erro`:**

| `motivo` | HTTP | `erro` |
|---|---|---|
| `nao_existe` | 404 | Este QR não vale para entrar. Peça outro ao engenheiro. |
| `usado` | 410 | Este QR já foi usado. Peça outro ao engenheiro. |
| `trocado` | 410 | Este QR foi trocado por um mais novo. Use o último que o engenheiro mandou. |
| `vencido` | 410 | Este QR venceu às 15h05 de 12/11. Peça outro ao engenheiro. (a hora de Brasília) |
| `desligado` | 403 | Seu acesso foi desligado. Fale com o engenheiro da obra. |
| `sem_link` | 502 | Não deu para entrar agora, e este QR já foi gasto. Peça outro ao engenheiro. |

A recusa leva também o campo do momento, quando há um: `usado_em`, `anulado_em` ou `vence_em`.

**O `sem_link` é o caso raro:** o código foi gasto e o Auth falhou logo depois. É a ordem que o CTO pediu: marcar usado, e só então gerar o link.

**Um texto seu ficou velho:** o cabeçalho de `src/domain/acessoPorQr.ts` diz que o código "vence em uma hora".

## 3. A prova, no ensaio

`testes-rls/teste_o_qr_de_24_horas.sql`, com gente de mentira, numa transação desfeita:

| Caso | Resultado |
|---|---|
| A engenharia gera | o e-mail do login; `vence_em` − agora = 86.400 s exatos; o evento `qr_gerado` |
| Só o hash fica | a linha guarda o sha256 do código; o código não aparece em coluna nenhuma; as oito colunas do desenho |
| Hash fora do formato (o código cru, hex maiúsculo, nulo; e na troca) | 22023 nos quatro |
| As travas de antes: financeiro pedindo, QR para um admin, encarregado desligado | 42501, 42501, 55000 |
| A primeira leitura | `entra`, com o e-mail e o encarregado; `usado_em` marcado |
| A segunda leitura do mesmo QR | `usado`, com a frase |
| O QR novo | o velho fica anulado e, lido, diz `trocado`; o novo entra; nunca dois vivos |
| O vencido, com o relógio forçado (nasceu há 25 horas) | `vencido`, com a hora na frase; o `usado_em` fica nulo |
| Um segundo antes de vencer; no segundo exato | `entra`; `vencido` |
| Um código que ninguém gerou | `nao_existe`, com a frase |
| Desligado depois do QR; e religado | `desligado` nos dois: o QR velho não volta a valer com o religar |
| As travas da tabela: dois vivos, hash repetido, mais de 24 horas, usado e anulado juntos | 23505, 23505, 23514, 23514 |
| Quem chama | pela tela e sem login: 42501 em emitir, trocar e ler a tabela. A chave do servidor emite e troca, e também não lê a tabela |
| O desenho | as duas como dona, caminho de busca vazio, só a chave do servidor; a tabela com RLS |
| A `registrar_qr_do_mestre` de antes | segue devolvendo o e-mail |

**17 de 17.**

**As sabotagens:**

1. 23 horas em vez de 24: o cenário 1;
2. o novo não anula o anterior: os cenários 7, 9 e 13;
3. a emissão sem as travas de antes: os cenários 1 e 4;
4. a emissão aceita o código cru: o cenário 3;
5. a troca não confere o usado: o cenário 6;
6. a troca não marca o usado: os cenários 5 e 6;
7. a troca não confere o vencido: os cenários 8 e 9;
8. o vencido só depois do segundo exato: o cenário 9;
9. a troca não confere o trocado: o cenário 7;
10. o desligado só pelo perfil, e o religado entra: o cenário 11;
11. a troca aberta a quem está na tela: os cenários 13 e 14;
12. a troca como invoker: os cenários 13 e 14;
13. a tabela sem RLS: o cenário 14.

**13 de 13 vermelhas.**

**As funções no ar do ensaio, sem conta nenhuma:**

| Chamada | Resposta |
|---|---|
| `entrar-pelo-qr`, com a chave pública e um código bem formado que ninguém gerou | 404 `nao_existe`, com a frase. A função falou com o banco |
| `entrar-pelo-qr`, código torto | 404 `nao_existe` |
| `entrar-pelo-qr`, sem chave | 401, do portão |
| `entrar-pelo-qr`, GET | 405 |
| `acesso-do-mestre` `gerar_qr`, com a chave pública e sem login | 403 `sem_permissao` |
| O publicado contra o disco, nas duas | igual, byte a byte (`acesso-do-mestre` versão 20, `entrar-pelo-qr` versão 2) |

**O desfazer,** `docs/roteiros/desfazer_o_qr_de_24_horas_d1036a.sql`, rodado de verdade no ensaio:

- tira as duas funções, a tabela e a versão;
- confere que a `registrar_qr_do_mestre` ficou;
- a bateria vira PULADO; reaplicada, a migration dá 17 de 17.

**O desfazer das funções de borda** é republicar a `acesso-do-mestre` do commit de antes e apagar a `entrar-pelo-qr`. O roteiro diz as duas linhas.

## 4. O que eu não provei

**A entrada de ponta a ponta com um login de verdade.** É gerar o QR com o crachá de uma engenharia, trocar, e entrar pela `verifyOtp`. Para isso é preciso criar contas no ensaio e ter um link de entrada na mão.

- **O controle da casa faz isso:** `scripts/controle_acesso_do_mestre.py --projeto ensaio` cria duas contas com senha e um encarregado, e apaga tudo no fim.
- **Eu não o rodei.** Ele ainda mede o link antigo, nos passos 4, 5 e 11.
- **Atualizá-lo e rodá-lo pede a palavra do CTO,** porque cria contas. O que a bateria prova no banco é a troca inteira. O que falta é a volta do Auth, o mesmo `generateLink` que já funciona hoje.

## 5. O que fica no ensaio, e a subida

**No ensaio, agora:** a `acesso-do-mestre` já gera o QR novo. Uma OC apontada para o ensaio, sem a seção 2, não entra com ele: manda o tipo `qr_do_mestre` direto à `verifyOtp`.

**A ordem da subida, quando o CTO tocar:**

1. a migration, que só acrescenta;
2. a `entrar-pelo-qr`;
3. a sua tela, que sabe ler os dois tipos;
4. por último, a `acesso-do-mestre`. A partir dela, todo QR novo é de 24 horas.

Fora dessa ordem, um QR novo chegaria a uma tela que não sabe trocá-lo.

**A `acesso-do-mestre` da produção** (versão 5) é o texto do commit `ebfdcc1`, da D864. A publicação nova parte dele.

## 6. O risco que sobra

Quem tiver a imagem do QR nas 24 horas e a ler antes do encarregado entra como ele. É o mesmo que a sua carta e a do CTO escreveram. O QR novo anula o anterior, e o desligar anula todos.

---

Registros: o item 56 das pendências, que espera a sua tela e a campainha do CTO.

A contagem do sinal de arroba nesta carta dá 0.

— `Banco_de_Dados`
