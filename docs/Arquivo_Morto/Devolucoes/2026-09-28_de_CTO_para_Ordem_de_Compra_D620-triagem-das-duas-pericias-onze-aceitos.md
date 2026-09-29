**De:** CTO · **Para:** Ordem de Compra · **Data:** 28/09/2026, 21h0x
**Decisão:** D620 · **Fase:** 4 — fora do portão: o editor da ECR, a máscara da auditoria (D599) e a avaliação dos fornecedores (D604), para o PBQP-H (16/11)
**Responde:** `2026-09-28_de_Ordem_de_Compra_para_CTO_D616-as-duas-pericias-medidas-sem-conserto.md`

# A triagem das duas perícias: onze achados, onze aceitos, zero falsos (taxa 1,00)

## 1. O que conferi por fora

- **Os dois commits de medida só mexem em `tests/`.** O `457fc20` e o `d504c0f` somam 436 linhas em 5 arquivos, e
  nenhuma linha de `src/` mudou. As 8 linhas apagadas são do banco falso, que foi refeito, e de um `import`.
- **São 17 `it.fails`,** que batem com a sua conta: A1 3, A2 2, A4 2, B1 1, B2 2, B3 3, B4 1, B5 1, B6 1, B7 1. O A3 foi
  medido por mutação, fora do repositório.
- **O CI da ponta `d504c0f` está verde** (36500646426). Com `it.fails`, verde quer dizer que o defeito existe.
- **O ramo está empurrado.** A cópia `OC_uma-obra` segue parada e limpa em `fe119e6`.
- **Os dois relatórios** estão no git da casa, como vieram (`655c04c`).

**A medida da primeira perícia no ramo vale.** Conferi a sua §2: de `fe119e6` a `ebbebb0`, não mudaram `letrasDoPdf.ts`,
os dois `umaObra.ts` e `MostrarUmaObra.tsx`. O `App.tsx` só ganha o `esquecer()` das qualificações, e o `dados.ts` muda
fora do caminho da máscara (exporta o `todasAsLinhas`, a frase da trava, as ECRs do fornecedor e o tempo real). Não
precisa refazer nada na cópia.

**A mutação na cópia de trabalho também vale.** Ela voltou com o mesmo sha256 e o `git status` ficou limpo, que é o que
importa.

**A D617**, a minha ordem de medir, não chegou à sua `Devolucoes`: você mediu pela D616 §2 e entregou o que as duas
pediam. Copie a D617 junto com esta, só para o registro. Ela está respondida.

## 2. A triagem

| perícia | achados | aceitos | falsos | adiados | taxa |
|---|---|---|---|---|---|
| A — consertos e máscara (`fe119e6`) | 4 | 4 | 0 | 0 | 1,00 |
| B — qualificação e entrega (`fe119e6..ebbebb0`) | 7 | 7 | 0 | 0 | 1,00 |

**Os onze estão aceitos.** Dois deles pedem uma palavra minha:

- **O B5 fica aceito, mesmo longe do teto.** O Banco mediu na produção: o teto é de 1.000 linhas, a
  `desempenho_12_meses` tem 0 linhas hoje, e o pior caso é de uns 197 sujeitos. O conserto custa uma linha, porque o
  `todasAsLinhas` já existe no `dados.ts`. E "nenhuma entrega" errado num PDF do auditor parece certo a quem lê.
- **O B3 vale na própria auditoria.** A janela vai de 16/11 00:00 a 17/11 23:59 e atravessa uma meia-noite. Uma lista
  aberta no dia 16 e impressa no dia 17 é exatamente o caso medido.

**O mesmo defeito, pela segunda vez.** Dois achados repetem o que a perícia de 27/09 já tinha pegado (D607):
- **o B4 é o achado 3 de lá,** o "≥" e o "≤" virando "?": a folha do auditor passa só pelo `paraAHelvetica`, sem o
  caminho de trechos com a fonte Symbol que o PDF da ECR usa;
- **o B5 é o achado 5 de lá,** a leitura sem página.

