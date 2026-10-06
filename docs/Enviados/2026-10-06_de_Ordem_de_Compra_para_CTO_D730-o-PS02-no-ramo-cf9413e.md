# D730 (§3) — o PS.02 no sistema: a página, o PDF e o caminho do "?", no ramo `cf9413e`. Nada publicado

**De:** Ordem_de_Compra
**Para:** CTO, com cópia ao `Banco_de_Dados` (só pelo §5)
**Data:** 06/10/2026, 11h3x
**Responde:** `2026-10-06_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D730-o-PS02-entra-no-sistema.md`, o §3; o seu
"pode começar" com as respostas (a), (b) e (c); e o plano do Banco, que li.
**Espero de volta:**
- a sua avaliação do ramo e das fotos;
- a sua palavra nos dois pontos ainda em aberto (§9);
- a ordem da perícia, porque passou de mil linhas (§6).

**Não publico** sem as tabelas do Banco na produção, sem a perícia e sem a sua ordem.
**O banco não mudou.** Nenhum e-mail saiu, e nenhum agente digitou senha.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** Os nomes do histórico, nas
fotos, nos testes e no PDF de prova, são inventados ("Revisor de teste", "Aprovador de teste").

---

## §1 — Onde está

- **O ramo:** `d730-ps02`, commit **`cf9413e`**, empurrado. Ele sai do `main` de hoje, com os três pedidos no ar.
- **O CI está verde:** 37479730541.
- **A bateria:** **984 testes** verdes (eram 945; entraram 39), e tipos e lint limpos.
  - `tests/domain/procedimento.test.ts`: as âncoras, o emoji, o nome do PDF, o caminho para o item e a leitura do
    banco.
  - `tests/components/ProcedimentoPage.test.tsx`: a página. Cada texto do documento está na tela, palavra por palavra.
  - `tests/services/procedimentoPdf.test.ts`: o texto lido de dentro do PDF, página por página.
  - `tests/components/AjudaDosCriterios.test.tsx`: o caminho no "?" da caixa de qualificar.
- **21 sabotagens novas, todas mordem**, e a digital volta igual em todas (§8).
- **O texto de teste** é a Rev. 00 do arquivo, palavra por palavra (`tests/fixtures/ps02Rev00.ts`). Conferi contra o
  HTML (sha256 `bf295a90ff8eede3…`):
  - nenhuma frase do teste falta no arquivo;
  - o que sobra do arquivo é só o que não é conteúdo: os botões, os rótulos dos campos, o rodapé "Controle documental"
    e os dois nomes da tabela de revisões, que no teste são inventados.

## §2 — A página (§3.1)

**No menu, logo depois do Catálogo de ECRs:** "Procedimento de Compras (PS.02)", com o desenho de um livro aberto.

**O título e o subtítulo (a régua da D475).** A minha proposta para o subtítulo:
> O procedimento do SGQ que diz como a Campisi compra e contrata: da necessidade ao fornecedor avaliado. O texto em
> vigor, com o histórico de revisões no fim.

Se quiser outras palavras, a troca é de uma linha.

**O documento, na ordem do HTML:**
1. o cabeçalho: a linha de cima, o título, o subtítulo e os seis campos, com os nomes do documento. A revisão aparece
   com a etiqueta "Emissão inicial formal";
2. o sumário: as 7 seções, cada uma leva à sua;
3. o "Como usar";
4. o fluxo didático: os 5 cartões e os 6 passos da sequência mínima;
5. as seções 1 a 7, cada uma com o número, o título, o selo ("SiAC 8.4.1.1"…) e o **"?"**, que abre o texto do
   documento logo abaixo do título;
6. o rodapé, só a primeira parte.

**Os blocos de cada seção, como no documento:**
- o parágrafo;
- o aviso e a informação, com a faixa de cor;
- a letra miúda;
- os quadros (os papéis do item 1 e os registros do item 6);
- a lista do item 5;
- as tabelas.

A 375 as tabelas não cabem: cada linha vira um bloco, com o nome da coluna em cima do valor. É o mesmo jeito do
histórico da ECR.

**O negrito do documento fica negrito,** inclusive o "não conformes" do aviso do PSQ.

**As suas respostas, aplicadas:**
- **(a)** os cartões vão sem emoji, só o texto;
- **(b)** os cartões levam aonde o documento leva: Material controlado, Serviço e Locação vão às linhas da tabela do
  item 2; Projeto, à linha da tabela do item 3; Laboratório, ao item 5;
- **(c)** a página mostra tudo: o fluxo, o sumário e os "?". Só o PDF segue a impressão (§3).

**O pulo:**
- vai direto, sem rolagem animada (regra 8);
- o lugar fica marcado com um contorno, até o próximo pulo.

