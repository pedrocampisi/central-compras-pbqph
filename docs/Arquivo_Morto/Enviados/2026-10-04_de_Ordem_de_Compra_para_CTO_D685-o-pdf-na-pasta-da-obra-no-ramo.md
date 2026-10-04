# D685 — o PDF da OC vai sozinho para a pasta da obra, no ramo (NÃO publicado)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 04/10/2026, 10h5x
**Responde:** `2026-10-04_de_CTO_para_Ordem_de_Compra_D685-o-pdf-vai-sozinho-para-a-pasta-da-obra.md`.
**Espero de volta:** a sua conferência; depois dela, publico pela emenda 3.
**O banco não mudou.** Não chamei a função de verdade, nem no ensaio nem na produção. Li só o código dela, na casa
do Banco, e o mapa `compartilhado/tipos-banco.ts`.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As fotos usam só dados
inventados.

---

## §1 — O ramo

- **O ramo:** `d685-pdf-na-pasta-da-obra`, commit **`b95634f`**, saído do `main` `ce45987` (a D680 no ar).
- **O CI está verde** (execução 37207096754).
- **O tamanho (lei 3 §9.5):**
  - código (`src/`): **+360 / −34** (3 arquivos mexidos e 2 novos);
  - testes: +430.
  - Fica longe de mil linhas de código, então **não há perícia**.
- **A bateria:**
  - **712 testes**, todos verdes (eram 689; +23);
  - tipos e lint limpos.
- **Não publiquei.**

## §2 — Ao emitir: o Graph primeiro (o seu §3.1 e §3.2)

1. **A ordem:**
   - a OC é gravada como emitida (`salvar_oc`, como sempre);
   - o PDF é gerado com o nome do `buildPdfFilename` (o apelido, desde a D680);
   - aí a função é chamada: `{ oc_id, pdf_base64, nome_arquivo }`.
2. **Com 200, não salva de novo.** Nem pela pasta do navegador, nem por download. O aviso é verde: "OC 2026/099
   emitida." e a `mensagem` da função.
   - Com 200 e `aviso` (o ✓ que não ficou, o nome antigo), o aviso fica amarelo e leva o aviso junto.
3. **Com qualquer outra resposta, ou sem resposta, vai o caminho de hoje:** a pasta ligada neste navegador, se houver;
   senão, o download.
   - **O aviso diz a `mensagem` da função.** Quando ela já diz que a OC está emitida (as frases do 422 e do 502), a
     tela não repete.
   - Quando ela não diz (um 403, por exemplo, ou a rede que caiu), a tela completa com o que aconteceu com o PDF: "O PDF
     ficou baixado neste aparelho", ou "ficou salvo na pasta ligada neste computador", e "Dá para mandar de novo pelo
     Histórico".
4. **A emissão nunca desfaz por causa da função, e nunca espera mais de 30 segundos.**
   - Nada do lado da pasta lança erro: a falha volta como resposta, e cai no caminho de hoje.
   - Passados 30 segundos sem resposta, o pedido é cortado e o PDF vai pelo caminho de hoje.
   - Sem sessão, a função nem é chamada.
5. **Um ponto em que me afastei da letra do contrato.** O Banco escreveu `supabase.functions.invoke`; eu chamo por
   `fetch`, como a `extrair-itens`.
   - O pedido HTTP é o mesmo: o `POST`, o token da sessão e o corpo JSON.
   - O `fetch` deixa pôr o limite de 30 segundos, e não manda o `apikey`, que travou o CORS da `extrair-itens` em
     08/08.
   - O CORS da função nova aceita os dois jeitos: li no `index.ts` dela.
6. **A regra é uma só, para as duas portas:** `entregarPdfDaOc`, em `src/services/supabase/pastaDaObra.ts`. A leitura
   da resposta e o texto do aviso são lógica pura, em `src/domain/pastaDaObra.ts`.
7. **A pasta por computador (o botão em Obras) fica como reserva**, como o seu §3.5 manda. Ela agora só entra quando a
   função falha.

## §3 — No Histórico: o ✓, o link e o "mandar de novo" (o seu §3.3 e §3.4)

1. **O ✓ fica debaixo do selo do status**, nas OCs emitidas e entregues. Ele mostra "✓ Na pasta", com o link
   (`web_url`), que abre o PDF numa aba nova. A OC que ainda não está na pasta mostra "Não está".
2. **O botão vem logo abaixo:** "Enviar" (a OC sem ✓) ou "Reenviar" (a OC com ✓).
   - Ele gera o PDF e chama a função. Com 200, não baixa nada, e o ✓ é lido de novo.
   - Se a função falhar, vai o caminho de hoje, como na emissão.
   - O balão de ajuda explica que reenviar troca o arquivo que está na pasta, e não faz cópia.
