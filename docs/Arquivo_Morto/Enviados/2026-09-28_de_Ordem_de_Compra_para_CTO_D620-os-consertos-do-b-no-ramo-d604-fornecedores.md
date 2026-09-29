# D620 — os sete consertos do B no ramo `d604-fornecedores`; as duas famílias varridas; 1.332 linhas, perícia pequena

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 28/09/2026, 21h4x
**Responde:** `2026-09-28_de_CTO_para_Ordem_de_Compra_D620-triagem-das-duas-pericias-onze-aceitos.md` (a carta do ramo
`d604-fornecedores`, §4, e a busca das duas famílias, §2).
**Espero de volta:**
- a sua conferência;
- a perícia pequena: este ramo passa de 1.000 linhas, então o senhor a prepara e o Pedro a dispara;
- e, quando for a hora, a ordem de publicar.

**Publicado: nada.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** Os testes usam dados inventados e banco
falso; nenhuma chamada ao banco de verdade.

---

## §1 — Em uma linha

**Os sete achados da perícia de `fe119e6..ebbebb0` estão consertados no ramo `d604-fornecedores`, ponta `1be6d46`, CI
verde.** Os dez `it.fails` viraram testes comuns, todos verdes. A busca das duas famílias achou mais um caso, o PDF da
OC, que está no ar, e ele foi consertado pelo mesmo caminho. **São 1.332 linhas novas contra `ebbebb0`, acima do
portão.** Continua no ar a `080168b8`.

## §2 — O ramo

| commit | o que é |
|---|---|
| `457fc20`, `d504c0f` | as medidas (a D616) |
| `16f1270` | merge do `d599-uma-obra` no `428db2f`: os consertos do A, como a D620 §4 manda |
| `626e478` | os sete consertos do B, mais a busca das famílias |
| `1be6d46` | merge do `d599-uma-obra` no `d0b244b`: o Duplicar da D621 e o `main` até `f0a6a1d` |

- **A bateria:** 589 testes em 45 arquivos, todos verdes; tipos e lint limpos; o pacote gerado pelo PowerShell.
- **O CI está verde na ponta `1be6d46`** (execução 36504138138).
- **No ramo inteiro não há mais `it.fails`.** Eram 17 no `d504c0f`, e hoje são 0:
  - os 7 do A viraram testes comuns no `d599-uma-obra`;
  - os 10 do B viraram testes comuns aqui.

## §3 — As linhas: 1.332, acima do portão

Contra `ebbebb0`, em `src/` e `tests/`: **1.332 linhas novas e 151 tiradas.** Em `src/` são 501 novas e 139 tiradas; em
`tests/`, 831 e 12.

| de onde vêm | novas | tiradas |
|---|---|---|
| as medidas (`ebbebb0..d504c0f`, só testes; o senhor já as viu na D616) | 436 | 8 |
| os consertos do B e a busca das famílias (`16f1270..626e478`) | 729 | 145 |
| (dentro dele) em `src/` | 409 | 120 |
| (dentro dele) em `tests/` | 320 | 25 |
| o que veio do `d599-uma-obra` pelos dois merges (A1 a A4 e a D621, contados também na carta daquele ramo) | 205 | 36 |

- **Pela regra, o ramo passa de 1.000, e vai à perícia pequena.** O senhor prepara, e o Pedro dispara.
- **Uma sugestão, se ajudar:** o que é novo para o perito são os `729` do `626e478`. As medidas ele mesmo pediu, e o A
  segue no ramo de lá.
- **No `626e478`, o maior pedaço de `src/` é o PDF:**
  - o caminho dos sinais saiu de dentro do PDF da ECR e virou um módulo só (`textoComSinais.ts`);
  - o PDF da ECR perdeu 68 linhas.

## §4 — Cada achado: a propriedade, o antes e o depois

"Antes" é a medida da D616, no `d504c0f`, marcada `it.fails`. "Depois" é o mesmo teste, sem o `.fails`, verde no
`1be6d46`. Nenhuma medida mudou de texto nem de verificação; só perdeu o `.fails`. Os testes novos de cada
achado estão descritos abaixo da tabela.

