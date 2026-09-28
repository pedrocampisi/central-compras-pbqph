# D607 — os sete consertos no ramo `d589-editar-ecr` (`97226b3`) e na cópia `OC_uma-obra` (`fe119e6`), NÃO publicados

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 28/09/2026, 13h4x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_e_Banco_de_Dados_D607-triagem-sete-aceitos.md`, §1 e §2.1. Responde
também a D609 §3, em uma linha (§7 desta carta).
**Espero de volta:** a sua conferência; a sua decisão sobre o portão de mil linhas (§5), porque passou; e a ordem de publicar.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** Nas medidas e nas fotos, os dados são sintéticos.

---

## §1 — Onde está

- **O ramo `d589-editar-ecr`, commit `97226b3`**, empurrado. Ele vem em cima das medidas (`5f287cd`).
- **A cópia `OC_uma-obra`, ramo `d599-uma-obra`, commit `fe119e6`**, empurrado.
  - O ramo entrou **por merge**, e não por cópia de arquivo. Houve dois conflitos, e os dois lados ficaram:
    - **`App.tsx`:** a saída esquece o rascunho guardado da máscara (D599) **e** fecha o rascunho da ECR (achado 4);
    - **`dados.ts`:** a máscara filtra dentro de cada página (a obra pelo id, as OCs pela `intervencao_id`), e a consulta
      nasce de novo a cada página.
  - O teste da máscara usava um banco falso que não sabia contar nem paginar. Ele aprendeu o que a API faz, e só isso mudou nele.
- **A pasta da casa voltou ao `main`,** para esta carta.
- **Publicado:** nada. Continua no ar a `080168b8`.
- **A perícia foi triada:** está em `docs/Arquivo_Morto/Pericias/`, com a linha no índice (lei 3 §9.3).

## §2 — Os sete: o antes e o depois de cada medida

Cada `it.fails` virou trava. Hoje o ramo tem **zero** `it.fails`.

| # | Antes (`5f287cd`) | Depois (`97226b3`) |
|---|---|---|
| 1 | `{"perguntou":false,"quantidade":10}` | pergunta antes de trocar; "Manter os meus" fica com 12 |
| 2 | `{"recusou":false}`: a linha B foi com o texto da Rev. 00 | a tela recusa e diz o que fazer; o banco recebe a revisão de origem |
| 3 | `"Resistência ? 30 MPa"`, `"Abatimento ? 10 cm"`, `"um?Linha"` | `≥` e `≤` impressos; a quebra de linha recusada no editor |
| 4 | `{"editor":true,"rascunhoNaTela":true}` | `{"editor":false,"rascunhoNaTela":false}`, e o rascunho apagado |
| 5 | `{"acusou":false,"fornecedoresNaTela":["f1","f2","f3"],"travaAoEmitir":""}` | os 5 na tela, a Alfa bloqueada; incompleto acusa |
| 6 | a mutação do perito: nenhum vermelho novo | a mesma mutação: 2 vermelhos em cada porta |
| 7 | 50 revisões: 30 páginas, sobreposição nas 30 | 50 revisões: 3 páginas, nenhuma sobreposição |

### Achado 1 — a releitura

- **Quando a resposta chega,** a tela compara de novo os itens daquela leitura com a foto tirada **na hora de mandar**.
- **Se algum mudou na espera,** a tela pergunta "Trocar os itens desta leitura?":
  - a mensagem é "Enquanto o certeiro lia, você mexeu em 1 item desta leitura. Trocar pelos do certeiro perde essas mudanças. Os
    itens que você pôs à mão ficam.";
  - os botões são **"Trocar pelos do certeiro"** e **"Manter os meus"**.
- **"Manter os meus":** a quantidade fica 12, e o aviso diz "Os seus itens ficaram como estão. A leitura do certeiro não entrou."
- **"Trocar":** a quantidade fica 10.
- **Os campos não travam durante a espera.**

### Achado 2 — o rascunho velho

- **O rascunho guarda a revisão de onde partiu.**
- **Se a ECR vigente mudou,** a tela para de oferecer "Salvar":
  - uma faixa diz: "Esta ECR foi revisada depois que você abriu o rascunho, e ele partiu de uma revisão que já não vale. Gravar
    agora desfaria a revisão nova. Copie o que quiser guardar, clique em "Cancelar" e abra a ECR de novo.";
  - o "Gravar" da confirmação confere de novo, para o caso de a revisão mudar com a janela aberta.
- **O banco:** a tela manda `p_revisao_de`, o contrato do Banco (a D607 dele). A recusa 40001 vira a mesma frase, mais "A revisão
  não foi gravada.".
- **A assinatura nova está na produção desde as 22:13 de ontem** (a D608 do Banco). O `main` publicado não chama a função, então
  **o editor tem de ir à produção já com este conserto**. Não há como publicar o editor sem ele.

### Achado 3 — o PDF

- **"≥", "≤" e os outros sinais de especificação se imprimem.** Eles vão na fonte Symbol, que é uma das fontes padrão do PDF:
  - todo leitor de PDF já tem a Symbol, então **nada é embutido**;
  - conferi o desenho no leitor do Chrome e no MuPDF.
- **O que ela cobre:**
  - ≥ ≤ ≠ ≈ ≡ ≅ − √ ∞ ∝ ∂ ∑ ∫ ∅ ′ ″;
  - as setas → ← ↑ ↓ ↔;
  - o ∆ e o Ω;
  - as letras gregas.
- **O que continua na Helvetica,** como sempre: letras, acentos, "°", "±", "²", "³", "µ", as aspas curvas e os travessões.
- **Um defeito que a foto pegou, já corrigido.** A biblioteca do PDF mede quase toda a Symbol com 580 milésimos, e a seta tem 987.
  Medida pela biblioteca, a palavra seguinte encostava na seta ("→rejeitar").
  - Agora a largura vem das métricas públicas da fonte, da Adobe.
  - Há uma trava para a largura de cada sinal e outra para o espaço depois da seta.
- **O editor recusa o que nenhuma das duas fontes desenha,** e diz qual é o caractere: "Seção 01, a linha 2 tem o caractere "☃",
  que o PDF não imprime: troque ou apague."
  - Nada que o editor aceita vira "?".
- **A quebra de linha dentro de uma linha é recusada:** "… tem uma quebra de linha: cada linha da ECR é uma linha só. Para outra, use
  "Pôr linha"."
- **O teste velho do "?" mudou com a regra.** Agora ele só vale para texto que não passou pelo editor: "a☃b" sai "a?b", e o
  editor recusa o "☃".
- **O tamanho do PDF** está no §4.

### Achado 4 — a troca de conta

- **A saída apaga o rascunho da ECR.**
- **O rascunho guarda a conta que o abriu.** Se outra conta entrar sem passar pela saída, ele também some. Há uma trava para
  cada caminho.
- **O catálogo só mostra o editor quando três coisas batem:** a conta pode revisar, o rascunho é dela e a resposta do "pode revisar"
  é da conta de agora.

### Achado 5 — a carga

- **A trava falha fechada.** Filial com bloqueio desconhecido não emite. O aviso diz: "Não deu para confirmar se esta filial pode
  receber compra nova: o cadastro dela não chegou inteiro. Recarregue a página e tente de novo."
- **O carregador pede com a contagem e vai de página em página até chegar nela.** Isso vale para as **seis listas**, e não só para
  os fornecedores:
  - fornecedores, resolvidos, obras, ECRs, OCs e ECRs de cada fornecedor;
  - cada uma com ordem e o id de desempate. A consulta resolvida ganhou `order('id')`.
  - A numeração ficou de fora: é uma linha por ano.
- **Quando não chega na contagem, a carga acusa e não segue pela metade:**
  - banco que para antes: "veio incompleta (3 de 5)";
  - resposta sem contagem: "veio sem a contagem, e não há como saber se veio inteira".
- **Depois, no mesmo banco falso de 3 linhas por pedido:**
  - os 5 fornecedores chegam, todos com o bloqueio conhecido;
  - a Alfa fica bloqueada para emitir.

### Achado 6 — as portas

- **O teste é de comportamento, nas duas portas de emissão, com a gravação espiada.** Os casos:
  - filial bloqueada: **zero gravação**, e o aviso diz o que fazer;
  - bloqueio desconhecido: zero gravação;
  - **a régua:** com a filial livre, a gravação é chamada. Isso prova que o teste enxerga a gravação quando ela acontece.
- **A porta do Histórico saiu de dentro da tela** para uma função própria, `mudarStatusDaOc`. É ela que o teste chama, e um teste a
  mais prova que o botão "Cancelar" da tela chega nela.
- **A mutação do perito** (chama a trava, avisa e segue gravando) deu **2 vermelhos em cada porta**. Antes não dava nenhum.
- **Uma coisa que a medida mostrou:** nenhum botão do Histórico leva uma OC a "emitida". Os que existem são "Entregue" e "Cancelar".
  - A trava daquela porta guarda um caminho que a tela de hoje não usa.
  - Deixei a trava como estava. **A trava da D605 ("Entregue") vai passar pela mesma função,** e o teste já tem o molde.

### Achado 7 — o rodapé

- **O rodapé tem um teto de 60 mm.**
- **Até o teto, o PDF é o de hoje, byte a byte.** Isso cobre até **10 revisões de uma linha**, ou uma revisão com a descrição de
  500 caracteres (§4).
- **Passou do teto:**
  - o rodapé mostra a nota "As revisões 00 a 40 estão no histórico completo, no fim deste documento." e as últimas que cabem;
  - com 11 ou mais revisões de uma linha, cabem 9;
  - o histórico inteiro vai em página(s) final(is), com o título "HISTÓRICO DE REVISÕES" e a cabeça da tabela repetida em cada página.
- **A descrição ganhou limite de 500 caracteres,** o mesmo número do banco:
  - a tela conta ("Até 500 caracteres (N agora)") e não deixa passar;
  - o que chega à confirmação é conferido de novo, com a frase "A descrição tem 501 caracteres; o limite é 500. Resuma o que mudou.";
  - quebras de linha e espaços repetidos viram um espaço só, porque a descrição é uma linha da tabela.
- **As medidas de depois:**
  - 50 revisões: 3 páginas, nenhuma sobreposição;
  - 10 revisões com a descrição no máximo: nenhuma sobreposição;
  - a descrição de 500 caracteres cabe numa página.
- **A medida de 6.000 letras se aposenta:** o limite não deixa mais essa descrição existir.

## §3 — A bateria e as sabotagens

**A bateria:**
- **412 testes verdes** no ramo. Eram 377 com as medidas: as 9 medidas viraram trava, e entraram 35 testes novos.
- **442 testes verdes** na cópia `OC_uma-obra`.
- Tipos e lint limpos nos dois.
- **Nenhuma chamada ao banco de verdade.**

**As sabotagens novas, 27, todas mordendo, hash igual:**

| Sabotagem | Vermelhos |
|---|---|
| (1a) a resposta não se compara com o que saiu | 3 |
| (1b) "Manter os meus" troca do mesmo jeito | 1 |
| (1c) a foto de saída tirada na resposta | 3 |
| (2a) a tela não vê o rascunho velho | 2 |
| (2b) "Gravar" não confere de novo | 1 |
| (2c) a revisão de origem não vai ao banco | 1 |
| (2d) a recusa 40001 vira a frase genérica | 1 |
| (3a) os sinais saem na Helvetica | 3 |
| (3b) o editor aceita a quebra de linha | 1 |
| (3c) o editor aceita o que o PDF não imprime | 1 |
| (3d) sem sinal, o texto não passa mais pela troca do "ᶟ" | 5 |
| (3e) a Symbol medida pela tabela da biblioteca | 1 |
| (4a) a saída não apaga o rascunho | 1 |
| (4b) o catálogo não confere o dono | 2 |
| (4c) a troca direta de conta não apaga | 1 |
| (5a) a trava volta a falhar aberta | 3 |
| (5b) o carregador para na primeira página | 2 |
| (5c) sem contagem, segue calado | 1 |
| (5d) o banco para antes do fim, e a carga segue | 1 |
| (6a) a mutação do perito na Nova OC | 2 |
| (6b) a mutação do perito no Histórico | 2 |
| (6c) o Histórico volta a gravar por conta própria | 1 |
| (7a) o rodapé sem teto | 3 |
| (7b) as páginas do histórico repetem a tabela do rodapé | 2 |
| (7c) o histórico do fim sem a cabeça | 1 |
| (7d) a descrição sem limite na tela | 2 |
| (7e) a descrição com a quebra de linha | 1 |

**As de antes mordem:**
- **D586:** 17 de 17. Duas mudaram de alvo, porque o código mudou de lugar: a (13), o "ᶟ" que vira "?", agora mora em
  `letrasDoPdf.ts`; e a (16), a tabela sem as linhas.
- **D593:** 2 de 2.
- **D596:** 21 de 21. A (14) e a (15) mudaram de alvo pelo mesmo motivo.

**No merge da cópia `OC_uma-obra`, 7 sabotagens mordendo, hash igual:**

| Sabotagem | Vermelhos |
|---|---|
| a máscara fora da obra paginada | 1 |
| a máscara fora das OCs paginadas | 3 |
| a consulta reaproveitada entre as páginas | 15 |
| 4a | 1 |
| 4c | 1 |
| 5a | 3 |
| 5b | 2 |

## §4 — O PDF: o tamanho e até onde ele fica igual

**Até onde fica igual:**
- **Seis impressões digitais (sha256) do `5f287cd`, sem conserto, viraram trava.** Elas cobrem:
  - a ECR 03;
  - a ECR 08 três vezes;
  - 10 revisões de uma linha;
  - a descrição de 500 caracteres;
  - o histórico nulo;
  - a ECR sem texto.
- **Sem sinal e dentro do teto, o PDF é o mesmo.**

**O tamanho, com a marca, antes → depois:**

| Caso | Antes | Depois |
|---|---|---|
| ECR 03 | 89.623 bytes | 89.623 bytes (igual) |
| ECR 08 | 97.486 bytes | 97.486 bytes (igual) |
| com sinais | 90.891 bytes | 91.313 bytes (+422; nenhuma fonte embutida) |
| 50 revisões | 1.510.288 bytes, 30 páginas | 146.760 bytes, 3 páginas |

**As fotos estão em `docs/Capturas/2026-09-28_D607/`:**

| Foto | O que mostra |
|---|---|
| 01a, 01b | a ECR 03 antes e depois; as duas imagens são iguais byte a byte |
| 02a, 02b | a linha dos sinais, de perto: antes, "?"; depois, ≥ ≤ ± ∆ → |
| 02c, 02d | a mesma página inteira |
| 03a–c | 50 revisões antes: a tabela por cima do cabeçalho |
| 04a–c | 50 revisões depois: a página 1 com o corpo, a nota e as revisões 41–49; as páginas 2 e 3 com o histórico inteiro |

## §5 — As linhas: passou de mil

A régua é a sua: linhas novas fora de `docs\`.

| Contra | Linhas novas | Em `src` | Em `tests` |
|---|---|---|---|
| `5f287cd` (só os consertos) | **1.185** | 592 | 593 |
| `7edb715` (as medidas e os consertos) | 1.503 | 592 | 911 |

**A D607 §2.2 contava com "abaixo de mil linhas". Não ficou abaixo.**
- A metade é de teste: as travas das duas portas, a das páginas, as seis impressões digitais do PDF e a largura de cada sinal.
- Não enxuguei para caber, porque o número é régua, não gosto.
- **Se o editor precisa de um olho de fora antes da produção é decisão sua.** Os 592 de `src` se concentram em três lugares:
  - o PDF: `generateEcrPdf.ts` e o `letrasDoPdf.ts`, novo;
  - o carregador: `dados.ts`;
  - a porta do Histórico: `mudarStatusDaOc.ts`, nova.

## §6 — O que eu não fiz

- **Nenhuma publicação.**
- **Nenhuma consulta ao banco,** nem no ensaio.
- **A D604, a D605 e a D606 não começaram.** Estão na `Devolucoes`, com o contrato do Banco (D604), a D609 dele e a D610.

## §7 — A D609 §3, em uma linha

**Sim, cadastra, mas pessoa jurídica só quando a empresa já existe.**

- **Quem pode:** "+ Novo Fornecedor", para os perfis admin, engenharia e financeiro, grava em `core.fornecedores` na produção.
- **Pessoa física:** entra com o CPF, porque não tem raiz.
- **Pessoa jurídica:** entra só quando a raiz do CNPJ já está em `core.empresa_raiz`.
  - Empresa nova, o banco recusa (`fornecedores_raiz_pendura_na_empresa`).
  - A tela diz: "O CNPJ é de uma empresa que ainda não está cadastrada. Fornecedor de empresa nova precisa ser aprovado antes de entrar
    por esta tela…".
- **A gaveta não tem campo de tipo de pessoa.** Ela grava o documento só com dígitos.
- Isto é pelo código. As regras do lado do banco são do Banco_de_Dados.

## §8 — O que fica de pé

1. **A sua conferência,** a decisão sobre o §5 e a ordem de publicar o editor.
2. **A máscara vai à perícia própria.** O ramo `d599-uma-obra` já traz os consertos, em `fe119e6`, e o texto é seu.
3. **Depois, a D604, a D605 e a D606, numa cópia nova.**
   - O Banco pediu aviso quando as telas estiverem prontas para teste.
   - A D610 dele traz duas coisas para a tela: o tipo de serviço `laboratorio`, e 2 fornecedores pessoa física sem documento,
     qualificados pelo `fornecedor_id`.

— Ordem_de_Compra
