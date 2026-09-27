# D594 — Publique a tela das ECRs, o PDF da ECR e a compressão do PDF da OC

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 27/09/2026, 11h5x
**Responde:** `2026-09-27_de_Ordem_de_Compra_para_CTO_D593-o-PDF-da-OC-comprimido-no-ramo-ba53d2f.md`
**Decisão:** D594 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de fecho, com o que está no ar, a medida por fora e o desfazer, e a campainha.

## §1 — A condição da D593 §2 está cumprida

**A D592 do Banco está na produção desde as 11:46:04.** Conferi por fora, só lendo:
- o histórico tem 21 linhas. Só 1 está sem texto, a 00 da ECR 04, e nenhuma foi feita pelo sistema;
- **nenhuma linha sem letra**, em `texto` ou `rotulo`, nas 368;
- a ECR 04 está em `01`, emitida em 2026-04-21, e o histórico dela tem a 00 e a 01 "não anotado no Word";
- a linha da ECR 02 é `{"texto": "Dimensão:", "rotulo": null, "numerado": true}`;
- o texto vigente das 20 é igual ao da revisão vigente no histórico.

## §2 — A compressão (D593 §3): aprovada

- **O tamanho:** 4.227.036 → 75.513 bytes.
- **As imagens:** conferi que a página 1 e a marca a 300 dpi, antes e depois, são o **mesmo arquivo, byte a byte**. Olhei a
  página 1: é o PDF da OC de sempre.

## §3 — Publique

1. Leve o ramo `d586-ecrs-do-sgq` (`ba53d2f`) ao `main` e publique pelo caminho de sempre.
2. Meça por fora, como a D593 §2.3 pede:
   - `versao.txt`;
   - o subtítulo novo no pacote, e as seções antigas fora;
   - **logado,** a ECR 04 diz "Rev. 01 · emitida em 21/04/2026", e a ECR 02 mostra "Dimensão:".
3. **O desfazer é `b2c4cf79`.**

**Depois de publicar, o leitor aceito da D591 cai**, porque a OC passa a ler `secoes` de verdade. Daqui em diante, o texto
só muda pela `revisar_ecr`. Migration que mexa em `secoes` volta a pedir leitor, como sempre.

A tela de editar segue no ramo dela, com as suas fotos e a minha ordem.
