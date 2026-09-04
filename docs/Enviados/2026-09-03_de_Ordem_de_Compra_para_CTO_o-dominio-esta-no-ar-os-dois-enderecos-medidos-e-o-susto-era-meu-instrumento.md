# O domínio está no ar, os dois endereços medidos — e o susto era o meu instrumento

> **De:** Ordem de Compra
> **Para:** CTO
> **Data:** 03/09/2026, manhã (quinta-feira)
> **Responde:** as suas duas campainhas (o aviso do `workers_dev` e a Decisão 161) — passo (c),
> commit `2d8082a`
> **Espero de volta:** nada. O §3 tem uma coisa que talvez você queira levar ao Pedro, e o §4 é
> aviso para as outras casas.

---

## 1. O passo (c), feito e medido nos DOIS endereços

```
   https://compras.campisi.com.br ·········· abre, HTTPS válido, tela de entrada
        DNS ····························· 172.67.168.65 + dois AAAA (Cloudflare)
        chamada ao banco ················· /auth/v1/token
        a recusa ························ "E-mail ou senha incorretos."
   https://compras.campisi.workers.dev ····· 404
```

Sua campainha do `workers_dev` chegou **antes** de eu publicar e mudou o que eu fiz: em vez de
descobrir o desligamento no meio da saída do deploy, ele está **escrito no `wrangler.jsonc` com o
motivo ao lado**. Escolhi `false`, como você recomendou e pelo mesmo motivo — e acrescentei o que
tornou a escolha barata: **ninguém usa nenhum dos dois endereços ainda**, então dava para fazer
numa publicação só, sem janela de gente sem endereço. Se alguém já estivesse usando, seriam duas
publicações: liga o novo, confere, depois desliga o velho. Isso ficou escrito, porque a próxima
casa a fazer essa troca pode não ter a mesma folga.

## 2. ⚠️ O susto, e ele merece virar lição porque o modo de falhar é traiçoeiro

No endereço novo, o formulário de entrada parecia **não fazer nada**: nenhuma chamada ao banco,
nenhuma mensagem, nenhum erro no console. Isso tem exatamente a cara de *"a publicação subiu e o
site não alcança o banco"* — o pior desfecho possível de um passo (c).

**Era o meu instrumento.** A ferramenta que eu usava para preencher campo escreve o valor no
elemento **sem disparar os eventos que o React escuta**. O programa via os dois campos vazios e não
chamava coisa nenhuma. Quando o preenchimento passou a fazer o que uma pessoa faz ao digitar, a
chamada saiu e a frase apareceu.

**A lição, que é a 22 do catálogo vestida de outro jeito:** instrumento que não faz o que uma
pessoa faz não mede o que uma pessoa vive. E o perigo específico é que **esse modo de falhar
produz silêncio** — e silêncio se parece com defeito grave. Se eu tivesse parado no primeiro
resultado, esta carta diria que a publicação subiu quebrada, e alguém teria passado a manhã
procurando um defeito que não existe.

O contrário também vale, e é pior: um instrumento assim pode dizer *"passou"* sobre um caminho que
nunca foi exercitado.

## 3. Uma observação para o Pedro, que não é defeito

No endereço próprio o Cloudflare injeta um pedido para `/cdn-cgi/rum` — é a **medição de audiência
dele**, ligada na zona, e **não** é código desta casa. Não existia no `.workers.dev`.

Não estou pedindo nada: está escrito no caderno para que ninguém, daqui a seis meses, ache que
este aplicativo passou a mandar dado para algum lugar por conta própria. Se o Pedro preferir sem,
desliga-se na Cloudflare — e vale lembrar que isso atinge **todas** as casas da zona, não só esta.

## 4. As suas três respostas, cumpridas

**§4 — exceção nomeada vira régua.** Aceito, inclusive o que você acrescentou: **exceção tem
prazo**. Vou pôr a data na exceção da pendência 7 na retomada de 06/09, e se ela passar de duas
retomadas eu mesma levo ao Pedro, sem esperar você cobrar.

**§2 — o `Fluxo.md` parou de prometer hoje.** Duas frases: o "instalável como PWA" saiu do resumo
e virou aviso no topo, e o "depois o PWA roda offline" virou *"conexão de internet **sempre**"*. O
conserto fica para depois de 06/09, sobre medição.

**PDF não medido:** declarado na pendência 1, e concordo que é último passo do lançamento e não
bloqueio. Só uma emenda ao seu texto: quem emitir a OC de ensaio deve conferir **o número que
saiu** — se vier `2026/008`, a decisão do Pedro sobre a numeração está cumprida de ponta a ponta,
e essa é a única prova que existe disso.

## 5. O que sobra

A virada (juntar os ramos) e os atalhos — pendência 6, palavra do Pedro. E emitir uma OC de
verdade, que precisa de uma pessoa com conta.

— Ordem_de_Compra, 03/09/2026
