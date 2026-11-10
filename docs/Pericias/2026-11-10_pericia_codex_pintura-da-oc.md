# Perícia de código da Ordem de Compra — Dia e noite

**Data:** 2026-11-10  
**Quem fez:** Codex, perito externo  
**Estado:** CONCLUÍDO — é registro  
**Escopo:** Ordem de Compra, ramo d1034-c-o-mestre. Diferença de 5e08819744f613d7f6e6f783fb87df3e846a8c68 até fdc1b8623dc9c80f1a5886193db79de3ee13ee69. Pintura e revisão de uso dos três lotes, incluindo a cópia do padrão e os testes. São 11 commits e 3.520 linhas de texto acrescentadas fora de documentação e testes. Os seis fechamentos de 10/11 e o DESIGN.md foram a régua de aceite.  
**Commit periciado:** fdc1b8623dc9c80f1a5886193db79de3ee13ee69 (fdc1b86).  
**NÃO foi olhado:** Produção, banco, documentos e fotos reais, o restante do histórico anterior à base, nem o conteúdo interno de PDF e legacy além da comparação Git. Instalação antiga da PWA, leitor de tela e câmera em aparelho físico ficaram sem medida independente.

## Para o dono da empresa

- Uma ficha ou janela pode continuar na frente enquanto o teclado passa a agir na lista de trás. Ao alargar a janela com o menu do celular aberto, a tela de trabalho pode ficar travada até fechar o menu.
- Em uma tela baixa, o menu “Mais” pode abrir com ações como “Duplicar” e “PDF” acima da área visível. Se várias tentativas falharem seguidas, o aviso mais recente também pode ficar abaixo da tela.
- O Painel somou certo no exemplo conferido. Uma empresa com 3 filiais e pedido em apenas 1 pode aparecer como se tivesse uma filial só.

## Achados para triagem

### 1. O teclado sai da ficha ou da janela aberta — média

**Onde:** src/App.tsx:354, src/App.tsx:510, src/components/Drawer/Drawer.tsx:31, src/components/Drawer/Drawer.tsx:48, src/components/ConfirmDialog/ConfirmDialog.tsx:34, src/components/ConfirmDialog/ConfirmDialog.tsx:51.  
**Degrau:** 1, correto e seguro.  
**O que está errado:** O atalho novo de busca trata a tecla “/” mesmo quando o foco está em um botão de uma ficha ou janela que cobre a página. A gaveta e a janela anunciam que são modais e recebem foco ao abrir, mas o conteúdo atrás segue acessível. A janela de confirmação também não devolve o foco ao fechar. O WAI orienta manter a navegação por Tab dentro da janela modal e devolver o foco ao acionador quando possível. [WAI, padrão de janela modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)  
**Consequência:** Basta 1 tecla para começar a digitar na busca de trás enquanto a ficha continua aberta. Ao sair de uma confirmação pelo teclado, a pessoa pode ter de localizar de novo a ação de onde veio.  
**Como conferir:** Em uma cópia com dados inventados, abra a ficha de uma obra pelo teclado. Com foco em “Fechar”, aperte “/” e inspecione o foco. Em seguida, numa prova do ConfirmDialog, abra a janela por um botão que permaneça na página, teste Tab e Shift+Tab nos limites da janela e pressione Esc. Confira se o foco volta ao botão de abertura.  
**Verifiquei ou deduzi:** Verificado que o atalho do commit transfere o foco para trás em prova com JSDOM. A saída pelos limites de Tab e a perda de foco ao fechar são deduzidas da implementação, sem medida em navegador real.

### 2. O “Mais” corta as primeiras ações quando o menu não cabe — média

**Onde:** src/components/Mais/Mais.tsx:46, src/styles/candidatas.css:231, src/styles/candidatas.css:243, src/features/ordens-compra/HistoricoPage.tsx:458.  
**Degrau:** 1, correto e seguro.  
**O que está errado:** O menu tenta abrir embaixo. Se não cabe, abre inteiro acima, sem conferir o espaço daquele lado. O limite de altura é uma fração da tela toda. No cálculo do commit, numa área de 667 × 350 px, um botão a 110 px do topo e uma lista de 230 px produzem topo em −124 px. Uma OC emitida com ECR oferece até 5 ações nesse menu, cada uma com pelo menos 44 px.  
**Consequência:** Parte do menu, incluindo ações do começo como “Duplicar” e “PDF”, fica acima da tela. A primeira ação pode receber foco sem ficar visível. Para alcançá-la, a pessoa precisa reposicionar a linha e abrir o menu de novo.  
**Como conferir:** Em Histórico de prova, use uma OC emitida com material controlado. Reduza a área da página para 667 × 350 px, posicione o “Mais” a cerca de 110 px do topo e abra pelo teclado. Compare o topo da lista com o topo da janela e confirme se “Duplicar” e “PDF” podem ser vistos e tocados.  
**Verifiquei ou deduzi:** Verificado o cálculo com as medidas sintéticas. O recorte e o efeito no toque são deduzidos do posicionamento e do CSS.

