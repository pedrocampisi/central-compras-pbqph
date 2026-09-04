# Você nasce em `compras.campisi.com.br` — CNAME no pacote e `base` na raiz

> **De:** CTO
> **Para:** Ordem de Compra
> **Data:** 02/09/2026, noite (quarta-feira)
> **Muda:** a minha carta de mais cedo dizia "não toque no `base`". A medição do domínio mudou
> isso, e esta carta manda tocar. Decisão 145.
> **Espero de volta:** campainha com o commit, o ensaio verde, e a lista do que você não
> conseguiu provar sem publicar.

---

## 1. O que mudou

A zona `campisi.com.br` está na Cloudflare, **na mesma conta** do Worker da Central. Com isso
o endereço próprio custa um registro de DNS, que o Banco cria hoje com a palavra do Pedro. Então
a decisão: **você vai ao ar direto em `compras.campisi.com.br`**, e a equipe nunca decora o
`github.io`.

## 2. A ordem — um commit, no mesmo lugar de hoje

1. **`public/CNAME`** com uma linha: `compras.campisi.com.br`. O Vite copia `public/` para
   `dist/`, e é por esse arquivo que o GitHub Pages sabe o domínio do pacote publicado.
2. **`VITE_BASE_PATH=/`** no `env` do passo `Build` do `deploy.yml`. Hoje o `base` padrão é
   `/central-compras-pbqph/`, certo para `github.io` e errado para domínio próprio — o site
   carregaria de `compras.campisi.com.br/central-compras-pbqph/assets/…` e não abriria.
3. **Uma trava depois do build** que prova o `base`: `dist/index.html` referencia `/assets/`
   e **não** `/central-compras-pbqph/`. Mesma família da trava do endereço do banco: confere o
   que SAIU (lição 17). Ensaie a trava antes de confiar nela (lição 16): monte uma vez sem a
   variável e veja que ela fica vermelha.
4. **Não mexa em código de produto.** É publicação, mesmo arquivo da 139, mesma exceção ao
   congelamento.

Rode o ensaio (`workflow_dispatch` com `ensaio`) e me diga o que ele provou.

## 3. O que é do Pedro, e você não faz

No repositório, `Settings > Pages > Custom domain = compras.campisi.com.br`, e `Enforce HTTPS`
quando o GitHub liberar (o certificado leva minutos a uma hora depois do DNS). E o botão de
juntar os ramos, que continua sendo só dele.

## 4. O que ainda NÃO entra

O crachá compartilhado (sessão em cookie no `.campisi.com.br`) é código de produto, frente
nova, congelada até 06/09. Entra na retomada. Por ora a pessoa digita a senha da Central uma
vez por máquina, e a sessão persiste — como você já construiu.

— CTO, 02/09/2026
