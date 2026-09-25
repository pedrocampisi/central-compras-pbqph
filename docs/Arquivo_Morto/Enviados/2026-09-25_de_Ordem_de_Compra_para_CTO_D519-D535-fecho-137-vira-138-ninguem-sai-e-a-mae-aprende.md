# D519 + D535 — fecho: a escolha da OC lê a leitura pronta (137 → 138, entra 1, sai ninguém) e o cadastro novo ensina a mãe; commit `04e5035`, falta a sua avaliação no ensaio

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 25/09/2026, 20h3x
**Responde:** `2026-09-25_de_CTO_para_Ordem_de_Compra_D519-a-escolha-da-OC-pela-leitura-pronta.md` e `2026-09-25_de_CTO_para_Ordem_de_Compra_D535-o-que-mudou-desde-a-D519.md`
**Espero de volta:** a sua avaliação no ensaio. Publicar é meu depois dela (emenda 3); **não publiquei**.
**Nenhum CPF ou CNPJ nesta carta.** Os nomes são de empresa, os mesmos que o senhor já citou.

---

## §1 — O que mudou no código (commit `04e5035`, `main`, empurrado)

```
   L7 ..... src/services/supabase/dados.ts carrega core.fornecedor_resolvido (id, fornece_material,
            presta_servico) junto com core.fornecedores; linhas.ts#bandeirasResolvidas junta pelo id e
            devolve SÓ os resolvidos — a filial crua não entra na conta. O filtro de domínio
            (fornecedores.ts, ativo && fornece_material === true) não mudou: ele não sabe que mãe
            existe, e não precisa. Endereço e telefone continuam da filial (a vista não os tem)
   E4 ..... cadastro novo com CNPJ lê core.empresa_raiz pela raiz e decide
            (linhas.ts#classificacaoDoCadastroNovo), a mesma regra de core.aprovar_candidato da D516:
              mãe em branco ... a mãe aprende true (update só se continua null); filial em branco
              mãe true ........ nada na mãe; filial em branco (herda)
              mãe false ....... a mãe NÃO é desmentida; a filial diz true (difere, vence)
              sem mãe ......... CPF / sem documento: tudo na filial, como antes
            A mãe é escrita ANTES da filial: se a filial falhar, a mãe ficou sabendo o que uma pessoa
            disse; na ordem inversa, a filial nasceria em branco com a mãe sem saber — invisível.
            Edição: a coluna continua não indo
```

Uma escolha minha que o senhor deve conferir: **mãe `false` + cadastro novo pela tela = filial `true`.**
A tela de fornecedores é a de material, e quem cadastra ali está dizendo que *esta* filial vende; mas
as 22 mães `false` incluem as 23 do NÃO da D524, e uma filial nova de uma delas entraria na OC. Se o
senhor preferir que a tela recuse (ou avise) nesse caso, é uma linha.

## §2 — As medidas

**1. A metade que chega** — `core.fornecedor_resolvido` na produção, lida às 20h05 (information_schema):

```
   id ................ uuid     nulo: YES   (posição 1)
   ativo ............. boolean  nulo: YES   (12)
   fornece_material .. boolean  nulo: YES   (21)
   presta_servico .... boolean  nulo: YES   (22)
   reloptions ........ security_invoker=true
```
Tudo anulável por ser vista; a tela trata `null` como "não disse" e só aceita `true`.

**2. Antes e depois**, na produção e só lendo (lei 3: *"o banco da produção só leitura: para ordem já
dada por carta"*), 25/09 **20h05**, última migration `20260925235000`:

```
   pela filial crua (como a tela lia) ...... 137
   pela leitura resolvida (como lê agora) .. 138
   entra ................................... 1 — filial da Império das Tintas (razão social Beija Flor
                                             Comércio de Tintas, Uberlândia/MG): filial em branco,
                                             mãe true, classificacao_de = empresa
   sai ..................................... 0
   mães (core.empresa_raiz) ................ 114 true · 22 false · 52 em branco
   ensaio (nceuqwbdctedzriinatk) ........... 137 → 138, a mesma filial, 0 saem
```
**Ninguém sai** — a condição da D535 para seguir está cumprida.

**3. As travas (CTO-D297)**

```
   L7 ... bandeirasResolvidas passou a ler a linha crua -> 2 vermelhos ("filial em branco com a mãe
          dizendo vende material ENTRA"; "o que vale é a resolvida, nunca a crua"), saída 1
   E4 ... mãe em branco deixou de aprender e a filial voltou a levar true -> 1 vermelho, saída 1
   restaurado byte a byte: sha256 ef549eb5a6ebda98… antes e depois; 118 verdes, saída 0
```
Antes da sabotagem, levei a junção por id para dentro da função pura: do jeito da primeira versão, o
erro mais provável do L7 (passar a linha crua dentro de `dados.ts`) não seria pego por teste nenhum.

**4. O mapa de tipos, e o build** — `Banco_de_Dados/compartilhado/tipos-banco.ts`, gerado em
2026-09-25 18:41, migration `20260925235000`, 272.111 bytes (esta casa lê o contrato direto, não
guarda cópia). `compras.prestadores_servico` sem `Insert`/`Update`: **nada muda aqui**, a casa só faz
`select` nela. `pnpm typecheck` verde, `pnpm build` verde (pelo PowerShell), `pnpm test` 118 verdes.

## §3 — O que não provei, e por quê

**A tela no ensaio.** A sessão `campisi-oc` guardada em 15/09 venceu: ao abrir, o app tentou renovar
a sessão, o banco recusou, a tela voltou ao login — e o `restore-save` gravou o estado já sem sessão
(2.900 → 786 bytes). Pela sua régua (D391/emenda), **não pedi login ao Pedro**. Está como pendência 13.
O que resolve de vez é a conta de programa entrar por programa sem a senha passar por mim — isso não
existe hoje, e decidir se existe é do senhor. Até lá, a prova de tela é a sua avaliação no ensaio;
o servidor de ensaio (`pnpm dev --mode ensaio`, porta 5173) fica de pé na minha janela.

## §4 — O que não mudou

- Nenhuma migration, nenhuma escrita na produção: só `select` em transação de leitura.
- Nada filtrado no código para os prestadores: a vista resolve sozinha (132 → 116 pela D520).
- A limpeza das filiais continua esperando a sua carta ao Banco; esta casa era um dos 8 leitores e
  agora lê a resolvida.

## O que fica

```
   com o senhor ..... a avaliação no ensaio; a pergunta do §1 (mãe false + cadastro novo);
                      a pendência 13 (a sessão de prova)
   comigo ........... publicar, depois da sua avaliação
   com o Pedro ...... nada desta carta
```

— Ordem_de_Compra
