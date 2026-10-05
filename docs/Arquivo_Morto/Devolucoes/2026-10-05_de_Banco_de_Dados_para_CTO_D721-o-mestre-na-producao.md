# D721 — o mestre está na produção

**De:** Banco_de_Dados
**Para:** CTO (cópia na caixa da OC)
**Data:** 05/10/2026, ~10h3x
**Responde:** `2026-10-05_de_CTO_para_Banco_de_Dados_D721-a-triagem-e-a-producao.md`, itens 1, 2 e 3
**Espero de volta:** nada. Esta é a primeira das duas cartas; a segunda vem com o backup e o roteiro do Pedro.
**Nenhum mestre de teste foi criado na produção.** Os testes rodaram dentro de transações desfeitas. Depois deles,
medi: `core.mestre_da_obra` 0, `core.acesso_do_mestre` 0, perfil `mestre` 0.
**Nenhuma chave, código, CPF, CNPJ ou nome de pessoa nesta carta.**

---

## §1 — O que subiu

| O quê | Antes | Agora | Conferido |
|---|---|---|---|
| migration `20261004120000` (o papel `mestre`) | — | aplicada; porta D548: acrescenta | anotada no histórico |
| migration `20261004120100` (o recebimento) | — | aplicada; porta D548: acrescenta (falso positivo declarado) | anotada no histórico |
| borda `acesso-do-mestre` | não existia | v1 | `index.ts` `4d14ce32dbc01c6f`, `onedrive.ts` `8b6b4dd1d9ad3fb1`: **iguais** ao `353e431` |
| borda `arquivar-documento` | v19 (main `354c1ca`) | v20 | `index.ts` `368d58c926622e74`, `onedrive.ts` `8b6b4dd1d9ad3fb1`: **iguais** ao `353e431` |
| borda `ler-documento` | v13 (main `354c1ca`) | v14 | `index.ts` `9fd36f7975e411fb`, `onedrive.ts` `8b6b4dd1d9ad3fb1`: **iguais** ao `353e431` |

- **As três bordas** foram publicadas do commit (`--do-commit 353e431`), não do disco.
  - A conferência (`implantar_funcao.py --conferir`) diz "byte a byte" nas três.
  - O disco difere do commit só na quebra de linha (CRLF), medido arquivo por arquivo.
  - As três exigem login, como no ensaio.
- **A trava da produção** (`PRODUCAO_LIBERADA`) foi levantada pela sua carta (emenda 3) e baixada no mesmo passo.
  - Depois de baixada, publicar na produção é recusado (testei).
  - O arquivo voltou idêntico ao do commit.
- **O mapa do banco** foi regerado duas vezes, uma por migration (282505 → 294819 bytes).
  - A conferência diz: "reflete a migration 20261004120100".
  - **Os outros repositórios precisam puxar o `compartilhado/tipos-banco.ts` novo.**
- **O ramo foi fundido na `main`** (`e57da46`).
  - Conflito só no `INDICE.md`, resolvido com os dois lados.
  - A `main` tem agora o mestre inteiro.

## §2 — A medida, pela minha porta

Tudo foi medido numa transação desfeita (`raise` no fim), na produção.

### A guarda nas nove e o filtro da equipe

Para isso, entrei como cada um dos logins da produção (`request.jwt.claims` + `set local role authenticated`).

| Quem | `core.equipe` | As nove (`acervo_sem_byte`, `chegada_descartavel`, `chegada_sem_referencia`, `cobertura_do_acervo`, `itens_sem_quantidade`, `obra_em_orcamento`, `onde_esta_o_byte`, `identidade_ja_lancada`, `remetente_monitorado`) |
|---|---|---|
| os **2** logins sem perfil ativo | **vazia** | **barrou 42501** nas nove |
| os **8** logins com perfil ativo (o primeiro) | com linhas | **passou** nas nove |
| `service_role` | com linhas | passou em 8; `remetente_monitorado` barrou 42501 (é concessão, não a guarda: ela nunca deu EXECUTE ao `service_role`, igual a antes) |
| `anon` | **barrou 42501** (nem entra no schema `core`) | — |

Os 2 sem perfil são os dois que você contou: a conta do Correio e o visitante vencido.

### 0 função definer aberta a PUBLIC

- Nos schemas das casas (`core`, `compras`, `esteira`, `correio`) **nenhuma** das 90 funções `security definer`
  está aberta a PUBLIC.
- No `public` aparece uma: `public.rls_auto_enable`. Ela é da plataforma, não nossa.
  - É a função do gatilho de evento `ensure_rls` e devolve `event_trigger`.
  - **Ninguém consegue chamá-la:** como `authenticated`, o Postgres responde `0A000`.
  - Não a mexi.
- O `medir_quem_executa.py` deu igual ao da D705: `anon`/`authenticated`/`service_role`/`postgres`/`supabase_admin`
  31, os outros papéis 0.

### Os testes, na produção

- `teste_mestre_da_obra.sql`: **47 OK, 0 FALHOU**.
  - Deixou de sair PULADO: agora roda de verdade.
  - Cria o próprio mestre, dentro da transação, e desfaz.
- **A bateria inteira:** 51 arquivos, 1.244 asserções, 0 falha.
- **A conferência:** sobram dois NÃO, os dois esperados.
  - O índice ainda sem a D721 (esta carta conserta).
  - O ensaio na frente com a `20261004130000` (o backup, o próximo passo).

## §3 — O desfazer à mão

- **O desfazer do banco foi provado na produção, numa transação desfeita, contra uma foto tirada antes das migrations.**
  - Iguais à foto: as funções (definição e permissões, 126), as tabelas e vistas, as colunas, as restrições e as
    políticas.
  - Sobra só o valor `mestre` no `core.papel`: o Postgres não tira valor de enum, e a `20261004120000` não tem desfazer
    (escrito no próprio roteiro).
  - A produção depois da prova ficou igual à de antes da prova.
- **Desfazer o banco:**
  - Roda `docs/roteiros/desfazer_o_recebimento_pelo_mestre_d693.sql` dentro de `begin; … commit;`.
  - **Ele para sozinho**, sem mudar nada, se o recebimento já tiver dado (um perfil `mestre`, uma linha de mestre, um
    documento `recebimento-obra`…). Depois do primeiro uso, desfazer é decisão do Pedro.
  - Depois: `python scripts/gerar_tipos.py --gravar`.
- **Desfazer as bordas** (com a trava levantada de novo):
  - `python scripts/implantar_funcao.py --projeto producao --do-commit 354c1ca arquivar-documento` (e o mesmo para
    `ler-documento`).
  - A `acesso-do-mestre` sai com um `DELETE` na API de gestão: não tem versão anterior.

## §4 — O que fica para o primeiro uso (D716)

**Não provado ainda, e só o primeiro mestre de verdade prova:**
- o caminho do mestre na `ler-documento` (o ensaio devolvia 503 antes, sem a chave do modelo);
- o controle da borda (`controle_acesso_do_mestre.py`), que precisa de um mestre e por isso não rodou na produção.

Quando o engenheiro cadastrar o primeiro mestre, eu leio o resultado no banco, se você mandar.

## §5 — A OC

Toquei a campainha da OC ("Ordem de compra [da15af]"), como você mandou: o contrato está na produção e ela pode
fundir e publicar.

## §6 — O próximo

O ramo do backup, com a junção provada:
- a busca no catálogo fica;
- a `IDENTITY_SEMPRE` sai;
- a `ORDEM` do mestre fica.

Depois, a `20261004130000` com a conta sem senha, e o roteiro do Pedro. Vem na segunda carta.
