# D586 + D588 + D589 (1º passo) — a tela de ler as ECRs e o PDF, no ramo `eca44c1`. Nada publicado

**De:** Ordem_de_Compra
**Para:** CTO — com cópia ao `Banco_de_Dados`, só pelo §6
**Data:** 27/09/2026, 11h4x
**Responde:**
- `2026-09-27_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D586-as-ECRs-iguais-as-do-SGQ.md`, §4;
- `2026-09-27_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D588-a-ECR-do-sistema-e-a-que-vale.md`, §4;
- `2026-09-27_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D589-so-o-Pedro-muda-a-ECR-e-o-PDF.md`, §4, o **primeiro**
  passo (a tela de ler e o PDF) e o item 4 (o comentário do `auth.ts`).

**Espero de volta:**
- o seu olhar nas fotos;
- a sua palavra sobre o subtítulo (§2);
- a ordem de publicar. **Não publiquei.**

**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta nem nas fotos.** Os nomes do histórico nas
fotos e nos PDFs de prova são inventados ("Revisor de teste", "Aprovador de teste").

---

## §1 — Onde está

- **Ramo:** `d586-ecrs-do-sgq`, commit **`eca44c1`**, empurrado. Ele já traz a D585, que está no ar. O `main` continua
  sem ele.
- **Bateria:** 342 testes verdes (eram 300; entraram 42), tipos e lint limpos.
  - `tests/domain/ecr.test.ts`: a lógica pura.
  - `tests/services/ecrPdf.test.ts`: lê o texto **de dentro do PDF**, página por página.
  - `tests/components/CatalogoEcr.test.tsx`: a tela.
- **Sabotagens:** 18 novas mordem (§7). As 55 de antes também mordem: as 51 de sempre e as 4 da D585. O hash volta
  igual em todas.
- **A sua condição de publicar está cumprida do lado do banco.** A tabela do histórico está na produção desde as
  10:58 (carta do Banco da D588/D589). Falta a sua ordem.

## §2 — A tela (D586 §4 com a D588 §4)

**A lista fechada.** Cada ECR mostra:
- o código, o nome e a categoria;
- "Rev. 00 · emitida em 15/04/2026" (a ECR 04 diz "Rev. 01");
- o botão **PDF**.

**A ECR aberta:**
- **as cinco seções**, "01. REFERÊNCIA" a "05. MANUSEIO…", com o traço embaixo do título, como no documento;
- **a lista** com o quadradinho, e o rótulo em negrito ("**Lote:** cada entrega…");
- **a nota fora da lista**, em destaque (negrito, com a faixa e o fundo da cor de erro dos tokens). No Word ela é negrito
  vermelho;
- **"Materiais"**, com o título simples (D588 §4.3);
- **o histórico de revisões no fim** (D588 §4.2), em tabela: Revisão, Data, Descrição, Revisado por, Aprovado por. A 375
  a tabela não cabe, e cada revisão vira um bloco com o nome da coluna ao lado do valor.

**Saíram da tela** Objetivo, Escopo, Normas Técnicas, Documentos Obrigatórios, Critérios de Recebimento, Ensaios e
Observações. Os campos continuam no banco; a tela só não os lê.

**O que falta, a tela diz numa linha:**
- ECR sem texto: "O texto desta ECR ainda não foi carregado.";
- histórico não lido: "O histórico de revisões desta ECR ainda não foi carregado." Nunca uma tabela vazia.

**O subtítulo — a minha proposta** (D588 §4.1, pela régua da D475):
> Especificações de Compra e Recebimento — 20 ECRs. **O texto em vigor de cada ECR, com o histórico de revisões no
> fim.**

Não fala de cópia nem de SGQ, porque agora não há outro documento. Se quiser outras palavras, a troca é uma linha.

**A seta.** O ▲▼ era texto. Virou desenho (a regra 6 da casa), sem animação ao abrir (a regra 8).

## §3 — O histórico: lido de `compras.ecr_revisoes`, pelo contrato do Banco

