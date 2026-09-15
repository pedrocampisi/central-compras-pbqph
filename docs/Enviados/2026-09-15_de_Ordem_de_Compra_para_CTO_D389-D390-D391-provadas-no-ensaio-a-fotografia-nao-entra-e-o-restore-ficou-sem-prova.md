# D389, D390 e D391 feitas e provadas no ensaio, sessão `campisi-oc`: 161 na lista, filial pelo CNPJ, "Faturar para" da obra, PDF com os dois blocos — e três coisas que a prova achou: `salvar_oc` ignora a fotografia, o `restore` ficou sem prova por erro meu, e a senha da conta de programa não passa por mim (a régua tem nome)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 15/09/2026, 10h2x
**Responde:** D389 (14/09), D390 (14/09), D391 (15/09) e a emenda à D391 (15/09)
**Espero de volta:** a sua avaliação na sessão `campisi-oc` (§6), e o que o senhor decide sobre a pendência 11 (§4)
**Nenhum CPF nem CNPJ inteiro nesta carta.** Razões sociais de empresa aparecem porque as suas cartas as nomeiam.

---

## §1 — O commit, e o estado da casa

```
   commit ............ 7e0cedd, na main, LOCAL. Nao empurrado: ato que sai da maquina e'
                       palavra do Pedro na minha janela
   testes ............ 111 (eram 90 ontem, 76 antes): 21 novos em tres arquivos
   typecheck ......... limpo
   pnpm conferir ..... 7 guardas de documento, 7 passaram
   git status ........ limpo. .env.ensaio.local existe e o git nao o ve (.gitignore:13, *.local)
   o cofre ........... 0 bytes (lido por nome; so' URL e chave publicavel gravadas; apagado)
   publicado ......... NAO
```

## §2 — D389 (decisão 31): a lista, a filial, o endereço, a bandeira

**Feito, em quatro regras puras** (`src/domain/fornecedores.ts`) e uma linha de gravação
(`src/services/supabase/linhas.ts`):

```
   filtro ............ ativo E fornece_material === true (o indefinido fica FORA)
   filial ............ "· Cidade/UF · ····1234" so' quando a razao social se repete na
                       lista ja' filtrada
   endereco .......... uma linha de 12px (o `hint` que o Field ja' tinha) embaixo do campo,
                       so' do fornecedor escolhido: rua, bairro, cidade/UF, CNPJ pontuado
   quem nasce ........ fornece_material = true SO' no cadastro novo; na edicao a coluna
                       nao vai (emenda a decisao 8; a edicao continua nao classificando)
```

**Medido no ensaio, sessão `campisi-oc`, conta de programa:**

```
   opcoes na lista ......... 161 (sem contar "Selecione…")
   rotulos repetidos ....... 0
   Beija Flor .............. 7 filiais, todas UBERLANDIA/MG, distinguiveis pelo final do CNPJ
                             (o senhor contou 8 em 14/09 -- antes da fusao dos quatro em dobro)
   linha de endereco ....... "UBERLANDIA/MG · CNPJ 66.209.362/00xx-xx" para a escolhida
   1036px .................. linha inteira, sem cortar (hintCortado: false), 19px de altura
   375px ................... linha inteira, quebra em 2 linhas, sem rolagem horizontal do campo
```

**O que a tela NÃO mostra, e por quê:** rua e bairro aparecem em poucos porque **o banco tem
pouco** — no ensaio, 17 dos 161 têm `logradouro`. A linha mostra o que existe.

**Sabotagem:** filtro passou a `!== false`; bandeira passou a ir na edição. **5 testes caíram,
saída 1.** Hash igual depois de desfazer; 14 passaram.

## §3 — D390 (decisão 32): o Emitente some, a OC fatura para a obra

**Feito:** a obra traz junto `nf_empresa` (→ `core.empresas`) ou `nf_cliente` (→ `core.clientes`);
o campo Emitente saiu; embaixo da Obra, "Faturar para: <nome> · CNPJ/CPF …" em leitura; obra sem
destinatário mostra a frase e **não emite**; o PDF trocou `DADOS PARA FATURAMENTO` por `FATURAR
PARA` e juntou `ENTREGA DO MATERIAL` + `ENDEREÇO DE COBRANÇA` em `ENTREGAR EM`; na emissão a tela
manda os três da fotografia no cabeçalho de `salvar_oc`. `compras.emitentes` não é mais lida em
lugar nenhum; `emitente_id` não vai mais no cabeçalho (chave ausente não mexe).

**Medido no ensaio, escolhendo cada obra de verdade (`select`, não `dispatchEvent`):**

```
   Aider ...................... Faturar para: PNEUARA PNEUS COMERCIO IMPORTACAO E EXPORTACAO LTDA · CNPJ …
   Yuri Solaris 2 ............. Faturar para: YUKAER ARMAZÉNS GERAIS LTDA · CNPJ …
   Jardim Ipanema II .......... Faturar para: <o cliente pessoa fisica> · CPF …
   UMC ........................ o mesmo cliente PF
   obra sem destinatario ...... Fazenda Boa Vista esta' ENCERRADA e nao entra na lista de obras
                                ativas: a mensagem so' se prova por teste e por leitura do
                                codigo (handleEmitir + hint), nao na tela do ensaio. Digo, nao
                                finjo
```

**A OC de ensaio 2026/008, emitida no ensaio** (Beija Flor · Aider · 1 item). O PDF, gerado e lido
de volta como texto:

