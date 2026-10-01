# D655 — o PDF com o quadro PARA A NOTA FISCAL, no ramo (NÃO publicado)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 30/09/2026, 15h0x
**Responde:** `2026-09-30_de_CTO_para_Ordem_de_Compra_D655-o-pdf-da-oc-com-o-endereco-da-obra-para-a-nota.md`.
**Espero de volta:** a sua conferência e, depois de o Pedro ver os PDFs, a carta curta de publicar (ou o que mudar).
**O banco não mudou.** Uma leitura a mais, só de leitura (§3).
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** As fotos usam só dados inventados.

---

## §1 — O ramo

- **O ramo:** `d655-pdf-obra-na-nota`, commit **`893e411`**, saído do `main` `340a506`.
- **O tamanho:** 8 arquivos fora de `docs/`, +395 / −36. É bem menos de mil linhas, então não houve perícia.
- **A bateria:**
  - 630 testes, todos verdes (eram 614; +16);
  - tipos, lint e o pacote (pelo PowerShell) limpos.
- **O CI está verde** (execução 36755275450).
- **Não publiquei.**

## §2 — O que mudou no PDF (o seu §4)

- **O quadro PARA A NOTA FISCAL** vem logo depois do cabeçalho da página 1. É a coisa mais forte da folha: fundo azul
  claro, borda azul, o título em azul e o texto em negrito maior. Ele traz:
  - a ordem: "Escreva no campo INFORMAÇÕES COMPLEMENTARES da nota fiscal o texto abaixo";
  - o texto pronto, numa caixa branca: obra, logradouro com número (e complemento), bairro, cidade/UF, CEP, CNO (só
    quando há) e o número da OC. A montagem é lógica pura, em `src/domain/notaFiscal.ts`;
  - a linha "Local de entrega: este mesmo endereço, o da obra." Quando a obra tem telefone, ele vem nela.
- **Parte vazia some com o rótulo:**
  - sem CNO, a palavra "CNO" não aparece;
  - em rascunho sem número, não aparece "OC nº".
- **O cuidado do seu texto, quando o destinatário é empresa:** uma linha pequena, dentro do quadro, diz para não trocar
  o endereço do destinatário pelo da obra. O da empresa continua o do cadastro dela; a obra vai só nas informações
  complementares e no local de entrega. **Para pessoa física a linha não aparece.**
- **O destinatário continua**, menor e abaixo do quadro:
  - o título é "FATURAR PARA — DESTINATÁRIO DA NOTA (endereço do cadastro do destinatário, não o da obra)";
  - a linha do endereço diz "Endereço do destinatário:".
- **O ENTREGAR EM saiu, e foi para dentro do quadro.** O endereço da obra aparece uma vez só na folha, e há um teste que
  conta isso.
- **As condições:**
  - o item 1 nomeia o campo INFORMAÇÕES COMPLEMENTARES e aponta o quadro, sem "rodapé";
  - o antigo item 5 (número da OC e obra/CNO) saiu, porque repetia o quadro. Eram 6 itens, agora são 5;
  - um texto de condições guardado com o item 1 antigo sai com o item 1 novo. Hoje a produção usa sempre o texto
    padrão, então isso é só guarda.
- **O lembrete no rodapé, em toda página,** numa linha azul: "NA NOTA FISCAL: o endereço da obra vai no campo
  INFORMAÇÕES COMPLEMENTARES (quadro PARA A NOTA FISCAL, página 1)".

## §3 — Achado no caminho: o "CNO" impresso hoje não é o CNO

- **O defeito:** o PDF no ar imprime como "CNO/CEI" o `cadastro_imobiliario` do imóvel, que é **a inscrição da
  Prefeitura**. O CNO de verdade mora em `core.intervencoes.cno`.
- **A medida,** só de leitura, na produção, com o papel `authenticated`:
  - 11 intervenções;
  - 7 têm CNO;
  - 1 está marcada "não se aplica";
  - 7 imóveis têm a inscrição.

  Então toda OC dessas obras saiu com um número da Prefeitura no lugar do CNO.
- **Consertei junto,** porque o quadro novo depende disso: o CNO sai no texto que vai para a nota, e é o primeiro degrau
  da Central_Financeiro. A carga passa a ler `intervencoes.cno`; é uma coluna a mais na leitura, e o banco não muda.
  - A tela de Obras dizia "CEI:" e agora diz "CNO:".
  - O campo da gaveta dizia "CEI / Matrícula" e agora diz "CNO".
  - O nome interno do campo (`cei`) ficou, para não espalhar a troca.
- **A marca "não se aplica" não é lida.** Obra sem CNO simplesmente não mostra CNO.

## §4 — As provas (o seu §5)

**Os testes** estão em `tests/domain/notaFiscal.test.ts`, `tests/services/ocPdfNotaFiscal.test.ts` e
`tests/services/cnoDaObra.test.ts`. Eles leem o texto do PDF desenhado e provam:
- o quadro tem obra, logradouro, CEP, CNO (quando há) e o número da OC;
- sem CNO, "CNO" não aparece no quadro;
- na página 1, o quadro vem antes do destinatário;
- ENTREGAR EM não existe, e o endereço da obra aparece uma vez só;
- o destinatário continua, com o endereço do cadastro dele;
- a linha do cuidado aparece só para empresa;
- as condições têm "INFORMAÇÕES COMPLEMENTARES", não têm "rodapé" e não têm item 6;
- o lembrete está em cada página;
- a carga lê `cno`, e não a inscrição.

**As sabotagens:** todas deram vermelho, e o arquivo voltou com o mesmo sha.

| # | Sabotagem | Resultado |
|---|---|---|
| 1 | tirar o CEP do texto da nota | vermelha: 6 testes caem |
| 2 | "CNO" sempre, mesmo vazio | vermelha: 4 caem |
| 3 | a linha do cuidado para todo destinatário | vermelha: 1 cai |
| 4 | tirar a troca do item 1 antigo | vermelha: 1 cai |
| 5 | o CNO de volta para a inscrição da Prefeitura | vermelha: 2 caem |

A sabotagem 4 foi pensada primeiro como "voltar o item 1 padrão ao texto antigo". Ela ficou **verde**, porque a troca
do item antigo consertava o texto sozinha. Então escrevi o teste do texto guardado e sabotei a troca, e aí deu vermelho.

**As imagens** estão no ramo, em `docs/Capturas/2026-09-30_D655/`. Cada uma mostra a mesma OC lado a lado: à esquerda
o gerador do `main` de hoje, à direita o do ramo. Os PDFs dos dois lados também estão lá.

| Arquivo | O caso |
|---|---|
| `1_destinatario_pessoa_fisica.png` | destinatário pessoa física com endereço |
| `2_destinatario_empresa.png` | destinatário empresa: a linha do cuidado |
| `3_obra_sem_cno.png` | obra sem CNO |
| `4_duas_paginas_pagina1.png` e `_pagina2.png` | 34 itens, duas páginas; o lembrete nas duas |
| `5_endereco_longo.png` | endereço longo que quebra |

**No caso 5, o PDF de hoje tem outro defeito:** o endereço longo passa da borda da folha, e o bairro longo escreve por
cima da cidade. No quadro novo, o texto quebra dentro da caixa.

**O que não medi:** a tela logada e um PDF de OC real. As imagens são o gerador sobre dados inventados.

## §5 — Para você decidir

1. **A linha do cuidado, só para empresa:** fica assim, ou vai para todos?
2. **O lembrete azul no rodapé:** fica, ou sai? O seu §4 deixou opcional.
3. **A publicação:** espero a sua carta curta, depois de o Pedro ver os PDFs.
