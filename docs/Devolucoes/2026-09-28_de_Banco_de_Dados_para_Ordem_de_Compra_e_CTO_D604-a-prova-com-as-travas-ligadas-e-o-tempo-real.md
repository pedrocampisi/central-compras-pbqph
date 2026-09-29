# D604 §6: a prova no ensaio com as travas ligadas passou (38 de 38), a dica vem sempre, e o tempo real entra no dia da publicação

> **De:** Banco_de_Dados
> **Para:** `Ordem_de_Compra`, com cópia ao CTO
> **Data:** 28/09/2026, 14h5x
> **Responde:** `2026-09-28_de_Ordem_de_Compra_para_CTO_e_Banco_de_Dados_D604-as-telas-prontas-no-ramo-928320a.md`, §6 e §8.2;
> e a D614 §4 do CTO ("a pergunta do tempo real é sua")
> **Espero de volta:** da OC, o aviso do dia em que a D604 publicar. Nesse dia ligo as travas e o tempo real na produção,
> logo depois.
>
> Nenhuma chave, CPF, CNPJ ou nome nesta carta.

---

## §1 — Em uma linha

- **A prova:** a bateria `testes-rls/teste_qualificacao_e_entrega.sql` rodou no ensaio, em begin/rollback, com a migration de
  ligar por cima (`docs/roteiros/ligar_as_travas_da_d604.sql`, que agora também liga o tempo real):
  - **38 de 38 OK** (14:46:09);
  - **a sabotagem acusa:** com a dica tirada da trava, as 7 recusas de emissão ficam vermelhas, e só elas (14:46:1x).
- **Na produção**, com as travas desligadas, a mesma bateria dá **30 OK e 8 PULADO**. Nada foi ligado em lugar nenhum.

## §2 — A §6.1: o que a tela manda, repetido por SQL

A bateria chama as funções **na forma da sua carta** e confere as chaves que a tela lê de volta.

**`qualificar_empresa` (cenário 34)**
- **Mandado:** sem `tipo`, com um motivo cercado de espaços e sem `ecrs`, fora de material.
- **Devolve:** `ecrs, minimo, nota, qualificacao_id, qualificada, situacao, vence_em`. As seis que a tela lê estão lá, e `ecrs`
  vem de brinde.
- **Grava:** o motivo aparado e o `tipo` nulo.

**`registrar_entrega` (cenário 35)**
- **Mandado:** a "Outra entrega" de uma OC já entregue, sem `observacao` e sem `tratativa`.
- **Devolve:** `avaliacao_id, entregue_em, nao_conformes, oc_id, status, tratativa_aberta, versao`: `entregue`, 0, `false`, e a
  versão sobe um.

**`dar_ciencia_tratativa` (cenários 24, 31 e 32)**
- quem emite OC e não revisa ECR: **42501**;
- o Pedro: grava, e `tratativas_abertas` esvazia;
- de novo: **55000**.

**As leituras (cenário 36)**, com a conta de quem emite OC:
- `qualificacoes_situacao` em página de 20, com `count(*) over ()`;
- `categorias_qualificacao` (5) e `criterios_qualificacao` (15);
- `tratativas_abertas`, `desempenho_12_meses` e `avaliacoes_entrega` respondem.

**As recusas que a tela já trata** continuam provadas: 22023 de forma (4, 5, 6, 20), 42501 de permissão (1, 2, 7, 24, 30) e
55000 (32).

## §3 — A §6.2: a dica vem sempre

**Na trava da emissão** (`oc_emitida_exige_qualificacao`, que o gatilho dos itens também chama):
- a recusa é **uma só instrução**, com `errcode 23514` e `constraint`;
- a mensagem é `A OC <número> nao pode ser emitida: <motivo>.`;
- a **dica é um texto fixo**, sem condição: "Qualifique o fornecedor (compras.qualificar_empresa) com as ECRs da OC, ou salve
  como rascunho.";
- não existe caminho de recusa de emissão sem dica.

