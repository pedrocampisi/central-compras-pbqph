# D1034k: a triagem do laudo da pintura, seis de seis verdadeiros

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 15h25
**Assunto:** os seis achados do laudo, cada um medido e consertado no ramo `d1034-d-a-triagem`; nada na produção
**Responde:** `2026-11-10_de_CTO_para_Ordem_de_Compra_D1034k-a-triagem-do-laudo-da-pintura.md`
**Espero de volta:** a sua conferência, e depois a ordem de publicar o ramo inteiro de dia.

---

## 1. Em uma linha

Os seis achados são verdadeiros, e os seis estão consertados.

- **O placar é 6 / (6 + 0) = 100%.** Nenhum foi medido e dado como falso, e nenhum ficou adiado.
- Cada achado ganhou um teste que **falhou no `fdc1b86`** antes do conserto. Rodei os nove testes no código intocado e os nove falharam. Cada falha está na tabela abaixo.
- O ramo `d1034-d-a-triagem` nasce do `d1034-c-o-mestre` em `fdc1b86`. Tem um commit por achado e um de arrumação. Está empurrado e **fora da produção**.
- A bateria passa inteira: **1.440 de 1.440**, com tipos e lint limpos.
- O `conferir_casas` dá "em dia".

O laudo entrou no commit desta carta, em `docs/Pericias/2026-11-10_pericia_codex_pintura-da-oc.md`. As travas moram em `tests/components/TriagemDaPintura.test.tsx`.

## 2. Achado por achado

| # | Achado (gravidade do laudo) | A medida no `fdc1b86` | Estado | Conserto |
|---|---|---|---|---|
| 1 | O teclado sai da ficha ou da janela aberta (média) | São quatro testes, e os quatro falharam. **(a)** Com a ficha aberta, o "/" levou o foco ao campo de busca de trás. **(b)** O Tab saiu da gaveta. **(c)** O Tab saiu da janela de confirmação, e o Esc não devolveu o foco a quem a abriu. **(d)** A trava de fonte achou **13 janelas modais** da casa sem foco preso. | aceito | `0f46286` |
| 2 | O "Mais" abre em cima sem caber (média) | Em 667 × 350, com o botão a 110 px e uma lista de 230 px, o topo da lista ficou em **−124 px**. Era a conta do laudo, e o teste a repetiu. | aceito | `ae14057`, e a arrumação `aade248` |
| 3 | O menu do celular fica armado ao alargar a janela (média) | Abri o menu a 959 px e alarguei para 1.100. O véu continuou aberto, e a tela de trabalho continuou `inert`. | aceito | `ea9961b` |
| 4 | Vários erros seguidos empurram o mais novo para fora (média) | Depois de seis erros seguidos, os **seis** avisos ficaram na tela, sem limite. O mais novo ia para o fundo da pilha. | aceito | `53e50cd` |
| 5 | O Painel conta as filiais que compraram, e não as da empresa (média) | A empresa inventada tinha 3 filiais, e uma OC de R$ 120,00 só em uma. O ranking mostrou o CNPJ dessa filial, e não "3 filiais". | aceito | `d977a92` |
| 6 | Na Qualificação em cartão, três "?" invisíveis no caminho do Tab (baixa) | Abaixo de 720 px, nenhuma regra tirava os botões do cabeçalho recortado da ordem do teclado. | aceito | `b2e1fe6` |

## 3. O que cada conserto faz

1. **Uma peça nova, `useFocoPreso`, em `src/hooks/`.**
   - Com a janela aberta, o Tab e o Shift+Tab dão a volta dentro dela.
   - Ao abrir, o foco entra na janela. Ao fechar, volta para quem a abriu.
   - Com uma janela por cima de outra, por exemplo a confirmação sobre a gaveta, só a de cima prende o foco.
   - Como o senhor pediu, ela vale para **todas** as modais da casa, e não só para as que o perito abriu. São 15: a gaveta, a confirmação e as 13 do `dialogo.overlay`. A trava de fonte confere que toda janela com `aria-modal` usa a peça, para quem fizer uma janela nova não esquecer.
   - O balão do tutorial é `aria-modal="false"` de propósito e ficou como está.
   - O "/" não procura mais nada com ficha, janela ou menu aberto.
2. **O "Mais"** abre embaixo quando cabe e em cima quando cabe.
   - Quando não cabe inteiro em nenhum dos dois lados, abre no lado com mais espaço, a 8 px da borda, e rola por dentro.
   - No caso do laudo, o topo passou de −124 px para 150 px.
   - A conta virou uma função pura, `ondeAbreOMais.ts`. Ela saiu do arquivo do componente na arrumação, porque o lint pede isso.
   - O achado 3, para o menu do celular, tem conserto próprio, no item seguinte.
3. **O menu do celular** fecha sozinho quando a janela passa de 960 px com ele aberto. Com isso, o véu e o `inert` saem juntos.
4. **Os avisos:**
   - Ficam no máximo três na tela, sempre os mais novos, e o mais novo fica sempre à vista.
   - Os de trás esperam na fila. Cada um que se fecha dá a vez ao seguinte.
   - O aviso de erro continua até a pessoa fechar, e nenhum se perde: na trava, os seis erros seguem na fila depois de aparecerem.
5. **O Painel** conta as filiais que a empresa tem no cadastro. O CNPJ só aparece quando a empresa tem uma filial só. O valor não mudou: no exemplo do teste deu R$ 120,00.
6. **A tabela em cartão** (`cc-cartoes`):
   - O cabeçalho recortado continua lá para o leitor de tela. Os botões, links e campos dele saem do caminho do Tab.
   - O texto inteiro de cada critério continua ao alcance, no cartão aberto. A trava confere isso também.
   - A regra está na candidata, e não só na Qualificação. Assim vale para qualquer tabela que virar cartão.

## 4. O que pede o seu olho

1. **Não olhei estes consertos na página de prova nem tirei fotos.** A medida de cada um é o teste em jsdom. Os seis tratam de foco, posição e contagem, e isso o teste mede melhor que a foto. Se o senhor quiser a foto do "Mais" em 667 × 350 ou dos três avisos, é uma rodada curta.
2. **A peça `useFocoPreso` é nova** e mexe em 15 janelas. Só mudou o comportamento do teclado e do foco, e o desenho continua igual. As outras 1.431 verificações da casa continuaram passando sem eu tocar nelas.
3. **Tamanho:** fora de teste e de documento, são 20 arquivos, com 196 linhas a mais e 40 a menos. A maior parte é a mesma linha da peça repetida em cada janela.
4. **A candidata `cc-cartoes` mudou** e vai assim ao pacote junto com as outras sete.

## 5. O que fiz na fila

O item 46 da PENDENCIAS agora diz três coisas:
- a perícia foi uma só, do ramo `d1034-c-o-mestre` inteiro;
- a triagem deu seis de seis, no ramo `d1034-d-a-triagem`;
- o que falta é a sua conferência e a ordem de publicar.

## 6. Agora

Nada está na produção, e não publiquei. Espero a campainha: a sua conferência, e depois a ordem.

Nada pediu a palavra do Pedro. Não digitei senha, e não usei sub-agente.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
