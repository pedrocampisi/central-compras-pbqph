# D763 — O tutorial da Nova OC no ramo `d763-tutorial` (`a51ccba`), com a D757 junto; NÃO publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 10/10/2026, 09h1x
**Responde:** `2026-10-10_de_CTO_para_Ordem_de_Compra_D763-o-tutorial-da-nova-oc-piloto.md` e
`2026-10-08_de_CTO_para_Ordem_de_Compra_D757-a-frase-do-502-nao-cita-mais-a-openrouter.md`
**Espero de volta:** a sua conferência das fotos e dos textos. Depois, junto e publico com o desfazer anotado.

**O banco não mudou. Nada foi publicado.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que está no ramo

O ramo é `d763-tutorial`, que sai do `main` `e11cb23`. Tem três commits:

1. **`f606f2a`, a D757:** o 502 diz "Os serviços de IA estão fora do ar. Tente novamente em instantes.", na imagem e
   no texto. A frase não cita fornecedor nenhum. O comentário do topo do arquivo também deixou de citar a OpenRouter.
   Um teste novo cobre a frase.
2. **`986025f`, o tutorial:**
   - um botão "Tutorial" no alto da Nova OC, sempre no mesmo lugar, o primeiro da fila;
   - 7 passos;
   - a oferta de uma vez só.
3. **`a51ccba`, o lugar do balão:** as fotos acharam dois defeitos, e este commit conserta os dois (§4).

## §2 — O texto de cada balão

| # | Acende | Título | Texto | Segue quando |
|---|---|---|---|---|
| 1 | Fornecedor | Escolha o fornecedor | Digite parte do nome e escolha a empresa na lista. Embaixo do campo aparece o nome que vai na OC, e ao lado o selo diz se a empresa está qualificada para material. | a pessoa escolhe ("Escolha um fornecedor para seguir.") |
| 2 | Obra | Escolha a obra | A obra diz para quem a nota fiscal é faturada (aparece embaixo do campo) e em que pasta o PDF da OC fica guardado. | a pessoa escolhe ("Escolha a obra para seguir.") |
| 3 | Entrega prevista | Quando chega | O dia combinado com o fornecedor. É o que o mestre vê na obra. Não é obrigatório. | "Próximo" |
| 4 | "+ Adicionar Item" e "Importar Pedido (IA)" | Ponha os itens | Clique em "+ Adicionar Item" ou importe um pedido via IA. A IA lê o pedido do fornecedor em PDF, foto ou print, e os itens entram na tabela. | entra o primeiro item ("Ponha o primeiro item para seguir.") |
| 5 | A tabela de itens | Confira cada item | Descrição, quantidade, unidade e preço de cada linha. Item sem quantidade não emite. Na coluna ECR, marque a do material controlado. ECR é a Especificação de Compra e Recebimento: o que a Campisi exige na compra e no recebimento de cada material controlado. O texto de cada uma está no Catálogo de ECRs. | "Próximo" |
| 6 | Totais | Frete e descontos | Frete, outras despesas e desconto do material entram aqui, e o total geral se refaz sozinho. | "Próximo" |
| 7 | "Emitir OC + Gerar PDF" (o laranja do rodapé) | Emitir a OC | Quando estiver tudo certo, é este botão que emite: a OC ganha o número, o PDF é gerado e vai para a pasta da obra. Quem aperta é você — o tutorial não aperta, e sair dele não grava nada. Ainda não terminou? "Salvar Rascunho" guarda a OC sem número. | "Terminar" fecha o balão |

**A oferta** aparece no alto da tela, na primeira entrada da pessoa:

> **Quer ver como funciona?** Um tutorial curto mostra como fazer uma OC, campo por campo. Você faz de verdade, e ele
> não emite nada.

Ela tem dois botões, "Agora não" e "Ver o tutorial". Qualquer um dos dois faz a oferta não voltar.

## §3 — As suas regras, uma a uma

1. **Um botão no alto, sempre no mesmo lugar.** É fantasma, com ícone desenhado (um play no círculo). O laranja da tela
   continua sendo só o "Emitir" do rodapé.
2. **De 4 a 7 passos:** são 7.
3. **A pessoa faz de verdade:**
   - nos passos 1, 2 e 4, o passo segue sozinho quando ela age;
   - nos passos de leitura, segue no "Próximo";
   - quem volta a um passo já feito não é empurrado para a frente, porque o passo só segue quando a OC **muda**;
   - "Voltar" e "Sair" estão sempre à vista. O botão da frente diz **"Pular"** onde se age, **"Próximo"** onde se lê e
     **"Terminar"** no fim. Troquei o nome dele conforme o passo porque "Pular" num passo de leitura engana;
   - "Voltar" fica apagado no passo 1.
4. **O tutorial nunca emite:**
   - o último passo acende o botão e explica o que ele faz;
   - o código do tutorial não chama gravação nenhuma. Ele lê a OC da tela, e só;
   - sair não desfaz o que a pessoa preencheu, e também não grava: a OC fica como rascunho em edição, igual a sem
     tutorial.
5. **Opcional, oferecido uma vez:**
   - a oferta aparece na Nova OC, e não no login (lei da casa: sem portão de boas-vindas);
   - fica guardada no navegador, por pessoa. Em outro computador, a oferta volta uma vez. Para valer por pessoa em
     qualquer lugar, seria preciso uma coluna no banco, e esta casa não altera o banco. Se quiser, vira carta ao Banco;
   - num navegador que não guarda nada (janela anônima), a oferta não aparece, para não perguntar a cada visita. O
     botão "Tutorial" continua lá;
   - **quem já usa o sistema também vai ver a oferta uma vez**, na primeira Nova OC depois da publicação.
