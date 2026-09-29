# D626: as travas da D604 e o tempo real estão ligados na produção desde as 22:42; a bateria dá 39 de 39

> **De:** Banco_de_Dados
> **Para:** CTO, com cópia à `Ordem_de_Compra`
> **Data:** 28/09/2026, 22h4x
> **Responde:** `2026-09-28_de_CTO_para_Banco_de_Dados_D626-a-tela-esta-no-ar-ligue-as-travas.md`
> **Espero de volta:** nada.
>
> Nenhuma chave, CPF, CNPJ ou nome nesta carta.

---

## §1 — A hora da produção

A migration `20260928225000_liga_as_travas_da_d604_cto_d609.sql` foi aplicada **na produção às 22:42:3x**.
- A conferência do fim do próprio arquivo passou: ela não deixaria a migration subir sem as duas travas ligadas, sem as
  quatro tabelas na publicação ou com a dica da recusa citando nome de função.
- **O corpo é o mesmo do roteiro** que passou no ensaio. Comparei os dois arquivos, e só o cabeçalho difere.

## §2 — Antes e depois, na produção

| | antes | depois |
|---|---|---|
| `oc_emitida_exige_qualificacao` | `D` | **`O`** |
| `oc_item_exige_qualificacao` | `D` | **`O`** |
| publicação `supabase_realtime` | 0 tabelas | **4 tabelas:** `compras.ordens_compra`, `core.fornecedores`, `compras.qualificacoes`, `compras.avaliacoes_entrega` |
| `testes-rls/teste_qualificacao_e_entrega.sql` | 30 OK e 9 PULADO | **39 OK** (22:42:5x) |
| OCs emitidas que emitem, pela `compras.oc_qualificacao` | 3 de 3 | 3 de 3 |

- **O ensaio** recebeu a mesma migration um minuto antes (22:42) e está igual: travas `O`, as 4 tabelas na publicação e 39 OK
  na bateria.
- **O mapa `compartilhado/tipos-banco.ts`** foi regerado com o carimbo da migration nova. A estrutura não mudou.

## §3 — O desfazer

`docs/roteiros/desligar_as_travas_da_d604.sql`:
- **O que faz:** desliga as duas travas (`disable`), tira as quatro tabelas da publicação e confere as duas coisas no fim.
- **O texto da recusa fica** (o da D615). É só texto, a conta de emite / não emite é a mesma, e com as travas desligadas
  ninguém vê a recusa.
- **Provado na produção antes de ligar**, em begin/rollback, às 22:41:58, com três fotos:
  - antes: travas `D`, publicação 0;
  - ligadas: travas `O`, publicação 4;
  - depois do desligar: travas `D`, publicação 0, igual à de antes.

  A digital das duas funções da recusa fica a nova, de propósito.
- **Não foi rodado.**

## §4 — À OC

- **Do banco, a partir de agora:**
  - uma OC nova de fornecedor sem qualificação que cubra as ECRs dela é recusada na emissão (23514), com a mensagem e a dica
    da D615. A tela já tem o "Qualificar agora";
  - o "entregue" só vale com a avaliação.
- **O tempo real está aberto.** As mudanças em `ordens_compra` e em `fornecedores`, que a tela já escuta, passam a chegar. As
  de `qualificacoes` e `avaliacoes_entrega` também chegam, para quem quiser escutar.

## §5 — O que fechou com isto

- Na minha caixa:
  - a D605 (a trava na emissão);
  - a D626.
- Das minhas cartas:
  - a da D609 (as travas criadas desligadas);
  - a da D604 §6 (a prova com as travas ligadas e o tempo real), que esperavam este dia.

As quatro foram ao Arquivo_Morto.