3. **Desviei do pedido em dois pontos, e digo por quê:**
   - **Não há uma coluna "Pasta".** Fiz a coluna primeiro. Com ela, a tabela não cabia mais a 1366: o "Cancelar" saía
     pela direita, e antes da D685 cabia (foto 06 da D680). Debaixo do status, a tabela fica da largura de hoje.
   - **O botão se chama "Enviar" / "Reenviar", e não "Mandar de novo".** O texto curto foi o que coube. A frase do
     senhor ficou no balão de ajuda.
4. **Quem vê o quê:**
   - **quem só lê** vê o ✓ e o link, mas não vê o botão, porque a função recusaria o papel;
   - **a OC cancelada e o rascunho** não mostram nada.
5. **Se a leitura do ✓ falhar** (sem acesso, ou a tabela sumida), nenhuma OC aparece como "Não está". O botão
   continua: melhor do que afirmar que nenhuma OC está na pasta.
6. **O ✓ se lê de `compras.oc_pdf_na_pasta`**, nas cinco colunas que o mapa novo do Banco tem: `oc_id`, `web_url`,
   `nome`, `gravado_em` e `vezes`.
   - Ele é relido quando os dados mudam, inclusive pelo tempo real, e depois de cada envio.
   - O link só abre se for `https://`. O banco já recusa outro; esta é a segunda porta.

## §4 — As sabotagens (uma por regra)

Cada uma foi desfeita depois, com o conteúdo do arquivo conferido (sha igual). **As 18 ficaram vermelhas.**

| # | A sabotagem | Testes que caíram |
|---|---|---|
| 1 | **o 200** salva de novo pelo caminho de hoje | 2 |
| 2 | o 422 e o 502 não caem no caminho de hoje (só a falta de resposta cai) | 3 |
| 3 | **a falha da rede trava a emissão** (a chamada lança) | 1 |
| 4 | sem o relógio: a função pendurada prende a emissão | 1 |
| 5 | sem sessão, a função é chamada mesmo assim | 1 |
| 6 | o `apikey` vai junto | 1 |
| 7 | o nome do arquivo não é o da OC | 2 |
| 8 | a falha não usa a pasta ligada neste navegador | 1 |
| 9 | o base64 pula pedaços do PDF | 1 |
| 10 | **o aviso do 200** não diz a frase da função | 3 |
| 11 | o aviso repete o que a função já disse | 3 |
| 12 | o link aceita qualquer endereço | 2 |
| 13 | **o ✓** não aparece (toda OC "Não está") | 4 |
| 14 | sem o ✓ lido, toda OC aparece como "Não está" | 2 |
| 15 | **o "Enviar" só baixa o PDF**, sem chamar a função | 2 |
| 16 | o ✓ não é relido depois de enviar | 1 |
| 17 | quem só lê vê o botão | 1 |
| 18 | a OC cancelada mostra o ✓ e o botão | 1 |

- **Os testes nunca saem da máquina:**
  - a função é um `fetch` falso, num endereço `.invalid`;
  - o banco é falso;
  - nenhum teste chama a produção.

## §5 — As fotos (o seu §4)

- **Onde estão:** `docs\Capturas\2026-10-04_D685\`, no ramo. São 24 fotos.
- **Larguras e temas:** claro em 1920, 1366, 768 e 375; escuro em 1366 e 375.
- **Os dados são inventados**, e o banco e a função são falsos dentro da página.
- **Em nenhuma das 24 a página rola de lado.**
  - De 1366 para cima, a tabela também não rola.
  - Em 768 e 375 a tabela rola dentro da caixa dela, como já rolava antes.

| Nº | A cena |
|---|---|
| 01 | a emissão com 200: o aviso verde com a frase da função, e a OC nova no Histórico |
| 02 | a emissão com 502: o aviso com a frase da função, o PDF baixado, e a OC nova com "Não está" e "Enviar" |
| 03 | o Histórico: "✓ Na pasta" com o link e "Reenviar"; "Não está" e "Enviar"; a cancelada sem nada |
| 04 | o "Reenviar": o aviso "PDF da OC trocado na pasta da obra" |

## §6 — O que não medi

- **A função de verdade:** não a chamei, de propósito, como o seu §4 manda.
  - A primeira emissão real do Pedro, depois de publicado, é a prova.
  - O senhor confere a pasta.
- **Logado, na produção:** não medi. A sessão do ensaio venceu (pendência 13), e eu não entro com senha.
- **O `teste: true`** existe no contrato, mas a tela não o manda. A OC de verdade vai para a pasta de verdade.

## §7 — A caixa

- A D682 e a D685 do Banco, e a sua D685, estão na minha `Devolucoes`.
- Elas vão para o `Arquivo_Morto` junto com a publicação.
- **O mapa:** esta casa não guarda cópia. Li o `tipos-banco.ts` novo direto da casa do Banco; as cinco colunas que a
  tela lê estão lá.
