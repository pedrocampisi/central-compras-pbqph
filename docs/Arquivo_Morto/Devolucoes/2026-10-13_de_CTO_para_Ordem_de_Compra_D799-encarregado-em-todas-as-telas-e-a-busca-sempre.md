# D799 — "Encarregado" em todas as telas, e a busca sempre visível

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 13/10/2026, 21h3x
**Decisão:** 799
**Fase:** 4 — fora do portão: pedido direto do Pedro (o recebimento do PS.02, que a auditoria de 16/11 lê)
**Espero de volta:** a carta com o ramo, os testes, as sabotagens e as fotos. Eu olho as fotos e aviso para publicar.

---

## §1 — O que o Pedro disse

1. Olhando o menu: "esse nome 'Mestres' não está muito intuitivo né?". Perguntado, ele escolheu:
   "Coloque: 'Acesso dos encarregados'".
2. Perguntado se troca só o menu ou todos os textos: **em todas as telas.**
3. No celular dele, numa obra com 2 pedidos: "cadê o sistema de busca? Pensa quando tiver um monte de ordens de
   compras". A busca da D795 existe, mas só aparece a partir de 4 pedidos. Mostrei a ele a sua foto 84, e ele escolheu
   **sempre visível.**

## §2 — O que muda

1. **O menu** diz "Acesso dos encarregados". O título da página diz o mesmo.
2. **Todo texto que alguém lê** troca "mestre" por "encarregado", no singular e no plural:
   - a página do engenheiro: o título, o subtítulo, os botões, o vazio, as confirmações e os motivos;
   - o app no celular do encarregado;
   - as mensagens de erro, inclusive a que manda pedir o QR "da tela Mestres", que passa a dizer a tela nova;
   - o que for impresso ou gravado em PDF a partir de agora. O que já foi gravado não muda.
   Medi uns 30 textos em `src`; a conta certa é sua.
3. **O que NÃO muda:**
   - os nomes de dentro: o papel `mestre`, a `pode_gerir_mestre`, as tabelas, as funções, os arquivos e os
     componentes. Ninguém os vê, e mexer neles pede migration sem ganho;
   - o ícone do capacete;
   - **o texto do PS.02.** É documento controlado, e a revisão é do Pedro. Liste na carta onde ele diz "mestre", e eu
     levo a ele.
4. **A busca do "Material a chegar" fica sempre visível:** com 1 pedido ou mais, ela está no alto da lista, como na sua
   foto 84. Com zero pedidos, não há o que procurar, e ela não aparece. A regra de achar não muda: o começo de
   qualquer palavra do nome (D795).

## §3 — Como

1. Num ramo próprio, a partir do `main` de hoje (`8b3bc36`).
2. Teste e sabotagem de cada coisa:
   - a busca aparece com 1 pedido;
   - nenhum "mestre" sobra em texto que aparece na tela. Uma varredura que pegue o próximo também vale.
3. Fotos a 375, no claro e no escuro: o menu, a página do engenheiro, a lista com 2 pedidos mostrando a busca, e uma
   mensagem de erro com a palavra nova.
4. Eu olho as fotos e aviso. Aí você publica pelo seu caminho (emenda 3), com o desfazer anotado (a produção de hoje é
   `9e74c0f0`) e a prova por fora.

— CTO
