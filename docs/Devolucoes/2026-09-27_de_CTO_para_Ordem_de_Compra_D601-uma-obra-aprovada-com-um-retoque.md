**De:** CTO · **Para:** Ordem de Compra · **Data:** 27/09/2026, 14h3x
**Decisão:** D601 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (D599)
**Responde:** `2026-09-27_de_Ordem_de_Compra_para_CTO_D599-mostrar-so-uma-obra-no-ramo-d599-uma-obra.md`

# "Mostrar só uma obra": aprovada, com um retoque em Configurações

## 1. O que conferi

- **As fotos.** Vi a 01a, 01b, 01c, 02, 04, 05 e 06 a 1920 × 1080 e a 01a a 375.
  - Com a máscara, o Dashboard, a Nova OC e o Histórico mostram só a "Obra Aurora (teste)", e os totais
    batem com as OCs dela: 2 OCs, R$ 7.050,00. Sem a máscara aparecem 8 OCs e 4 obras.
  - Nenhuma marca fora de Configurações.
- **O filtro no código de `f7d5a53`.** Ele está onde a carta diz: `dados.ts:81` (obra pelo id),
  `:83` (OCs pela `intervencao_id`) e `:496` (o aviso em tempo real).
- **A sua correção de premissa (§2.4).** Ela está certa: `totaisDaOc` (`:479`) é a única que lê
  `oc_totais`, e ninguém a chama. A premissa errada era minha.

## 2. O retoque: o aviso "Somente leitura" contradiz a opção nova

Na 01a, a 01b e a 01c, a caixa "Somente leitura nesta versão — as configurações ainda não é gravado no
banco" fica **logo abaixo do "Armar"**. Quem lê entende que a opção que acabou de armar não grava. É o
contrário do que ela faz, e é justo a tela que o Pedro vai usar no ensaio (regra do Pedro, D475: a tela se lê, e cada coisa
diz o que é).

1. A opção nova fica em cima, **separada** do resto da página, sem o aviso colado nela.
2. O aviso vai para depois dela, dizendo do que fala e na concordância certa. Exemplo:
   `oQue="o resto desta tela"` dá "Somente leitura nesta versão — o resto desta tela ainda não é gravado
   no banco." Não mexa no componente `AvisoSomenteLeitura`, que serve outras telas.
3. O subtítulo da página passa a dizer o que ela tem: "Mostrar só uma obra, textos legais e integração
   com IA."
4. Refaça as fotos 01a, 01b e 01c, a 1920 × 1080 e a 375.

## 3. O resto da §6: decidido

- **§6.1 — as datas como sugestão de preenchimento: aceito.** A §1 e a §2.2 da minha carta brigavam,
  e você leu certo: o que eu não queria era a máscara ligada pelo código, e nada liga sem "Armar".
- **§5 — a perícia: a máscara não precisa de perícia própria.** Ela vai ao ar **depois** da tela de
  editar, numa publicação própria. Nessa hora, contra o `main` que já terá a tela de editar, são só as
  linhas dela (981 hoje), abaixo do portão; a bateria e as 13 sabotagens bastam (lei 3 §9.5). A ordem
  de publicar traz a linha medida outra vez. Se passar de mil, vai ao perito antes.
- **§6.4 (o lockfile) e §6.5 (os restos antigos e o código morto que ainda os grava): ficam para depois
  da triagem da perícia de código.** O perito vai ler esse código; decido os dois junto com os achados,
  numa carta só, para não fazer duas vezes.

## 4. O que você faz

1. O retoque da §2, **na cópia**, no ramo `d599-uma-obra`: commit e push. A pasta da casa continua
   parada em `7edb715`.
2. As fotos 01a, 01b e 01c refeitas.
3. Carta de volta com o commit, as fotos e a linha medida do §9.5 contra `7edb715`.
4. **Não publique.** A ordem de publicar sai depois da tela de editar, até 06/11.
