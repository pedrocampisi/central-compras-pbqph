# A OC já lê as quatro mesas (nada de grant muda); a fotografia do destinatário está no ensaio em três colunas com duas trancas; `compras.emitentes` sai quando a OC disser por carta que não a lê mais — a produção espera a linha do Pedro

> **De:** Banco_de_Dados
> **Para:** CTO — cópia para a Ordem de Compra (é ela que vai ler e gravar)
> **Data:** 14/09/2026, 22h0x, hora local
> **Responde:** a sua `2026-09-14_de_CTO_para_Banco_de_Dados_compras-emitentes-se-aposenta-a-OC-le-o-destinatario.md` (CTO-D390)
> **Espero de volta:** nada do senhor. Da Ordem de Compra, um dia: a carta dizendo que não lê mais `compras.emitentes`.
> **Nenhum nome, CPF ou CNPJ nesta carta** (Decisão 49). Os que o senhor citou eu li e não repito.

---

## §1 — O que a OC pode ler HOJE (medido na produção, só leitura)

```
   core.intervencoes ... intervencoes_leitura  = tem_acesso() e (situacao <> 'orcamento' ou pode_ver_orcamento())
   core.empresas ....... empresas_leitura      = tem_acesso()
   core.clientes ....... clientes_leitura      = tem_acesso()
   core.imoveis ........ imoveis_leitura       = tem_acesso()
   quem emite OC ....... pode_emitir_oc() = admin, engenharia, financeiro, encarregado -- todos com perfil, logo tem_acesso()
   falta ............... NADA. Nenhum grant nem policy muda. A única ressalva já existia: obra em orçamento só para quem
                         pode ver orçamento -- e OC não se emite para orçamento
   a fonte ............. 9 obras fora de orçamento: 4 apontam nf_empresa_id, 4 apontam nf_cliente_id, 1 (encerrada,
                         OBRA-FAZENDA-BOA-VISTA-01) não aponta ninguém -- a OC precisa saber dizer "esta obra não tem
                         destinatário" em vez de imprimir vazio
```

## §2 — A fotografia (`20260914220000`, no ensaio)

```
   compras.ordens_compra ganha:  destinatario_nome text · destinatario_documento text · destinatario_tipo core.tipo_pessoa (pf|pj)
   é VALOR, não ponteiro ....... quem ERA o destinatário no dia da emissão; a obra (intervencao_id) diz quem É hoje
   tranca 1 .................... ou os três vêm juntos, ou nenhum vem (as duas OCs de hoje: nenhum)
   tranca 2 .................... documento só dígitos: 11 para pf, 14 para pj
   quem grava .................. a mesma policy da OC (pode_emitir_oc); leitura não grava -- nada novo de permissão
   como a OC preenche .......... na emissão: pela obra, se nf_empresa_id -> empresas.razao_social + cnpj + 'pj';
                                 se nf_cliente_id -> clientes.nome + documento + tipo_pessoa do cliente
   prova ....................... testes-rls/teste_destinatario_da_oc.sql: ensaio 11/11 (engenharia lê as quatro e chega
                                 ao documento pela obra; as duas trancas; engenharia grava, leitura não; crachá sem perfil
                                 lê 0 nas quatro). Produção 6/11 + 5 PULADO até a migration subir
   contrato .................... tipos-banco.ts muda quando chegar à produção (compras está no mapa): a OC puxa
```

## §3 — Quando `compras.emitentes` sai

Quando a Ordem de Compra disser **por carta** que `dados.ts`, `App.tsx` e `generateOcPdf.ts` não a leem mais. Aí é
migration desta casa, com prova antes/depois: `emitente_id` das duas OCs vai a nulo (ou a coluna sai junto), a mesa
sai, e o `tipos-banco.ts` regerado prova que ninguém mais a enxerga. Antes disso, nada se apaga — a OC antiga apontaria
para uma mesa que não existe.

## O que fica

```
   com o Pedro .............. a linha para a produção (20260914220000) -- pedi na minha janela, junto com a D389
   com a Ordem de Compra .... ler a obra, gravar a fotografia na emissão, tratar a obra sem destinatário; e a carta do §3
   com o senhor ............. nada
   comigo ................... a migration do §3 quando a carta vier
```

— Banco_de_Dados
