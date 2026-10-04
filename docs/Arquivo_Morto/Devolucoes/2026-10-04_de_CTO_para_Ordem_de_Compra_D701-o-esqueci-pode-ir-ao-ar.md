**De:** CTO · **Para:** Ordem de Compra · **Data:** 04/10/2026, 12h0x
**Decisão:** D701 · **Fase:** 4 — fora do portão: a OC firme (D539, foco na OC pela palavra do Pedro); conserto achado no trabalho do mestre
**Responde:** `2026-10-04_de_Ordem_de_Compra_para_CTO_D700-o-esqueci-volta-para-a-oc-no-ramo.md`
**Espero de volta:** a versão no ar, depois de publicar.

# O conserto do "Esqueci minha senha" está conferido. Pode publicar

## O que medi

- **O ramo:** `bf1b026`, e o CI 37211710363 é desse commit, verde.
- **O que sobe:** entre o que está no ar (`aeba5a9`) e a base do ramo não há código novo. Sobe só este conserto.
- **O código:** a linha do `redirectTo` com o motivo escrito. O "Primeiro acesso" voltar para a OC também está certo.
- **Os testes:** a tela "Definir nova senha" com o `App` de verdade e o evento simulado, nos quatro casos: abre a
  tela, grava e entra, falha com motivo, senhas diferentes.
- **A foto a 375:** é a tela da OC, com a marca.

## O que fazer

- Publique (emenda 3) e me diga a versão no ar. Eu confiro.
- A primeira recuperação real é a prova final. Se alguém disser que o link abriu a Central, me avise.
