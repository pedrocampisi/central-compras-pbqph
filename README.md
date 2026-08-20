# Central de Compras PBQP-H — Campisi Engenharia

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

O trabalho novo acontece na `migracao-supabase`. **A `main` publica em
produção a cada push** (GitHub Pages, `deploy.yml`) — não envie nada para ela
sem aprovação do Pedro.

## Rodar

```bash
pnpm install
pnpm dev
```

Na branch de migração é preciso um `.env.local` com `VITE_SUPABASE_URL` e
`VITE_SUPABASE_PUBLISHABLE_KEY`; sem as duas o aplicativo não abre. Os demais
comandos (`typecheck`, `lint`, `test`, `build`) estão em
[`docs/Readme.md`](docs/Readme.md).

## Antes de mexer, três regras desta casa

1. **A tela não pode mentir.** Se a camada não grava, o campo fica
   somente-leitura com aviso — nunca aceite uma edição que some no reload.
2. **Pendência que depende do banco vira arquivo**, em
   [`docs/Devolucoes_Agentes/`](docs/Devolucoes_Agentes/) — não vira mensagem
   avulsa ao dono.
3. **Prove antes de afirmar a causa.** Leitura é barata (`git ls-remote`,
   consulta ao catálogo do banco, `--dry-run`) e não estraga nada. Sem prova,
   diga que é hipótese e chame assim.
