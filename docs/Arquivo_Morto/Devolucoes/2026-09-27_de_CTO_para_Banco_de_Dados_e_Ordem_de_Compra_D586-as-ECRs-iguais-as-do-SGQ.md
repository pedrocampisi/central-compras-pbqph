# D586 — As ECRs do sistema passam a ser as do SGQ, palavra por palavra

**De:** CTO · **Para:** `Banco_de_Dados` (§3) e `Ordem_de_Compra` (§4) · **Data:** 27/09/2026, 09h5x
**Decisão:** D586 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:**
- **do Banco:** a carta de fecho, com a migration, o desfazer e a prova da §3 no ensaio e na produção, e a campainha
  para mim e para a OC;
- **da OC:** depois da D585, a carta com o ramo e as fotos da §4, e a campainha. Não publique antes da minha ordem.

## §1 — A palavra do Pedro

Palavra do Pedro, na minha janela, hoje às 09h4x. Ele apontou a pasta das ECRs do SGQ:
`C:\Users\Pedro Paulo\Dropbox\SGQ - Campisi\08 - Execução de Obra\08.4 - Aquisição\ECR - Especificação de Compra e recebimento`

E disse: **"Vc vai ver que as ECR's do software esta bem simplificado"**.

## §2 — O que eu medi (só li)

**De onde vem o que o sistema tem hoje.** As 20 ECRs de `compras.ecrs` vieram da carga de 08/08
(`20260808150000_carga_compras.sql`). Essa carga copiou o HTML antigo (`Ordem de Compra\legacy\CentralCompras-PBQPH.html`).
**Nunca vieram dos documentos do SGQ.** Por isso não são só mais curtas: em vários pontos, dizem outra coisa.

**Os documentos do SGQ.** São 20 arquivos `.docx`, emitidos em 15/04/2026. Os nomes e os códigos batem com os 20 do
sistema. Cada documento tem cinco seções, sempre nesta ordem:

1. REFERÊNCIA
2. ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO
3. REGISTRO DO FORNECEDOR
4. INSPEÇÃO DO RECEBIMENTO
5. MANUSEIO, ARMAZENAMENTO E IDENTIFICAÇÃO

| | SGQ (linhas) | sistema (itens) |
|---|---|---|
| Referência / normas | 65 | 64 |
| Especificação de compra | 60 | **0** — o sistema não tem |
| Registro do fornecedor / documentos | 49 | 28 |
| Inspeção do recebimento / critérios | 112 | 62 |
| Manuseio, armazenamento e identificação | 88 | **0** — o sistema não tem |

**Onde o sistema diz outra coisa:**

- **As normas.** Só 3 das 20 ECRs têm a mesma lista de normas do documento: a 01, a 03 e a 19. Um exemplo é a ECR 02.
  O documento cita NBR 9193, 11700, 15696 e ISO 1096. O sistema cita 7190, 14807 e 15575.
- **Coisa inventada.** Na ECR 08, o sistema diz "quantidade conforme pedido + 5% de margem". O documento não fala em
  margem nenhuma.
- **Falta a regra de rejeição.** Na ECR 04, o documento manda rejeitar o lote se houver 6 peças defeituosas numa amostra
  de 20, com ±3 mm de limite. Manda também empilhar até 1,80 m. O sistema não tem nenhuma das duas.
- **Na ECR 03,** o sistema não tem o fator a/c nem a conferência da hora de saída e de chegada do caminhão.

**Quem lê as ECRs hoje:**

- **A tela "Catálogo ECR" da OC** lê tudo.
- **O item da OC** guarda o `ecr_id`.
- **O leitor da IA** (`extrair-itens`, linha 407) lê só `id, codigo, nome, materiais(descricao)`.
- **Os campos antigos** (normas, documentos, critérios, ensaios e o resto) só a OC lê, e mais os tipos gerados do Banco.

## §3 — Para o Banco: carregar os 20 documentos como estão

**A regra:** o documento do SGQ é a fonte. O sistema copia, **palavra por palavra**, sem resumir e sem consertar.
Consertar erro de digitação ou trocar uma norma é revisão do documento, e isso é do SGQ, não nosso. Quando o SGQ revisar
uma ECR, a carga roda de novo.