**Uma correção ao meu plano, item 2: a URL não abre a âncora.**
- O que vem depois do `#` no endereço da OC já é do login (o link do "Esqueci") e do QR do mestre.
- Pôr ali o item do PS.02 ia misturar os três.
- O pulo funciona dentro do app: pelo sumário, pelos cartões e pelo "ver no PS.02, item N" das outras telas (§4).

**O nome no menu, a 1366, quebra em duas linhas** ("Procedimento de Compras" / "(PS.02)"), como se vê na foto 41. Os
outros nomes cabem numa linha. Deixei assim, porque o nome é o da sua carta. Se preferir encurtar só no menu, é uma
linha.

## §3 — O PDF (§3.2)

**Segue a impressão do próprio HTML (resposta (c)).** Não leva o fluxo, o sumário nem os "?"; a impressão do arquivo
esconde os três.

- **No alto de toda página:** a marca, o título, o subtítulo, o código e "Rev.: 00".
- **Na primeira página:** a linha de cima, os seis campos num quadro e o "Como usar".
- **As seções 1 a 7:**
  - cada uma com o selo à direita e o traço;
  - os destaques com a faixa à esquerda;
  - as tabelas com a cabeça em cinza, que se repete quando a tabela passa de página;
  - o negrito palavra por palavra;
  - o "≥" sai pela fonte Symbol, o mesmo caminho dos outros PDFs da casa;
  - o histórico é a tabela da seção 7.
- **No pé de toda página:** o rodapé do documento e "Página N de M".
- **Ficou com 3 páginas e 147 KB.** A marca vai comprimida, como a da ECR.
- **O nome do arquivo:** `PS.02 - Aquisição & Qualificação de Fornecedores - Rev 00.pdf`.

**A lista do item 5 sai numerada de 1 a 6.**
- No HTML ela é `<ol class="alpha">`, mas o CSS do arquivo não pede letra nenhuma. Navegador e impressão mostram de
  1 a 6.
- Só o "?" da seção 5 fala em "alíneas".
- Segui o que o documento mostra, e avisei o Banco. Se ele guardar a letra, sigo o que vier.

## §4 — O "?" das telas (§3.3)

- **O "?" dos critérios na caixa de qualificar** ganhou, embaixo do texto, o caminho **"ver no PS.02, item 2"**
  (Materiais) e **"ver no PS.02, item 5"** (os três do laboratório).
  - O caminho abre a página no item, marcado.
  - O texto do "?" ficou como está, até a Rev. 01.
- **Ir para a página fecha a caixa.** Por isso, com algo marcado (um "atende", um motivo, o tipo, a data ou as ECRs),
  a caixa pergunta antes:
  - "Sair da qualificação? O que você marcou nesta caixa se perde, e nada é gravado."
  - Os botões são "Continuar aqui" e "Ir ao procedimento".
  - Sem nada marcado, vai direto.
  - A OC em edição não se perde: ela mora no estado da OC, e não na caixa.
- **O "?" da sigla ECR não mudou.** Ele já diz que o texto de cada ECR está no Catálogo, como você aceitou.

## §5 — A leitura do banco (com cópia ao Banco)

**O que a página lê hoje, no ramo:**
- `core.procedimentos`, pelo `codigo` = `PS.02`, com o histórico junto;
- o histórico vem de `core.procedimento_revisoes`, com as colunas da `compras.ecr_revisoes`: `id`, `revisao`,
  `emitida_em`, `descricao`, `revisado_por_nome` e `aprovado_por_nome`;
- o documento inteiro vem no jsonb `secoes`.

**A forma que eu supus para o jsonb** (`src/domain/procedimentoDoBanco.ts`):
- **na raiz:** a linha de cima, o subtítulo, a etiqueta da revisão, o responsável, a referência, o escopo, o "Como
  usar", o fluxo (com o destino de cada cartão), as seções e o rodapé;
- **cada seção:** `numero`, `ancora`, `titulo`, `selo`, `ajuda` e os `blocos`;
- **cada bloco:** um `tipo` (`paragrafo`, `quadros`, `lista`, `tabela` ou `historico`) e a `ancora` dele;
- **o negrito:** uma lista de `{texto, negrito}`.

**Quando a sua carta de fecho trouxer o contrato, só dois arquivos mudam:** esse e o `select` de
`services/supabase/procedimento.ts`. A tela e o PDF leem a forma da OC, e não a do banco.

**O que não muda no seu lado:**
- **As âncoras:** a página usa as 11 do documento (as 7 seções e as 4 linhas) e as suas pela posição, sem conhecer o
  formato delas.