6. **O texto vem de uma fonte só — e aqui há um ponto para você decidir.** A Nova OC tem **um só "?"**: o da ECR. Os
   campos Fornecedor, Obra, Itens, Totais e Emitir não têm "?". Então:
   - o que já existe na tela agora mora num lugar só (`src/domain/tutorialDaNovaOc.ts`), e a tela e o balão leem
     dali: a dica da entrega, a frase da tabela vazia e a dica do "Importar Pedido (IA)". O passo 5 usa a frase do
     "?" da ECR;
   - **os textos dos passos 1, 2, 4, 6 e 7 são novos.** Eles moram no mesmo arquivo;
   - **a proposta:** se você quiser, esses mesmos textos viram o "?" dos campos, e aí a fonte única vale para tudo.
     Não fiz isso, porque muda a tela fora do tutorial.
7. **A 375 e no escuro:**
   - abaixo de 700 px, o balão vira uma faixa no pé da tela, e sobe para o alto quando o campo aceso está no pé (o
     "Emitir");
   - as cores vêm todas dos tokens;
   - sem movimento: o balão aparece no lugar, e a rolagem até o campo é seca.

**Teclado:** o Esc no balão sai do tutorial. O Esc na página não sai: ali ele já fecha a lista do campo, o "?" e a
importação, e não leva o tutorial junto.

## §4 — A ferramenta e o peso

**Nenhuma biblioteca: é um componente da casa.**
- **Por que não a driver.js nem a React Joyride:** as duas escurecem a página fora do campo aceso. A lista do
  Fornecedor e da Obra abre **por fora** do campo, e ficaria embaixo do escuro, sem clique. "A pessoa faz de verdade"
  não funcionaria no passo 1.
- **Como ficou:** nada cobre a página. O campo ganha um contorno laranja, o balão fica ao lado, e a tela inteira
  responde.
- **O peso no pacote, medido no build do ramo contra o do `main`:**
  - código: +5,7 kB, ou **+1,9 kB comprimido**;
  - estilo: +1,4 kB, ou **+0,3 kB comprimido**.

**Os dois defeitos que as fotos acharam, consertados em `a51ccba`:**
1. A 1366, no passo 1, o balão ficava **embaixo** do Fornecedor, e cobriria a lista quando ela abre. Agora o balão
   procura lugar nesta ordem: em cima, ao lado (direita e depois esquerda), e só então embaixo. A foto `71b` mostra a
   lista aberta, descoberta: a sobreposição medida é 0.
2. A 375, no passo 7, a faixa do pé cobria o próprio "Emitir". Agora ela sobe para o alto.

## §5 — A prova

1. **Os testes:**
   - 1034 no total, todos passando;
   - 21 são novos: 20 do tutorial e 1 da D757;
   - tipos e lint limpos.
2. **O percurso inteiro por programa, com a contagem de OCs (o seu §3.3):**
   - **no teste:** a tela de verdade, com a gravação falsa contando as chamadas. A pessoa escolhe o fornecedor e a
     obra, põe um item, preenche, segue até o "Terminar", e o resultado é **zero** `salvarOrdemCompra`, **zero**
     `marcarPdfGerado`, e as OCs ficam **iguais**, antes e depois. No mesmo teste, o "Emitir" apertado depois pela
     pessoa grava: isso prova que a OC estava pronta e que nenhuma trava escondeu um clique do tutorial;
   - **nas fotos:** o App de verdade sobre um banco falso dentro da página, nas 40 fotos. Em todas: **0 escritas**
     (rpc, insert, update, upsert ou delete) e **1 OC antes, 1 OC depois**.
   - **⚠️ O que eu não fiz: o percurso no banco de ensaio.** Ele precisa de uma sessão aberta no app, e eu não entro
     com senha. Proponho que o Pedro, ou quem tiver sessão no ensaio, faça o percurso. A contagem antes e depois sai
     por SELECT do seu lado ou do Banco. Se preferir outro caminho, me diga.
3. **As sabotagens:** 8 estragos no código, e todos ficaram vermelhos:
   - o "Terminar" emitindo;
   - o passo seguindo sem a pessoa agir;
   - a oferta sem guardar;
   - a oferta sem ser por pessoa;
   - o Esc da página levando o tutorial;
   - o contorno ficando depois de sair;
   - a dica da entrega como frase solta;
   - um alvo sem marca.

   **A primeira passou verde da primeira vez:** o teste deixava a OC sem destinatário e com o item vazio, e a própria
   tela recusava emitir antes da gravação. Consertei o teste para a OC ficar emitível, e agora ela fica vermelha.
4. **As fotos:** 40 PNGs em `docs/Capturas/2026-10-10_D763/`, a 1366 e a 375, claras e escuras:
   - 70: a oferta;
   - 71 a 77: os passos (71b é a lista aberta);
   - 78: o fim, sem balão e sem contorno.

   Em todas, a página não rola de lado, o balão cabe na tela e o campo aceso está à vista, sem nada por cima. Sem
   login de ninguém; nomes inventados.
5. **O tamanho, pela régua da D756** (linhas novas de código, sem testes e sem dados):
   - **D763: 474 linhas.** São 141 do balão, 121 dos passos e textos, 113 do estilo, 33 do guardar a oferta, 51 na
     Nova OC, 9 no ícone e 6 no campo. Nenhuma perícia;
   - **D757: 3 linhas.**

## §6 — Depois

1. Você confere as fotos e os textos, e decide o ponto do §3.6, se quiser.
2. Eu junto no `main` e publico pelo PowerShell, com o desfazer anotado antes.
3. O Pedro testa com uma pessoa de verdade.
4. A D757 sai na mesma publicação.

Se o Pedro trouxer um defeito do app do mestre hoje, ele passa na frente (o seu aviso das 09h).

— Ordem_de_Compra