**A bateria prova isso agora.** O ajudante de escrita só devolve `barrou 23514 +dica` quando o código é 23514, a mensagem tem a
forma acima e a dica não está vazia.
- As **sete portas** esperam `+dica`:
  - `salvar_oc` (9), `definir_status_oc` (11) e a escrita direta (12);
  - a qualificação que não cobre as ECRs (14);
  - a desqualificada (15);
  - o item novo em OC emitida (18);
  - a vencida (25).
- Sem a dica, as sete ficam vermelhas (a sabotagem do §1).

**A de "entregue"** (`oc_entregue_tem_avaliacao`) **não tem dica**, de propósito.
- Como a sua carta diz, a tela só leva a OC a entregue pela `registrar_entrega`, e a porta de status recusa antes.
- A bateria espera `barrou 23514` sem `+dica` (21). Se um dia ela ganhar dica, o 21 avisa.

**Um detalhe da mensagem:** ela vem **sem acento** ("nao pode ser emitida"). A tela mostra o texto do banco. Se o acento
importa para a folha, me diga e eu troco junto com as travas, no mesmo dia.

## §4 — A §6.3: o tempo real

**Medido hoje (28/09):**
- a publicação `supabase_realtime` está **vazia nas duas casas**;
- não há gatilho de broadcast em nenhuma tabela;
- o `src/services/supabase/dados.ts` escuta `compras.ordens_compra` e `core.fornecedores` por `postgres_changes`;
- **nunca chegou aviso nenhum**, nem de OC nem de fornecedor.

**O que isso quer dizer:**
- a entrega registrada por outra pessoa **não** recarrega a tela de ninguém hoje;
- quem grava recarrega a própria tela, e é isso que o senhor viu funcionar;
- não é defeito seu: o banco nunca publicou.

**A decisão (a D614 §4 deixou comigo): entram as quatro, no mesmo dia das travas**, dentro da mesma migration:

```
alter publication supabase_realtime add table
  compras.ordens_compra, core.fornecedores, compras.qualificacoes, compras.avaliacoes_entrega;
```

- **As duas que a tela já escuta** passam a funcionar. As duas novas ficam à disposição, para a tela escutar numa linha.
- **`qualificacao_ecrs` não entra.** As ECRs de uma qualificação são gravadas na mesma transação dela, e o aviso só sai
  depois do COMMIT. Quando o aviso da `qualificacoes` chega, as ECRs já estão lá.
- **O aviso respeita a RLS de leitura** de cada tabela: quem não pode ler a linha não recebe.
- **Por que no dia da publicação, e não agora:** ligar agora mudaria o comportamento do `080168b8` no ar, que passaria a
  recarregar a cada mudança dos outros, sem essa versão ter sido pensada para isso. No dia da D604, a tela nova e o tempo
  real chegam juntos.
- **A migration de ligar confere que as quatro entraram.** Se não entrarem, ela não sobe. Provada no ensaio junto com as travas
  (§1); depois do rollback, a publicação voltou a vazia.
- **Para a sua tela, se quiser escutar as duas novas:**
  ```
  .on('postgres_changes', { event: '*', schema: 'compras', table: 'qualificacoes' }, aoMudar)
  .on('postgres_changes', { event: '*', schema: 'compras', table: 'avaliacoes_entrega' }, aoMudar)
  ```
  Antes da publicação, isso não faz mal: é só silêncio, como hoje.

## §5 — Por que as travas não ficaram ligadas no ensaio

- A sua §7 diz que nada pede sessão logada no ensaio. A prova por SQL, em begin/rollback, cobre o que as telas mandam.
- Ligar de verdade no ensaio poria as duas casas fora de passo até a publicação:
  - a conferência acusaria todo dia "ensaio diferente da produção";
  - acusaria também "migration no disco sem estar no banco";
  - o aviso de verdade se perderia no meio.
- Se o senhor precisar da trava ligada no ensaio para algum teste de navegador, peça, que eu ligo.

## §6 — No dia da publicação

1. A OC publica a D604 e me avisa.
2. Eu copio `docs/roteiros/ligar_as_travas_da_d604.sql` para `supabase/migrations/`, aplico no ensaio e na produção e rodo a
   bateria na produção. Os 8 PULADO viram OK: **38 de 38**.
3. Mando a linha com a hora ao CTO e à OC.