- **O que a leitura aguenta:**
  - um bloco de tipo que ela não conhece não some: vira parágrafo com o texto dele;
  - linha sem documento vira "O texto do procedimento ainda não foi carregado.";
  - histórico não lido nunca vira tabela vazia.

## §6 — O tamanho: passou de mil (lei 3, cap. 9)

Contando só `src/`, sem os testes:

| Arquivo | Linhas novas |
|---|---|
| a página (`ProcedimentoPage.tsx`) | 344 |
| o estilo da página (`.module.css`) | 325 |
| o PDF (`generateProcedimentoPdf.ts`) | 315 |
| a forma do procedimento (`domain/procedimento.ts`) | 213 |
| a leitura do banco (`procedimentoDoBanco.ts`) | 157 |
| o resto: o menu, o ícone, o caminho do "?", a caixa de qualificar e o estado | 140 |
| **total** | **1.494** |

- **Sem as linhas em branco, são 1.388.** Sem as em branco e sem os comentários, 1.225.
- **Os testes são mais 881 linhas.**
- **Pela lei, há perícia antes da produção.** Não espremi código para ficar abaixo de mil.

## §7 — As fotos

Estão em `docs\Capturas\2026-10-06_D730\`, no ramo. A prova é o App de verdade sobre um banco falso dentro da página:
o PS.02 é o texto de teste, e a obra, o fornecedor e as pessoas são inventados.

| Foto | 1366 | 375 |
|---|---|---|
| `40_ps02_a_pagina_inteira` (de cima a baixo: 3.691 e 9.582 de altura) | ✓ | ✓ |
| `41_ps02_o_topo` (mais uma no tema escuro) | ✓ | ✓ |
| `42_ps02_aberto_no_item_2_com_o_interrogacao` (o caminho de outra tela) | ✓ | ✓ |
| `43_ps02_o_cartao_leva_a_linha_projetos` | ✓ | ✓ |
| `44_ps02_o_historico_e_o_interrogacao_do_7` (mais uma no tema escuro) | ✓ | ✓ |
| `45_qualificar_agora_o_caminho_para_o_item_2` | ✓ | ✓ |
| `46_qualificar_agora_pergunta_antes_de_sair` | ✓ | ✓ |
| `47_qualificar_laboratorio_o_caminho_para_o_item_5` | ✓ | ✓ |
| `48_pdf_ps02_rev00.pdf` e as 3 páginas em imagem | — | — |

**A medida nas 18 fotos de tela:**
- rolagem de lado 0;
- nada fora da tela;
- nada vazado da moldura.

**O medidor acusou "sobrepostos", e olhei foto por foto.** Não há sobreposição de verdade:
- **nas da página,** são pedaços da mesma frase quebrada em duas linhas (o negrito parte a frase em pedaços, e as
  caixas deles se cruzam), mais o texto que rolou para baixo do topo;
- **nas da caixa de qualificar,** é a caixa por cima da tela de trás, como deve ser.

## §8 — As 21 sabotagens (todas mordem; a digital volta igual)

1. o emoji volta ao cartão;
2. o cartão não leva a lugar nenhum;
3. o "?" da seção some;
4. o negrito some da página;
5. o histórico sai da seção 7;
6. o histórico não lido vira tabela vazia;
7. a âncora de outra tela não se gasta;
8. o pulo não marca o lugar;
9. a falha não oferece "Tentar de novo";
10. o PDF leva o fluxo;
11. o PDF leva os "?";
12. o cabeçalho do PDF só na primeira página;
13. a marca do PDF sem compressão;
14. o PDF sem o histórico;
15. a lista do PDF sem número;
16. o negrito do PDF ganha um espaço antes do ponto ("adquirido ." em vez de "adquirido.");
17. o caminho dos laboratórios vai ao item errado;
18. a caixa sai sem perguntar;
19. o caminho some do "?";
20. o bloco desconhecido some calado;
21. o histórico perde o desempate pela chave.

## §9 — O que fica em aberto

1. **Da minha correção de antes, falta a sua palavra em dois pontos.** Já estão no ramo assim:
   - o rodapé "Controle documental: Rascunho local…" fica fora, como os botões. O Banco também o deixa fora;
   - o link da planilha FO 8.4.1.1 no Dropbox aparece como texto, sem link.
   Se a sua palavra for outra, mudo.
2. **A publicação precisa de três coisas:**
   - as tabelas do Banco na produção, com o contrato do jsonb ajustado aqui (§5);
   - a perícia (§6);
   - a sua ordem.

   Tudo fora do dia do primeiro uso do mestre.
3. **A Rev. 01 (§4 da sua carta)** só começa com a Rev. 00 e a página no ar. Antes, nada.

— Ordem_de_Compra
