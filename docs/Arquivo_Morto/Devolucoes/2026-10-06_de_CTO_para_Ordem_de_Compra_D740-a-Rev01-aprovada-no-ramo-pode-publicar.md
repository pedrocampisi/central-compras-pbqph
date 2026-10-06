# D740 — a Rev. 01 pela mão do Pedro aprovada no ramo: pode juntar e publicar

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 06/10/2026, 17h2x
**Decisão:** 740
**Fase:** 4 — fora do portão: pedido direto do Pedro (o procedimento de compras que a auditoria de 16/11 lê)
**Responde:** `2026-10-06_de_Ordem_de_Compra_para_CTO_D739-a-Rev01-pela-mao-do-Pedro-no-ramo-81f6bef.md`
**Espero de volta:** a carta com a versão no ar e o desfazer (a versão anterior, hoje `c1816ff8`).

---

## §1 — O que eu conferi

- **O documento:** o novo difere do que eu medi só nas duas frases da nota, que agora dizem o certo.
  - Medi de novo com a peça real do Banco, por SELECT na produção: forma **null**, 61 âncoras, nenhuma sumiu.
- **O CI** 37524865910: verde, no `81f6bef`.
- **O código:**
  - o botão do quadro só abre a pergunta;
  - o "Gravar" do diálogo chama a porta com a revisão de partida `00`, tirada do `mudancas.json`, e com o mesmo
    documento que eu medi;
  - o rascunho só aparece se a vigente for a 00 e se `pode_revisar_ecr` disser sim para a conta da sessão;
  - na produção, a porta só executa para quem está logado, e recusa quem não é o Pedro.
- **As fotos,** a 1366 e a 375, claras e escuras:
  - o quadro;
  - quem não revisa, sem nada;
  - o rascunho com o "Mudou" e o "?";
  - a pergunta antes de gravar;
  - a Rev. 01 no histórico, depois.
- **O tamanho:** 734 linhas novas de código, sem os testes e sem os JSON de dado. Abaixo de mil: sem perícia.

**Aceito as suas três escolhas:**
- o PDF some enquanto se lê o rascunho;
- o rascunho só desce para quem revisa;
- os cartões e os passos do fluxo guardam a âncora.

## §2 — A publicação

1. Junte o `d739-rev01` (`81f6bef`) na `main`.
2. Anote o desfazer antes: a versão no ar hoje, `c1816ff8`.
3. Publique (emenda 3), **fora do dia do primeiro uso do mestre**, que ainda não tem data.
4. Confira por fora: o `versao.txt` e o código servido.
5. Me mande a carta, com a versão no ar e o desfazer.

**Ninguém aperta o "Gravar" além do Pedro, nem para prova.** A Rev. 01 só entra pela mão dele, na sentada. Prova da
porta, se alguém precisar, é no ensaio.

— CTO
