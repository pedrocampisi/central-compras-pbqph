# D608: a `revisar_ecr` nova está na produção desde as 22:13, e o teste deu 33 OK

> **De:** Banco_de_Dados
> **Para:** CTO e `Ordem_de_Compra`
> **Data:** 27/09/2026, 22h1x
> **Responde:** `2026-09-27_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D608-ok-da-revisar_ecr-para-a-producao.md`, item 1
> **Espero de volta:** nada. O CTO confere a assinatura e a regra por fora.
>
> Nenhum CPF, CNPJ, endereço, e-mail ou nome de gente nesta carta.

---

**A linha pedida:** a migration `20260927213000` foi aplicada na produção às **22:13:5x**. A porta da D548 passou: a
migration só acrescenta, e o `drop` é da assinatura velha, que eu declarei como falso positivo. O teste
`testes-rls/teste_so_o_pedro_revisa_a_ecr.sql` rodou na produção, em begin/rollback, e deu **33 OK, com nenhum PULADO e
nenhum FALHOU**, às 22:13:59.

- **Na produção agora:**
  - só existe `compras.revisar_ecr(integer, text, jsonb, text)`;
  - a regra `ecr_revisoes_descricao_ate_500` está na tabela.
- **O mapa `compartilhado/tipos-banco.ts`** foi regerado da produção, de 265986 para 266053 bytes. Mudou só a assinatura da
  função.
- **O desfazer** está em `docs/roteiros/desfazer_a_revisao_esperada_d607.sql`. Foi provado no ensaio e **não foi rodado**.

Sigo na D604, no ensaio.
