# Central de Compras PBQP-H — Campisi Engenharia

> **Data:** 20/08/2026
> **Estado:** VALE HOJE
> **Escopo:** a porta do humano — o que o programa faz, como rodar e as duas versões que convivem. **NÃO** descreve arquitetura nem código: para isso, `docs/`.

Aplicativo web que a Campisi usa para emitir **ordens de compra** dentro do
padrão PBQP-H: cadastros de fornecedor e obra, catálogo ECR, importação de
pedido por IA e o PDF no layout da empresa.

## Comece por aqui

👉 **[`docs/INDICE.md`](docs/INDICE.md)** — o índice diz o que vale hoje e o
que já fechou. Se você é uma IA de manutenção, o arquivo denso é
[`docs/Agente.md`](docs/Agente.md), e **a seção 0 dele vence sobre o resto**.

## Duas versões ao mesmo tempo — não confunda

| | `main` | `migracao-supabase` |
|---|---|---|
| É o que está no ar? | **sim**, é a que a empresa usa | não, ainda não liberada |
| Onde ficam os dados | um arquivo JSON no OneDrive | banco Supabase |
| Entrada | sem login | login por pessoa, com papéis |

O trabalho novo acontece na `migracao-supabase`. **Não envie nada para a `main`
sem aprovação do Pedro** — ela é o que está em produção.

⚠️ **A publicação mudou de casa em 02/09/2026** (palavra do Pedro): este
aplicativo vai para o **Cloudflare**, junto com o resto da plataforma, e o
GitHub Pages saiu. Com isso a `main` **deixou de publicar sozinha a cada
push** — publicar passou a ser um ato deliberado, `pnpm run deploy`, que monta,
confere o pacote e sobe. Ver `docs/PLANEJAMENTO.md`, decisão 24.

## Rodar

```bash
pnpm install
pnpm dev
```

Na branch de migração é preciso um `.env.local` com `VITE_SUPABASE_URL` e
`VITE_SUPABASE_PUBLISHABLE_KEY`; sem as duas o aplicativo não abre. Os demais
comandos (`typecheck`, `lint`, `test`, `build`) estão em
[`docs/roteiros/guia-do-desenvolvedor.md`](docs/roteiros/guia-do-desenvolvedor.md).

## Antes de mexer, três regras desta casa

1. **A tela não pode mentir.** Se a camada não grava, o campo fica
   somente-leitura com aviso — nunca aceite uma edição que some no reload.
2. **Pendência que depende do banco vira arquivo**, em
   [`docs/Devolucoes_Agentes/`](docs/Devolucoes_Agentes/) — não vira mensagem
   avulsa ao dono.
3. **Prove antes de afirmar a causa.** Leitura é barata (`git ls-remote`,
   consulta ao catálogo do banco, `--dry-run`) e não estraga nada. Sem prova,
   diga que é hipótese e chame assim.
