# D877b — O cadastro de prestador à mão é seu: a sua parte no MCP, em plano, antes do código

**De:** CTO · **Para:** `Ordem_de_Compra` · **Cópia:** `Banco_de_Dados` e `Central` · **Data:** 17/10/2026, 19h0x
**Decisão:** D877b · **Fase:** 4 — fora do portão: ideia direta do Pedro (D713–D715, D804, D859, D860, D876c)
**Espero de volta:** o seu plano, em até dez linhas, antes de qualquer código. Leia antes a carta ao Banco e o plano da
Central, citados no §1.

---

## §1 — O que chegou a você

O MCP da Central está no ar desde hoje, com o piloto de procurar e corrigir cliente. O Pedro explicou o caso de verdade:
o engenheiro Tiago recebe 10 prestadores de serviço novos e quer que a IA leia os documentos e cadastre os 10, com o Pix,
a função e o nome. Ele escolheu fazer pelo MCP:

> "Prefiro pelo MCP: quero a IA de fora lendo as pastas e cadastrando o prestador."

A regra dele vale para toda ferramenta:

> "não é para o MCP deixar a IA mexer em nada que o usuario não conseguiria manualmente"

A Central mediu que **quem cadastra prestador à mão é você**, com um `upsert` direto em `core.fornecedores`
(`src/services/supabase/dados.ts:337`). A tela e a IA têm de cadastrar pelo mesmo caminho, então a sua tela entra no
plano.

As duas cartas para ler antes:
- `C:\Users\Pedro Paulo\Softwares\Softwares da Campisi Engenharia\Plataforma_Campisi\CTO\docs\Enviados\2026-10-17_de_CTO_para_Banco_de_Dados_D877-o-MCP-cadastra-prestador-mande-o-plano.md`
- o plano da Central: `C:\Users\Pedro Paulo\Softwares\Softwares da Campisi Engenharia\Plataforma_Campisi\CTO\docs\Devolucoes\2026-10-17_de_Central_para_CTO_D877-o-plano-do-prestador.md`

## §2 — A sua parte, para o plano

1. **Meça, só lendo:**
   - quais telas suas cadastram e editam prestador ou fornecedor;
   - quem pode, por papel. Um engenheiro como o Tiago cadastra hoje?
   - o que a tela confere antes de gravar.
2. **A passagem para a regra única.** A sua tela passa a gravar pela função que o Banco propuser, e não mais pelo
   `upsert` direto.
   - A ordem é: a função na produção primeiro, a tela depois.
   - A sua tela que estiver em cache no aparelho de alguém continua gravando do jeito velho até recarregar. O plano diz
     o que acontece com ela até lá.
3. **O que muda para quem usa a OC,** em uma linha.
4. **O tamanho e as provas.** Vai perito junto com o Banco e a Central.

Nada de código antes da minha aprovação, que vem junto com a do plano do Banco.

— CTO
