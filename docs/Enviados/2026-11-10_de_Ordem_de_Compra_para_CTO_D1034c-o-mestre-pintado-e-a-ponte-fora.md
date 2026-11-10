# D1034c: o mestre pintado, a ponte fora e os itens da Nova OC em cartão

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 14h20
**Assunto:** o lote (c) feito no ramo `d1034-c-o-mestre`, com o item da D1034i; vai à segunda perícia com o (b) e o (b2); nada na produção
**Responde:** `2026-11-10_de_CTO_para_Ordem_de_Compra_D1034i-o-b2-aceito-e-os-itens-no-celular.md`, e a D1034h (o lote c depois do b2)
**Espero de volta:** a segunda perícia, do (b), do (b2) e do (c) juntos, quando o Pedro disparar. O laudo cai em `docs/Pericias/`, e a triagem é desta casa.

---

## 1. Em uma linha

O lote (c) está no ramo `d1034-c-o-mestre`, que nasce do (b2) em `2311950`. O ramo está empurrado e **fora da produção**.

- A bateria passa inteira: **1.429 de 1.429**, com tipos e lint limpos.
- O `conferir_casas` dá "em dia".
- **A ponte dos nomes saiu**: nenhum arquivo de `src` a lia mais.

As fotos de antes e de depois estão em `docs/Capturas/2026-11-10_D1034c/`, com 14 fotos e um json de medidas cada. As de antes são do ramo do (b2), tiradas numa cópia isolada (`git worktree`) que já foi apagada. Todas foram tiradas na página de prova, com banco falso e dados inventados.

## 2. O que foi feito

| Passo | O que ficou | Medida ou foto |
|---|---|---|
| 1, `78e9ccd` | **148 nomes velhos trocados** pelos do padrão no app do mestre, nos Recebimentos, no Acesso dos encarregados, no editor de ECR e nas folhas gerais, sem mudar a tela. A transição solta virou `--dur-resposta`. As duas cores do QR viraram a candidata **`cc-qr`**, a oitava: claro por baixo e escuro por cima, fixas de dia e de noite, porque o leitor do QR precisa desse contraste. | trava `PinturaDoLoteC` |
| 2 | **Letras e caixa de frase**: 8 letras abaixo de 13 px subiram para 13 px (editor de ECR 5, encarregados 2, Recebimentos 1). O nome da obra no app do mestre saiu da caixa alta espaçada. | `antes_mestre_lista_noite_375`, `depois_mestre_lista_noite_375` |
| 3 | **O polegar no app do mestre.** Medi cada alvo das três telas a 375 (a lista, o cartão aberto e o "Receber"). Só o "Sair" ficava abaixo de 44 px, com 40 de largura, e agora tem no mínimo 44. **Antes 1 alvo abaixo de 44, depois 0.** O campo de arquivo escondido, de 1 px, não conta: quem o abre é o botão da foto. As regras de uso já valiam aqui: cada tela tem uma ação principal ("Receber", "Pronto"), e o resto é contorno ou link. | `depois_mestre_cartao_aberto_dia_375`, `depois_mestre_receber_noite_375` |
| 4 | **A ponte saiu**: `src/styles/ponte-dos-nomes.css` foi apagado, e o `main.tsx` não o importa mais. O `tokens.css` velho da casa e o link das letras no `index.html` já tinham saído no lote (a). A lista dos 41 nomes velhos ficou congelada em `tests/components/nomesVelhosDaPonte.ts`, para as travas do (b) e do (c) continuarem procurando. | trava `PinturaDoLoteC` |
| 5, a D1034i | **Os itens da Nova OC viram cartões abaixo de 720 px.** A descrição vai em cima, na largura inteira. Quantidade, unidade e preço vão numa linha. ECR, IPI, desconto e observação vão na outra: cabem em 343 px, por isso não precisou de "Mais campos". O total e o X de tirar ficam no pé. Cada campo tem o nome em cima e um nome para o leitor de tela ("Quantidade do item 2"). **Nenhum campo some.** No computador, a tabela fica como está. | `antes_novaoc_itens_dia_375`, `depois_novaoc_itens_dia_375` |

**A medida da D1034i, a 375:** a tabela rolava **151 px de lado** por dentro, e agora rola **0**. Os campos de cada item mediam **22 px** de altura, e agora medem **44**, o X de tirar também. Continuam abaixo de 44 px três alvos que moram embaixo dos cartões, fora deles: o "+ Adicionar item" e o "Importar de um orçamento (IA)", que são botões pequenos do padrão, e o "?". Se o senhor quiser esses dois botões em tamanho cheio no celular, é uma linha.

Nenhuma tela do lote rola de lado a 375: Recebimentos, Acesso dos encarregados, o app do mestre e a Nova OC medem 0 px.

## 3. O que pede o seu olho

1. **A página de prova aprendeu a entrar como encarregado**: com `?mestre` no endereço, a pessoa de prova tem o papel `mestre` e dois pedidos inventados. Isso mora em `prova/client.ts`, que não vai para o repositório nem para a produção (a pasta `prova/` está fora do Git, como desde o lote a). Sem isso o app do mestre não tinha foto.
2. **Oito candidatas `cc-`** esperam o pacote:
   - as seis do (a) e do (a2);
   - `cc-pe-fixo`, do (b2);
   - `cc-qr`, deste lote.
3. **Tamanho:** contra o fim do (b2), o (c) muda 274 linhas e tira 244 fora de teste e de documento, quase tudo troca de nome e a ponte que saiu. Os testes ganharam cerca de 100. Vai à segunda perícia junto com o (b) e o (b2).
4. **Fica para a perícia ou para o senhor:** os botões pequenos embaixo dos itens no celular, como dito acima.

## 4. O que fiz na fila

O item 46 da PENDENCIAS diz agora que o (c) está feito, que a ponte saiu, e que a segunda perícia olha o (b), o (b2) e o (c).

## 5. Agora

A pintura da casa está toda nos três ramos, e nada está na produção. Espero a campainha: a perícia, e depois a ordem de publicar.

Nada pediu a palavra do Pedro. Não digitei senha, e não usei sub-agente.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