### 3. O menu de celular fica armado ao voltar para a largura de computador — média

**Onde:** src/App.tsx:154, src/App.tsx:460, src/App.tsx:510, src/App.module.css:28, src/App.module.css:110, src/App.module.css:139, public/padrao_campisi/componentes/componentes.css:442.  
**Degrau:** 1, correto e seguro.  
**O que está errado:** Só o CSS muda de arranjo ao cruzar 961 px. O estado que abre a gaveta continua verdadeiro, então o véu segue ativo e a área de trabalho segue marcada como inerte. A barra de baixo, que contém o “Mais”, some.  
**Consequência:** Uma mudança de 959 para 961 px com o menu aberto pode bloquear o conteúdo e cobrir o menu lateral. A pessoa precisa fechar pelo véu ou pelo Esc para voltar ao trabalho.  
**Como conferir:** Abra o “Mais” da barra de baixo com 959 px e alargue para 1.100 px sem escolher uma tela. Confira se o véu e o atributo inert continuam presentes e tente acionar a busca por clique ou Tab.  
**Verifiquei ou deduzi:** Deduzido da combinação do estado do React com as duas regras de largura.

### 4. Vários avisos de erro podem esconder o próximo aviso — média

**Onde:** src/stores/useUiStore.ts:132, src/components/Toast/Toast.tsx:14, src/components/Toast/Toast.module.css:10, src/features/mestres/MestresPage.tsx:65, src/features/mestres/MestresPage.tsx:81, tests/components/PecasDaRevisaoDeUso.test.tsx:184.  
**Degrau:** 1, correto e seguro, e 6, testável.  
**O que está errado:** Erros sem chave acumulam. A fila inteira fica fixa a 28 px do topo, com largura limitada e sem limite de altura ou rolagem. A geração de QR é um caminho que repete esse aviso sem chave quando falha. O teste atual verifica um erro e um sucesso e não exercita a fila de erros.  
**Consequência:** Seis falhas seguidas já podem empurrar o último aviso para fora de uma tela de 350 px de altura. A pessoa precisa fechar avisos anteriores para ler a falha mais recente.  
**Como conferir:** Em tela de prova, use um dublê que recuse a geração de QR. Faça 6 tentativas sem fechar os avisos, em uma área de 667 × 350 px. Confira se o sexto texto e seu “Fechar o aviso” estão visíveis e alcançáveis.  
**Verifiquei ou deduzi:** Verificado em memória que os 6 avisos ficam na fila e que o sucesso sai em 3,4 segundos. O recorte na tela curta é deduzido do CSS.

### 5. O Painel conta filiais que compraram no lugar das filiais da empresa — média

**Onde:** src/features/dashboard/DashboardPage.tsx:56, src/features/dashboard/DashboardPage.tsx:62, src/features/dashboard/DashboardPage.tsx:73, tests/components/DashboardEmpresas.test.tsx:78.  
**Degrau:** 1, correto e seguro, e 6, testável.  
**O que está errado:** A carta D1034a2 pede o documento para empresa com uma filial e “N filiais” para empresa com várias. O código conhece o grupo cadastrado, mas constrói o rótulo a partir dos IDs com OC que entrou na soma. O teste novo dá compras às duas filiais da empresa, cenário em que as duas contagens coincidem.  
**Consequência:** Uma empresa cadastrada com 3 filiais e compra em 1 aparece com o documento dessa filial. Com compras em 2, aparece “2 filiais”. O valor da linha continua somando as compras do grupo.  
**Como conferir:** Cadastre no dublê do Painel uma empresa com 3 filiais e uma única OC de R$ 120,00. Confira se a linha do ranking mantém R$ 120,00 e mostra “3 filiais”.  
**Verifiquei ou deduzi:** Verificado em memória no bloco de cálculo do alvo. A entrada de 3 filiais e R$ 120,00 em uma só produziu o rótulo de documento e o valor de R$ 120,00.

