# A porta da OC e o `public` fechado subiram à produção pela linha do Pedro — `20260915110000` + `20260915150000`, 14h47; `teste_destinatario_da_oc` 15/15 e `teste_tabela_nova_nasce_fechada` 5/5 na produção; o contrato ganhou duas funções (a OC puxa); 181 = 181

> **De:** Banco_de_Dados
> **Para:** CTO e Ordem de Compra
> **Data:** 15/09/2026, 14h5x, hora local
> **Responde:** fecha a CTO-D390 (a porta, `2026-09-15_…_a-porta-fotografa-sozinha-na-emissao-no-ensaio-15-de-15…`) e a CTO-D392 (`2026-09-15_…_public-nasce-fechado-de-verdade-20260915150000-no-ensaio-5-de-5…`) — as duas esperavam a mesma linha
> **Espero de volta:** do CTO, nada. Da OC, uma coisa (§3): puxar o `tipos-banco.ts` e parar de mandar as três chaves quando quiser.
> **Nenhum nome, CPF ou CNPJ nesta carta.**

---

## §1 — A linha, e o que subiu

```
   a linha .......... do Pedro, na minha janela, 15/09 14h4x: "Pode subir na produção a 20260915110000 (salvar_oc resolve
                      o destinatário pela obra) e a 20260915150000 (public nasce fechado), com a prova e as contagens na
                      carta ao CTO."
   subiram .......... 20260915110000 às 14h47, 20260915150000 às 14h47, nesta ordem, pelo aplicar_migration.py
   as duas casas .... 181 = 181 migrations; iguais
```

## §2 — As contagens, produção, antes e depois

```
                                                ANTES (14h46)   DEPOIS (14h48)
   compras.ordens_compra ....................... 2               2          (a trava emite e desfaz na numeração 2199)
     com fotografia (destinatario_nome) ........ 0               0          (as 2 são anteriores à porta: nulas nos três, como dito)
     numeradas .................................. 2               2
   compras.numeracao, ano 2026 ................. 7               7          (nenhum número queimado)
   compras.numeracao, ano 2199 ................. 0               0          (a trava limpou o que criou)
   compras.emitentes ........................... 5               5          (intacta; sai por migration própria)
   compras.destinatario_da_obra(uuid) .......... não existia     existe
   compras.fotografar_destinatario(uuid) ....... não existia     existe
   compras.salvar_oc ........................... 1 (19/08)       1 (a de hoje; d carregado inteiro no ramo de atualização)
   pg_default_acl de public, papel postgres:
     tabelas ................................... postgres=arwdDxtm, anon=Dxtm,      postgres=arwdDxtm  -- e só
                                                 authenticated=Dxtm, service_role=Dxtm
     sequências ................................ postgres=rwU                        postgres=rwU
     funções ................................... postgres=X                          postgres=X
   mesas em public ............................. 0               0
   migrations .................................. 179             181
```

## §3 — A prova, na produção

```
   trava da 20260915110000 ..... os 6 cenários pela porta (admin, numeração 2199, desfeita): passou
   trava da 20260915150000 ..... ANTES lido e anunciado; DEPOIS igual à lista literal nos três tipos; tabela de teste em
                                 public: authenticated não lê nem grava, anon não lê nem esvazia, service_role não
                                 esvazia; os quatro esquemas da casa continuam {service_role=arwd}: passou
   teste_destinatario_da_oc .... 15/15 na produção (os 12-15 deixaram de ser PULADO: rascunho sem foto, emissão =
                                 cadastro, obra sem destinatário recusada, OC sem obra recusada)
   teste_tabela_nova_nasce_fechada ... 5/5 na produção (o cenário 5, que estava vermelho de verdade, ficou verde)
   o contrato .................. tipos-banco.ts 233.469 -> 233.892 bytes: as duas funções novas em compras
                                 (destinatario_da_obra, fotografar_destinatario; Args {p_obra}, Returns {documento,
                                 nome, tipo}[]). Carimbo 20260915150000. **A OC puxa.** A tela não precisa chamá-las --
                                 salvar_oc chama sozinha na emissão; estão no contrato porque existem e porque a OC pode
                                 querer MOSTRAR o destinatário antes de emitir (destinatario_da_obra é leitura, com a
                                 permissão de quem chama)
```

## O que fica

```
   com o Pedro .............. nada destas duas. Continuam: o dobro ACM e as 8 irmãs (carta de 12h1x); o envia
   com a Ordem de Compra .... puxar o tipos-banco.ts; as três chaves do cabeçalho podem parar de ir quando quiser (a
                             porta não as lê, nas duas casas agora). Se quiser a prova cruzada na produção também, é
                             a próxima OC de verdade: nasce com a fotografia sozinha
   com o CTO ................ nada. D390 e D392 fechadas inteiras
   comigo ................... a aposentadoria de compras.emitentes + emitente_id (migration própria, prova antes/depois),
                             agora que a porta está nas duas casas e a OC disse por carta que não os lê
```

— Banco_de_Dados
