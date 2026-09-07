# O ensaio está no ar — e achou um defeito que é mais velho que a mudança

> **De:** Ordem de Compra
> **Para:** CTO
> **Data:** 03/09/2026, manhã (quinta-feira)
> **Responde:** a sua ordem de hoje, passo (b) — `commit fab033b`
> **Espero de volta:** nada obrigatório. Mas o §4 tem uma pergunta de método que é sua para
> responder, e o §2 muda o que a `Central` deve esperar do próprio pacote dela.

---

## 1. O passo (b), feito e medido

`compras.campisi.workers.dev` está no ar, com a palavra do Pedro na minha janela. **Sem `routes`.**

```
   a tela carrega ················· SIM — o formulário de entrada inteiro
   a tela alcança o banco ········· SIM — 1 chamada a /auth/v1/token
   a recusa é frase de gente ······ SIM — "E-mail ou senha incorretos."
   o PDF sai ····················· NÃO MEDIDO
```

A terceira linha é a decisão 5 desta casa funcionando **no ar**, e não em teste: a recusa do banco
chegou traduzida, sem jargão. Foi a primeira vez que isso se viu fora da bancada.

A quarta é limite meu e fica declarada: gerar PDF exige estar **dentro**, e eu não tenho senha nem
uso a de ninguém. **Quem fecha isso é uma pessoa com conta**, emitindo uma OC de ensaio. Anotei
assim na pendência 1.

**Como provei o banco sem credencial:** e-mail que não existe, senha sem valor. Prova a fiação
inteira — pacote → navegador → banco → resposta → tradução — sem tocar em conta de ninguém e sem
disparar e-mail. Registro isto porque é reutilizável nas outras casas.

## 2. ⚠️ O defeito, e ele é mais velho que a mudança de hospedagem

O console acusou `Unexpected token '<'`. **A rede não tinha um 404 sequer** — e é exatamente esse
o achado:

```
   /manifest.webmanifest  →  200, content-type text/html, com o index.html dentro
   /registerSW.js         →  200, content-type text/html, com o index.html dentro
```

O `index.html` pede os dois. A montagem **não gera** nenhum dos dois (o `sw.js` sai; estes não).
O `not_found_handling: "single-page-application"` transforma arquivo faltando em **200 com página
inteira dentro**, e o navegador tenta ler página como programa.

**Fui medir antes de acusar a mudança:** o site publicado no GitHub Pages (ramo `main`) responde
**404 nos dois**. Ou seja: **o PWA desta casa nunca funcionou em produção** — o "instalável,
funciona offline" que o `Fluxo.md` promete ao operador nunca foi verdade. O Cloudflare não criou o
defeito; ele **trocou o 404 honesto por um 200 mentiroso.**

**Isto interessa à `Central`, e por isso o §2 tem este parágrafo.** Ela usa o mesmo
`not_found_handling`, e portanto tem a mesma propriedade: **arquivo que falta no pacote dela não
aparece como erro, aparece como página**. Se ela nunca conferiu que tudo o que o `index.html` dela
pede existe no `dist`, ela não sabe se está inteira — e o navegador dela também não vai contar.

Não consertei o PWA: produto congelado até 06/09, e a causa é **hipótese** (`vite-plugin-pwa` não
emitindo sob o Vite 8 desta casa), não medição. Conserto sobre hipótese, de madrugada, em
ferramenta de montagem, é como nasce o defeito seguinte. Virou a **pendência 7**, que inclui uma
decisão que não é técnica: **ou o PWA passa a funcionar, ou o `Fluxo.md` para de prometer que
funciona.**

## 3. A trava nova — a quarta pergunta

*Tudo que o `index.html` pede existe dentro do pacote?*

Mesma família das outras três, mesma cegueira de sempre: **"o arquivo respondeu?" fica verde nos
dois casos**, porque o servidor responde 200 para tudo. A pergunta que discrimina é "ele
**existe**?".

**Ensaiada:** escondi um `.css` que o índice pede — vermelha, nomeando o arquivo. Pacote inteiro,
verde.

## 4. A pergunta de método, que é sua

As duas exceções (`manifest.webmanifest`, `registerSW.js`) ficaram **declaradas dentro da trava**,
com o número da pendência ao lado, e são **impressas a cada execução** com o aviso de que exceção
não é "está tudo bem".

Eu recusei as duas alternativas: trava que não pergunta isso, e trava que avisa sem reprovar.
**Exceção escrita é dívida que se cobra; trava frouxa é dívida que some.** O custo é que a trava
nasce com duas linhas de perdão — e trava que nasce perdoando é o começo conhecido de trava que
perdoa tudo.

**A pergunta:** essa forma — *lista de exceções nomeadas, com credor e data, impressa sempre* —
serve como padrão para as cinco casas, ou você prefere que trava com exceção **não exista** e o
defeito fique só na pendência? Eu escolhi a primeira e vou seguir com ela até você dizer o
contrário; mas é decisão de régua, não desta casa.

## 5. Uma armadilha que eu mesma plantei ontem

Escrevi `pnpm deploy` em sete lugares. **`pnpm deploy`, sem o `run`, é comando EMBUTIDO do pnpm**
(empacotar workspace) e não roda o roteiro desta casa — não publica nada. O certo é `pnpm run
deploy`. Corrigido nos sete, **com o motivo escrito ao lado**, senão a próxima sessão "conserta"
de volta por parecer redundante.

## 6. O que falta, e de quem é

O passo (c) — subir com `compras.campisi.com.br` — está pronto do meu lado e **espera a palavra do
Pedro**, que é ato que sai da máquina. Conferi por mim que o registro velho saiu: `8.8.8.8` diz
que o nome não existe, e a zona `campisi.com.br` responde nos servidores da Cloudflare (o teste de
controle importa: sem ele, "não existe" podia ser zona quebrada).

— Ordem_de_Compra, 03/09/2026
