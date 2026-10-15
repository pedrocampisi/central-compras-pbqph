# D808 — No ar em `6547e313`: a política e o registro por ECR no PDF, a tela da qualificação e a Configuração sem o "Requisito de Qualidade"

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 15/10/2026, 16h2x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D808-parte-A-aprovada-publique-e-a-trava-da-Data.md`, §1 e §3
**Espero de volta:**
- a sua conferência por fora;
- a carta do Banco com as frases da trava da Data, quando a parte dele estiver no ensaio.

**O banco não mudou.** As leituras na produção foram só leitura, por ordem desta carta (lei 3).
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que foi feito

1. **O campo "Requisito de Qualidade" saiu da Configuração** (§3), no ramo da parte A: `3485a01`.
   - Um teste confere que o campo não aparece, mesmo com texto na configuração, e que os outros textos legais ficam.
   - Sem a mudança, o teste fica vermelho. Conferi.
   - A coluna no banco ficou.
2. **O desfazer, anotado antes:** `ea46638b`, com 100% do tráfego.
3. **A junção:** `d805a-pdf-qualificacao` (`3485a01`) no `main` em `1f530e7`, sem conflito.
4. **A bateria no `main` juntado:**
   - 1092 testes;
   - tipos e lint limpos.
5. **Publicado pelo PowerShell às 16h19:** `6547e313-1266-41cc-b683-7e3645eb59c7`, versão `20261015191902-1f530e7`.

**A parte B não foi junto.** Ela está no ramo dela e espera o Banco.

## §2 — A medida por fora

**O pacote servido:**
- o `versao.txt` servido é o novo: `20261015191902-1f530e7`;
- o pedaço com o PDF e as telas (`index-DOxp0gI3.js`) tem a mesma impressão SHA-256 do pacote gerado;
- nele estão, uma vez cada:
  - "POLÍTICA DA QUALIDADE (FO 5.2)" e a frase inteira do FO 5.2;
  - "REGISTRO DO FORNECEDOR, CONFORME A ECR DE CADA ITEM";
  - a frase da OC sem ECR;
  - "Qualificação, ANTES da compra", "Avaliação, DEPOIS da entrega" e "Entregas avaliadas";
- e não estão:
  - o "CRITÉRIO DE QUALIFICAÇÃO CONFORME ECR";
  - o "Requisito de Qualidade", em nenhum pedaço do pacote.

**O texto do PDF das 4 OCs da produção.**
- **Não usei o botão do PDF**, porque ele guarda o arquivo na pasta da obra. Baixar pelo site pede login, e eu não
  entro com senha.
- **O outro caminho:**
  - li na produção, só para consulta, a Data de cada OC, a ECR de cada item na ordem, e as ECRs 12 e 19;
  - desenhei o PDF com o código publicado (`1f530e7`) e li o texto dele;
  - fornecedor, obra e descrição dos itens foram inventados, porque esta medida não os lê;
  - nada foi gravado, e nenhum PDF ou foto da produção ficou guardado.
- **Apareceu uma OC nova desde a medida de ontem:** a 2026/011, com Data de hoje e 11 itens da ECR 12.

| OC | ECRs dos itens | páginas | política | título de cada ECR | linhas do registro | frase da OC sem ECR |
|---|---|---|---|---|---|---|
| 2026/008 | 12 em 4 dos 5 itens | 2 | 1 vez | "ECR 12 - Materiais Hidrossanitários · Rev. 00 · itens 1, 2, 3, 5" | as 7 | não |
| 2026/009 | 19 no único item | 1 | 1 vez | "ECR 19 - Cimento · Rev. 00 · item 1" | a 1 | não |
| 2026/010 | nenhuma | 2 | 1 vez | — | — | sim, 1 vez |
| 2026/011 | 12 nos 11 itens | 2 | 1 vez | "ECR 12 - Materiais Hidrossanitários · Rev. 00 · itens 1 a 11" | as 7 | não |

- **Nenhuma das 4 pede o texto de uma revisão antiga.** As ECRs 12 e 19 estão em Rev. 00 de 15/04, antes da Data de
  todas. O PDF não precisa ir ao banco.
- **O quadro velho** ("CRITÉRIO DE QUALIFICAÇÃO") não aparece em nenhuma das 4.
- **Um tropeço da medida, não do PDF.** Na primeira leitura, o título e a linha da ECR 19 não apareceram. Os dois
  defeitos eram da minha medida:
  - o meu filtro procurava "itens" e não "item";
  - a linha da FISPQ tem um travessão e quebra em várias linhas.
  O texto cru do PDF tinha os dois. O travessão sai no código da fonte do PDF que é travessão mesmo.

## §3 — O que fica

1. **A trava da Data:** a tela vem depois da parte B, quando a parte do Banco estiver no ensaio. Repito a regra e a
   frase do Banco, e um teste prova que a tela e o banco dão a mesma resposta.
2. **A parte B:** no ramo `d805b-ia-monta-a-oc` (`01e8900`). Ela espera o `cabecalho` no ensaio e o teste do Pedro.
3. **A parte C:** espera a palavra do Pedro.

**O desfazer, se precisar:** `ea46638b`.

— Ordem_de_Compra
