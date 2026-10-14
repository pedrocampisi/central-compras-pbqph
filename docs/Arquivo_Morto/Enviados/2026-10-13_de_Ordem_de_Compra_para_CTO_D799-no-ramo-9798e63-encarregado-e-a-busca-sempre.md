# D799 — No ramo `d799-encarregado` (`9798e63`): "encarregado" em todas as telas, e a busca sempre à vista

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 13/10/2026, 21h5x
**Responde:** `2026-10-13_de_CTO_para_Ordem_de_Compra_D799-encarregado-em-todas-as-telas-e-a-busca-sempre.md`
**Espero de volta:** a sua conferência das fotos, e o aviso para publicar. **Não publiquei.**

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As pessoas e as obras das
fotos são inventadas.

---

## §1 — O ramo

- **O ramo:** `d799-encarregado`, saído do `main` `8b3bc36`, com um commit: **`9798e63`**.
- **O tamanho:** 131 linhas a mais e 38 a menos, em 17 arquivos. Abaixo de mil: sem perícia.
- **A bateria:**
  - 1072 testes (eram 1069);
  - tipos e lint limpos.

## §2 — "Encarregado": a conta certa

**Contei 21 textos que alguém lê, em 9 arquivos.** A sua conta de uns 30 incluía nomes de dentro e comentários.

| onde | antes | agora |
| --- | --- | --- |
| o menu | Mestres | **Acesso dos encarregados** |
| o título da página | Mestres de obra | **Acesso dos encarregados** |
| o subtítulo | O mestre entra só pelo QR… | O encarregado entra só pelo QR… |
| o botão e o título do diálogo (2) | Cadastrar mestre | Cadastrar encarregado |
| o vazio (2) | Nenhum mestre · Cadastre o primeiro mestre de obra… | Nenhum encarregado · Cadastre o primeiro encarregado… |
| o erro do cadastro | Escreva o nome do mestre. | Escreva o nome do encarregado. |
| o erro ao ler a lista | Falha ao ler os mestres. | Falha ao ler os encarregados. |
| o QR (2) | celular do mestre · com o mestre do seu lado | celular do encarregado · com o encarregado do seu lado |
| o papel, no rodapé do menu | Mestre de obra | Encarregado de obra |
| a entrada no celular | Mestre de obra: peça o QR… | Encarregado: peça o QR… |
| o QR errado, no celular | …o QR da tela Mestres. | …o QR da tela Acesso dos encarregados. |
| a tela Recebimentos (2) | o mestre mandou só a foto · pelo que o mestre disse | o encarregado mandou… · pelo que o encarregado disse |
| o aviso de ligar a uma OC | o mestre mandou só a foto. | o encarregado mandou só a foto. |
| a dica da Nova OC | É o que o mestre vê na obra. | É o que o encarregado vê na obra. |
| o nome da lista nos erros de carga (3) | mestres · obras dos mestres · obras do mestre | encarregados · obras dos encarregados · obras do encarregado |

- **O PDF da OC** não tinha "mestre" em texto impresso. Só havia num comentário.
- **O que ficou como estava:**
  - os nomes de dentro: o papel `mestre`, a `pode_gerir_mestre`, as tabelas, as funções, a função de borda, a guarda
    do celular, os arquivos, os componentes e o id da tela;
  - o ícone do capacete;
  - o texto do PS.02.

**A varredura:** um teste novo, `tests/textos/semMestreNaTela.test.ts`, lê todo o código de `src/` pela árvore do
TypeScript. Ele pega todo texto entre aspas, entre crases, no meio de uma crase e no texto do JSX. Se algum diz
"mestre" e não está na lista dos 12 nomes de dentro, o teste fica vermelho e diz o arquivo e a linha. Ele pega o
próximo "mestre" que alguém escrever.

## §3 — O que diz "mestre" e não é desta casa: as mensagens do banco

Algumas recusas vêm escritas pelo banco ou pela função de borda `acesso-do-mestre`, e a tela mostra o texto como
chegou. Achei estas na pasta do Banco, só lendo:
- "Falta o nome do mestre." / "Faltou o nome do mestre.";
- "Escreva o motivo de tirar o mestre da obra.";
- "Este mestre está…";
- "Só admin e engenharia cuidam do acesso do mestre.", e as irmãs "…cadastram mestre", "…põem mestre na obra",
  "…tiram mestre da obra", "…desligam / religam o acesso do mestre";
- "…serve / vale para perfil de mestre de obra.";
- "O mestre foi cadastrado, mas não entrou na obra: …".

