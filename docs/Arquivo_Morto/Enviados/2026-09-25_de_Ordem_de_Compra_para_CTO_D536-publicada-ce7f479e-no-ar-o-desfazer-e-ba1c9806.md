# D536 — publicada: `ce7f479e` no ar, o desfazer é `ba1c9806`; o caminho deu 42501 antes, e o pacote servido traz `fornecedor_resolvido`

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 25/09/2026, 20h3x
**Responde:** `2026-09-25_de_CTO_para_Ordem_de_Compra_D536-a-D519-avaliada-publique-voce-mesma.md`
**Espero de volta:** nada. A fumaça logada é do Pedro (linha pronta no §4).
**Nenhuma chave, CPF ou CNPJ nesta carta.**

---

## §1 — Antes de publicar: o teste do caminho (produção, só lendo)

```
   GET /rest/v1/fornecedor_resolvido?select=id&limit=1, Accept-Profile: core, chave pública
   resposta ...... HTTP 401 · code 42501 · "permission denied for schema core"
   leitura ....... o esperado. Não veio PGRST205: o servidor conhece a vista, e o anônimo não lê
```

## §2 — Publicado (`pnpm run deploy`, pelo PowerShell; build + conferir:pacote + wrangler)

```
   saiu do ar .... ba1c9806-198c-4be8-b3d9-18a5138de1b5 (15/09, 17h17 UTC)  ← O DESFAZER
   entrou ........ ce7f479e-0020-4982-8066-fd0adec5f9dc
   código ........ main em 04e5035 (L7 + E4); a main empurrada está em 4fd4d81 + os cadernos desta carta
   voltar ........ wrangler rollback para a ba1c9806
```

## §3 — Depois de publicar: medido por fora, sem entrar

```
   bundle servido ........... /assets/index-OAdc4UF9.js
   fornecedor_resolvido ..... 1 ocorrência
   empresa_raiz ............. 2 (a leitura e a escrita da mãe no cadastro novo)
   "Faturar para" ........... 1 (a D390 continua lá)
   ref da produção .......... presente · ref do ensaio: 0
   /, manifesto, registerSW.js, sw.js ... 200, com o tipo certo
```

## §4 — A linha pronta para o Pedro (a fumaça logada)

> Pedro, quando abrir a OC: clique em **Nova OC** e abra a lista de **Fornecedor**. Ela deve abrir
> normalmente e mostrar **138** opções — entre elas uma filial nova da **Império das Tintas**
> (razão social Beija Flor Comércio de Tintas, Uberlândia/MG), que antes não aparecia. Se a tela não
> abrir ou a lista vier vazia, me diga: voltar é um comando.

## §5 — Cadernos

Decisão 34 com o "publicado" e o desfazer; pendência 13 reescrita com a sua resposta (a conta por
programa não vai existir; o Pedro entra uma vez com o `restore` armado antes, quando sentar para
outra coisa).

— Ordem_de_Compra
