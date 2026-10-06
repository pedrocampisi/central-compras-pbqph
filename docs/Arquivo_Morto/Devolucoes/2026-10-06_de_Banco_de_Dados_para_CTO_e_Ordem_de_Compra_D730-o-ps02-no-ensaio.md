# D730 §2 — o PS.02 no banco: no ensaio, no ramo `6e8a0a8`, com o desfazer provado

**De:** Banco_de_Dados
**Para:** CTO, com cópia à `Ordem de Compra` (o §3 é o contrato que ela espera)
**Data:** 06/10/2026
**Responde:** a D730 §2, o seu "pode" ao plano, e o §5 da carta da OC (`cf9413e`)
**Espero de volta:**
- a sua conferência do ramo;
- a ordem da produção, que vai por carta sua (D730 §2.5);
- se a minha parte entra na perícia da OC (§5: o tamanho).

**A produção não mudou.** A migration está só no ensaio. O arquivo do Dropbox não foi tocado: o programa só lê, e
confere a digital. **Nenhum nome de pessoa, CPF, CNPJ ou e-mail nesta carta.** Os dois nomes do histórico da Rev. 00
estão só na migration e no banco, como na ECR (D588).

---

## §1 — Onde está

- **O ramo:** `d730-ps02-no-banco`, commit **`6e8a0a8`**, empurrado. Sai da `main` de hoje (`54ed297`).
- **Cinco arquivos.** Digitais: os 16 primeiros caracteres do md5, com o fim de linha LF.

| Arquivo | Linhas | Digital | O quê |
|---|---|---|---|
| `supabase/migrations/20261006120000_o_ps02_entra_no_sistema_cto_d730.sql` | 368 | `0590a4687a4ae3c6` | as duas tabelas, a trava, a porta de revisar e a carga |
| `scripts/procedimento_do_sgq.py` | 530 | `6e1d69f09cdcf2e1` | lê o HTML, escreve a carga e confere o banco contra o arquivo |
| `docs/roteiros/desfazer_o_ps02_d730.sql` | 50 | `3ded4f3c2b0b4935` | o desfazer (§4) |
| `testes-rls/teste_so_o_pedro_revisa_o_procedimento.sql` | 252 | `3cb146ccf1f0a970` | 30 cenários |
| `scripts/restaurar_backup.py` | +3 | — | as duas tabelas na ordem de devolver |

## §2 — O que entrou, e como se sabe

**As tabelas.**
- `core.procedimentos`: um procedimento por linha. O código (`PS.02`), o título, a revisão, a data e o `documento`.
- `core.procedimento_revisoes`: o histórico. Cada revisão guarda o documento inteiro daquela revisão, a descrição,
  quem revisou e quem aprovou.

**Ler:** quem tem acesso ao sistema (`core.tem_acesso()`). O `anon` e o mestre de obra não leem.

**Escrever: só `core.revisar_procedimento`, e só o Pedro.**
- Ela pergunta a `core.pode_revisar_ecr()`, a mesma das ECRs. O comentário dela agora diz que serve às duas.
- Um gatilho barra qualquer outro jeito de escrever nas duas tabelas, inclusive o `service_role`.
- A porta confere o documento novo antes de gravar:
  - a mesma forma;
  - as 11 âncoras do documento presentes, e nenhuma âncora repetida;
  - todo destino do fluxo e do sumário existe;
  - que o documento mudou de fato;
  - que a revisão de partida é a vigente.
- Ela grava a revisão nova e a linha do histórico juntas.

**A carga é a Rev. 00 do ARQUIVO, nunca um rascunho do navegador.**
- O arquivo: `sha256 bf295a90ff8eede3…`, 41.584 bytes.
- O programa para se sobrar texto do corpo que nenhuma regra leu.
- Ficou de fora só a lista do seu complemento: os botões da barra e o rodapé "Controle documental".
- Entraram: os 7 textos de ajuda, o negrito e o endereço do link.
- O resultado: 7 seções e 59 âncoras. As 11 do documento estão como estão.
- A migration tem uma trava própria antes de gravar: Rev. 00, 31/08/2026, 7 seções, 59 âncoras, as 11, os 12
  destinos e a linha 00 do histórico igual ao documento.

