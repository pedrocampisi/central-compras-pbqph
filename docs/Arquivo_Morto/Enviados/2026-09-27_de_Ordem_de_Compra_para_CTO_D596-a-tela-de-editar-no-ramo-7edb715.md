# D596 §3 — a tela de editar a ECR e os dez campos fora do código, no ramo `d589-editar-ecr` (`7edb715`), NÃO publicada

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 13h3x
**Responde:** `2026-09-27_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D596-campos-velhos-e-tela-de-editar.md`, §3. Cumpre
também a D589 §4.2, o segundo passo.
**Espero de volta:** o seu olhar nas fotos e a ordem de publicar.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** Nas fotos, os dados são de prova.

---

## §1 — Onde está

- **Ramo:** `d589-editar-ecr`, commit **`7edb715`**, empurrado.
- **Base:** o `main` de hoje (`886e6a2`), juntado ao ramo antes de começar. Está **fora do `main`**.
- **Publicado:** nada. Continua no ar a `080168b8`.

## §2 — A tela de editar (D589 §4.2, com a proposta do nosso §6)

**Quem vê o botão "Editar":**
- A tela pergunta ao banco por `core.pode_revisar_ecr()`.
- **Só o Pedro vê "Editar",** ao lado do "PDF" de cada ECR.
- **Se o banco disser não ou não responder,** o botão não aparece.
- **Para os outros perfis a tela fica como está no ar:** não aparece nem o botão nem o espaço dele (foto 02).

**A ECR em edição:**
- **Uma de cada vez.** Enquanto uma ECR está em edição, as outras não oferecem "Editar".
- **A cabeça dela diz "Em edição",** e o cartão não fecha enquanto o rascunho existir.
- **O rascunho não se perde ao trocar de aba:** ele fica guardado fora da tela.
- **Cada linha tem:**
  - o rótulo;
  - o texto, num campo que cresce com o que se escreve;
  - a caixa "Nota (fora da lista)", que é o `numerado` ao contrário;
  - subir, descer e tirar. O "tirar" fica apagado quando é a última linha da seção, porque o banco quer pelo menos uma.
- **"Pôr linha na seção NN"** põe a linha no fim da seção, e o "subir" a leva ao lugar.

**"Salvar revisão" confere as regras da `revisar_ecr` antes de mandar:**
- as mesmas seções e os mesmos títulos;
- pelo menos uma linha por seção;
- texto com letra;
- rótulo em branco, ou com letra;
- texto diferente do vigente, depois de tirar os espaços das pontas.

**Quando algo não passa:**
- **A linha fica marcada** e a frase aparece embaixo dela.
- **O cursor vai para a primeira linha com defeito,** e uma lista junta todas as frases no pé da tela.
- **A linha é apontada pelo rótulo quando tem:** "Seção 02, a linha "Dimensão" está sem texto: escreva o texto ou tire a
  linha." (foto 05).
- **Nada vai ao banco.** A frase some assim que a pessoa conserta a linha.

**Quando passa, abre a confirmação** (foto 04):
- **O que a janela mostra:** "Rev. 00 → 01, emitida hoje (27/09/2026), aprovada por você."
  - "Hoje" é o dia de São Paulo, que é a data que o banco põe. Às 23h de Brasília, o relógio UTC já estaria no dia seguinte.
- **"O que mudou"** é obrigatório e vira a descrição da linha nova do histórico.

**O que vai ao banco:**
- `p_ecr_id`, `p_secoes` e `p_descricao`;
- o texto sem espaço nas pontas;
- o rótulo em branco como `null`;
- as chaves exatas do contrato.

**Gravou:**
1. a tela recarrega os dados;
2. fecha a edição;
3. avisa: "ECR 03 revisada: Rev. 01, emitida em 27/09/2026."

**O banco recusou:** a frase aparece dentro da confirmação e o rascunho fica inteiro (foto 07). As frases:

| Código | O que a tela diz |
|---|---|
| 42501 | "Só o Pedro revisa uma ECR. A revisão não foi gravada." |
| P0002 | "Esta ECR não existe mais no banco. Recarregue a página. A revisão não foi gravada." |
| 55000 | "A revisão vigente desta ECR não tem o texto guardado no histórico, e revisar agora perderia esse texto. A revisão não foi gravada." |
| 22023 | "O banco recusou a revisão: " + a mensagem do banco |
| outro | "Falha ao gravar a revisão: " + a mensagem |

**Sair sem salvar:**
- **"Cancelar" sem mudança** fecha direto.
- **Com mudança, pergunta "Sair sem salvar?"** (foto 06):
  - a mensagem diz "A ECR 03 continua como está, na Rev. 00.";
  - os botões são "Continuar editando" e "Sair sem salvar".
- **Fechar o navegador com mudança:** o próprio navegador pergunta.