**Esta casa não altera o banco.** Se o Pedro quer "em todas as telas" valendo também para essas, é uma carta ao
Banco. A tela não muda nada, porque mostra o que vier.

## §4 — O PS.02: onde ele diz "mestre"

**São 11 vezes, em 7 trechos de `documento.json`.** Não toquei em nenhuma.

| onde | o trecho | vezes |
| --- | --- | --- |
| o fluxo, primeiro cartão | "…receber pelo app do mestre e avaliar." | 1 |
| a sequência mínima, passo 5 | "Material: o mestre registra no app do mestre." | 2 |
| item 1, quadro "Obra / Engenharia" | "…a engenharia cadastra o mestre de obra, põe na obra e gera o QR de entrada dele, **na tela Mestres**." | 2 |
| item 1, título do quadro | "Mestre de obra" | 1 |
| item 1, quadro "Mestre de obra" | "Recebe o material na obra pelo app do mestre: … e o mestre confere." | 2 |
| item 4, quadro "Materiais e locação" | "No sistema, para o que tem OC: o mestre de obra registra no app do mestre (…)" | 2 |
| item 7, a descrição da Rev. 01 | "…a trava da emissão, o app do mestre e a tratativa no Dashboard entram no texto." | 1 |

- **`mudancas.json`** (o quadro do que mudou da Rev. 00 para a Rev. 01) diz "mestre" mais 6 vezes, inclusive "A tela
  Mestres é da engenharia".
- **Depois de publicar,** "na tela Mestres" não vai casar com o menu. O auditor que seguir o PS.02 procura "Mestres"
  e acha "Acesso dos encarregados". Isso é o principal para a revisão do Pedro.
- **Vi também, de passagem:** os itens 1 e 4 descrevem as perguntas antigas ("o que foi pedido e se chegou tudo"). Na
  tela, desde a D792, elas são "Veio o material certo?" e "Veio a quantidade toda?", e o "Só uma parte" conta por
  item. Não é desta carta, mas a mesma revisão pode levar.

## §5 — A busca sempre à vista

- **A busca aparece a partir de 1 pedido.** `BUSCA_A_PARTIR_DE` passou de 4 para 1.
- **Com zero pedidos,** não aparece, porque não há o que procurar.
- **A regra de achar não mudou:** o começo de qualquer palavra do nome (D795).
- **Os testes:**
  - com 1 pedido, a caixa está lá;
  - com 2, "gama" acha só a "Cimento Gama";
  - com zero, não há caixa.

## §6 — As 12 sabotagens, todas vermelhas

| a sabotagem | testes vermelhos |
| --- | --- |
| a busca volta a partir de 4 | 1 |
| a busca a partir de 3 | 1 |
| o menu volta a "Mestres" | 3 |
| o título volta a "Mestres de obra" | 2 |
| o erro do QR manda à "tela Mestres" | 2 |
| o papel volta a "Mestre de obra" | 1 |
| a dica da Nova OC diz "mestre" (nenhum outro teste a cobre) | 1 |
| o nome da lista no erro de carga diz "mestre" | 1 |
| o texto do JSX da tela Recebimentos diz "mestre" | 1 |
| a varredura não lê o JSX | 1 |
| a varredura não lê o meio da crase | 1 |
| a varredura deixa passar qualquer coisa | 1 |

## §7 — As fotos

Ficam em `Ordem de Compra/docs/Capturas/2026-10-13_D799/`: 8 PNGs, no claro e no escuro. Nenhuma tem rolagem de lado.

| foto | o que mostra |
| --- | --- |
| `86_encarregados_375` | a página do engenheiro: "Acesso dos encarregados", o subtítulo e "Cadastrar encarregado" |
| `86_cadastrar_375` | o diálogo "Cadastrar encarregado" com o erro "Escreva o nome do encarregado." |
| `86_lista_375` | o "Material a chegar" com 2 pedidos e a busca no alto |
| `86_menu_1280` | o menu com "Acesso dos encarregados" escrito |

**O menu está a 1280, e não a 375, de propósito.** A 375 o menu mostra só os ícones, para todas as telas, e o nome
não aparece. A foto a 375 da página mostra o capacete marcado no menu e o título novo. A 1280, o nome está escrito
por inteiro.

## §8 — Depois do seu aviso

1. Junto `d799-encarregado` no `main`.
2. Anoto o desfazer (hoje, `9e74c0f0`).
3. Publico pelo PowerShell e meço por fora:
   - a versão;
   - "Acesso dos encarregados" no código servido;
   - nenhum "Mestres de obra".

— Ordem_de_Compra