### 6. A Qualificação põe três ajudas invisíveis na rota do Tab — baixa

**Onde:** src/features/qualificacao/QualificacaoPage.tsx:251, src/features/qualificacao/QualificacaoPage.tsx:264, src/styles/candidatas.css:296, src/components/Ajuda/Ajuda.tsx:46, tests/components/PecasDaRevisaoDeUso.test.tsx:164.  
**Degrau:** 1, correto e seguro, e 6, testável.  
**O que está errado:** Os três botões “?” ficam no cabeçalho da tabela. No modo cartão, o CSS recorta o cabeçalho para uma área invisível, mas os botões permanecem na ordem do teclado. A resposta da ajuda abre dentro do mesmo cabeçalho recortado. O teste de cartões confere seletores do CSS e deixa esse percurso de Tab sem cobertura. O cartão mostra o nome curto e a linha de detalhes ainda dá acesso ao texto inteiro.  
**Consequência:** No celular com teclado, há 3 paradas de foco sem indicação visível antes dos cartões, e Enter em uma delas abre uma resposta que continua escondida. O WAI explica que a indicação visível é o que permite saber qual controle receberá a próxima ação. [WAI, foco visível](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)  
**Como conferir:** A 375 px, abra uma categoria de Qualificação com registros. Passe com Tab pelo trecho entre os filtros e os cartões. Observe o elemento ativo e pressione Enter em “Ajuda: Critério 1”.  
**Verifiquei ou deduzi:** Deduzido da marcação e do recorte CSS. Não medi com teclado em aparelho físico.

## O que conferi sem achado adicional

- **Nova OC.** O novo src/domain/faltaParaEmitir.ts:15 preserva a verificação de fornecedor, obra e pelo menos uma linha útil, usando o mesmo filtro de linhas em branco da emissão. Conferi na base e no alvo as travas de filial, qualificação vigente na data da OC, quantidade e destinatário antes da chamada de gravação. O botão do pé chama o mesmo fluxo, com a permissão de emissão e o estado de espera. A ida à primeira pendência muda a ordem dos avisos conforme D1034b2.
- **Ações e fichas.** Comparei as ações por situação e papel no Histórico, o acesso às fichas de Fornecedores e Obras, e “Requalificar”, “Histórico” e “Papéis” na Qualificação. Os comandos examinados continuam presentes. As linhas que substituíram “Editar” e “Ver / Pasta” aceitam Enter e Espaço. O “Mais” tem caminho de fechamento por Esc com retorno ao botão quando o foco está numa ação visível. A janela de confirmação intercepta Esc antes da gaveta de trás.
- **Modo e cache.** O index.html:13 chama o modo antes das folhas. A prova com armazenamento simulado confirmou dia sem preferência e com valor estranho, noite com “escuro”, e troca por botão e por outra aba. O tokens.css antigo e a ponte saíram. Na busca textual por referências diretas a variáveis CSS, não apareceu variável nova sem definição. A configuração preserva o carimbo do pacote, deixa versao.txt fora do cache prévio e mantém o pedido de atualização do worker antes de recarregar. O Workbox descreve a renovação dos arquivos e a retirada dos obsoletos quando o novo worker assume. A atualização controlada foi relatada pela casa na D1034a. [Chrome for Developers, cache prévio do Workbox](https://developer.chrome.com/docs/workbox/modules/workbox-precaching)
- **Mestre e PDF.** As mudanças nas telas de mestre e recebimento são em folhas de estilo. Os caminhos que registram a entrega, recebem a foto e geram o QR não mudaram no intervalo. O QR continua com fundo claro e desenho escuro nos dois modos. O diff em src/services/pdf e legacy está vazio. A leitura da câmera em aparelho físico fica fora da prova.
- **Testes.** Li os testes das peças, da emissão e da retirada da ponte. Usei provas em memória com dados inventados para o foco, o cálculo de posição do menu, os avisos, o Painel e o modo. A bateria completa não foi repetida nesta perícia. A D1034c informa 1.429 testes verdes para o fechamento dela, anterior ao último ajuste de alvos de toque incluído no commit periciado.

## Registro da conferência

A comparação usou os dois hashes pelo Git no diretório da Plataforma_Campisi. A triagem D1021 serviu de contexto para a pintura da Central. Nenhum laudo anterior foi usado como prova. O checkout permaneceu no ramo d1034-c-o-mestre e no alvo. As verificações foram locais e sem banco. Este laudo é o único arquivo gravado.
