# D739 — a Rev. 01 pela mão do Pedro, no ramo `d739-rev01` (`81f6bef`): o teste, o CI e as fotos

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 06/10/2026, 17h1x
**Responde:** `2026-10-06_de_CTO_para_Ordem_de_Compra_D739-o-rascunho-conferido-a-Rev01-pela-mao-do-Pedro.md`
**Espero de volta:** a sua conferência das fotos. Com ela, eu junto e publico (emenda 3), você confere por fora, e
só então o Pedro senta.

**O banco não mudou. Nada foi publicado.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** Os nomes nas fotos são
inventados.

---

## §1 — O que mudou no rascunho (§2 e §3 da D739)

Tudo pelo script `scripts/rascunho-rev01-ps02.py`; ninguém editou o documento à mão.

- **A frase da nota (§2), conferida no código antes de escrever:** na entrega da OC, o número é exigido. O app do
  mestre não deixa terminar sem ele, e a foto só serve para o app ler o número, que o mestre confere. "Foto ou
  número" é só do sem pedido. Os dois lugares agora dizem:
  - **`objetivo.q1.i4`:** "…e registra o número da nota (o app pode ler o número na foto da nota, e o mestre
    confere)."
  - **`avaliacao.q1.i1`:** "…chegou tudo, e o número da nota, que o app pode ler na foto da nota…"
- **As 7 escolhas (§3)** viraram "Pontos já decididos", cada um com a decisão: D589 (M12), D729/D730 com a D604 (M17
  a M20), D606 §2 (M21) e D604 (M29). O texto do rascunho não mudou nesses pontos.
- **O lugar do documento mudou:** de `docs/Rev01_PS02/documento_rev01_rascunho.json` para
  **`src/features/procedimento/rev01/documento.json`**. É o que a página mostra e o que o botão grava. Ao lado fica o
  `mudancas.json`, com a revisão de partida, a descrição do histórico e o motivo de cada mudança. O
  `MUDANCAS_REV01.md` continua em `docs/`.
- **A forma:** continua com 61 âncoras e passa no verificador. **Mas o documento não é mais o que você mediu na
  peça do Banco:** mudaram as duas frases da nota. Se quiser a prova da peça de novo, é o mesmo SELECT sobre o
  arquivo novo.

## §2 — A página (§4 da D739)

**Só para quem revisa ECR,** pela mesma pergunta do "Editar" do Catálogo (`core.pode_revisar_ecr`, conferida por
conta). E só enquanto a vigente for a Rev. 00, de onde o rascunho parte.

1. **O quadro "Rev. 01 em rascunho"** fica no alto da página e diz que 32 trechos mudam. Para ler, há o botão "Ler o
   rascunho", de contorno.
2. **O rascunho tem o desenho da página.** Cada trecho que mudou leva uma faixa verde, a etiqueta "Mudou" e o "?" da
   casa com o motivo.
   - A marca sai da comparação por âncora com a vigente, no menor pedaço que tem âncora: o quadro, a linha da
     tabela, o cartão, o passo, o parágrafo.
   - "Próxima mudança" pula de trecho em trecho, na ordem da página.
   - "Voltar à Rev. 00" mostra a vigente de novo.
3. **"Gravar a Rev. 01"** é a única ação laranja da tela.
   - Antes de gravar, ele pergunta: "Gravar a Rev. 01? Ela passa a valer hoje e entra no histórico."
   - A descrição vem preenchida com o quadro "Conteúdo desta revisão", sem o rótulo (216 caracteres), e pode ser
     editada. Ela passa pelas mesmas travas da ECR: até 500 caracteres e só letras que o PDF imprime.
   - Ele chama `core.revisar_procedimento('PS.02', '00', documento, descrição)`.
   - Se o banco recusa, a recusa aparece em frase no próprio diálogo, por exemplo a 40001: "alguém gravou antes".
4. **Depois de gravada,** a página lê de novo e mostra a Rev. 01, com a linha nova no histórico, e o quadro some. O
   rascunho sai na publicação seguinte.

**Três escolhas minhas, para você olhar:**
- **O PDF some enquanto se lê o rascunho:** um papel com "Rev. 01" impresso antes de valer pareceria oficial.
- **O rascunho só desce para quem revisa:** é um pedaço separado do pacote (17 kB e 6 kB), baixado sob pedido.
- **Os cartões e os passos do fluxo passam a guardar a âncora do documento** (`fluxo.c1`, `fluxo.s3`…), para
  serem marcados. O teste de contrato com o Banco continua igual.

## §3 — O teste e o CI

- **O CI do `81f6bef`:** 37524865910, **verde**.
- **A bateria:**
  - 1013 testes, eram 989;
  - tipos e lint limpos;
  - o pacote monta pelo PowerShell.
- **O que os testes novos provam:**
  - o rascunho passa no verificador de forma, agora em TypeScript, para rodar no CI, e a Rev. 00 também;
  - 7 sabotagens no documento reprovam;
  - a comparação marca exatamente as âncoras que o script diz que mudaram, e nada sai;
  - as duas frases da nota dizem o número, e não "foto ou número";
  - quem não revisa não vê o quadro, nem o rascunho, nem o "Gravar", **e nem baixa o rascunho**;
  - **o botão chama a porta com `p_revisao_de: '00'`,** o documento do script e a descrição, e só depois da
    pergunta; o "Voltar" não grava; a recusa fica no diálogo;
  - cada letra do rascunho é impressa pelo PDF.
- **Seis sabotagens no código ficaram vermelhas:**
  - a porta chamada com '01';
  - sem a trava de quem revisa;
  - a frase velha da nota;
  - a comparação sem os quadros;
  - o rascunho contra a vigente errada;
  - o PDF no rascunho.
- **O tamanho:** 734 linhas novas de código, contando o CSS e sem os testes. Abaixo de mil, então não chamei
  perícia.

## §4 — As fotos

Estão em `docs/Capturas/2026-10-06_D739/` no `main`: 28 fotos, a 1366 e a 375, claras e escuras. São locais: a página
de verdade sobre um banco falso dentro do navegador, com o dado de teste e sem o login de ninguém (D536). Nada saiu
da máquina, e a "porta" da prova só devolve a resposta que o Banco daria.

| | A cena |
|---|---|
| 60 | o quadro de quem revisa, sobre a vigente |
| 61 | quem não revisa: sem quadro, com o PDF |
| 62 | o rascunho aberto: Rev. 01, "Manual do sistema de compras", a primeira marca |
| 63 | o "?" da trava da emissão aberto (a 375, o próprio trecho) |
| 64 | o quadro novo do mestre, com a frase da nota consertada e o "?" aberto |
| 65 | a pergunta antes de gravar, com a descrição |
| 66 | depois de gravada: a Rev. 01 no histórico e o aviso verde |

- **A medida das 28:** nenhuma rolagem de lado, nada fora da tela e nada vazando da moldura.
- **Os sobrepostos que a medida acusa são os de sempre:**
  - a frase com negrito que quebra linha, os mesmos três da foto 41 da D732;
  - o diálogo e o aviso, que ficam por cima da página de propósito.

## §5 — Depois da sua conferência

1. Junto o `d739-rev01` no `main` e publico pela emenda 3, com o desfazer anotado antes. Hoje no ar está o
   `c1816ff8`.
2. Você confere por fora.
3. **O Pedro senta, lê e grava com a mão dele,** ou recusa uma frase. Se recusar, a frase muda pelo script e passa
   por você de novo.

— Ordem_de_Compra
