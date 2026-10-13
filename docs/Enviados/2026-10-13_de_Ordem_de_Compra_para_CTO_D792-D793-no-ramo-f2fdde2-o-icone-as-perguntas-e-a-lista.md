# D792 e D793 — No ramo `d792-mestre` (`f2fdde2`): o ícone do castor, as perguntas, o número em dígitos e a lista fechada

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 13/10/2026, 16h4x
**Responde:**
- `2026-10-13_de_CTO_para_Ordem_de_Compra_D792-o-icone-do-castor-e-as-perguntas-do-mestre.md`;
- `2026-10-13_de_CTO_para_Ordem_de_Compra_D793-a-lista-do-mestre-fechada-e-a-busca.md`;
- `2026-10-13_de_CTO_para_Ordem_de_Compra_D794-a-quantidade-por-item-vai-ao-banco.md`.

**Espero de volta:** a sua conferência das fotos. **Não publiquei.** Depois do seu sim, eu junto no `main`, publico
pelo meu caminho, com o desfazer anotado, e mando a prova da produção.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As empresas das fotos são
inventadas, todas com "(teste)".

---

## §1 — O ramo

- **O ramo:** `d792-mestre`, saído do `main` `0c2134b`, com dois commits:
  - `b70196e`, o ícone;
  - `f2fdde2`, as perguntas, o número da nota e a lista.
- **O tamanho:** 590 linhas pela minha régua e 495 sem comentário. Fica abaixo de mil: sem perícia.
- **A bateria:**
  - 1054 testes (eram 1035);
  - tipos e lint limpos.
- **O CI do ramo** estava rodando quando escrevi. Se ele não ficar verde, eu te escrevo.
- **As fotos** estão em `Ordem de Compra/docs/Capturas/2026-10-13_D792/`: 17 PNGs, a 375 e com dois pixels por
  ponto, como num celular.

## §2 — O ícone (D792 §2)

- **Os quatro novos** saem do `public/marca/mascote-rosto.png`, a cabeça laranja que já é o favicon, sobre o creme
  `#FBF3DE`. São `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` e o `apple-touch-icon.png`, este último novo,
  de 180 px.
  - **O do iPhone** é um quadrado cheio, sem transparência: o iPhone pinta de preto o que é transparente e arredonda
    sozinho.
  - **A página ganhou** `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />`. O Android continua
    lendo o manifesto.
- **No `maskable`, a cabeça inteira cabe num círculo de 38% do lado.** A área segura do Android é de 40%. O capacete
  não é cortado em nenhum recorte.
- **As fotos:**
  - `80_maskable_recortes.png`: o maskable inteiro, com o círculo da área segura em vermelho, e recortado em círculo
    e em quadrado arredondado, ao lado do antigo;
  - `81_icones_antes_e_depois.png`: os quatro, antes e depois;
  - `82_na_tela_inicial.png`: o recorte em círculo a 96 px, sobre fundo escuro, como na tela do celular.
- **A medida do manifesto, no pacote construído** (`pnpm build`, pelo PowerShell):
  - o `manifest.webmanifest` aponta os três ícones, o de 512 com `purpose: maskable`;
  - os quatro arquivos em `dist/icons/` têm a mesma impressão SHA-256 dos novos em `public/icons/` (por exemplo,
    maskable `749513A2F204…`);
  - o `index.html` do pacote traz o `apple-touch-icon`;
  - o `sw.js` guarda os quatro para o uso sem sinal.
- **Depois de publicar**, meço o mesmo na produção:
  - o manifesto servido;
  - a impressão de cada ícone baixado de `compras.campisi.com.br/icons/…`, igual à do pacote.

### O que o Pedro faz no celular para ver o ícone novo

O Android guarda o ícone do dia em que o app foi posto na tela, e o iPhone nunca o troca sozinho. O caminho que não
falha é o mesmo nos dois:

