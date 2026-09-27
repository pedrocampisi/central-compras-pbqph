# D593 §3 — o PDF da OC com a marca comprimida: de 4,1 MB para 74 KB, e a página igual. No ramo `ba53d2f`, nada publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 11h5x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D593-tela-e-PDF-aprovados-publique-depois-da-D592.md`, §3
**Espero de volta:** a ordem de publicar, numa linha, depois que você conferir a D592 na produção (§2 da sua carta). **Não
publiquei.** A carta de fecho, com a medida por fora, vem depois da publicação.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta nem nas fotos.** A OC de teste tem dados
inventados ("Fornecedor de Teste Ltda", "Obra de Teste").

---

## §1 — O que mudou

- **Uma linha, em `generateOcPdf.ts`:** o `addImage` da marca ganhou `'FAST'`, a compressão. **Nada mais muda.** Mesma
  posição e mesmo tamanho (14 × 14 mm), e a tabela e os textos intactos.
- **No mesmo ramo da tela das ECRs:** `d586-ecrs-do-sgq`, commit **`ba53d2f`**, empurrado. Sai na mesma publicação, como a
  sua §3 manda.

## §2 — A prova, com a mesma OC de teste

| | Antes | Depois |
|---|---|---|
| Tamanho do PDF | **4.227.036 bytes** (4,1 MB) | **75.513 bytes** (74 KB) |
| Página 1 a 110 dpi | — | **0 pixels diferentes** de 1.171.170 |
| A marca a 300 dpi | — | **0 pixels diferentes** de 57.730 |

- **As imagens de antes e de depois são o mesmo arquivo, byte a byte.** A digital sha256 é igual: `cf4a99e2…` a página e
  `986fda38…` a marca.
- **A compressão não perde nada:** a imagem é a mesma, só guardada comprimida.
- **Fotos:** em `docs\Capturas\2026-09-27_D593\`, a página 1 e a marca a 300 dpi, antes e depois, e o PDF novo. O PDF de
  antes ficou fora do repositório, porque são 4 MB do mesmo desenho.

## §3 — As travas

- **`tests/services/ocPdfPeso.test.ts`:** gera o PDF de uma OC de teste com a marca de verdade (lida do arquivo, sem rede).
  Confere que a marca entrou e que o arquivo fica **abaixo de 300 KB**.
- **As 2 sabotagens mordem, com o hash de volta igual:**
  1. a marca volta sem compressão;
  2. a marca some do PDF. Isso prova que o teste não passa à toa só porque a marca faltou.
- **A D557 1d**, a sabotagem antiga que mexe no PDF da OC, continua mordendo.
- **A bateria:** 343 testes verdes (eram 342), tipos e lint limpos.

## §4 — O que fica esperando, e o que sigo fazendo

- **A publicação:** quando a sua linha chegar, junto o ramo no `main` e rodo a bateria e as sabotagens de novo. Depois
  publico pelo PowerShell e meço por fora, como a sua §2 lista. O desfazer é `b2c4cf79`.
- **A tela de editar (D589 passo 2):** começo agora, num ramo à parte, a partir deste. Ela confere as regras da
  `revisar_ecr` antes de mandar, como você aceitou.

— Ordem_de_Compra
