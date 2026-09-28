# D609: a qualificação e a avaliação na entrega estão na produção desde as 12:57; as duas travas nasceram desligadas

> **De:** Banco_de_Dados
> **Para:** CTO e `Ordem_de_Compra`
> **Data:** 28/09/2026, 13h0x
> **Responde:** `2026-09-28_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D609-lista-ok-travas-depois-da-tela.md`, §2
> **Espero de volta:** nada agora. **No dia em que a OC tiver as telas da D604**, a ordem de ligar as travas (§2).
>
> Nenhum CPF, CNPJ, endereço, e-mail ou nome de gente nesta carta.

---

## §1 — A linha pedida

A migration `20260927220000` foi aplicada na **produção às 12:57:1x**. A porta da D548 passou: ela só acrescenta.
- **A prova de aceite passou por dentro da migration.** A 2026/008 saiu com `emite = true`; se não saísse, nada entrava.
- **As três OCs emitidas da produção** saem assim na vista `compras.oc_qualificacao`:
  - 2026/004, ECR 12;
  - 2026/005, ECR 19;
  - 2026/008, ECR 12.

  As três estão qualificadas, sem ECR faltando, com `emite = true`.
- **Na produção agora:** 15 qualificações e 11 pares com ECR. As duas travas estão com `tgenabled = 'D'` (desligadas).
- **O teste `testes-rls/teste_qualificacao_e_entrega.sql` na produção**, em begin/rollback, às 12:57:26, deu **27 OK e 8
  PULADO**. Nenhum falhou.
- **O mapa `compartilhado/tipos-banco.ts`** foi regerado da produção, de 266053 para 279724 bytes.
- **O restaurador de backup** (`scripts/restaurar_backup.py`) conhece as cinco tabelas novas, na ordem das chaves.
  A conferência acusou a falta no mesmo dia, como devia. Os números da qualificação e da avaliação voltam como estavam,
  porque as ECRs e a ciência apontam para eles.

## §2 — Como as travas ficam para depois (o que você pediu para eu dizer)

**Escolhi criá-las desligadas, na mesma migration.**
- Os dois gatilhos (`oc_emitida_exige_qualificacao` e `oc_item_exige_qualificacao`) são criados e, logo em seguida,
  desligados com `alter table … disable trigger`. Não existe nenhum instante com a trava ligada na produção.
- **Duas travas, dois gatilhos, mas não um para cada.** O primeiro carrega as duas regras: a emissão e o "entregue só com
  avaliação". O segundo carrega a da emissão pelos itens. Desligando os dois, as duas regras ficam fora.

**Para ligar**, a migration já está escrita, em `docs/roteiros/ligar_as_travas_da_d604.sql`. São dois
`enable trigger` e uma trava que confere se ligou. No dia:
1. quando a OC tiver as telas prontas para o teste de comportamento, o arquivo vira migration e vai **ao ensaio**. A OC
   testa ali com a trava de verdade;
2. logo **depois** de a OC publicar as telas, vai **à produção**. A tela vem primeiro, a trava depois.

**Por que não uma migration separada agora:** ela ficaria no disco sem subir por semanas. A conferência acusaria "migration
no disco sem estar no banco" todo dia, e o aviso de verdade se perderia no meio.

**O ensaio:** ele tinha a versão de ontem, com as travas ligadas. Ali eu desfiz a migration pelo roteiro de desfazer (sem
uso, a trava do roteiro deixou), limpei a linha do histórico e reapliquei a versão nova, às 12:56:26 e 12:56:38. Agora o
ensaio está igual ao arquivo, com as travas desligadas.

## §3 — Como o teste sabe que as travas estão PULADAS

- **Ele lê o banco.** Conta os dois gatilhos em `pg_trigger` com `tgenabled <> 'D'`. Só com os dois ligados ele considera as
  travas ligadas.
- **Desligadas:** os oito cenários que dependem delas (9, 11, 12, 14, 15, 18, 21 e 25) **não escrevem nada**. Cada um diz
  `PULADO: as travas da D604 estao desligadas ate a tela (D609)`. Os outros 27 rodam.
- **Ligadas:** os oito rodam sozinhos. Ninguém precisa mexer no teste.
- **A prova no ensaio, em begin/rollback:**
  - com a migration nova, 27 OK e 8 PULADO (12:55:19);
  - com o roteiro de ligar por cima, 35 OK (12:55:23).
- **A conferência (`scripts/conferir_tudo.py`) aprendeu a diferença.**
  - **Bateria que não rodou nada**, porque a migration ainda não chegou: continua amarela.
  - **Bateria que rodou com cenários PULADOS de propósito:** conta só os OK, e a frase diz quais baterias têm PULADO e
    quantos. Hoje é "teste_qualificacao_e_entrega.sql (8 de 35)", para ninguém ler como provado.
  - As baterias antigas escrevem o cenário 0 pulado como "PULADO … OK". Essa linha não conta como cenário que rodou.

## §4 — O que fica

- **Os 9 sem cadastro:** a decisão é do Pedro (D609 §3).
- **`compras.fornecedor_ecrs`:** como está.
- **O desfazer** (`docs/roteiros/desfazer_a_qualificacao_dos_fornecedores_d604.sql`) não foi rodado na produção. Ele recusa
  depois do primeiro uso.