**Duas correções que as fotos pegaram, já feitas no ramo:**
1. **A 375 com dois botões,** o nome da ECR virava uma coluna de uma palavra ao lado deles. Agora os botões descem para a linha
   de baixo, só quando são dois. Com um botão só, que é o caso de quem não é o Pedro, a cabeça fica como está no ar.
2. **O texto de exemplo "Rótulo (opcional)"** saía escuro e em negrito, como se fosse um rótulo escrito. Agora sai claro.

## §3 — Os dez campos velhos fora do código

- **O que saiu:** os tipos, o esquema, os quatro tradutores do `normalize.ts` (`toNormaItem`, `toDocItem`, `toCritItem` e
  `toEnsaioItem`, que só eles usavam) e as dez linhas do `paraEcr`.
- **Se o banco ou um arquivo antigo ainda trouxer os campos,** o `normalizeEcr` os deixa de fora, e a ECR carrega igual. Há
  um teste para isso.
- **O degrau de formato v2 → v3 fica,** com a nota, como na D585. Ele ainda acrescenta os campos, e o formato de dados os
  descarta. O teste da escada completa confere isso.
- **A leitura continua sendo `*`.**
  - Com a migration do Banco (12:06), os dez já não vêm.
  - A versão no ar (`080168b8`) aguenta a falta deles, como o senhor mediu no §1.
- **Nenhuma tela usava os campos.** Saíram 8 testes que só conferiam como eles eram lidos.

## §4 — A prova

**A bateria:**
- **368 testes verdes** (eram 343 no `main`):
  - saíram 8 dos campos velhos;
  - entrou 1 que confere que eles ficam de fora;
  - entraram 21 da tela de editar;
  - entraram 11 das regras puras.
- Tipos e lint limpos.

**A tela se prova pelos testes, com as duas funções do banco falsas e seguindo o contrato:**
- a `pode_revisar_ecr`, com as respostas sim, não e falha;
- a `revisar_ecr`: o formato do que recebe, o que devolve e as quatro recusas, cada uma com a frase que a tela mostra.

**Nenhuma chamada ao banco de verdade:**
- nenhuma revisão de verdade, nem no ensaio nem na produção;
- os testes da tela de ler também passaram a usar as funções falsas, porque a tela agora pergunta "pode revisar?" ao abrir, e
  o `.env.local` aponta para a produção.

**As sabotagens:**
- **21 novas, todas mordendo, hash igual:**
  - texto sem letra;
  - a linha apontada só pelo número;
  - as pontas sem limpar;
  - rótulo vazio sem virar `null`;
  - texto igual passando;
  - a data pelo relógio UTC;
  - a frase do 55000;
  - "pode revisar" na falha;
  - o nome do parâmetro;
  - "Editar" para todos;
  - salvar sem conferir;
  - o cursor que não vai à linha;
  - cancelar sem perguntar;
  - gravar sem "O que mudou";
  - o rascunho sem limpar;
  - a recusa que perde o rascunho;
  - gravar sem recarregar;
  - tirar a última linha;
  - a caixa da nota invertida;
  - fechar o navegador sem perguntar;
  - um campo velho de volta no formato.
- **As 20 da D586 e da D593 mordem.** Duas mudaram de alvo, porque o histórico e os materiais agora só aparecem fora da
  edição.
- **As 56 de antes mordem.** As pontas da `557c` e da `557d` param no alvo velho antes de escrever, como já estava
  registrado.

## §5 — As fotos: `docs/Capturas/2026-09-27_D596/`, a 1920×1080 e a 375

| Foto | O que mostra |
|---|---|
| 01 | a lista para o Pedro: "Editar" e "PDF" |
| 02 | a lista para outro perfil: só o "PDF", igual ao que está no ar |
| 03 | a ECR 03 em edição, inteira |
| 04 | a confirmação "Rev. 00 → 01…" |
| 05 | a linha "Dimensão" sem texto, apontada |
| 06 | "Sair sem salvar?" |
| 07 | a recusa 42501 dentro da confirmação |

**A medida:**
- **Nas 14 fotos:** nenhuma rolagem de lado e nada fora da tela.
- **Nas fotos com janela aberta (04, 06, 07):** a medida acusa textos um sobre o outro. Conferi um por um: todos são a janela
  por cima da página, e nenhum é dentro da janela.

**Os dados:**
- o texto das 20 ECRs como estava na produção antes da D592. É por isso que a ECR 02 ainda tem a linha "Dimensão" sem texto, e
  é ela que a foto 05 mostra;
- as funções do banco são falsas;
- o nome é de prova.

## §6 — Para o senhor decidir

- **A ordem de publicar.**
- **Depois de publicada:** a primeira revisão de verdade é do Pedro, como a sua §3 diz. A tela já estará pronta para ele.
- **Um aviso da carta do Banco:** nas últimas 24 h, o log não viu nenhuma leitura com `revisoes`. A tela nova ainda não tinha
  lido a produção desde a publicação. **Não há o que fazer.** A primeira pessoa que abrir o sistema faz essa leitura.

— Ordem_de_Compra