- **Vem junto com as ECRs,** na mesma leitura: `revisoes:ecr_revisoes(id, revisao, emitida_em, descricao,
  revisado_por_nome, aprovado_por_nome)`.
- **Os nomes vêm das colunas `_nome`,** como o contrato manda. **A ordem** é a data da revisão e, no empate, a chave.
- **O texto de cada revisão velha** (`secoes` do histórico) **não vem.** A tela de ler não precisa dele, e ele é o que
  pesa.
- **Medido na produção, só lendo:**
  - a tabela tem uma chave só para as ECRs (`ecr_id` → `compras.ecrs.id`), e por isso a leitura junto funciona;
  - 20 linhas de histórico, 368 linhas de texto e 17 notas, como o Banco escreveu.
- **O que não provei:** a leitura contra a API de verdade. Ela exige login, e prova minha não usa login. A prova é a
  chave medida mais os testes. Depois de publicar, quem abre logado vê.

## §4 — O PDF (D589 §4.1)

**O botão:**
- "PDF", de contorno, em cada ECR que tem texto, fechada ou aberta, para todo mundo que vê o catálogo;
- não abre nem fecha a ECR;
- baixa `ECR 03 - Concreto Usinado - Rev 00.pdf`.

**A biblioteca:** jsPDF, a do PDF da OC, com a mesma marca.

**Em toda página:**
- o cabeçalho: a marca, "ECR – ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO", o nome, o código e "Rev.: 00";
- no pé, a tabela de revisões e "Página N de M".

**No corpo:**
- as seções "01." a "05.", com o traço;
- o quadradinho nas linhas da lista, e o rótulo em negrito;
- a nota fora da lista, sem quadradinho, em negrito vermelho, como no Word.

**Uma correção na premissa.** A carta diz "numeradas como no Word (1, 1.1, 1.2…)", mas o Word **imprime** outra coisa.
- Exportei a ECR 03 e a ECR 08 do Word para PDF, só lendo. A digital do `.docx` ficou igual antes e depois.
- O que sai impresso: **"01." nos títulos e um quadradinho em cada linha.** Não há 1.1.
- Segui o que o Word imprime.

**O "mᶟ" da ECR 03.** A fonte do PDF não tem esse caractere, e ele é o único das 368 linhas nessa situação. No PDF ele
sai "m³", que é como o Word mostra. Qualquer outro caractere fora da fonte sai "?", para nunca sumir calado. **A tela
mostra o texto como está no banco.**

**A ECR 08:**
- no Word, ela passa para a 2ª página por uma linha; no PDF, cabe numa página, porque a letra é um pouco menor;
- a quebra de página está provada no teste: as cinco seções três vezes; o cabeçalho, a tabela e o número em toda página;
  cada uma das 24 linhas aparece exatamente 3 vezes.

**O peso — achei e consertei.**
- O jsPDF grava a marca **sem compressão** (1080 × 974 pontos, com transparência). Assim, o PDF de uma página passava
  de **4 MB**.
- Com a compressão ligada, o da ECR 03 tem **88 KB** e o da ECR 08, **95 KB**. O do Word tinha 98 KB.
- Há teste com a marca de verdade (abaixo de 300 KB) e a sabotagem 17.

**⚠️ Um achado fora desta carta: o PDF da OC que está no ar pesa 4,1 MB por OC,** pela mesma causa.
- Medi no navegador local, com uma OC de teste.
- **Não mexi nele:** a D586 §5 diz que o PDF da OC não muda.
- O conserto é uma palavra (`'FAST'`, no `addImage` da marca). Se quiser, mande a carta.

## §5 — As fotos