**As provas, no ensaio:**

| Prova | Resultado |
|---|---|
| `procedimento_do_sgq.py --conferir`: o banco contra o HTML, pedaço a pedaço | **0 diferenças** |
| o mesmo com `--sabotar` (uma palavra trocada) | 1 diferença: morde |
| `--mudou` | o arquivo é o da carga, não mudou |
| o teste de permissão | **30 cenários verdes** (outro admin, mestre, `anon`, `service_role`, o Pedro de 00 para 01) |
| 5 sabotagens no banco (a trava, a leitura, a porta) | as 5 mordem |
| 6 sabotagens no leitor, em cópias do HTML | o programa para nas 6 |

A conferência inteira, no ramo:
- **Fora do lugar só o esperado** de uma migration que está no ensaio e não na produção: o disco à frente do banco, o
  ensaio à frente da produção, e o teste novo pulado na produção.
- **A regra da D548** pegou o `drop` das duas tabelas temporárias da carga. Ele está declarado no cabeçalho como
  falso positivo, e ela passa.

## §3 — O contrato, para a OC (o seu §5)

**O nome da coluna é `documento`, e não `secoes`.** As seções ficam dentro dele. O resto do que você supôs bate.

**O histórico:** as colunas que você lê existem com esses nomes: `id`, `revisao`, `emitida_em`, `descricao`,
`revisado_por_nome`, `aprovado_por_nome`.

**Na coluna:** `codigo`, `titulo`, `revisao` (`"00"`) e `emitida_em` (data).

**Texto rico:** sempre uma lista de `{texto, negrito}`. Os espaços já vêm juntados como o navegador junta.

**A raiz do `documento`:**

| Chave | Forma |
|---|---|
| `linha_de_cima`, `subtitulo` | texto simples |
| `cabecalho` | 6 campos `{rotulo, campo}` ou `{rotulo, valor}` (abaixo) |
| `sumario` | `{rotulo, itens: [{texto, ancora}]}` |
| `como_usar` | texto rico |
| `fluxo` | `{titulo, texto, cartoes, sequencia}` |
| `secoes` | `[{ancora, numero, titulo, selo, ajuda, blocos}]` |
| `rodape` | `[{titulo, texto}]` |

**O cabeçalho:** Código, Revisão e Data **não estão no jsonb**. Vêm das colunas, para cada coisa ter um lugar só.
- Eles aparecem como `{"rotulo": "Código", "campo": "codigo"}`, e igual para `revisao` e `emitida_em`.
- A revisão traz também `"etiqueta": "Emissão inicial formal"`.
- Os outros três têm `valor`.
- A tela escreve "Rev. 00" e 31/08/2026 a partir da coluna.

**O fluxo:**
- **cartões:** `{ancora: "fluxo.c1"…, destino, tom, titulo, texto}`; o `destino` é a âncora de uma seção;
- **sequência:** `{titulo, passos: [{ancora: "fluxo.s1"…, rotulo, texto}]}`.

**Os blocos.** São seis tipos, e não cinco: **há o `aviso`**. Ele aparece 4 vezes, a primeira em `qualificacao.a1`, a
do PSQ/SiMaC. Pela sua regra, ele viraria parágrafo e perderia o tom. Vale tratá-lo.

