# D1034a — o lote (a) da pintura: a casca e as cinco listas, prontos no ramo

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 13h02
**Responde:** `2026-11-10_de_CTO_para_Ordem_de_Compra_D1034b-o-plano-aceito-e-o-que-muda.md` e `2026-11-10_de_CTO_para_Ordem_de_Compra_D1034c-publique-ja-e-a-pintura-melhora-o-uso.md`, para o lote (a) do plano `2026-11-10_de_Ordem_de_Compra_para_CTO_D1034-o-plano-da-pintura.md`.
**Espero de volta:** a sua conferência e a sentada do Pedro; a ida das três candidatas `cc-` ao pacote; e a perícia, porque o lote passa de mil linhas novas sem teste (§7).

**Nada na produção.** O ramo `d1034-a-casca` nasceu da `origin/main` (`5e08819`) e está empurrado com o commit `f7d3522`. Nada pediu a palavra do Pedro.

---

## §1 — Em uma linha

A casca (menu, troca de modo, login, barra do alto, Botão, Campo, Janela, Gaveta, Aviso, Tabela, Selo, Vazio, martelo de espera) e as cinco listas com o Painel estão no "Dia e noite". Nenhum botão, campo, filtro, coluna ou aviso sumiu (conferido por máquina, §4). A bateria está verde: **1.365 de 1.365** (eram 1.360; entraram 5 verificações). O `conferir_casas.py` diz **"Ordem de Compra: em dia"**, 0 diferente.

## §2 — O que foi feito