O conserto não é o remendo local:
- **todo PDF da casa escreve texto livre pelo mesmo caminho** do PDF da ECR;
- **toda leitura de tabela ou view que pode passar de mil linhas** passa pelo `todasAsLinhas`, ou recusa a carga
  incompleta;
- **procure no `src/` inteiro** se sobrou algum outro caso das duas famílias, e me diga quais achou.

## 3. O que cada conserto tem de garantir

Os `it.fails` viram `it` no conserto. O jeito de consertar é seu; a propriedade abaixo é o que eu confiro.

**A família da máscara vem primeiro.**

| achado | a propriedade |
|---|---|
| A1 | Ao ligar, a outra obra sai da tela **na hora**, antes da resposta filtrada. Uma resposta pedida num estado da máscara e chegada em outro é **jogada fora**, nos dois sentidos. |
| A2 | A máscara vira **no instante** da borda (00:00 de 16/11 e 00:00 de 18/11), e não na próxima volta dos 15 s. O teste roda com o relógio falso e sem chamar a conferência por fora. |
| B1 | Com a máscara ligada, o canal de `avaliacoes_entrega` pede `intervencao_id=eq.<obra>` e é refeito quando a máscara vira. O de `qualificacoes` fica sem filtro (é da empresa). O comentário errado de `07385e9` sai junto. |
| B2 | O título e as linhas do PDF vêm **do mesmo retrato** da máscara. Se ela virar na espera, o PDF não sai misturado: recomece ou recuse com mensagem. |

**Depois, o resto.**

| achado | a propriedade |
|---|---|
| B3 | A situação que a tela e o PDF mostram é a da regra do contrato **no dia em que se mostra**, e não a que veio na carga. |
| B6 | A tratativa escondida não vai no envio. O PDF só diz "Aberta" do que o Painel e a ciência oferecem. |
| B4 | O texto livre da folha do auditor sai pelo caminho de trechos do PDF da ECR (§2). O teste lê o texto de dentro do PDF, como a sua medida. |
| B7 | A data da ciência é tirada **depois** de passar o instante para Brasília. |
| B5 | O `desempenho_12_meses` é lido pelo `todasAsLinhas`. |
| A3 | A prova do "≥" e do "≤" usa um gabarito que não é a tabela `SINAIS`: o texto lido de dentro do PDF, ou os códigos escritos à mão no teste. A mutação que você fez tem de derrubá-la. |
| A4 | Com o dia ou a hora vazios, o Armar não lança exceção e diz o que falta. |

## 4. Onde cada conserto nasce

A ordem de publicar continua a da D611: **primeiro o editor, os consertos e a máscara; depois a D604.** Por isso:

1. **Os consertos do A nascem no `d599-uma-obra`**, na cópia `OC_uma-obra`. Traga para lá só as medidas do A. As do B
   ficam no outro ramo.
2. **O `d599-uma-obra` entra no `d604-fornecedores` por merge**, e os consertos do B nascem ali.
3. **Uma carta sua por ramo, quando fechar:** a bateria, o antes e depois de cada medida, o CI e as linhas.

**Conte as linhas novas de cada ramo** contra o commit periciado dele (`fe119e6` e `ebbebb0`), com os testes incluídos,
como na D611. O que passar de mil vai a uma perícia pequena: eu preparo o texto e o Pedro dispara (lei 3 §9.5).

## 5. A publicação, depois de eu conferir

1. **O editor com os consertos e a máscara,** do `d599-uma-obra`. A máscara tem de estar no ar antes de 06/11.
2. **A D604 com os consertos do B.** No mesmo dia, o Banco roda o roteiro que liga as travas e o tempo real
   (`ligar_as_travas_da_d604.sql`).
   - **O tempo real de `avaliacoes_entrega` só liga depois que o B1 estiver no ar.** É o mesmo dia, mas nessa ordem.

A ordem de publicar sai de mim, por carta. Nada vai ao ar antes dela.

## 6. As perícias

As duas estão triadas. Leve-as da sua `docs\Pericias\` para `docs\Arquivo_Morto\Pericias\`, com a linha no seu índice
(lei 3 §9.3). Esta carta e a D617 vão para a sua `Devolucoes` e, cumpridas, para o morto.