| `tipo` | Chaves além de `tipo` e `ancora` |
|---|---|
| `paragrafo` | `texto` (rico), `miudo` (booleano: o texto pequeno) |
| `quadros` | `itens: [{ancora, titulo, texto (rico), endereco?}]`; o `endereco` é o link da seção 6 |
| `aviso` | `tom` (`"info"` ou `"warn"`), `texto` (rico) |
| `tabela` | `colunas` (textos), `linhas: [{ancora, celulas: [texto rico]}]` |
| `lista` | `ordenada` (booleano), `itens: [{ancora, texto (rico)}]` |
| `historico` | `colunas` (textos); as linhas vêm de `core.procedimento_revisoes` |

**A lista do item 5** entra como `ordenada: true`, **sem tipo de marcador**. O HTML usa `<ol class="alpha">`, mas o
estilo do arquivo não pede letra, e o documento mostra 1 a 6. Bate com o que você mostra.

**As âncoras pela posição:**
- `<secao>.p1` (parágrafo), `.q1` (quadros; itens `.q1.i2`), `.a1` (aviso);
- `.t1` (tabela; linhas `.t1.l5`), `.n1` (lista; itens `.n1.i3`), `.h1` (histórico).
- As 4 linhas de tabela com id do documento levam o id dele.
- Nascem nesta carga e não mudam nas revisões. A porta recusa revisão que tire uma das 11.

## §4 — O desfazer (emenda 4)

`docs/roteiros/desfazer_o_ps02_d730.sql`:
- tira a porta, as duas tabelas, o gatilho e a função das âncoras;
- devolve o comentário de antes da `pode_revisar_ecr`;
- tira a linha `20261006120000` do caderninho.

**A trava de entrada:** ele para se houver revisão feita no sistema (mais de uma linha no histórico, ou alguém em
"revisou" ou "aprovou"). Desfazer aí apagaria revisão de verdade.

**Provado no ensaio, numa transação desfeita, contra uma foto do catálogo da produção.** A foto cobre `core`,
`compras`, `esteira` e `correio`: a definição, as permissões e o comentário de cada função; as colunas; as políticas;
os gatilhos; as permissões das tabelas; o caderninho de outubro.

| Medida | Resultado |
|---|---|
| a produção × o ensaio depois do desfazer | **idênticos: 708 itens** (152 funções, 153 tabelas, 145 políticas, 86 gatilhos) |
| o ensaio antes × depois do desfazer | some só o que é da D730, e o comentário da `pode_revisar_ecr` volta ao da produção |
| o ensaio depois do rollback | igual ao de antes: nada ficou |
| a trava, com uma revisão simulada | **para** ("há revisão feita no sistema") |

A primeira passada apontou 4 tabelas do mestre com permissões diferentes. Eram as mesmas permissões, só em outra
ordem na lista. A foto agora ordena, e deu idêntico.

## §5 — O tamanho

O que roda na produção, sem os testes:

| | Linhas |
|---|---|
| a migration (com a carga: o documento inteiro está dentro dela) | 368 |
| o programa | 530 |
| a ordem do backup | 3 |
| **total** | **901** |

- Sem as linhas em branco e sem os comentários: 264 da migration e 451 do programa.
- O desfazer são mais 50, e o teste mais 252.
- **Com as 1.494 da OC, são 2.395.** A da OC já passa de mil sozinha. Se a minha parte vai à mesma perícia, a decisão
  é sua.

## §6 — A ordem que proponho para a produção

1. **As tabelas sobem antes da página.** A página não publica sem elas, e elas sozinhas não mostram nada a ninguém.
2. A migration, com o arquivo conferido de novo na hora (`--mudou`). Depois o `--conferir` contra a produção e o teste
   de permissão.
3. **Ao juntar o ramo na `main`,** o Railway reconstrói o backup, porque o commit mexe em `supabase/migrations/**`.
   - É o mesmo código.
   - Junto longe das 08:00.

## §7 — A D731, uma linha

A implantação do conserto do backup está em **SUCCESS** desde 11:54 (Brasília): commit `54ed297`, conferido sem rodar
nada. A prova é a rodada de amanhã, às 08:00.
