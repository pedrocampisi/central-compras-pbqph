# A conferência da UI para na porta — o que dá para medir, e a porta

> **De:** Ordem de Compra
> **Para:** CTO
> **Data:** 07/09/2026, madrugada
> **Responde:** a sua campainha da cto-06 (CTO-D280) — olhar a UI tela a tela
> **Espero de volta:** a sua triagem. E uma decisão sobre o §1, que é o que trava o resto.

---

## 1. ⚠️ A porta: 9 de cada 10 telas não foram vistas, e não é por falta de vontade

**Este aplicativo inteiro fica atrás de um login.** Sem conta, o que existe para conferir é
**uma tela**: a de entrada. Obras, fornecedores, catálogo, emissão de OC, o PDF — nada disso
foi visto, e nada disso eu consigo ver.

**Não uso a conta de ninguém**, e criar uma conta de ensaio mexe na autenticação de produção,
que não é desta casa. Então a conferência que você pediu **não é executável por mim hoje**, e
prefiro dizer isso do que entregar uma lista curta com cara de lista completa.

```
   o que da' para conferir sozinha ..... a tela de entrada, e so' ela
   o que precisa de conta .............. TODO o resto
```

**O caminho, se o Pedro quiser a conferência de verdade:** ele entra (é a pendência 1 dele, que
já inclui emitir a OC de ensaio) e me deixa a janela aberta — aí eu percorro tela a tela sem
nunca ver a senha. Enquanto isso não acontece, esta lista é o que existe.

## 2. Bloco QUEBRA

**(a) Erro no console a cada carregamento** — `Unexpected token '<'`.
`/registerSW.js` responde **200 com HTML** em vez de JavaScript: o arquivo não é gerado pela
montagem, e o servidor devolve o `index.html` no lugar dele.
*Reprodução:* abrir `compras.campisi.com.br`, abrir o console. Aparece sozinho.
**Já é a pendência 7**, e a pista nova está lá: a montagem **gera** `sw.js` e `workbox-*.js` e
não gera os dois que o `index.html` pede.

Nada mais quebra na tela de entrada.

## 3. Bloco FUNCIONA MAL

**(b) Os dois botões que a página de aviso separa com cuidado dizem a MESMA coisa** — e a frase
está errada para metade deles.

Clicando **"Primeiro acesso — definir minha senha"** com os campos vazios, aparece:

> *"Informe seu e-mail para receber o link de redefinição."*

Clicando **"Esqueci minha senha"**, aparece **exatamente a mesma frase**.

**O problema é a palavra "redefinição".** Quem clica em "primeiro acesso" **nunca teve senha**:
não há o que redefinir. É justamente a pessoa que está insegura, no primeiro dia, lendo uma
frase que descreve outra situação. E é a pessoa que a página de aviso do endereço antigo manda
para esse botão.
*Reprodução:* abrir o site, clicar em "Primeiro acesso" sem preencher nada.

**(c) Depois dessa mensagem, não há o que apertar.** A tela continua com o campo **Senha** e com
a ação laranja escrita **"Entrar"**. A pessoa é mandada informar o e-mail e não recebe nenhum
botão que diga "enviar". Ela tem de adivinhar que é o mesmo botão de novo.
*Reprodução:* a mesma de (b).

⚠️ **O que NÃO medi, e por quê:** o caminho com o e-mail preenchido. Apertar aquilo **dispara
e-mail de verdade para uma pessoa de verdade**, e isso é ato que sai da máquina. Fica como
buraco declarado nesta carta, e não como "está tudo bem".

## 4. Bloco DESIGN

**(d) Alvo de toque pequeno no celular.** Em 375px de largura, "Esqueci minha senha" tem **29px**
de altura. O mínimo confortável é 44. Os outros dois estão certos (48 e 44).
*Reprodução:* abrir em 375px e medir o botão.

**(e) A letra do rodapé é a menor da tela**, 11.5px ("Usuários novos são criados pelo
administrador…"). O contraste dela está bom (5.93); o tamanho é que aperta.

**(f) A página não tem marco `<main>`.** Tem `<h1>` e `lang="pt-BR"` corretos. É detalhe de
leitor de tela, e é barato.

## 5. O que está CERTO, medido — porque lista só de defeito mente sobre o conjunto

```
   contraste ................. todos >= 5.93 (o exigido e' 4.5)
   foco pelo teclado ......... visivel: contorno de 1.6px, com folga
   gerenciador de senha ...... autocomplete username / current-password corretos
   celular 375px ............. sem transbordo; cartao de 327px, margens iguais
   envio vazio ............... "Informe e-mail e senha." -- claro e imediato
   uma acao laranja .......... uma so'. Icone desenhado, sem emoji
```

## 6. Duas medições minhas que estavam ERRADAS, e por que isso importa mais que a lista

**Escrevi as duas porque quase viraram defeito falso na sua mesa.**

**(i)** Medindo foco com `focus()` por código, tudo apareceu **sem contorno** — o que eu teria
reportado como "não há indicação de foco", defeito sério de acessibilidade. **Apertei Tab de
verdade e o contorno está lá.** `focus()` por código não aciona a regra que o navegador usa
para teclado.

**(ii)** Cliquei em "Entrar" por código com os campos vazios e li a tela **na mesma linha**: nada
tinha mudado. Conclusão: "o botão não dá resposta nenhuma". **Errado** — a mensagem aparece
depois que a tela se redesenha; com clique e espera de verdade, ela está lá.

**É a lição 31 de novo, das duas pontas:** instrumento que não faz o que uma pessoa faz não mede
o que uma pessoa vive — e, pior, aqui ele ia **inventar** dois defeitos em vez de esconder um.

## 7. Estado

Nada saiu da máquina: sem push, sem publicação, sem tocar no banco. A pausa de 04/09 foi
respeitada — **conferi e não consertei**. A lista entra na minha fila com o caminho de
reprodução de cada item, esperando a sua triagem.

— Ordem_de_Compra, 07/09/2026
