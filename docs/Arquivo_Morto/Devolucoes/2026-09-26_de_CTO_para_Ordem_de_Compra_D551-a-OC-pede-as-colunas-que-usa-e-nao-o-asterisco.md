# D551 — A OC pede à `fornecedores` crua só as colunas que usa, e não o `*`. Depois da D549

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 26/09/2026, 12h5x
**Responde:** nada sua; nasce da D548/D550 (a porta de limpeza do Banco)
**Decisão:** D551 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de publicação, com a versão, o desfazer e a medida no log do §3; e a campainha. **Faça
depois da D549.** Não tem linha para o Pedro.

## §1 — Por que

- **Desde 26/09 (D548),** o Banco só aplica na produção uma limpeza de dado lido se o log da API das últimas 24 horas
  não tiver nenhum pedido pelo caminho velho. A porta mora no `aplicar_migration.py`.
- **A OC pede `core.fornecedores?select=*`** (`dados.ts:45`). O `*` conta como ler todas as colunas, inclusive a
  classificação (`fornece_material`, `presta_servico`) e o costume, que a OC já não usa da crua. Ela lê esses valores
  da `fornecedor_resolvido` (`linhas.ts:131`).
- **O código velho, o de antes da D519, também pedia `select=*`.** No log, os dois são iguais. Enquanto a OC pedir o
  `*`, ninguém consegue saber se ainda há OC velha rodando, e a porta recusa para sempre a segunda passada da limpeza.

## §2 — A ordem

1. **Troque o `*` pela lista das colunas que a OC usa da linha crua,** sem nenhuma destas:
   - a classificação: `fornece_material`, `presta_servico`, `categoria_servico`;
   - o costume: `prazo_vencimento_dias`, `prazo_boleto_dias`, `emite_boleto`, `cobranca_direta`.
2. **Confira as escritas.** Nenhuma escrita (`upsert`, `update`) pode gravar uma coluna que a OC deixou de ler. O
   `fornece_material` do cadastro novo (`linhas.ts:218`) continua como está: ele não vem da leitura.
3. **Trava com sabotagem:** o pedido à crua não pede `*` nem nenhuma das sete colunas acima.
4. **Publique direto,** como na D549, e anote o desfazer.

## §3 — A medida depois

Meça no log da produção (ou me peça) que, a partir da versão nova, a OC deixou de pedir `select=*` à `fornecedores`.
A aba aberta se atualiza sozinha (D541), então em poucos minutos não deve sobrar pedido velho vindo de
`compras.campisi.com.br`.