1. **Segure o dedo no ícone antigo** e escolha "Remover" ou "Desinstalar". Os dados do app ficam: o que o mestre
   guardou no celular não se perde, porque mora no navegador e não no ícone.
2. **Abra `compras.campisi.com.br` no Chrome** (no iPhone, no Safari), espere a tela carregar e:
   - no Android: menu ⋮ → "Instalar app" ou "Adicionar à tela inicial";
   - no iPhone: o botão de compartilhar → "Adicionar à Tela de Início".

Sem remover, o Chrome do Android pode trocar o ícone sozinho, mas leva até alguns dias. Às vezes ele pergunta antes
("Atualizar app?"). O mesmo vale para o celular de cada mestre que já pôs o ícone na tela.

## §3 — As duas perguntas (D792 §3)

| antes | agora | a dica embaixo, em letra menor |
| --- | --- | --- |
| Chegou o que foi pedido? | **Veio o material certo?** | O tipo, a marca e a medida do pedido. |
| Chegou tudo? (Sim / Só uma parte) | **Veio a quantidade toda?** (Sim / Só uma parte) | Se faltou alguma coisa, é só uma parte. |

- **Mantive a sua ideia** e acrescentei a dica. Ela diz, nas palavras dele, o que cada pergunta olha, e uma não fala
  do que a outra fala. Um teste confere isso.
- **As duas primeiras** ("Chegou no dia combinado?" e "Chegou sem estrago?") não mudaram.
- **O banco guarda o mesmo de antes:** `oc_ecr_conforme` e `chegou_tudo`.
- **A tela do escritório** (o "Chegou tudo?" ao ligar um sem pedido, na Recebimentos) não mudou. Ela é do
  escritório, e a carta falava da tela do mestre.

## §4 — A D768 (D792 §4 e D794)

- **A medida** foi na carta das 16h2x, e a D794 a confirmou.
- **O número da nota agora vai só com os dígitos:**
  - na tela do mestre e no "sem pedido";
  - no que ele escreve (o campo tira o ponto e a letra enquanto ele digita);
  - no que a leitura da foto devolve ("NF 000.123" vira "000123");
  - e no rascunho que a versão de hoje deixou guardado no celular, que vai limpo.
  - Os zeros da frente ficam, para a `core.numero_normal`.
  - Sem nenhum dígito, o "Pronto" pede o número, como já pedia para o campo vazio.
- **A quantidade por item não foi construída**, como a D794 manda. Ela fica para o ramo próprio, depois da peça do
  Banco.

## §5 — A lista do mestre (D793)

**O antes e o depois**, com dez pedidos, a 375, no claro e no escuro:

| | antes | depois |
| --- | --- | --- |
| altura da lista | 2.919 px | 1.267 px |
| cada cartão | 228 a 284 px | 82 px (110 com o nome em duas linhas) |
| "Chegou material sem pedido" | 343 × 60 px, o tamanho do botão principal | 294 × 48 px, de contorno, com o "+" |

1. **O "sem pedido" ficou menor.** Continua no alto, antes dos pedidos (D696 §2.1), mas do tamanho de um botão de
   apoio. Os 48 px de altura ainda servem para dedo grosso.
2. **O cartão fecha numa linha:** a empresa, o valor e a seta. Embaixo, de ponta a ponta, vai "Combinado para hoje",
   só quando há dia.
   - **O toque abre:** os itens, "Pedido 2026/1xx" e o "Receber", que é a única ação laranja da tela.
   - **Um aberto por vez:** abrir outro fecha o primeiro.
   - **Na volta do receber**, a lista vem com todos fechados.
   - **O guardado esperando sinal** abre para ver os itens, mas não tem "Receber", porque receber de novo faria duas
     entregas.
   - **O recusado** diz "Não foi: …" na linha e abre com "Abrir de novo".
   - **O "Sem dia combinado" saiu da linha**, como você escreveu. Ele continua no alto da tela do receber.
