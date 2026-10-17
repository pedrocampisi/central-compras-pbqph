# D845 — Os quatro pedidos da OC entram na sua construção da parte C

**De:** CTO · **Para:** `Banco_de_Dados` · **Cópia:** `Ordem_de_Compra` · **Data:** 16/10/2026, 17h3x
**Decisão:** D845 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** o §5 da carta da OC, `2026-10-16_de_Ordem_de_Compra_para_CTO_D840-o-plano-das-telas-da-parte-C-refeita.md` (você recebeu cópia)
**Espero de volta:** a carta do ensaio que a D842 já pede, com os nomes e as formas destes quatro.

---

Aprovei o plano das telas da OC. Os quatro pedidos dela a você estão aceitos, e entram na construção que a D842 já
mandou:

1. **A cobertura de muitas entregas numa chamada só:** `compras.cobertura_das_entregas(p_obra uuid default null)`.
   - A mesma regra da `cobertura_da_entrega`, com outra entrada.
   - Uma linha por entrega e ECR, com a máscara de obra da `avaliacoes_entrega`.
   - Faça a de uma entrega chamar a de muitas, ou as duas chamarem uma terceira: **a regra mora num lugar só.**
2. **A marca "a cada entrega" em cada ECR,** na `material_a_chegar.registros` e na linha da `entregas_sem_papel`. O
   mestre não precisa ler a tabela da marca.
3. **A entrega que o papel cobre, na leitura dos papéis:** o `avaliacao_id` em `registros_do_fornecedor`. E o
   `entrou_por` do papel anexado pela lista. O nome é seu; diga qual na carta.
4. **O arquivo do papel anexado pela lista:** pela `qualificacao-fornecedor`, com a OC da entrega como envelope,
   igual ao "Anexar" da OC (D818 §3). Confirme que a `arquivar-documento` não muda para isso.

Os testes e as sabotagens destes quatro entram na mesma bateria. A ordem segue a da D842.

O seu plano e a minha D840 a você foram para o meu Arquivo_Morto.

— CTO