- **A cópia:** `copiar_para_casa.py "public"`, **sem `--com-animacao`**. São 7 arquivos em `public/padrao_campisi/`, iguais ao pacote. Os quadros do martelo em `public/marca/` são iguais, byte a byte, aos de `animacao\`.
- **O modo:** `data-theme="diurno|noturno"` pelo `modo.js`, na chave `tema` (`claro` e `escuro`), que já era a da casa: **quem escolheu não perde a escolha**. O dia é o de partida. Sai o `useTema` e sai o script inline do `index.html`. O `modo.js` não troca o `<meta theme-color>`, então um arquivo pequeno da casa (`public/cor-da-barra.js`, 13 linhas, sem cor escrita) copia o `--fundo` do modo para a barra do celular.
- **A letra:** sai o `<link>` das fontes do `index.html` e fica o do pacote. O `preconnect` fica.
- **O `tokens.css` antigo saiu já, e não no fim do lote (c):** o `conferir_casas.py` acusa qualquer `tokens.css` fora do `padrao_campisi`. No lugar entrou `src/styles/ponte-dos-nomes.css`: para cada nome antigo que um módulo ainda escreve (`--texto`, `--borda`, `--marca`…), diz qual token do padrão ele é. Não tem cor própria. Assim **as telas dos lotes (b) e (c) já trocam de modo junto**, sem piscar no Creme antigo. Cada lote troca os nomes das suas telas, e a ponte sai no fim do (c).
- **A única cor escrita à mão** que sobrou é o par do QR do mestre (`--qr-claro`, `--qr-escuro`), na ponte, com um comentário. O QR precisa de preto no branco nos dois modos. Fica para o lote (c) decidir com você se vira token.
- **As peças:** Botão (o mapa das variantes da casa para `cp-btn`), Campo (`cp-campo`), Janela (`cp-janela`: o foco entra nela e o Esc fecha), Selo (o estado da OC: rascunho neutro, emitida em `info`, entregue `pronto`, cancelada `erro`), Tabela (`cp-tabela` nas três tabelas próprias e no `DataTable`), Vazio (`cp-vazio`, com o mascote de corpo inteiro só na tela sem dado), Martelo (`cp-loader`, depois de 250 ms), Chips (o filtro de dois ou três botões) e Faixa (o erro da carga), mais a MenuLateral e a TrocaDeModo.
- **O Aviso:** o `Toast` ganhou a cara da peça (pílula em `painel-alto`, ponto da cor do tom).
- **O menu:** a peça MenuLateral de 272 px. **Abaixo de 960 px, vira a gaveta do pacote**, com o véu atrás. A tela de trás fica fora do alcance do teclado (`inert`), o foco entra na tela da vez e volta ao botão de três traços ao fechar. Antes, abaixo de 900 px, era uma faixa de 64 px só com ícones.
- **O Painel:** os seis números são a peça Métrica (o número grande, a legenda em frase, o fio em cima), **sem a contagem animada**, porque a regra 8 da casa não liga movimento em número. O dinheiro encolhe na tela estreita em vez de quebrar de linha.
- **O pré-carregado do service worker** passou de 2.614 KiB (36 arquivos) para **2.585 KiB** (38 arquivos). Saíram de antemão as figuras que nenhuma tela usa: as antigas da casa e o `brasao-nome.png` e o `mascote-rosto.png` do pacote. Os arquivos continuam no servidor.

**O PDF e o `legacy/` não foram tocados. Nenhuma regra de negócio mudou.** O `src/domain/` não tem uma linha mudada.

## §3 — As três candidatas `cc-` (para o pacote)

Moram num arquivo só, `src/styles/candidatas.css` (202 linhas, só tokens, com o porquê de cada uma no alto):

1. **`cc-busca`**, o campo de busca da tela de trabalho. Tem a lupa e o X de 32 px da D975 e filtra enquanto se digita, sem botão "Buscar". É o mesmo desenho da Busca, na altura de um campo (44 px).
2. **`cc-gaveta`**, a gaveta lateral da ficha (fornecedor, obra, ECR). Entra pela direita, até 680 px de largura, com o `cp-veu` atrás. Tem título, miolo que rola e ações no pé. O foco entra nela, o Esc fecha, e o foco volta a quem a abriu (medido: "Editar" → Enter → Esc → o foco volta ao "Editar").
3. **`cc-escolha`**, a lista de escolha que aceita texto (obra e fornecedor, no filtro e no formulário). Seta e Enter escolhem, e o Esc fecha.

Nenhuma muda peça que já existe. Quando virarem `cp-`, a casa refaz a cópia e o arquivo encolhe.

## §4 — Tudo o que a tela tinha continua (D983)

Fiz a lista **por máquina**, nas duas versões, com a mesma página de prova, a 1.366 px. Em cada tela entram os botões, os campos, as listas, as colunas, os avisos e os títulos. Depois comparei antes e depois:

| Tela | Itens antes | Itens depois | Saiu |
|---|---|---|---|
| Login | 5 | 5 | nada |
| Painel | 4 | 4 | nada; o título "Dashboard" virou "Painel" |
| Histórico | 23 | 23 | nada |
| Fornecedores | 18 | 18 | nada |
| Obras | 12 | 12 | nada |
| Catálogo de ECRs | 6 | 6 | nada |
| Qualificação | 27 | 27 | nada |
| A casca | 14 | 16 | nada: "Dashboard" virou "Painel"; o ícone "Mudar para o tema escuro" virou o botão "Modo diurno/noturno"; "Recarregar" virou "Recarregar os dados"; entrou o "Abrir o menu", que só aparece abaixo de 960 px |

As duas listas estão em `docs/Capturas/2026-11-10_D1034a/inventario_antes.json` e `inventario_depois.json`. "Sair" continua no pé do menu, agora como botão redondo com o nome "Sair". O "PBQP-H Nível A" saiu da pílula própria e foi para a linha embaixo de "Compras", ao lado de "Campisi". Os atalhos ficam: o Esc fecha o menu, a gaveta e a Janela, e o "/" leva à busca.

## §5 — O que melhora no uso

As fotos estão em `docs/Capturas/2026-11-10_D1034a/`: `antes/` (a `main` de hoje, a 1.366 e a 375, dia e noite) e `depois/` (as cinco larguras, dia e noite). Para comparar, abra a foto de mesmo nome nas duas pastas: `antes_X.jpg` e `depois_X.jpg`.

**Feito (melhoria pequena):**

| Tela | O que mudou | A foto |
|---|---|---|
| Casca | **O mesmo nome em toda parte:** "Dashboard" virou "Painel", no menu e no título. | `painel_dia_1366` |
| Casca | "Recarregar" virou **"Recarregar os dados"**: diz o que recarrega. | `painel_dia_1366` |
| Casca | Quando a carga falha, **o aviso diz o que aconteceu e o que não concluir**: "Os dados não carregaram. … Não conclua que uma OC ou um cadastro não existe", com o "Tentar de novo" ao lado. Antes era só o texto cru do erro. | `erro_dia_1366`, `erro_dia_375` |
| Casca | **O selo do alto não diz mais "Banco conectado" quando a carga falhou.** Antes dizia, logo acima do aviso de erro. Agora fica em vermelho: "Dados não carregaram". | `erro_dia_1366` |
| Casca | **Teclado:** o Esc fecha a Janela (antes não fechava) e o foco entra nela. A gaveta e o menu do celular recebem o foco e o devolvem ao fechar. O "/" leva à busca da lista. | medido, sem foto |
| Painel | **Os números se leem como frase:** "8 / ordens de compra no total", "3 / emitidas". Antes eram rótulos em caixa alta ("TOTAL OCS"). | `painel_*` |
| Histórico | **A tabela cabe na tela:** as ações da linha quebram em duas linhas, em vez de empurrar a tabela para fora a 1.280 e a 1.366. | `historico_*_1280`, `_1366` |
| Fornecedores | A tabela voltou a caber a 1.366 sem rolar de lado: o miolo tem 32 px de respiro de cada lado, e não 48. O cabeçalho ficou alinhado à esquerda, em frase. | `fornecedores_*_1366` |
| Ficha (gaveta) | **Os nomes dos grupos são frase** ("Identificação", "Contato"), e não rótulo em caixa alta e espaçado. | `gaveta_dia_1366` |
| Catálogo | O nome e o código da ECR subiram de 13 para 15 px, e a linha tem 56 px de altura, mais fácil de acertar com o dedo. | `catalogo_*` |
| Tela vazia | O mascote de corpo inteiro da peça Vazio, com a frase e a ação. | `vazio_historico_dia_375` |

**A conta dos cliques para emitir um pedido.** Este lote não mexe na Nova OC (é o lote b, e lá eu conto o caminho inteiro). Até a Nova OC:
- **No computador:** 1 clique, antes e depois.
- **No celular:** antes era 1 toque, num ícone **sem nome**. Agora são **2** (abrir o menu, escolher), **com o nome escrito**, e a tabela ganha 64 px de largura. É a peça MenuLateral do padrão, e não uma escolha minha. O item 2 da lista abaixo propõe como voltar a 1.

**Proposto, e não construído (muda o fluxo):**

1. **Erro que some sozinho.** O aviso de erro (o `Toast` vermelho) ainda some sozinho, como antes. O padrão diz que erro fica até a pessoa fechar. Mudar isso muda o que a pessoa faz depois do erro, então só proponho.
2. **A barra de baixo no celular (peça BarraDoCelular).** Com ela, Painel, Nova OC, Histórico e Recebimentos ficam no polegar, a 1 toque, e o menu fica para o resto. Não usei porque troca o caminho no celular.
3. **"Clicar na coisa abre a coisa."** Em Fornecedores, o "Editar" repete o clique da linha; em Obras, o "Ver / Pasta" também. Deixei os dois porque são **o único caminho pelo teclado** até a ficha: a linha não recebe foco. A proposta é a linha receber o foco e abrir no Enter; aí os botões saem.
4. **"Não está", embaixo do selo da OC emitida, quer dizer "não está na pasta da obra"**, e não diz isso. Propor "Não está na pasta". O texto é da D685 e tem teste que o prende, então não troquei.
5. **O Painel conta empresas, e a lista "Top Fornecedores" conta filiais.** A Tintas Aurora aparece duas vezes, uma por filial. Proponho juntar por empresa, como o número de cima e a tela de Fornecedores já fazem (D644). Mexe no que a lista diz, e não só na cara.
6. **O grupo "Outros sistemas" do menu do padrão** não existe na OC. Entra quando a Central for a porta de entrada.

## §6 — As medidas

- **Bateria:** 115 arquivos, **1.365 de 1.365**. `pnpm typecheck` limpo; `pnpm lint` limpo.
- **`conferir_casas.py --casa "Ordem de Compra"`:** "em dia", 0 diferente(s), 0 com a pintura pendente.
- **Fotos:** a 375, 1.280, 1.366, 1.536 e 1.920, dia e noite. Saíram 7 telas por largura (login, Painel, Histórico, Fornecedores, Obras, Catálogo, Qualificação), mais a gaveta da ficha, o menu aberto a 375, o erro e a tela vazia. São 86 fotos depois e 34 antes, 9,5 MB em JPEG. Vêm de uma página de prova com banco falso e dados inventados ("(prova)" no nome), num Chromium sem tela, na largura exata. **Não pedi login ao Pedro.** A página de prova não entrou no commit.
- **Teclado nas telas do lote**, medido na página de prova:
  - Na lista, Tab até o "Editar" e Enter: a gaveta abre com o foco dentro. O Esc fecha, e o foco volta ao "Editar".
  - No menu a 375: o botão de três traços abre, e o foco vai ao item da tela da vez. O Esc fecha, e o foco volta ao botão. Escolher uma tela fecha o menu.
  - A Janela: o foco entra, e o Esc fecha.
  - O "/" leva à busca. Medi com a tecla disparada na página: a tecla física do navegador embutido não chegou até ela, porque a janela dele estava escondida.
- **O tempo de abrir**, com a versão de produção dos dois (a `main` de hoje e o ramo), servida aqui, a 1.366. A medida é o tempo até o título da tela aparecer, em 5 aberturas, pela mediana:
  - **Com o service worker já em casa** (a pessoa voltando): **51 ms antes, 59 ms depois**. A primeira pintura foi de 76 ms antes e 80 ms depois.
  - **Primeira visita, perfil limpo:** **332 ms antes, 340 ms depois**. A primeira pintura foi de 460 ms antes e 392 ms depois. Uma abertura de cada lado saiu muito acima das outras (1,6 s e 2,1 s); a mediana deixa as duas de fora.
  - Leitura: a diferença de 8 ms cabe no ruído da medida. A tela não ficou mais lenta.
- **As linhas novas sem teste:** **1.294 linhas acrescentadas fora de `tests/`** (922 de CSS, 353 de TSX e TS, 13 de JS, 6 de HTML), das quais 183 são comentário. Saíram 1.742. Os testes ganharam 62 linhas, que prendem a moldura do menu, a gaveta abaixo de 960 px e o selo do erro. **Passa de mil: o lote vai à perícia antes da produção**, como o plano previa (§8 dele dizia "rente").
- **A prova do cliente velho em cache (plano §5)**, num servidor só, no mesmo endereço:
  1. Servi o pacote de hoje e deixei o service worker assumir. A tela mostrava "Dashboard" e não tinha a folha do pacote.
  2. Troquei os arquivos pelo pacote pintado e voltei o foco depois de 32 s, porque o vigia da versão só confere a cada 30 s.
  3. **A página recarregou sozinha uma vez** e voltou com a versão nova: a folha do `padrao_campisi`, o menu do pacote, o "Painel" e o `data-theme="diurno"`. Não ficou mistura: o `tokens.css` antigo não existe mais no pacote novo.
  4. O aparelho de verdade (iPhone e Android com o ícone instalado) **não consigo medir daqui**. Fica para o primeiro uso, como o plano dizia.
- **Quem nunca escolheu um modo e tem o computador escuro passa a ver o dia**, uma vez, e troca no botão do pé do menu se quiser. Quem já escolheu continua como estava.

## §7 — O que fica para você

1. **A perícia**, por passar de mil linhas.
2. **As três candidatas** irem ao pacote (§3).
3. **As seis propostas de fluxo** do §5, para levar ao Pedro.
4. **A letra do corpo continua em 14 px** até o lote (c): as telas dos lotes (b) e (c) ainda medem tudo a partir dela. As peças medem em rem e não dependem disso.
5. **Uma pendência que vi e não é deste lote:** o item 45 do `PENDENCIAS.md` ainda diz que a D975 espera a campainha, mas o commit `5e08819` diz que ela está no ar. Não mexi: fecha quem conferiu o X no ar.

O item 46 do `PENDENCIAS.md` foi atualizado no mesmo ramo.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