1. **Colunas novas em `compras.ecrs`** (a forma é a minha proposta; se algo não couber nela, você muda e avisa a OC e a
   mim na carta):
   - `revisao text`: a revisão do cabeçalho do documento, por exemplo `00`;
   - `emitida_em date`: a data da última linha da tabela de revisões;
   - `secoes jsonb`: as cinco seções, na ordem do documento, assim:
     `[{"titulo": "REFERÊNCIA", "itens": [{"rotulo": null, "texto": "NBR 7212 - Execução de Concreto ..."}]}, ...]`
   - `rotulo`: é o começo em negrito da linha, antes dos dois-pontos ("Lote", "Aspecto geral", "Quantidade",
     "Atenção", "Identificar"...). Quando a linha não tem rótulo, fica `null`. Você mede onde separar.
2. **Não entra no banco:** os nomes de pessoas da tabela de revisões, no rodapé. A tela não precisa deles, e quem fez e
   quem aprovou fica registrado no próprio documento.
3. **Fica como está:** `id`, `codigo`, `nome`, `categoria`, `unidades_padrao` e os `materiais`. O leitor da IA depende de
   `id`, `codigo`, `nome` e `materiais`. Os 20 nomes já batem com os do documento; se algum não bater, pare e me diga.
4. **Os campos antigos ficam, por enquanto** (`normas`, `documentos_obrigatorios`, `criterios_recebimento`, `ensaios`,
   `amostragem`, `registros`, `responsabilidades`, `observacoes`, `objetivo`, `escopo`). A tela da OC que está no ar lê
   esses campos, e um navegador com a versão velha guardada também lê. Quem apaga esses campos é outra carta, depois
   que a tela nova estiver no ar.
5. **Um desencontro no próprio documento.** A ECR 04 diz "Rev.: 01" no cabeçalho, mas a tabela de revisões dela só tem
   a linha 00. Carregue o que o cabeçalho diz e anote o caso na carta. **Não conserte o documento.**
6. **A prova.** Faça um programa em `scripts\` que:
   - lê os 20 `.docx` da pasta (só lê);
   - compara com o banco seção por seção e linha por linha;
   - dá **0 diferenças**, primeiro no ensaio e depois na produção.

   O programa fica guardado, porque é ele que roda de novo na próxima revisão do SGQ. **Faça uma sabotagem:** troque uma
   palavra no banco do ensaio e mostre o programa acusando.
7. **O caminho.** Migration com desfazer: primeiro no ensaio, depois na produção (emenda 3). Os tipos em
   `compartilhado\tipos-banco.ts` são gerados de novo. Campainha para a OC quando as colunas estiverem na produção.

## §4 — Para a OC: a tela mostra a ECR como o documento

**Comece depois da D585.** Você pode construir no ramo antes de o Banco terminar, usando a forma da §3 e o texto dos
`.docx` (só leitura). Os testes podem usar os textos dos arquivos como dados de teste. **Publicar, só depois que as colunas
estiverem na produção, e com a minha ordem.**

1. **Cada ECR aberta mostra:**
   - o código e o nome, e "Rev. 00 · emitida em 15/04/2026";
   - as cinco seções, com os mesmos títulos e na mesma ordem do documento, com o rótulo em negrito quando houver;
   - depois delas, os materiais, com um título que deixe claro que são **do sistema**, não do documento.
2. **Saem da tela** as seções antigas: Objetivo, Escopo, Normas Técnicas, Documentos Obrigatórios, Critérios de
   Recebimento, Ensaios e Observações.
3. **Um subtítulo na página** diz de onde vem o texto: cópia das ECRs do SGQ. Você propõe as palavras. É a regra da
   D475: cada tela diz o que é.
4. **Tipos, `normalize`, esquema e testes** mudam junto. A tela precisa aguentar uma ECR ainda sem `secoes`. Nesse
   caso, ela diz isso numa linha e não quebra.
5. **As fotos, a 1920×1080 e a 375:**
   - a lista fechada;
   - a ECR 03 aberta (curta);
   - a ECR 08 aberta (a mais longa no "Registro do fornecedor");
   - antes e depois.

   Guarde em `docs\Capturas\2026-09-27_D586\`.

## §5 — O que isto não muda

- O PDF da OC continua com a mesma linha "CRITÉRIO DE QUALIFICAÇÃO CONFORME ECR".
- O leitor da IA não muda.
- O `ecr_id` dos itens não muda.
