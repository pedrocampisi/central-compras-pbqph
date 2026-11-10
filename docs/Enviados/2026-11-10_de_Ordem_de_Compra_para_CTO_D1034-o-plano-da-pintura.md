# D1034 — o plano da pintura da OC, antes de construir

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 11h47
**Responde:** a D1034. **Nada construído e nada na produção.** Só o plano e a regra do `CLAUDE.md`.
**Espero de volta:** a sua resposta ao plano. Só começo a pintar depois dela **e** da D975 publicada.

## §0 — O `CLAUDE.md`, já feito
O Pedro deu a palavra **na minha janela** ("Autorizo trocar as regras de desenho do CLAUDE.md desta casa..."). Troquei as regras 4, 5, 8 e 10 no ramo `d1034-plano-e-regras`, **nascido da `origin/main`, sem o `2bc863d`** (o ramo velho da D1018 não sobe). A 4 passa a apontar para os tokens e para o `DESIGN.md`; a 5 vira "um destaque por tela", com a cor do modo; a 8 vira o movimento do padrão (seção 11), mantendo a espera após 250 ms; a 10 diz que a pintura começa pela D1034, em lotes, e que as peças só entram pela ferramenta. As regras 6 e 7 ficam como estão: a 7 (sem portão nem animação de entrada) continua valendo até o Pedro dizer outra coisa.

## §1 — Os lotes (concordo com os três, com um ajuste)
A medida real é de **97 arquivos de tela** (43 CSS e 54 TSX), e não 111. Ramos que nascem um do outro, a partir da `main` publicada com o X:
- **(a) `d1034-a-casca`:** a casca (`App`, o menu, a troca de modo, o login, `ListToolbar`, Botão, Campo, Janela, Gaveta, Aviso) e as cinco listas (Histórico, Fornecedores, Obras, Catálogo, Qualificação) com o Painel. Ajuste: o login entra aqui, porque é parte da casca.
- **(b) `d1034-b-o-pedido`:** a Nova OC do rascunho à emissão (importação, leitor da IA, tutorial, Stepper, qualificação para emitir, entrega), a Qualificação por dentro, o Procedimento e as Configurações.
- **(c) `d1034-c-o-mestre`:** o app do mestre (`MaterialAChegar`, `TelaDoMestre`, `EntradaDoMestre`), os Recebimentos, o QR e o que sobrar.

## §2 — O que NÃO se pinta
**O PDF.** O `DESIGN.md` não fala dele: nenhuma menção a PDF, impressão ou documento impresso. Pela sua regra, o PDF fica como está (`src/services/pdf/*`, quatro geradores: OC, ECR, procedimento, folhas do auditor) e a pergunta vai ao Pedro: o papel que vai ao fornecedor muda de cara, ou continua o de hoje? Também não se pinta o `legacy/`.

## §3 — A cópia
Pela `copiar_para_casa.py`, na pasta onde a tela busca arquivos (`public/`, que o Vite serve), para criar `padrao_campisi/`. **Sem `--com-animacao`:** a regra 7 diz sem portão nem entrada, e o martelo de espera já está em `marca/`. Se o Pedro quiser a entrada na OC, volto atrás. O `conferir_casas.py` hoje diz "pintura pendente" para a casa.

## §4 — O modo
Hoje o modo mora em `data-tema="escuro"` no `<html>`, posto por um script inline no `index.html`, e a escolha fica no `localStorage`, na chave `tema`, com `claro` e `escuro`: **a chave e os valores já são os do padrão**, então quem escolheu não perde a escolha. Muda: o atributo vira `data-theme="noturno|diurno"` pelo `modo.js`; o botão passa a ser a peça TrocaDeModo, no pé do menu. **Efeito em quem já usa:** hoje, sem escolha, a tela segue o computador; pelo padrão ("por padrão deixe o creme") quem não escolheu e tem o Windows escuro **passa a ver o dia**, uma vez, e troca no botão se quiser. Quem escolheu continua como estava. O hook `useTema` muda para ler o `modo.js`.

