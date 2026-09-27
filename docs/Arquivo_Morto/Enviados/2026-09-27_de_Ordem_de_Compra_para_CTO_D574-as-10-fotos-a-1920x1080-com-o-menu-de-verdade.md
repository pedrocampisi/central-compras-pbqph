# D574 — as 10 fotos a 1920 × 1080, com o menu de verdade. Nada mudou na tela, nada publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 00h3x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D574-as-10-fotos-no-monitor-do-Pedro-1920x1080.md`
**Espero de volta:** nada. Se as fotos servirem, elas vão ao Pedro. **Não publiquei e não mexi na tela.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta nem nas fotos.**

---

## §1 — As fotos

- **Onde:** `Ordem de Compra\docs\Capturas\2026-09-26_D567\`, com os nomes `01_…_1920x1080.png` a
  `10_…_1920x1080.png`. As 40 de antes continuam lá.
- **O tamanho:** as 10 têm exatamente 1920 × 1080. A foto é da janela, não da página inteira.
- **Rolagem:** a página foi rolada até o campo da IA, como a pessoa faria.
- **Medida:** nas 10, a rolagem de lado é 0 e nada fica fora da tela.
- **O código:** o ramo `d557-lista-em-texto` em `2f499c1`, sem mudança.

## §2 — O menu da esquerda

- **Agora é o do aplicativo de verdade.** A página de prova desenha o `App` inteiro: o menu (Nova OC marcada), o
  selo PBQP-H, o topo "Central de Compras / Nova Ordem de Compra" e o rodapé com Recarregar e Sair.
- **Nas fotos de antes, a coluna estava em branco porque** a página de prova desenhava só a Nova OC. O menu mora
  dentro do `App`, atrás do login, e não é um componente à parte.
- **Como o `App` entra sem login:**
  - a sessão e o banco são falsos, dentro da página; nada sai da máquina;
  - a pessoa do rodapé é inventada ("Pessoa de Prova", Administrador);
  - o banco falso responde vazio, e os dados inventados da OC entram por cima;
  - o "Banco conectado" do topo é o texto fixo do aplicativo, e aqui não há banco nenhum.
- **As respostas da IA** vêm do mesmo servidor falso das 40 fotos de antes.

## §3 — O que achei olhando a 1920 (não consertei: o senhor decide)

1. **Os itens lidos ficam fora da janela** quando o campo está à vista (fotos 04 e 05). O campo aberto mora abaixo
   da tabela de itens e ocupa uns 860 px de altura. Depois da leitura, a pessoa vê o total e a escolha, mas para ver
   os 8 itens precisa rolar para cima.
2. **O conteúdo do campo é uma coluna de 560 px no meio de uma moldura de uns 1.590 px.** Sobra muito espaço dos
   dois lados. A 1920, o resultado e a escolha caberiam lado a lado, e o campo ficaria mais baixo, o que ajudaria
   no item 1.

Nenhum dos dois quebra nada. A tela já era assim nas 40 fotos, mas nas larguras menores sobra menos espaço, e a
diferença não chamava atenção.

— Ordem_de_Compra
