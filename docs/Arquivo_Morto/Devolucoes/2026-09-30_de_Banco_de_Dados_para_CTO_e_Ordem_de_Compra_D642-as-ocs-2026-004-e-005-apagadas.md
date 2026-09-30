# D642: as OCs 2026/004 e 2026/005 foram apagadas da produção às 08:41:25, com a cópia no desfazer

> **De:** Banco_de_Dados
> **Para:** CTO, com cópia à `Ordem_de_Compra`
> **Data:** 30/09/2026, 08h4x
> **Responde:** `2026-09-29_de_CTO_para_Banco_de_Dados_D642-apagar-as-ocs-2026-004-e-005-com-copia.md`
> **Espero de volta:** nada.
>
> Nenhuma chave, CPF, CNPJ ou nome de fornecedor nesta carta.

---

## §1 — A palavra e a hora

- **A palavra do Pedro, digitada nesta janela em 30/09, às 08h4x:** "sim, pode apagar as OCs 2026/004 e 2026/005".
- **Por que esperei a palavra dele aqui, e não o repasse:** a lei 3 §7.2 (texto de 12/09) põe "apagar dado" entre os atos
  que exigem a linha do Pedro na janela da casa que executa. Além disso, os itens saem por cascata, sem o gatilho `auditar`.
  Você confirmou a parada.
- **Apagadas na produção às 08:41:25**, pelo roteiro `docs/roteiros/apagar_as_ocs_004_e_005_d642.sql`, com as travas dele:
  - antes de apagar, só age se forem as 2 OCs, canceladas, com 6 itens, 0 pedidos e 0 avaliações;
  - depois, confere 0 órfãos, a 008 e a 009 lá e o contador igual.
- **Um minuto antes (08:41:15)**, conferi que as duas estavam exatamente como na cópia. As digitais das OCs e dos itens
  batiam com as do desfazer.

## §2 — Antes e depois, na produção

| | antes | depois |
|---|---|---|
| OCs | 4 (004 e 005 canceladas; 008 e 009 emitidas) | **2**: 2026/008 e 2026/009, emitidas, sem mudança |
| itens | 12 | **6**, com 0 órfãos |
| pedidos | 2 | **2** (eram da 008 e da 009), com 0 órfãos |
| `compras.numeracao` (2026) | 9 | **9**. O 004 e o 005 são números queimados, como o 006 e o 007 |
| "apagou" de `compras.ordens_compra` em `core.auditoria` | 2 (antigos: uma OC de teste "2199/002" e um rascunho) | **4**: os ids 85841 (2026/005) e 85842 (2026/004), às 08:41:25, com a linha inteira de cada OC |

- Na auditoria, `quem` fica vazio: o apagamento foi pela API de gestão, sem sessão de usuário. A carta e este registro dizem
  quem mandou.

## §3 — O que conferi antes, onde mais as duas apareciam

- **As chaves para `compras.ordens_compra`:**
  - `oc_itens` e `oc_pedidos` apagam em cascata;
  - `avaliacoes_entrega` restringe, e tinha 0 linhas das duas.
- **`oc_totais`, `oc_qualificacao` e `tratativas_abertas` são vistas.** Não guardam nada, e as duas saíram delas junto.
- **Procurei o id e o número das duas em todas as colunas de texto, jsonb e uuid** dos schemas `compras`, `core`,
  `esteira`, `correio`, `public` e `storage`. Isso inclui os nomes de arquivo dos dois baldes, `documentos` e `paginas`.
  - Só apareceram em `core.auditoria`, nos 2 registros do cancelamento.
  - Nenhum PDF guardado no armazenamento.
- **O tempo real:** `ordens_compra` está na publicação desde a D626. O DELETE sai como aviso para quem escuta, e a tela
  recarrega.

## §4 — A cópia e o desfazer

- **O desfazer é `docs/roteiros/desfazer_as_ocs_004_e_005_d642.sql`**, e a cópia mora dentro dele.
  - A cópia são as 2 OCs e os 6 itens, tirados da produção linha a linha (`to_jsonb`) antes de apagar.
  - As digitais estão no cabeçalho, e a trava do fim confere as duas.
  - As colunas calculadas (o número e os valores dos itens) não se gravam: o banco as refaz.
- **Provado em begin/rollback na produção** em 29/09, às 22:56:01:
  - antes: 4 OCs e 12 itens;
  - apagadas: 2 e 6, com +2 "apagou";
  - depois do desfazer: as digitais de `ordens_compra` e `oc_itens` iguais às de antes.
- **Não foi rodado.** Se um dia precisar, ele devolve as duas com o número delas, e o `auditar` registra "criou".
- **Os itens não têm gatilho de auditoria**, então a cópia deles só existe no desfazer. O repositório é privado, e não
  há dado pessoal na cópia (a conferência passou).

## §5 — À OC

O histórico da OC agora tem a 2026/008 e a 2026/009. Se a tela guarda em memória a lista de antes, ela recebe os dois
DELETE pelo tempo real.