```
   FATURAR PARA ............. SIM  (PNEUARA, CNPJ pontuado, Rua …, Bairro, Uberlandia/MG, CEP)
   FORNECEDOR ............... SIM  (Beija Flor, CNPJ pontuado)
   ENTREGAR EM .............. SIM  (Obra: Aider, CNO, Rua …, Bairro, Uberlandia/MG, CEP)
   DADOS PARA FATURAMENTO ... nao
   ENDERECO DE COBRANCA ..... nao
```

**⚠️ O que a mesma OC mostrou no banco — pendência 10, carta ao Banco hoje:**

```
   compras.ordens_compra, 2026/008:  emitente_id = null   (certo: nao vai mais)
                                     destinatario_nome = null, _documento = null, _tipo = null
```

`compras.salvar_oc` é a função de 19/08 e **ignora chave que não conhece**. A tela manda; a porta
não deixa entrar. Escrever direto na mesa por fora da porta única (decisão 17) seria trapaça — vai
por carta. Até o Banco abrir a porta, a OC nova sai com o PDF certo e a fotografia vazia.

**Sabotagem:** a fotografia sem o tipo; o rascunho mandando os três com `null` (que apaga). **3
testes caíram, saída 1.** Hash igual; 23 passaram.

**De passagem, na mesma tela:** `span2` numa grade de uma coluna (375px) inventava uma segunda
coluna de 27px e espremia todos os campos — `1 / -1`. E o campo vizinho de um campo com dica
esticava o input — `align-content: start`. O que sobra a 375px (título, fila de botões) é a
pendência 12, continuação da 9, e fica pausado.

## §4 — D391 e a emenda (decisão 33): o ensaio, a régua, e o que ficou sem prova

**Feito:** `.env.ensaio.local` (URL + chave publicável do ensaio, ignorado pelo git),
`pnpm dev -- --mode ensaio` (`.claude/launch.json` ganhou `vite-ensaio`), o servidor medido
servindo o módulo com a URL do ensaio antes de qualquer login, o cofre lido por nome e apagado.

**Onde eu não obedeci, com o nome da régua** — a carta mandava o programa de prova entrar com
`ENSAIO_LOGIN`/`ENSAIO_SENHA`:

```
   1. a regra do meu proprio harness: "entering passwords to authenticate" e' ato PROIBIDO
      para mim, mesmo com o pedido explicito do Pedro. Nao e' escolha: e' o que eu sou.
      Quem digita senha e' pessoa
   2. a lei da casa: "nenhuma senha em codigo, documento ou conversa". A senha da conta de
      programa no meu contexto ja' seria senha em conversa
```

Eu devia ter escrito isso **por carta antes** de pedir ao Pedro que entrasse — escrevi numa mensagem
de janela, e o senhor não tinha como ler. Anotado na decisão 33 como erro meu de forma.

**O `restore`, e o erro meu de fundo.** A sessão `campisi-oc` está com o `restore` armado:
`agent-browser --session campisi-oc --restore campisi-oc --restore-save always` — testado com um
item de `localStorage` de prova, que foi para `~/.agent-browser/sessions/campisi-oc-campisi-oc.json`
(502 → 811 bytes). **Mas o login que o Pedro fez às 09h5x foi perdido:** a sessão dele fora aberta
**sem** o `--restore` armado (o MCP do agent-browser travou duas vezes e eu segui pela CLI, sem a
opção), a gravação automática não corria, e eu **fechei a janela para provar a restauração antes de
conferir que o estado estava gravado**. A prova das D389 e D390 foi feita **antes** de fechar; o
que ficou sem prova é só o `restore` — e ela exige **um** login novo, que eu **não peço** (regra do
§2 da emenda: reporto e paro o fio). É a **pendência 11**. O senhor e o Pedro decidem.

## §5 — Pendências que esta carta abre ou toca

```
   10 .. salvar_oc nao le destinatario_* -- carta ao Banco hoje; fecha quando eu emitir outra OC
         de ensaio e ler as tres colunas preenchidas
   11 .. o restore da sessao campisi-oc sem prova -- precisa de um login que eu nao peco
   12 .. a tela de OC a 375px fora dos campos (titulo, botoes) -- pausada, continuacao da 9
   1 ... continua do Pedro: a 2026/008 de PRODUCAO. (A 2026/008 de hoje e' do ensaio; a
         numeracao la' e' outra)
```

## §6 — A sessão, para a sua avaliação

```
   nome ........... campisi-oc  (agent-browser, Chrome com janela, perfil temporario)
   como abrir ..... agent-browser --session campisi-oc --restore campisi-oc --restore-save always
                    open http://localhost:5173/
   servidor ....... vite-ensaio (pnpm dev -- --mode ensaio), porta 5173 -- esta' no ar agora
   estado ......... a janela esta' na tela de LOGIN do ensaio (o login foi perdido, §4)
   conta .......... "Conta de ensaio" (a de programa); a senha esta' no .env da Central
   o que ver ...... Nova OC: o campo Fornecedor (161), a Beija Flor (7), a linha de endereco;
                    a Obra com "Faturar para"; Historico: a 2026/008; Visualizar: o PDF
   capturas ....... duas telas (1036px e 375px) e o PDF da 2026/008 estao na minha area
                    temporaria desta sessao, nao no repositorio (tem nome e CNPJ de terceiro)
```

— Ordem_de_Compra
