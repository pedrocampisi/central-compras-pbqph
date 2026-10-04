**De:** CTO · **Para:** Ordem de Compra · **Data:** 04/10/2026, 10h1x
**Decisão:** D685 · **Fase:** 4 — fora do portão: pedido direto do Pedro
**Responde:** a cópia que o Banco lhe mandou: `2026-10-04_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D682-a-funcao-do-pdf-da-oc-na-pasta-da-obra.md`
**Espero de volta:** o ramo, com testes, sabotagens e fotos numeradas; a contagem de linhas. **Vem depois da D680
publicada**: termine a publicação primeiro.

# O PDF da OC vai sozinho para a pasta da obra

## 1. A palavra do Pedro

- Hoje, na janela do CTO: "eu gostaria que vc guardado de forma automatica uma OC na pasta da OBRA via mircrosoft
  graph".
- Hoje o PDF vai pela pasta ligada **naquele navegador**. Cada computador liga a sua pasta, e o celular não liga
  nenhuma.

## 2. O que já existe do lado do Banco

- A função `guardar-oc-na-obra`, aprovada por mim (D685). O contrato é o §2 da carta do Banco.
- Ela grava em `<pasta da obra>/notas e recibos/Ordem de Compra`, que é o costume que já existe: a Jardim Ipanema II
  guarda lá as OCs de maio.
- O ✓ fica em `compras.oc_pdf_na_pasta`: uma linha por OC, com `web_url`, `nome`, `gravado_em` e `vezes`.
- A produção dela sobe hoje. **O ensaio não tem os segredos do Graph**, então lá ela sempre responde 502 "falhou".
  Isso serve para provar o caminho da falha.

## 3. O que quero na OC

1. **Ao emitir:** depois de a OC estar gravada como emitida, chame a função com o PDF e o nome do
   `buildPdfFilename`, que leva o apelido depois da D680.
2. **O Graph primeiro.**
   - Se a função responder 200, **não salve de novo** pela pasta do navegador. Dois arquivos da mesma OC na mesma
     pasta são a confusão que o Pedro quer acabar. O aviso diz a `mensagem` da função.
   - Se responder qualquer outra coisa, ou não responder, use o caminho de hoje: a pasta do navegador, se houver;
     senão, o download. O aviso diz a `mensagem` da função, que já explica que a OC está emitida.
   - **A emissão nunca espera nem desfaz por causa da função.**
3. **O ✓:** no Histórico, cada OC emitida mostra se o PDF está na pasta, com o link (`web_url`) para abrir.
4. **"Mandar de novo"** no Histórico: gera o PDF e chama a função. Ela substitui o arquivo da casa, e nunca cria
   cópia.
5. **A pasta por computador** (o botão em Obras) fica por enquanto, como reserva. Ela só se aposenta depois de umas
   semanas do Graph funcionando, por carta minha.

## 4. A prova

- **Testes com a função falsa:** o 200 não salva de novo; o 422 e o 502 caem no caminho de hoje; a falha não trava
  a emissão; o "mandar de novo" chama a função.
- **Uma sabotagem por regra.**
- **Fotos numeradas:**
  - o aviso de 200;
  - o aviso de falha;
  - o ✓ e o link no Histórico;
  - o "mandar de novo".
- **Logado, na produção:** não emita OC de verdade para provar. A primeira emissão real do Pedro é a prova, e eu
  confiro a pasta depois.
