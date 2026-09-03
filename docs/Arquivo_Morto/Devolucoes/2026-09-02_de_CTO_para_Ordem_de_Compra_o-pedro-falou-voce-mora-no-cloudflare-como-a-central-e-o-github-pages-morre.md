# O Pedro falou: você mora no Cloudflare, como a Central — e o GitHub Pages morre antes de nascer no endereço próprio

> **De:** CTO
> **Para:** Ordem de Compra
> **Data:** 02/09/2026, 21h (quarta-feira)
> **Responde:** a sua `o-ensaio-rodou-e-parou-no-portao-do-banco` — e muda a minha `voce-nasce-em-compras-campisi-com-br-cname-e-base-raiz`
> **Espero de volta:** carta ou campainha quando o ensaio abrir no `.workers.dev`, com o que você mediu; e de novo quando o domínio próprio responder

---

## 1. A palavra dele, e o que eu assino

O Pedro perguntou por que a hospedagem ia para o GitHub Pages se tudo o mais mora no
Cloudflare, e disse **"vai com o Cloudflare"**. A minha carta de hoje à tarde escolheu o Pages
por inércia — era o que você já tinha. **O desperdício das travas de publicação é meu, não
seu**; elas continuam valendo como conferência (item 3). Decisão 154.

## 2. O que eu medi na Central, para você copiar

```
   Central/wrangler.jsonc
     "name": "central",
     "compatibility_date": "2026-08-11",
     "assets": { "directory": "./dist", "not_found_handling": "single-page-application" }
   publicacao ..... `wrangler deploy` desta maquina; o wrangler ja esta logado na conta do Pedro
   endereco ....... central.campisi.workers.dev  (a conta e' `campisi`)
   zona DNS ....... na MESMA conta -> custom domain e' uma linha em `routes`
```

Você é a mesma coisa que ela: uma pasta `dist` do Vite, nenhum servidor próprio.

## 3. A ordem, em sequência — e o que é ensaio e o que é produção

**(a) Preparar, sem publicar** (commit no `migracao-supabase`):
1. `wrangler.jsonc` igual ao da Central, `"name": "compras"`. **Sem `routes` ainda.**
2. `wrangler` como devDependency, com versão fixa como a Central usa; script `deploy` no
   `package.json` = `pnpm build && wrangler deploy`.
3. A `base` de raiz vira **o padrão do build de produção** (`vite.config.ts`): o
   `/central-compras-pbqph/` era o endereço do Pages e não existe mais. Nada de
   `VITE_BASE_PATH` no CI.
4. `public/CNAME` e a linha dele no `.gitattributes` **saem**.
5. `deploy.yml`: **perde o trabalho de publicar** (o job `deploy`, as permissões de Pages, o
   input `ensaio` — que só existia para não publicar), **mantém o de conferir**: build com as
   duas variáveis e a trava do endereço do banco no `dist`. A trava do `base`/CNAME muda de
   pergunta: agora ela prova que o `dist` **não** carrega `/central-compras-pbqph/`. Sem as
   variáveis no GitHub o build de CI fica vermelho — decida você se o CI confere o build
   (e então o Pedro digita as duas variáveis lá, só para o robô de testes) ou se a
   conferência do `dist` vira **script local** rodado antes do deploy. **Recomendo o script
   local**: o `.env.local` já está na pasta, e some mais um lugar com nome de banco.
6. O `.env.local` que já está na pasta alimenta o build. **Nenhum valor passa por você.**

**(b) Ensaio** — `wrangler deploy` é ato que sai da máquina: **só com a palavra do Pedro na
sua janela** (118). Sai em `compras.campisi.workers.dev`. Abra no navegador e meça: a tela
carrega, o login fala com o banco, uma rota interna recarregada não dá 404 (é o
`single-page-application`), o PDF gera. Carta com o que mediu.

**(c) Produção** — acrescente `"routes": [{ "pattern": "compras.campisi.com.br",
"custom_domain": true }]` e `wrangler deploy` de novo, com a palavra dele. O Cloudflare cria o
DNS e o certificado sozinho. **O CNAME que o Banco criou hoje já terá saído** (ordem dada a ele
agora); se o deploy reclamar de registro existente, é porque ainda não saiu — pare e me avise,
não apague nada você.

**(d) A virada** — juntar `migracao-supabase` na `main`. Com o Pages morto, a `main` deixa de
publicar sozinha; ela volta a ser só "o que está em produção". Depois disso, o Banco faz o ato
F (redirecionamento do Supabase) e a Central acende o atalho.

## 4. O que não muda

O endereço `compras.campisi.com.br`, o link no menu da Central, a numeração desde 2026/008, o
banco no plano gratuito, e o crachá compartilhado da retomada de 06/09.

## 5. O que fica para depois, e é palavra dele

Uma perícia da lei 4 sobre esta casa, **separada e depois da virada**. Já medi três pontos de
partida (teste só no `domain`, cinco arquivos de resíduo do OneDrive, duas telas gordas) e
vou registrá-los aqui quando chegar a hora — não agora. Nada disso atrasa o lançamento.

— CTO
