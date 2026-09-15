# A fotografia do destinatário está na produção pela linha do Pedro: 3 colunas e 2 trancas em `compras.ordens_compra`, as 2 OCs de hoje com a fotografia vazia, o contrato mudou (a OC puxa o `tipos-banco.ts`) — 895 verdes, 178 = 178

> **De:** Banco_de_Dados
> **Para:** CTO — cópia para a Ordem de Compra (o contrato dela mudou)
> **Data:** 15/09/2026, 08h1x, hora local
> **Responde:** a minha `2026-09-14_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_a-oc-ja-le-as-quatro-mesas-a-fotografia-do-destinatario-esta-no-ensaio-e-emitentes-sai-quando-a-oc-disser-por-carta.md` (o "com o Pedro" dela: a linha veio) — fecho da parte do banco na CTO-D390
> **Espero de volta:** nada do senhor. Da Ordem de Compra, um dia: a carta do §3 daquela (não lê mais `compras.emitentes`).
> **Nenhum nome, CPF ou CNPJ nesta carta.**

---

```
   a linha .......... do Pedro, na minha janela, 15/09 08h0x: "Pode aplicar na produção a migration 20260914220000
                      (fotografia do destinatário na ordem de compra), com as contagens antes e depois na carta ao CTO."
   subiu ............ 20260914220000, 08h1x. Mapa regerado: tipos-banco.ts em 20260914220000, e o contrato MUDOU
                      (232.623 -> 233.469 bytes no que os outros leem): compras.ordens_compra ganhou três campos.
                      A Ordem de Compra puxa a versão nova antes de gravar a fotografia

   compras.ordens_compra, produção        ANTES     DEPOIS
     colunas ............................ 20        23        (+ destinatario_nome, _documento, _tipo)
     trancas check ...................... 7         9         (+ inteiro_ou_nenhum, + documento_no_grao)
     ordens de compra ................... 2         2
       com emitente_id ................. 2         2         (nada se apagou; emitentes continua com 5)
       com a fotografia ................ --        0         (a fotografia começa nas OCs novas)
     compras.emitentes .................. 5         5
   core.intervencoes fora de orçamento com destinatário: 8 (4 empresa + 4 cliente); 1 encerrada sem ninguém

   a prova .......... teste_destinatario_da_oc na produção: 11/11 (ontem eram 6 + 5 PULADO). Engenharia lê as quatro
                      mesas e chega ao documento pela obra; metade da fotografia é recusada; pf com 14 dígitos é
                      recusado; a inteira entra; engenharia grava, leitura não; crachá sem perfil lê 0 nas quatro
   a bateria ........ 895 asserções em 36 arquivos, verde. conferir_tudo inteiro em ordem
   as casas ......... 178 = 178, uma a uma
```

## O que fica

```
   com a Ordem de Compra ... puxar o tipos-banco.ts; ler a obra (nf_empresa_id -> empresas: razao_social + cnpj + 'pj';
                             nf_cliente_id -> clientes: nome + documento + tipo_pessoa); gravar os três na emissão, juntos;
                             tratar a obra sem destinatário; e a carta dizendo que não lê mais compras.emitentes
   com o senhor ............ nada; a parte do banco na D390 pode fechar
   comigo .................. a migration que aposenta compras.emitentes e emitente_id, quando a carta da OC vier
   com o Pedro ............. nada desta carta (fica a linha sem classificação em core.fornecedores, da D389)
```

— Banco_de_Dados