3. **A busca "Procurar a empresa"** fica entre o "sem pedido" e a lista.
   - **Ela acha pelo começo do nome**, sem acento e sem maiúscula: "ome" acha "Ômega", e "teste" não acha nada.
   - **Sem achado**, ela diz: Nenhuma empresa começa com “xyz”., e oferece "Limpar a busca".
   - **Uma escolha minha:** ela só aparece a partir de quatro pedidos. Com três, a lista cabe na tela e a caixa só
     atrapalha. Se a lista encolher com uma busca escrita, a busca deixa de valer: nada fica escondido sem a caixa à
     vista.
- **Os nomes das fotos são mais longos** que um apelido de verdade, por causa do "(teste)". Por isso dois deles
  quebram em duas linhas. Com "Comarco R$ 290", cabe numa linha.

**As fotos** (cada uma no claro, e com `_escuro` no escuro):

| foto | o que mostra |
| --- | --- |
| `83_antes_lista_375` | a lista de hoje, com dez pedidos |
| `83_antes_receber-parte_375` | a tela do receber de hoje, com "Só uma parte" |
| `84_depois_lista_375` | a lista fechada |
| `84_depois_aberto_375` | o segundo cartão aberto |
| `84_depois_busca_375` | "ome" achando "Ômega (teste)" |
| `84_depois_nada_375` | a busca sem achado |
| `84_depois_receber-parte_375` | as perguntas novas, com a dica |

Em todas, a rolagem de lado é zero, e as funções de gravar não foram chamadas.

## §6 — Os testes e as sabotagens

Cada peça foi quebrada de propósito, e o teste ficou vermelho. Depois voltou, e ficou verde.

| peça | a sabotagem | testes vermelhos |
| --- | --- | --- |
| ícone | os quatro sobre azul escuro | 5 |
| ícone | o maskable com a cabeça a 46% | 1 |
| ícone | o `apple-touch-icon` fora da página | 1 |
| §3 | o texto antigo de volta | 19 |
| §3 | a dica fora da tela | 1 |
| §4 | o campo aceita qualquer coisa | 1 |
| §4 | a leitura da foto vai como veio | 1 |
| §4 | a avaliação vai sem limpar | 1 |
| §4 | o "sem pedido" vai sem limpar | 1 |
| D793.1 | o "sem pedido" volta a ser o botão grande | 1 |
| D793.2 | o cartão nasce aberto | 4 |
| D793.2 | dois cartões abertos | 1 |
| D793.2 | o cartão fica aberto na volta | 3 |
| D793.3 | a busca acha pelo meio | 2 |
| D793.3 | a busca não tira acento | 2 |
| D793.3 | a busca aparece sempre | 1 |

**Uma das sabotagens ficou verde na primeira volta:** a do "sem pedido vai sem limpar".
- **O motivo:** o campo já limpa enquanto ele digita.
- **O que eu fiz:** o teste passou a usar o caso em que a limpeza do envio é a única que vale, o rascunho com
  "nº 12.345" que a versão de hoje deixou guardado no celular.
- **O resultado:** a sabotagem ficou vermelha.

O teste do ícone lê os PNGs de verdade, sem biblioteca nova. Ele confere quatro coisas:
- o tamanho;
- os cantos creme;
- o laranja do capacete;
- e, no maskable, que nenhum pixel da cabeça passa do círculo de 40%.

## §7 — Depois do seu sim

1. Junto `d792-mestre` no `main`.
2. Anoto o desfazer: hoje, a produção é `656d33e5`.
3. Publico pelo PowerShell.
4. Meço por fora:
   - a versão;
   - o manifesto e as impressões dos ícones;
   - as perguntas novas no código servido.
5. Mando a carta com a prova.
6. **A lista do "Só uma parte"** espera o seu aviso com o formato do envio (D794 §2).

— Ordem_de_Compra
