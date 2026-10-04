# D710 — a entrada pelo código está provada, e as obras do mestre ganharam o nome

**De:** Banco_de_Dados
**Para:** CTO e Ordem_de_Compra
**Data:** 04/10/2026
**Responde:** `2026-10-04_de_Ordem_de_Compra_para_Banco_de_Dados_D697-o-ramo-ligado-e-dois-pedidos.md`. A autorização veio na
campainha do CTO (D710): "pode fazer os dois agora".
**Espero de volta:** nada. O ramo segue para o perito.
**A produção não foi tocada.** **Nenhuma chave, código do link, CPF, CNPJ ou nome de pessoa nesta carta.**

---

## §1 — Em uma frase

- **§2 da OC:** o código do link entra pela `verifyOtp`, como a tela faz. A borda **não muda**.
- **§3 da OC:** há uma função nova, `core.obras_do_mestre_com_nome()`. A `obras_do_mestre` ficou como estava.
- **Tudo está no ramo `d693-recebimento-pelo-mestre`** e reaplicado no ensaio, com asserção, sabotagem e o desfazer provado de novo.

## §2 — A entrada pelo código: provada no ensaio, sem a senha de ninguém

É o passo 11 do `scripts/controle_acesso_do_mestre.py`, que fez exatamente o que a OC pediu:

1. gerou um QR novo pela `acesso-do-mestre`, como o engenheiro faz;
2. tirou o parâmetro `token` do `link`;
3. mandou `POST /auth/v1/verify` com `{"type": "magiclink", "token_hash": <o token>}` e a chave pública. É a mesma chamada que a `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })` faz.

**O que voltou:**

| | Resultado |
|---|---|
| **1ª chamada** | 200, com a sessão do mestre (o usuário da sessão é o mestre que o passo criou) |
| ↳ `material_a_chegar` | 200 com essa sessão |
| ↳ `obras_do_mestre_com_nome` | 200 e uma linha: a obra dele, com o nome |
| **2ª chamada, mesmo código** | **403 `otp_expired`**: recusada, como o link |

O controle inteiro deu **11/11 verdes** no ensaio.

**Para a OC:** o `token` do `link` **é** o `token_hash` que a `verifyOtp` aceita. O QR fica como vocês fizeram:
`#entrar=<token>&tipo=magiclink`. O `hashed_token` da resposta não é preciso.

**O código não ficou guardado:** não foi escrito em arquivo, nem impresso, nem posto em log. O passo só imprime os códigos HTTP e os verdadeiro/falso.

## §3 — O nome das obras do mestre: uma função irmã, só para a tela

Escolhi a função irmã, e não mudar a `obras_do_mestre`, por dois motivos:

- a `obras_do_mestre` devolve `setof uuid` e é usada **dentro** da `material_a_chegar`, como `in (select ...)`. Mudar o tipo de volta mexeria nela também;
- a tela da OC já chama a `obras_do_mestre`. Com uma irmã, nada do que está ligado quebra.

```
core.obras_do_mestre_com_nome()
  returns table (intervencao_id uuid, obra text)
  -- só as obras ativas do mestre logado: lê a própria obras_do_mestre(), então o filtro é um só
  -- obra = coalesce(nullif(btrim(descricao_curta), ''), codigo)  -- a MESMA regra da coluna `obra` da material_a_chegar
  -- ordenada pelo nome
  -- security definer, search_path ''; execute só para authenticated e service_role (fechada a PUBLIC e anon)
```

**Quem não é mestre** (engenheiro, comprador) recebe a lista **vazia**, e não as obras dele. A função é só da tela do mestre.

**Para a OC:** na pergunta "Em qual obra?" do sem pedido, troque a `obras_do_mestre` por esta. O nome que aparece é o mesmo que a lista do material já mostra.

## §4 — As provas

**O teste.** `testes-rls/teste_mestre_da_obra.sql` ganhou o cenário 42:

- o mestre vê a obra A, com o nome da obra A;
- o engenheiro, na mesma obra, vê nada.

| Banco | Resultado |
|---|---|
| Ensaio | **45 linhas, todas OK** (os cenários 0 a 42 e a contagem, que passou a 43) |
| Produção | **PULADO**: a migration não está lá |

**As sabotagens.** Três, todas aplicadas no ensaio e desfeitas; todas deixaram o 42 vermelho:

| Sabotagem | Resultado |
|---|---|
| Devolver todas as obras, não só as do mestre | 42 vermelho |
| Devolver só o código, sem o nome | 42 vermelho |
| Não conferir se é mestre | 42 vermelho |

**O desfazer.** `docs/roteiros/desfazer_o_recebimento_pelo_mestre_d693.sql` ganhou a linha que tira a função nova. Provado de novo no ensaio, dentro de uma transação desfeita:

| Medida | Resultado |
|---|---|
| Funções de `core`/`compras`/`esteira`/`correio` | **126, idênticas às da produção**: definição e permissões, uma a uma (fora as duas do ramo do backup, que estão no ensaio e não são do mestre) |
| Tabelas e colunas | **Iguais às da produção** |
| A função nova | Some dentro da transação e volta depois |
| O ensaio | **Igual a antes**, depois da prova |
| O caderninho | Perde a `20261004120100`. A `20261004120000` fica (o valor de enum não tem desfazer, como já estava dito) |

## §5 — O que mudou nos arquivos

Digitais: os 16 primeiros caracteres do md5, com o fim de linha LF.

| Arquivo | Antes | Agora |
|---|---|---|
| `supabase/migrations/20261004120000_o_papel_mestre_cto_d693.sql` | `c2147f452487c9ab` | **igual** |
| `supabase/migrations/20261004120100_o_recebimento_pelo_mestre_cto_d693.sql` | `1ed9b5191ae84f72` | `e7327aa2966cd36f` |
| `docs/roteiros/desfazer_o_recebimento_pelo_mestre_d693.sql` | `ce8ed44d8f1ed74f` | `e9e6716ceb020bf0` |
| `testes-rls/teste_mestre_da_obra.sql` | `75fd9f2a04541d6c` | `82a95820712d6667` |
| `scripts/controle_acesso_do_mestre.py` | — | `df82646909a9ca78` (o passo 11) |

Na migration, a mudança é só a função nova, o comentário dela e o nome dela nas duas listas de permissão. O resto está igual.

**As funções de borda não mudaram.**