Estão em `docs\Capturas\2026-09-27_D586\`.

**Os dados das fotos:**
- as 20 ECRs com o texto como está na produção: 368 linhas, sem o "." e o "2" soltos;
- os nomes do histórico são inventados.

| Foto | 1920×1080 | 375 |
|---|---|---|
| `01_lista_fechada` | antes e depois | antes e depois |
| `02_ecr03_aberta` (a ECR inteira, até o histórico) | antes e depois | antes e depois |
| `03_ecr08_aberta` (idem) | antes e depois | antes e depois |
| `04_historico_aberto` | depois | depois |
| `05_pdf_ecr03.pdf` e `05_pdf_ecr08.pdf`, e as páginas em imagem (`…_pagina1.png`) | — | — |

**Sobre o tamanho das fotos:** as fotos da ECR aberta crescem na altura até mostrar a ECR inteira (1920 × 2366 a 375 ×
4608). As outras são da tela como ela é.

**A medida nas 14 fotos da tela** (6 de antes e 8 de depois):
- rolagem de lado 0, nada fora da tela e nada vazado da moldura;
- nada sobreposto, fora as duas fotos do histórico. Nelas, o título que rolou para baixo do topo está meio escondido pela
  borda da rolagem. Olhei as fotos: não há sobreposição de verdade.
- O medidor aprendeu a ignorar o que a rolagem esconde. Na primeira rodada, ele contou os cartões escondidos atrás do
  topo.

## §6 — Para a tela de editar: a ECR 02 tem uma linha com o texto vazio (e cópia ao Banco)

- **ECR 02, seção 02 (Especificação de compra e recebimento), linha 2:** o rótulo "Dimensão" e o texto **vazio**. Medi
  na produção, só lendo, e é a **única** das 368.
- **O efeito:** a `revisar_ecr` exige texto com letra em toda linha (carta do Banco, §1). Se a linha ficar como está,
  **toda revisão da ECR 02 é recusada (22023)**, mesmo que o Pedro mude outra coisa.
- **A tela de ler mostra a linha como está:** "**Dimensão:**" sem nada depois, igual ao Word.
- **Proponho, para a tela de editar:**
  - conferir as mesmas regras da função **antes** de mandar;
  - apontar a linha: "A linha 'Dimensão' está sem texto: escreva o texto ou tire a linha."
  - O Pedro decide o que ela diz. A decisão é sua, ou do Banco, se preferir aceitar texto vazio quando há rótulo.

**Mais dois pontos da carta do Banco:**
- **O mapa `compartilhado/tipos-banco.ts`:** nenhum código da OC o importa. Não há o que puxar.
- **A ECR 04** fica recusada (55000) até a sua decisão, e a tela de editar vai respeitar isso.

## §7 — As 18 sabotagens novas (todas mordem; hash igual)

1. a nota entra na lista;
2. ECR sem seções vira lista vazia;
3. o subtítulo volta a dizer "cópia das ECRs do SGQ";
4. os materiais voltam ao título longo;
5. o histórico perde o desempate pela chave;
6. os nomes lidos da coluna errada (o uuid, e não a `_nome`);
7. o rótulo sem negrito;
8. o histórico some da tela;
9. histórico não lido vira tabela vazia;
10. uma seção antiga volta;
11. o botão PDF aparece em ECR sem texto;
12. o cabeçalho do PDF só na primeira página;
13. o texto do PDF não quebra a página;
14. o "mᶟ" vira "?";
15. a lista sem o quadradinho;
16. a nota ganha o quadradinho;
17. a tabela de revisões sem as linhas;
18. a marca volta sem compressão (4 MB).

## §8 — O `auth.ts` (D589 §4.4) e o que vem

- **O comentário velho foi corrigido.** O `pode_editar_cadastro` dá `true` a admin, engenharia e financeiro, como você
  mediu. O texto da ECR é só do usuário do Pedro, e salvar é aprovar. Isso não é um papel: a regra mora no banco.
- **O próximo passo é a tela de editar (D589 §4.2).** A função do Banco já está na produção, então ele não espera mais.
  - Começo num ramo à parte, a partir deste, e mando a carta com as fotos.
  - Os pontos em aberto são a linha da ECR 02 (§6) e a ECR 04.
  - Não publico nada sem a sua ordem.

— Ordem_de_Compra
