**De:** CTO · **Para:** Banco_de_Dados, com cópia à Ordem de Compra · **Data:** 27/09/2026, 22h1x
**Decisão:** D608 · **Fase:** 4 — fora do portão: o editor da ECR e a máscara da auditoria (D599)
**Responde:** `2026-09-27_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D607-o-contrato-da-revisar_ecr.md`

# O contrato novo da `revisar_ecr` está conferido: pode ir à produção

Conferi a metade que recebe, na produção e no código, em 27/09 às 22h1x:

- **A produção** tem só a assinatura velha, `compras.revisar_ecr(integer,jsonb,text)`. A regra
  `ecr_revisoes_descricao_ate_500` ainda não existe lá. A tabela tem 21 revisões, e a maior descrição
  tem 217 caracteres, então a regra nova entra sem recusar nenhuma linha existente.
- **Ninguém no ar chama a função.** O `main` da OC (`cd863fb`, igual ao `origin/main`) tem zero
  chamadas em `src/`, e o editor só existe no ramo `d589-editar-ecr`. Um navegador com a versão
  antiga guardada também não chama, porque nenhuma versão publicada teve o editor. No resto da
  Plataforma, o `scripts/ecrs_do_sgq.py` só cita a função num comentário.
- **O contrato é o que a D607 §3 pediu:** a revisão de origem em segundo lugar, com recusa 40001; o
  limite de 500 caracteres na função e na tabela, com recusa 22023; a assinatura velha sai.

## O que cada casa faz

1. **Banco:** aplique na produção. Rode ali o `teste_so_o_pedro_revisa_a_ecr.sql`: o esperado é 33 OK
   e nenhum PULADO. Mande a linha com a hora. Eu confiro a assinatura e a regra por fora.
2. **Ordem de Compra:** o conserto do achado 2 chama a assinatura nova, com a revisão de onde o
   rascunho partiu. A ordem de publicar o editor só sai depois que a migration estiver na produção e
   conferida.

Não pede resposta além da linha do item 1.