| achado | a propriedade da D620 §3 | antes | depois |
|---|---|---|---|
| B1 | o canal de `avaliacoes_entrega` com `intervencao_id=eq.<obra>`, refeito na virada; o de `qualificacoes` sem filtro; o comentário errado sai | 1 `it.fails` | verde |
| B2 | título e linhas do mesmo retrato da máscara; recomeça ou recusa com aviso | 2 `it.fails` (ligou, desligou) | 2 verdes, e um controle |
| B3 | a situação é a regra do contrato no dia mostrado | 3 `it.fails` | 3 verdes |
| B4 | texto livre pelo caminho dos trechos; o teste lê o texto do PDF | 1 `it.fails` | verde |
| B5 | o desempenho pelo `todasAsLinhas` | 1 `it.fails` (1.001 com teto de 1.000) | verde |
| B6 | a tratativa escondida não vai ao banco; "Aberta" só se o Painel e a ciência a oferecem | 1 `it.fails` | verde |
| B7 | converter para Brasília antes de cortar a data | 1 `it.fails` (a ciência às 21h30) | verde |

- **B1:**
  - O canal de `avaliacoes_entrega` vai com o filtro da obra quando a máscara está ligada.
  - O `App` já refazia o canal quando a máscara vira. O teste agora prova que o canal novo leva o filtro novo, nos dois
    sentidos.
  - `qualificacoes` fica sem filtro, porque a qualificação é da empresa e não da obra.
  - O comentário errado foi corrigido.
- **B1, extras da mesma família:**
  - Ao ligar a máscara, as tratativas de outra obra também saem da tela na hora, como as OCs saíram no A1.
  - Uma carga de qualificações pedida noutro estado da máscara vai fora, como a dos dados.
- **B2:**
  - O PDF das avaliações tira o retrato da máscara antes de ler.
  - Ele lê as linhas com aquele retrato.
  - Se a máscara virou durante a espera, não sai PDF. A pessoa vê: "A opção "mostrar só uma obra" ligou ou desligou
    enquanto o PDF era preparado. Gere o PDF de novo."
  - O controle prova que, sem virada, o PDF sai.
- **B3:**
  - A situação exibida é recalculada pela regra do contrato no dia de Brasília: vencida, vence em até 30 dias,
    qualificada.
  - Isso vale para o PDF, o selo, a ficha, a gaveta, a Nova OC e a trava da emissão.
  - Um relógio acorda a tela à meia-noite de Brasília.
  - Os dois testes novos:
    - a lista aberta vira sozinha à meia-noite;
    - a emissão depois da meia-noite lê a situação do dia, e não a da carga.
- **B3, um conserto nos testes antigos:**
  - As fixturas da `TravaDaQualificacao` inventavam uma situação que não batia com o vencimento: "vencida" com vencimento
    no futuro.
  - Com a regra do dia, a situação passou a sair do vencimento. Então cada fixtura ganhou um vencimento coerente com a
    situação que ela quer testar.
  - Nenhuma verificação mudou.
- **B4:** as folhas do auditor escrevem as tabelas, o título e o subtítulo pelo mesmo caminho do PDF da ECR.
  - A prova lê o texto de dentro do PDF, com o gabarito escrito à mão da fonte Symbol da Adobe.
  - Os dois testes novos: uma observação longa que quebra linha no meio do sinal, e o tipo dos qualificados com "≥".
- **B5:** o desempenho lê de 1.000 em 1.000 pelo `todasAsLinhas`, com contagem exata.
  - O teste novo prova que uma página incompleta recusa a carga, em vez de mostrar pela metade.
- **B6:**
  - Com uma "Não Conforme" só, a tratativa vai ao banco vazia. O texto continua na caixa, se a pessoa voltar a resposta.
  - No PDF, "Aberta" só aparece quando o Painel e a ciência a oferecem (`pedeTratativa`). Sem isso sai "—", e isso vale
    também para registros antigos.
- **B7:** a ciência é convertida para o dia de Brasília antes de cortar a data. Às 21h30 de 28/09, sai 28/09.
- **O aviso do Banco (D618 §5):** uma trava nova, sem conserto, porque a tela já estava certa. Às 21h30 de Brasília, o
  recebimento sugerido e o máximo do campo são 28/09.

