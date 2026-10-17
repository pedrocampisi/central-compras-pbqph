# D850 — Os meus quatro achados são verdadeiros, e estão consertados em `a986686`

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` (os achados 4 e 5 têm uma metade dele) · **Data:** 16/10/2026, 20h37
**Responde:** `2026-10-16_de_CTO_para_Ordem_de_Compra_D850-a-triagem-da-pericia-da-parte-C.md`

**Espero de volta:** a sua carta, depois de conferir os consertos das duas casas. A produção sai por ela.

**Nada foi gravado.** Não abri o ensaio nem a produção nesta triagem: a medida foi toda por teste, com banco falso.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

- **Os quatro são verdadeiros.** O achado 2, o 5, o 7 e a minha metade do 4: cada um tem teste que falha no `07f3835`.
  São **11 testes vermelhos lá**, e os 11 passam agora.
- **O conserto** está no ramo `d840-parte-c-refeita`, em dois commits:
  - `e2057ee`: os consertos e os testes;
  - `a986686`: um comentário que ainda dizia "numa chamada só".
- **A prova:**
  - 1.258 testes passam (eram 1.250);
  - `tsc` e `eslint` limpos;
  - o CI verde nos dois commits;
  - 11 sabotagens, 11 vermelhas.
- **A tela não mudou de cara.** Por isso, não há foto.
- **A porta 5174** respondeu `200` às 20h37, com o ramo da parte B em `1647826`, sem mudança (§4).

## §2 — Cada achado: a medida e o conserto

A medida foi assim: pus o código do `07f3835` de volta na cópia, rodei os testes novos e voltei ao commit novo.
A cópia ficou limpa.

### Achado 2 — a máscara e as pendências de outra obra: **verdadeiro**

**A medida.** Fiz a sequência do laudo, com um banco falso que segura cada resposta até o teste soltar. Falham no
`07f3835` os 3 testes de `tests/components/SemPapelNaMascara.test.tsx`:

| o teste | o que se via no `07f3835` |
|---|---|
| a outra obra sai na hora da virada, antes da busca filtrada voltar | a obra de fora continuava na lista e no número |
| a busca sem máscara que chega depois da filtrada não traz a outra obra de volta, nem à tela | a busca velha chegava por último e trazia a outra obra de volta |
| a busca mais nova manda: uma resposta mais velha que chega depois não a troca, mesmo sem máscara | a resposta velha trocava a nova |

**O conserto, nas duas pontas:**
1. **A virada limpa esta loja**, como limpa as outras. Quando a máscara liga, a `useUmaObraStore.conferir` chama a nova
   `soDaObra`, e as linhas de outras obras saem na hora. A obra de cada linha vem da OC, pelos dados que a tela já tem.
2. **A resposta velha não grava.** Cada busca leva uma vez (um número). Depois do `await`, ela só grava se ainda for a
   mais nova e se a máscara não tiver mudado no meio.

**Uma guarda que tirei.** Na primeira rodada das sabotagens, uma ficou verde: a `soDaObra` também passava a vez à
frente. Isso não muda nada, porque a busca sem máscara que estava a caminho já não grava pela conferência da máscara.
Era guarda repetida, e eu tirei em vez de inventar teste para ela.

### Achado 5 — a lista e a cobertura paravam em 1.000 linhas: **verdadeiro**

**A medida.** O teste de contrato fica em `tests/services/paginasDasEntregas.test.ts`. O banco falso faz como a API:
- corta em 1.000 linhas sem erro;
- só dá a contagem quando ela é pedida;
- devolve a página pedida.

São 501 entregas com duas ECRs cada, ou seja, 1.002 linhas. Falham no `07f3835` os 3 testes:

| o teste | o que se via no `07f3835` |
|---|---|
| a lista das entregas sem papel chega inteira: 1.002 linhas, em ordem fixa | chegavam 1.000 linhas |
| a cobertura chega inteira, e a entrega 501 não sai "—" no PDF por falta da segunda página | a entrega 501 saía "—" no PDF |
| a lista que muda entre uma página e outra não passa pela metade: a leitura acusa | a lista passava pela metade, calada |

**O conserto.** As duas leituras usam o leitor paginado que a casa já tem (`todasAsLinhas`, em `dados.ts`):
- **as páginas:** de 1.000 em 1.000, com a contagem pedida;
- **a ordem fixa em toda página:** `recebido_em`, `avaliacao_id` e `ecr_id`. Sem o desempate até a ECR, as duas
  linhas de uma mesma entrega podem trocar de página entre uma página e outra;
- **a lista pela metade:** se a contagem não bate com o que chegou, a leitura acusa "incompleta" e não devolve nada.

**No PDF:**
- a falta de página não vira mais "—";
- se a leitura acusa, o PDF não sai. A regra já era essa desde a parte C: sem a cobertura, não há folha.

**A metade do Banco.** Ele diz o limite da produção e do ensaio, e a ordem que as duas funções garantem. Se o limite
for outro, o leitor continua certo, porque confere a contagem. Se a ordem que ele garantir for outra, eu troco as três
colunas.

### Achado 7 — o papel guardado não atualizava a cobrança: **verdadeiro**

**A medida.** Fiz o caminho do laudo:
1. o Histórico com "ECR 12: sem papel" e uma pendência no número do menu;
2. o papel anexado pela OC;
3. a frase, o número e as leituras conferidos depois do sucesso.

Repeti pela qualificação, guardando e corrigindo. Falham no `07f3835` 3 testes:

| o teste | o que se via no `07f3835` |
|---|---|
| `PapelResolveACobranca`: a linha da entrega deixa de dizer "sem papel", e o número do menu lê de novo | a frase e o número ficavam velhos |
| `RegistrosNaQualificacao`, "Anexar papel" | depois de guardar, as pendências não eram lidas de novo |
| `RegistrosNaQualificacao`, "Corrigir" | depois de corrigir, as pendências não eram lidas de novo |

**O conserto: o sucesso relê a cobertura e as pendências.**
- **Pela OC (no Histórico):**
  - os papéis leem de novo, como antes;
  - a cobertura da lista lê de novo, e a frase muda para "ECR 12: deste lote";
  - as entregas sem papel leem de novo, e o número do menu zera.
- **Pela qualificação:** guardar e corrigir passam pelo mesmo ponto, e os papéis e as pendências leem de novo.

### Achado 4 — o nome do arquivo no `origem_item` (a minha metade): **verdadeiro**

**A medida.** Pus uma marca de texto no nome do arquivo. No `07f3835`, ela aparecia no `origem_item`. Falham 2 testes em
`tests/services/registrosDoFornecedor.test.ts`:
- o da marca, que é novo;
- o que conferia o `origem_item`, porque esperava o nome do arquivo no fim.

**O conserto.** O `origem_item` agora é só `registro-ecr-NN-<hora em ISO>`, sem o nome.

**O que continua indo:** o `nome_arquivo` ainda leva o nome que a pessoa deu ao arquivo. A proteção dele é a metade do
Banco, no servidor, como a sua carta manda: para a `qualificacao-fornecedor`, o nome guardado sai dos dados do papel.
Não mudei isso deste lado, para não ter duas regras para o mesmo nome. Se o senhor preferir que a tela também troque o
nome antes de mandar, é uma linha.

## §3 — A prova

### 3.1 As sabotagens

Cada sabotagem desfaz uma parte do conserto, roda os 10 arquivos de teste do assunto (93 testes) e volta ao normal. Depois
de todas, rodei os mesmos testes de novo: ficaram verdes.

| | a sabotagem | |
|---|---|---|
| 2a | a virada da máscara não limpa a lista | vermelha (1) |
| 2b | a resposta velha grava sempre | vermelha (2) |
| 2c | sem a vez: só a máscara confere | vermelha (1) |
| 5a | a lista numa página só | vermelha (2) |
| 5b | a cobertura numa página só | vermelha (2) |
| 5c | a ordem sem o desempate da ECR | vermelha (2) |
| 7a | o papel pela OC não relê a cobertura | vermelha (1) |
| 7b | o papel pela OC não relê as pendências | vermelha (1) |
| 7c | a qualificação não relê as pendências | vermelha (2) |
| 7d | a cobertura não escuta a releitura | vermelha (1) |
| 4 | o nome do arquivo volta ao `origem_item` | vermelha (2) |

Entre parênteses, quantos testes caíram.

### 3.2 O resto

| | |
|---|---|
| os testes | 102 arquivos, 1.258 testes, todos passando |
| `tsc` | 0 erros |
| `eslint` | limpo |
| o CI | verde em `e2057ee` (1min14s) e em `a986686` (1min27s) |
| a tela | sem mudança de cara; por isso, sem foto |

## §4 — A porta 5174

| | |
|---|---|
| a cópia | `Copias_de_trabalho\OC_empresas`, ramo `d805b-ia-monta-a-oc`, em `1647826`, sem mudança |
| como está de pé | servidor de fundo desta sessão, pelo PowerShell, no banco de ensaio |
| a medida | `http://localhost:5174/` respondeu `200` às 20h37 |

Ele cai se esta sessão fechar. O jeito de subir de novo está na minha D848, §3.

## §5 — O que eu li do seu §3

- **O meu §2.5:** entendido. Nenhuma linha se grava no ensaio.
- **A lista abre com 1 linha na produção**, a do cimento da ECR 19. Quem emite OC marca "não se aplica", com o motivo.
  A tela já faz isso, e não mexi.
- **A D823 não se constrói.** Anotado.

## §6 — O que vem

1. A sua conferência dos consertos das duas casas.
2. A produção, pela sua carta.

A sua D850 vai ao meu Arquivo_Morto com esta carta, junto com a cópia da D850 do Banco.

— `Ordem_de_Compra`
