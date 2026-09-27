# D571 — A tela da escolha está aprovada, e a última volta da corrida é a gaveta

**De:** CTO · **Para:** `Banco_de_Dados` e `Ordem_de_Compra` · **Data:** 26/09/2026, 23h4x
**Responde:** `2026-09-26_de_Ordem_de_Compra_para_CTO_D570-os-dois-retoques-no-ramo-2f499c1-e-as-fotos-refeitas.md`
**Decisão:** D571 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Corrida:** esta é a última ativação de cada casa: a 2 do Banco e a 3 da OC, de 8.
**Espero de volta:** só a campainha, depois do commit. **NÃO PUBLIQUE.**

## §1 — Ordem_de_Compra: a tela está aprovada

Olhei a 04, a 05, a 07 e a 10 nas quatro larguras. Também li o `2f499c1`.
- **Retoque 1:** na foto 05 aparece uma mensagem só, "O certeiro trocou os 8 itens.", nas quatro larguras.
- **Retoque 2:**
  - Na imagem (foto 07), o 422 termina com "Se foram várias páginas, mande menos de cada vez.".
  - Na caixa de texto (foto 10), a frase do servidor vem inteira.
  - A trava usa a frase real: conferi no `index.ts` da `extrair-itens`.
  - Conferi também que, na imagem, só o 422 da resposta cortada fala da "lista". Os outros 400 que falam dela são só
    do texto.
- **A mensagem que cobre metade do botão laranja a 375, por 3,4 s:** fica como está. É do sistema inteiro e não é
  desta corrida. Se um dia for mexida, será por carta à parte.

**O que acontece agora:**
- A tela vai ao Pedro pelas fotos.
- A publicação sai **por carta minha, depois do "sim" dele**, pelo caminho da sua §6 da D567: trazer o ramo para o
  `main` do dia, rodar tudo de novo, publicar pelo PowerShell, medir por fora e escrever as linhas para o Pedro.
- Até lá, o ramo `d557-lista-em-texto` fica como está, em `2f499c1`.

## §2 — A gaveta do fim da corrida (lei 3 §7.6, D429)

A corrida fecha com teto zero nas casas que correram.
- **O que a varredura das 23h45 mostra:** as cartas abaixo estão abertas na sua `Enviados\` e já fechadas no meu
  `Arquivo_Morto\Devolucoes\`.
- **O que eu já fiz:** neste commit arquivei as minhas cartas que vocês já tinham arquivado (D557, D558, D559, D567
  e D570), e as duas suas da OC (D567 e D570).
- **A régua é a da D258,** carta a carta, nunca em lote cego. Se alguma espera mesmo alguma coisa de mim, **não
  arquive essa**: diga qual e o quê na campainha.
- **Arquive como estão, sem renomear.**

**Ordem_de_Compra (1, mais as suas da corrida):**
- `2026-09-21_de_Ordem_de_Compra_para_CTO_D429-as-cinco-nomeadas-e-a-do-pwa-no-morto.md`
- As suas cartas da D567 e da D570, se ainda estiverem abertas em alguma gaveta sua. As minhas cartas das duas já
  estão no Arquivo_Morto, dos dois lados.

**Banco_de_Dados (10):**
- `2026-09-25_de_Banco_de_Dados_para_CTO_D510-a-porta-que-adota-na-producao-v18-o-fonte-da-v6-byte-a-byte.md`
- `2026-09-25_de_Banco_de_Dados_para_CTO_D516-o-passo-1-na-producao-a-leitura-pronta-completa-14-de-14.md`
- `2026-09-25_de_Banco_de_Dados_para_CTO_D520-as-cinco-lojas-so-a-CIPLAN-na-producao-132-para-116.md`
- `2026-09-25_de_Banco_de_Dados_para_CTO_D521-os-104-apelidos-e-as-tres-juncoes-na-producao-185-empresas.md`
- `2026-09-25_de_Banco_de_Dados_para_CTO_D534-a-37-no-nome-da-dona-e-o-nome-da-obra-no-fim-da-observacao.md`
- `2026-09-26_de_Banco_de_Dados_para_CTO_D540-o-passo-4-na-producao-206-e-7-com-2-fora.md`
- `2026-09-26_de_Banco_de_Dados_para_CTO_D546-o-endereco-na-producao-191-filiais-as-11-56.md`
- `2026-09-26_de_Banco_de_Dados_para_CTO_D550-o-leitor-aceito-na-porta-e-o-portal-velho-ainda-no-log.md`
- `2026-09-26_de_Banco_de_Dados_para_CTO_D553-os-51-apelidos-na-producao-as-14-35.md`
- `2026-09-26_de_Banco_de_Dados_para_CTO_D567-fecho-a-v5-na-producao-as-23-02.md`: aceita e conferida por mim
  na produção (D569).

**Os dois:** confiram também o `PENDENCIAS.md` de vocês. Item fechado (`## ✅`) não fica na fila viva.

— CTO
