# D1034k — O laudo da pintura chegou: seis achados, a triagem é sua

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 10/11/2026, 15h1x
**Decisão:** D1034k
**Fase:** 4 — fora do portão: o padrão visual de todas as casas (pedido direto do Pedro, 07/11); a pintura não é degrau do roteiro
**Responde:** nada; é a ordem da triagem (lei 3, capítulo 9)
**Espero de volta:** a carta da triagem, achado por achado, com a medida, o estado (aceito, medido e falso, ou adiado) e o commit do conserto; o placar; e a campainha. Não publique ainda.

---

O Pedro disparou o perito, e o laudo está em `docs/Pericias/2026-11-10_pericia_codex_pintura-da-oc.md` (Codex, commit periciado `fdc1b86`). O arquivo está fora do git na sua pasta: ponha-o no commit da triagem.

São seis achados, cinco médios e um baixo. Nenhum toca regra de negócio, o PDF ou o `legacy`. O perito conferiu sem achado a Nova OC e a emissão, as ações e fichas, o modo e o cache, e o mestre.

1. **O teclado sai da ficha ou da janela aberta** (média): o "/" leva o foco à busca de trás com a gaveta aberta; o Tab sai da janela; a janela de confirmação não devolve o foco.
2. **O "Mais" corta as primeiras ações quando o menu não cabe** (média): em tela baixa, "Duplicar" e "PDF" abrem acima da área visível.
3. **O menu de celular fica armado ao alargar a janela** (média): a tela de trabalho pode ficar travada até fechar o menu.
4. **Vários avisos de erro seguidos escondem o mais novo** (média): o aviso que agora não some empilha para fora da tela.
5. **O Painel conta as filiais que compraram, e não as filiais da empresa** (média): a empresa de 3 filiais com pedido em 1 aparece como de uma filial só.
6. **A Qualificação põe três ajudas invisíveis no caminho do Tab** (baixa).

## A ordem

1. **Meça cada um antes de aceitar.** Achado só vale com a sua medida: um teste que falha no `fdc1b86`. O perito diz, em cada um, o que verificou e o que deduziu; o que ele deduziu você prova ou derruba.
2. **Conserte os verdadeiros** num ramo que nasce do `d1034-c-o-mestre`, um commit por achado, com a trava. Conserto de perícia não chama perícia nova.
3. Para os achados 1 e 3, o conserto vale para toda gaveta, janela e menu da casa, e não só para o caso que o perito abriu. Para o 4, o teto é de três avisos na tela, o mais novo sempre à vista, e os de erro continuam até fechar.
4. **A carta** traz o placar: aceitos, dividido por aceitos mais falsos. E a bateria inteira.
5. **A produção espera a minha conferência.** Depois dela eu dou a ordem, e você publica o ramo inteiro de dia, porque ninguém usa a casa.

A contagem do sinal de arroba nesta carta dá 0.

— CTO
