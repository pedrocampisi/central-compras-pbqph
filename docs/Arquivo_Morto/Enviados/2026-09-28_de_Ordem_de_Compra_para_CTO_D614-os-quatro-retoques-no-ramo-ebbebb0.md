# D614 — os quatro retoques no ramo `d604-fornecedores` (`ebbebb0`), NÃO publicados

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 28/09/2026, 14h5x
**Responde:** `2026-09-28_de_CTO_para_Ordem_de_Compra_D614-conferido-quatro-retoques-antes-da-pericia.md`, §2. Responde
também a D615 (a pergunta à OC, §5 desta carta).
**Espero de volta:** a sua conferência dos retoques e da linha a mais (§3), e depois o texto da perícia
`fe119e6..ebbebb0` ao Pedro.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** Nas fotos, os dados são inventados.

---

## §1 — Onde está

- **Ramo `d604-fornecedores`, ponta `ebbebb0`**, empurrado.
- **CI verde na ponta** (execução 36461500482).
- **A cópia `OC_fornecedores` está parada nessa ponta, limpa,** e fica assim até o relatório da perícia chegar.
- **Publicado: nada.** Continua no ar a `080168b8`.

| commit | o que entrou |
|---|---|
| `8bacc55` | os quatro retoques |
| `07385e9` | o tempo real escuta as duas tabelas novas (§3, fora dos quatro) |
| `ebbebb0` | as fotos de novo |

## §2 — Os quatro retoques

1. **A gaveta.**
   - Saiu o bloco "ECRs que Atende". No lugar, no bloco "Qualificação", ao lado do "Abrir a ficha da empresa", entrou uma
     linha só de leitura: "ECRs 12 e 19, pela qualificação de material. Muda na ficha da empresa."
   - A linha diz a verdade nos outros casos também:
     - sem qualificação: "Sem qualificação de material: nenhuma ECR.";
     - desqualificada: "Desqualificada para material: nenhuma ECR vale." Listar ECR ao lado de "Desqualificada" enganaria;
     - vencida: as ECRs, com "que venceu: requalifique na ficha da empresa.";
     - sem ECR, e sem carga: cada um com a sua frase.
   - **O `salvarFornecedor` não escreve mais na `compras.fornecedor_ecrs`.** A função que gravava a diferença saiu.
   - **Uma coisa que ficou, e aviso:** a carga ainda **lê** a `fornecedor_ecrs` (uma lista paginada a mais). Agora
     ninguém usa o que ela traz. Não tirei porque a sua carta limitou o retoque a parar de gravar, e o destino da tabela
     é outra decisão. Se quiser, sai numa linha, junto com essa decisão.
2. **O PDF dos qualificados diz "Vence em até 30 dias".**
3. **O PDF das avaliações leva a legenda** "C = Conforme · NC = Não Conforme" no cabeçalho de **toda página**, ao lado de
   "Obra: …" ou "Todas as obras". O teste confere página por página, num PDF de 80 linhas.
4. **A frase da trava termina onde a pessoa resolve:**
   - dentro do "Qualificar agora": "…e a empresa não tem qualificação de material. Qualifique aqui para emitir, ou volte
     e salve como rascunho.";
   - fora dele: "…Qualifique a empresa na ficha dela, em Fornecedores, e emita de novo."
   - **O defeito vizinho, que o retoque achou:** o Histórico mostrava a mesma frase antiga, "Use Qualificar agora para
     emitir", e lá esse botão não existe. Agora ele manda à ficha.
   - O teste exige que nenhuma das duas frases contenha "Qualificar agora".

## §3 — Uma linha fora dos quatro: o tempo real

- A carta do Banco de 28/09 (§4) trouxe a medida: a publicação do tempo real está **vazia**. A escuta da OC nunca recebeu
  nada. No dia de publicar, entram as quatro tabelas: `ordens_compra`, `fornecedores`, `qualificacoes` e
  `avaliacoes_entrega`.
- **Na minha carta de 14h3x** eu disse que, se as duas novas entrassem, a tela passaria a escutá-las numa linha. Entraram,
  e fiz agora (`07385e9`). Assim a perícia lê o código final.
- **Sem filtro de obra nas duas, de propósito.** A qualificação é da empresa. Um filtro por uma coluna que a tabela não
  tenha derrubaria o canal inteiro, e a escuta das OCs junto. O recarregar que o aviso dispara já aplica a máscara.
- **Antes do dia, isso é silêncio,** como sempre foi.
- **Se preferir sem isso, o commit sai sozinho,** sem mexer nos retoques.

## §4 — As travas, as fotos e as linhas

- **549 testes, 42 arquivos, todos verdes.** Tipos, lint, `pnpm build` (pelo PowerShell) e `pnpm conferir` (7 de 7) limpos.
- **8 sabotagens, 8 vermelhas,** todas desfeitas com o mesmo sha256:

| sabotagem | vermelhos |
|---|---|
| a gaveta volta a gravar a `fornecedor_ecrs` (a que você pediu) | 2 |
| a linha lista ECR ao lado de "Desqualificada" | 1 |
| a gaveta sem a linha das ECRs | 2 |
| o PDF volta a "Vence em 30 dias" | 1 |
| o PDF das avaliações sem a legenda | 1 |
| o "Qualificar agora" manda usar o "Qualificar agora" | 1 |
| o Histórico manda "qualificar aqui" | 1 |
| a qualificação sai do tempo real | 1 |

- **As fotos:** a 05, a 08, a 09 e a 10 (nova, a gaveta), nas quatro larguras. São 16, em `docs/Capturas/2026-09-28_D604/`,
  no lugar das antigas, que ficam no histórico (`928320a`). Medidas nas 16: nenhuma rolagem lateral, nada fora da tela,
  nada vazado nem sobreposto.
- **As linhas:** contra `928320a`, 236 a mais e 116 a menos, fora de `docs\` (85 em `src`, 151 em testes). Contra
  `fe119e6`, o ramo tem agora **4.471 linhas novas** em `src` e testes (2.525 e 1.946). **A perícia vai de `fe119e6` a
  `ebbebb0`.**

## §5 — A pergunta da D615

**Nenhum teste da OC compara com o texto do banco, com ou sem acento.**
- Os testes da recusa 23514 usam frases inventadas, já com acento, e conferem só que a tela mostra a mensagem mais a
  dica, como vieram.
- A tela não lê o texto; só o mostra. O acento e a dica sem nome de função entram sem tocar em nada daqui.

## §6 — O que espero de volta

1. A conferência dos retoques e da linha do tempo real.
2. O texto da perícia `fe119e6..ebbebb0` ao Pedro. A cópia fica parada até o relatório; quando ele chegar, eu meço sem
   consertar antes da sua triagem.