## §5 — A busca das duas famílias no `src/` inteiro

### B4: todo PDF da casa escreve texto livre pelo caminho do PDF da ECR

**Achei um caso, e ele está no ar: o PDF da OC.**

- **O que ele escrevia direto na Helvetica, sem passar pelo caminho dos sinais:**
  - a descrição do item;
  - a observação do item;
  - as observações da OC;
  - as condições;
  - o texto da qualidade.
- **O efeito de um "≥" ali:** a biblioteca grava a frase inteira em outra codificação, e o leitor mostra **a frase toda
  estragada**, e não só o sinal.
- **A medida:** dois testes leem o texto de dentro do PDF da OC (o item, e as observações). Ficaram vermelhos antes
  do conserto.

**O conserto:** o mesmo módulo das folhas.

- A tabela de itens usa os ganchos do módulo.
- Observações, condições e texto da qualidade vão pelos trechos, e só quando têm sinal.
- **Sem sinal, o PDF da OC sai idêntico byte a byte:** mesmo sha256 (`8423e492…`), 16.689 bytes, antes e depois.
- O PDF da ECR também sai igual: a prova `ecrPdfIgual` continua verde.
- Abri os dois PDFs com sinal, o da OC e o das avaliações. Os sinais aparecem certos, e o resto da frase está inteiro.

**O que eu não mudei, e deixo para o senhor:**

- Os campos de cadastro no cabeçalho da OC: razão social, endereço, nome da obra.
- Não são texto livre de quem emite a OC; vêm do cadastro.
- Se o senhor quiser a regra também para eles, é o mesmo caminho, e custa poucas linhas.

### B5: toda leitura que pode passar de mil linhas passa pelo `todasAsLinhas`, ou recusa a carga incompleta

**Achei só o desempenho, que é o próprio B5.** As outras leituras sem paginação têm teto pelo contrato:

- o perfil de quem entrou (uma linha);
- a numeração (uma por ano);
- as categorias (5);
- os critérios (15, fixos pelo contrato);
- as leituras de uma linha só, por chave;
- as funções do banco que devolvem um objeto só.

As tabelas que podem crescer já passam pelo `todasAsLinhas`: OCs, obras, fornecedores, fornecedores resolvidos, ECRs,
ECRs de cada fornecedor, qualificações, tratativas abertas, avaliações de entrega e, agora, o desempenho.

## §6 — As sabotagens

Cada conserto foi desfeito, um por vez, pelo roteiro que restaura e confere o sha256. Rodou a bateria do arquivo.

| sabotagem | resultado |
|---|---|
| B1: o canal sem o filtro da obra | vermelha |
| B1 extra: as tratativas sem sair da tela na hora | vermelha |
| B1 extra: a carga velha de qualificações aceita | vermelha |
| B2: sem conferir a máscara depois de ler | vermelha |
| B3: a situação da carga no PDF | vermelha |
| B3: a situação da carga na lista | vermelha |
| B3: sem o relógio da meia-noite | vermelha |
| B6: a tratativa escondida enviada | vermelha |
| B6: "Aberta" sem o `pedeTratativa` | vermelha |
| B7: cortar a data em UTC | vermelha |
| B4: as folhas sem os ganchos | vermelha |
| B4: a tabela da OC sem os ganchos | vermelha |
| B4: as observações da OC direto na Helvetica | vermelha |
| B4: a volta dos sinais nas linhas quebradas desligada | vermelha |
| B5: o desempenho numa leitura só | vermelha |

**15 de 15 vermelhas, 15 de 15 com o mesmo sha256.**

## §7 — O que segue

- **A perícia pequena:** o senhor prepara, e o Pedro dispara.
- **A publicação:** pela sua ordem da D620, primeiro sobe o `d599-uma-obra`; depois, este ramo. No mesmo dia, o Banco liga
  as travas e o tempo real, e o tempo real das avaliações só depois do B1 no ar.
- **Nada vai ao ar antes da sua ordem.**
