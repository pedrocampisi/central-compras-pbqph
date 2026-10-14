# D800 §2 — O rascunho da Rev. 01 do PS.02 com "encarregado", no ramo `d800-ps02-encarregado` (`334feb6`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 13/10/2026, 22h0x
**Responde:** `2026-10-13_de_CTO_para_Ordem_de_Compra_D800-publica-a-D799-e-o-rascunho-do-PS02-com-encarregado.md`, §2
**Espero de volta:** a sua conferência das fotos, e o aviso para publicar. **Não publiquei.**

**O banco não mudou.** **A Rev. 00 gravada não mudou, e ninguém apertou "Gravar":** a prova só abriu o rascunho na
página, com "Ler o rascunho".
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O ramo

- **O ramo:** `d800-ps02-encarregado`, saído do `main` `b1d4c47` (a D799 no ar), com um commit: **`334feb6`**.
- **O tamanho:** 78 linhas a mais e 40 a menos, em 6 arquivos.
- **A bateria:**
  - 1075 testes (eram 1072);
  - tipos e lint limpos.
- **Os dois JSON não foram editados à mão.** Eles saem de `scripts/rascunho-rev01-ps02.py`, como o `index.ts` deles
  manda. Mudei as mudanças M03, M10, M14, M15, M26 e M34 no script e rodei ele de novo.
- **O script confere o "antes" de cada mudança contra a Rev. 00.** Ele passou e disse "34 mudanças; 61 âncoras; já
  decididos 7; vermelhos 0", igual a antes. O `docs/Rev01_PS02/MUDANCAS_REV01.md` saiu junto.

## §2 — O que o rascunho diz agora

| onde | agora |
| --- | --- |
| fluxo, cartão "Material controlado" (M03) | "…receber pelo app do encarregado e avaliar." |
| fluxo, passo 5 (M10) | "Material: o encarregado registra no app do encarregado." |
| item 1, "Obra / Engenharia" (M14) | "…cadastra o encarregado de obra, põe na obra e gera o QR de entrada dele, na tela Acesso dos encarregados." |
| item 1, o quadro novo (M15) | título **"Encarregado de obra"**. O texto diz: "Recebe o material na obra pelo app do encarregado: responde “Chegou no dia combinado?”, “Chegou sem estrago?”, “Veio o material certo?” e “Veio a quantidade toda?”; quando veio só uma parte, ele diz quanto veio de cada item; e registra o número da nota (…), e o encarregado confere." |
| item 4, "Materiais e locação" (M26) | "…o encarregado de obra registra no app do encarregado (as mesmas quatro perguntas; quando veio só uma parte, quanto veio de cada item; e o número da nota…)". O resto do quadro fica igual. |
| item 7, "Conteúdo desta revisão" (M34) | "…a trava da emissão, o app do encarregado e a tratativa no Dashboard entram no texto." A descrição do histórico, que sai dele, diz o mesmo. |

- **Os motivos (o "?")** de M10, M14, M15 e M26 dizem o mesmo, e os de M15 e M26 citam a D792 e a D797.
- **Contei de novo:** os dois JSON têm zero "mestre", e a página do rascunho aberta também.
- **As perguntas estão escritas como a tela as escreve.** Um teste novo confere os dois quadros contra
  `PERGUNTAS_DO_MESTRE`, a lista que a tela usa. Se a tela mudar uma pergunta, o teste avisa que o PS.02 ficou para
  trás.
- **O "Entregue" do escritório** continua descrito como estava. A pergunta dele não mudou.

## §3 — As marcas

- **A comparação com a Rev. 00 marca os mesmos 32 lugares de antes,** porque nenhuma âncora mudou. Entre eles estão
  `objetivo.q1.i4` (o quadro novo), `objetivo.q1.i3`, `avaliacao.q1.i1`, `fluxo.c1`, `fluxo.s5` e `revisoes.a1`.
- **O teste que já existia passa:** "a comparação marca exatamente os lugares que o script diz que mudou, e nada sai".
- **A medida na página aberta:** 32 com `data-mudou`, e zero "mestre" no texto.

## §4 — A varredura lê os dois JSON

`tests/textos/semMestreNaTela.test.ts` ganhou dois testes:
- **o primeiro** anda pela árvore inteira de `documento.json` e de `mudancas.json` e falha em qualquer texto com
  "mestre". Ele diz o caminho do texto e confere que os dois arquivos estão lá;
- **o segundo** prova que a varredura acha o "mestre" no fundo da árvore, no título e no motivo.

## §5 — As 8 sabotagens, todas vermelhas

| a sabotagem | testes vermelhos |
| --- | --- |
| o título do quadro volta a "Mestre de obra" | 1 |
| o quadro volta a dizer "na tela Mestres" | 1 |
| um motivo do quadro do que mudou diz "mestre" | 1 |
| o quadro do encarregado perde "Veio o material certo?" | 1 |
| o quadro dos materiais perde a quantidade por item | 1 |
| o quadro novo sai do quadro do que mudou (sem marca) | 3 |
| a varredura do JSON não entra nos objetos | 1 |
| a varredura lê só o `documento.json` | 1 |

Depois de todas, a restauração ficou verde.

## §6 — As fotos

Ficam em `Ordem de Compra/docs/Capturas/2026-10-13_D800/`: 3 PNGs a 1280, no claro. A página rola por dentro,
então cada foto é a tela visível no lugar certo.

| foto | o que mostra |
| --- | --- |
| `87_item1_1280` | o item 1, com os quatro quadros marcados "Mudou"; o "Encarregado de obra" com as quatro perguntas e o "?" aberto |
| `87_item4_1280` | o item 4: "Materiais e locação" marcado, com as perguntas e a quantidade por item, e o "?" aberto |
| `87_item7_1280` | o item 7: o "Conteúdo desta revisão (Rev. 01)" marcado, dizendo "o app do encarregado" |

**"O quadro do que mudou"**, eu li como o "Conteúdo desta revisão" do item 7, que vira a descrição do histórico. O
"?" de cada trecho, nas duas primeiras fotos, mostra o motivo que vem do `mudancas.json`. Se você queria outro
quadro, me diga qual.

## §7 — Depois do seu aviso

1. Junto `d800-ps02-encarregado` no `main`.
2. Anoto o desfazer (hoje, `685ccd1c`).
3. Publico pelo PowerShell e meço por fora:
   - a versão;
   - no pedaço do rascunho servido, "Encarregado de obra" e "Veio o material certo?", e nenhum "mestre".

**O "Gravar a Rev. 01" continua sendo só do Pedro.**

— Ordem_de_Compra
