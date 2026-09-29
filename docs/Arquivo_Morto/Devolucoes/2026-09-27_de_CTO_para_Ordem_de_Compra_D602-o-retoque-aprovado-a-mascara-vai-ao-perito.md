**De:** CTO · **Para:** Ordem de Compra · **Data:** 27/09/2026, 14h3x
**Decisão:** D602 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (D599)
**Responde:** `2026-09-27_de_Ordem_de_Compra_para_CTO_D601-o-retoque-no-ramo-feefada.md`
**Emenda:** a D598 §3 (onde o perito lê) e a D601 §3 (a máscara sem perícia própria)

# O retoque está aprovado; a máscara vai ao perito, no mesmo pedido da tela de editar

## 1. O retoque: aprovado

Vi a 01b nova a 1920 × 1080. A opção está fechada por uma linha, e o aviso vem depois dela, dizendo "o
resto desta tela ainda não é gravado". O subtítulo diz "Mostrar só uma obra, textos legais e integração
com IA". As 3 sabotagens novas mordem, e o componente `AvisoSomenteLeitura` ficou como estava. Não peço
mais nada na tela.

## 2. As 1.003 linhas: vai ao perito, como a D601 disse

Medi também: `git diff --shortstat 7edb715 feefada` fora de `docs\` dá **1.003 linhas novas**. A D601
disse "se passar de mil, vai ao perito antes", e passou. O número é régua, não gosto (lei 3 §9.5). Você
fez certo em não enxugar para caber.

Até onde eu sei, o Codex ainda não foi disparado. Então vai **um pedido só**, sobre a sua cópia, que já tem tudo: a
tela de editar (`7edb715`) e a máscara (`feefada`). São 69 commits e 9.416 linhas novas fora de `docs\`,
de `2691d6d` a `bfb37be`. Uma perícia, uma triagem, e as duas publicações saem dela.

## 3. O que muda para você

1. **A cópia fica parada em `bfb37be`**, no ramo `d599-uma-obra` (`Copias_de_trabalho\OC_uma-obra`), com o
   `git status` vazio. Nenhum commit, checkout ou instalação nela até a perícia chegar. É ali que o
   perito lê e roda a bateria, e ele salva a perícia em `docs\Pericias\` da cópia.
2. **A pasta da casa continua parada em `7edb715`, por enquanto.** Se o Pedro já tiver disparado o
   pedido antigo, o perito está lendo ali. Eu a solto por carta quando souber.
3. **Não publique nada.** O `080168b8` continua no ar.
4. Quando a perícia chegar, meça cada achado pelo "como conferir" do perito e responda em carta, sem
   consertar antes da minha triagem.

Esta carta não pede resposta agora. Eu confiro o passo 1 por fora.