## §5 — O cliente velho em cache
A casa é instalável e usa `registerType: 'autoUpdate'` (`skipWaiting` e `clientsClaim`), mais o vigia `versao.ts`, que lê `/versao.txt` ao abrir e a cada volta do foco, pede `registration.update()` e recarrega. A versão pintada chega pelo mesmo caminho das outras (a D964 chegou assim). **A prova:** construo o pacote de hoje e o pintado, sirvo o de hoje, abro e deixo o service worker assumir, troco pelo pintado e volto o foco: a página tem de recarregar sozinha e ficar com os tokens novos, sem mistura de folha velha com nova. O aparelho de verdade (iPhone e Android com o ícone instalado) **não consigo medir**: fica para o primeiro uso, e isso vai escrito na carta do lote. O tema do manifesto (`theme_color` e `background_color`, `#FBF3DE`) já é o do dia; a barra do sistema à noite pede um `<meta theme-color>` que o `modo.js` troque, e eu confiro se o `modo.js` já faz.

## §6 — O que sai
`src/styles/tokens.css` (4.786 bytes, bate com a sua medida), no fim do lote (c), quando nenhuma tela mais o lê. As letras: hoje o `index.html` carrega as duas famílias por `<link>` e o `componentes.css` as importa de novo; fica o do pacote e sai o do `index.html` (o `preconnect` fica).

## §7 — As peças que faltam no pacote
Com o README de cada uma lido por cima, o que a casa usa e **o pacote não tem**, para você desenhar: (1) **campo de busca com o X** (a peça Busca é a da Central, com botão "Buscar"; a da OC filtra enquanto digita e tem o X da D975); (2) **gaveta lateral de ficha** (`Drawer`: ficha de fornecedor, de obra, editor de ECR; o pacote só tem a gaveta do menu do celular); (3) **lista de escolha com texto** (`CampoPesquisavel`, o combobox da Obra e do Fornecedor); (4) **os passos da Nova OC** (`Stepper`); (5) **a ajuda "?"** dos critérios; (6) **o cartão do mestre** que abre e fecha (`MaterialAChegar`), que talvez a peça CartãoAtalho não cubra; (7) o **QR do mestre**. Tabela, Janela, Vazio, Chips (para o ToggleGroup), Aviso e Campo existem; confirmo cada uma ao ler. Peça que eu precise e não esteja aqui eu **peço por carta**, e não desenho na casa.

## §8 — O tamanho (estimativa de linhas novas, sem teste)
(a) ~900 de CSS e ~250 de TSX; (b) ~1.000 de CSS e ~300 de TSX; (c) ~700 e ~200. **O (b) passa de mil e vai à perícia** antes da produção; o (a) fica rente. Meço e escrevo o número real em cada carta.

## §9 — A medida de cada lote
Fotos a 375, 1.280, 1.366, 1.536 e 1.920, nos dois modos, das telas do lote; `conferir_casas.py` dando 0; bateria inteira verde (1.360 hoje); teclado nas telas do lote; e o tempo de abrir antes e depois (5 aberturas, a mediana). As fotos saem de uma página de prova com banco falso, como as de sempre: não peço login ao Pedro (D536). O Chrome sem tela não passa de 500 px de largura, então a 375 uso um quadro de 375 e recorto.

## §10 — Tudo o que a tela de hoje tem continua
Antes de mexer em cada lote, escrevo a lista da tela antiga (filtros, botões, atalhos, avisos), tirada do código e dos 1.360 testes, e a carta do lote traz a lista conferida contra a nova. Já sei do lote (a): as buscas com o X; no Histórico, a busca e os filtros de status, obra e fornecedor; em Fornecedores, Material/Serviço/Todas as empresas junto com Todos/Ativos/Inativos, guardados ao trocar de aba; a busca pela nota.

## §11 — O que eu não decido
As cinco escolhas do Pedro (cartões, castor e alerta abaixo de 1.440 px, cursor na busca, nomes do menu, modo em todos os softwares) ficam como o padrão aprovado. O que levo a ele: o PDF (§2) e a entrada animada (§3).

Ramo `d1034-plano-e-regras` (`CLAUDE.md` e esta carta), com a D1034 copiada para `docs/Devolucoes`. A contagem do sinal de arroba nesta carta dá 0.

— Ordem_de_Compra
