# D593 — A tela de ler e o PDF estão aprovados; publique só depois da D592 do Banco, e o PDF da OC ganha a compressão

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 27/09/2026, 11h4x
**Responde:** `2026-09-27_de_Ordem_de_Compra_para_CTO_D586-D588-D589-a-tela-de-ler-e-o-PDF-no-ramo-eca44c1.md`
**Decisão:** D593 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:**
- agora: a carta com a compressão do PDF da OC (§3), com as fotos de antes e depois;
- depois da minha ordem (§2): a carta de fecho da publicação, com a medida por fora.

## §1 — O que olhei, e está aprovado

- **A lista fechada a 1920:** o código, o nome e a categoria, "Rev. 00 · emitida em 15/04/2026" e o botão PDF.
- **A ECR 03 aberta a 1920 e a 375:**
  - as cinco seções "01." a "05.", com o traço;
  - o quadradinho, e o rótulo em negrito;
  - a nota "Atenção" em destaque;
  - "Materiais";
  - o histórico em tabela a 1920 e em bloco a 375.
- **O PDF da ECR 08, página 1:** o cabeçalho com a marca, o código e a revisão; as cinco seções; a tabela de revisões e
  "Página 1 de 1" no pé. Está muito perto do Word.
- **O subtítulo está aprovado como você propôs:** "Especificações de Compra e Recebimento — 20 ECRs. O texto em vigor de
  cada ECR, com o histórico de revisões no fim."

**As suas três correções de premissa estão aceitas:**
- **o Word imprime "01." e o quadradinho, não 1.1.** A minha carta estava errada, e você fez certo em seguir o Word;
- **o "mᶟ" sai "m³" no PDF,** e o que ficar fora da fonte sai "?", nunca some;
- **o mapa de tipos:** a OC não o importa.

**A sua proposta do §6 também está aceita:** a tela de editar confere as regras da `revisar_ecr` **antes** de mandar e
aponta a linha com defeito.

## §2 — Publique só depois da D592 do Banco (a ordem importa)

**O Banco está consertando o texto** pela D592:
- a "Dimensão:" da ECR 02 passa a `rotulo` null e `texto` "Dimensão:";
- a ECR 04 ganha a linha 01 no histórico, "não anotada no Word", com `emitida_em` 21/04/2026, pela palavra do Pedro às
  11h4x ("Não lembro").

**Por que esperar:** a migration dele mexe em `secoes`. Hoje ela só passa na porta da D548 porque a OC no ar **descarta**
`secoes` (o leitor aceito da D591). **A sua tela nova lê `secoes`.** Se ela for ao ar primeiro, a aceitação cai, e a
porta recusa o conserto do Banco. Migration e tela são um par, e a migration vai antes.

**Então:**
1. Espere a minha ordem, que vem numa linha, por campainha, depois que eu conferir por fora a D592 na produção.
2. Aí publique o ramo pelo caminho de sempre, **com a compressão da §3 junto**.
3. Meça por fora:
   - `versao.txt`;
   - no pacote servido, o subtítulo novo aparece, e "Objetivo" e "Critérios de Recebimento" saem da tela;
   - logado, a ECR 04 diz "Rev. 01 · emitida em 21/04/2026", e a ECR 02 mostra a linha "Dimensão:".
4. **O desfazer é `b2c4cf79`.**

Enquanto isso, siga na tela de editar (o passo 2 da D589), num ramo à parte, como você propôs.

## §3 — O PDF da OC: a compressão entra (emenda a D586 §5)

**O seu achado está aceito.** Um PDF de 4,1 MB por OC vai anexado a e-mail de fornecedor, e isso é defeito. A D586 §5
dizia "o PDF da OC não muda", e **esta decisão emenda isso só neste ponto**: a marca ganha a compressão (`'FAST'` no
`addImage`), e nada mais muda.

**A prova:**
- o tamanho antes e depois, com a mesma OC de teste;
- a página 1 do PDF da OC, antes e depois, em imagem: tem de ficar igual a olho, e a diferença de pixels medida;
- um teste que trava o tamanho (abaixo de 300 KB), e a sabotagem dele mordendo.

**Vai no mesmo ramo e sai na mesma publicação da §2.**
