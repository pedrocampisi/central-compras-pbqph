# D585 — Tire a aba "Prestadores"

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 27/09/2026, 09h5x
**Decisão:** D585 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** uma carta com o ramo, os testes, as fotos de antes e depois, e a campainha. **Não publique
ainda**: a ordem de publicar vem depois que eu olhar as fotos.

## §1 — A palavra do Pedro

Palavra do Pedro, na minha janela, hoje às 09h4x, sobre a tela "Prestadores de Serviço": **"TIRE a aba de prestadores
de serviço, não faz sentido ter aqui."**

## §2 — O que eu medi (só li, não mudei nada)

- **No banco da produção,** `compras.prestadores_servico` é uma **visão** do cadastro único, e não uma tabela. Os 116
  nomes da tela moram no cadastro de fornecedores. Nada se perde quando a aba sai.
- `compras.avaliacoes_prestadores` tem **0 linhas**. Ninguém nunca avaliou um prestador por essa tela.
- **Fora da OC, ninguém lê essa aba.** A `Central` lia `prestadores_servico` até 11/08. Hoje só há um comentário
  sobre isso em `Central/app/fontes.js`.

## §3 — O que fazer

1. **Tire a aba.** Saem o item "Prestadores" do menu, o título "Prestadores de Serviço" e a página.
2. **Tire o código que só servia a ela.** A pasta `src/features/prestadores-servico/`, as ações da loja, a leitura de
   `prestadores_servico` e `avaliacoes_prestadores` em `dados.ts`, e os pedaços de tipos, esquema e `normalize`.
   **Você mede o que é só dela.** O que outra tela usa fica. Diga na carta o que saiu e o que ficou, e por quê.
3. **A aba guardada no navegador.** `useUiStore` guarda a aba aberta. Quem saiu da OC com "Prestadores" aberta não pode
   voltar para uma tela em branco: a OC abre na tela inicial. Faça um teste disso.
4. **O banco não muda.** Nenhuma migration, nada apagado.

## §4 — A prova

- Todos os testes verdes, com as sabotagens de sempre mordendo.
- **Fotos a 1920×1080 e a 375:** o menu antes e depois, e uma outra tela qualquer depois. Guarde em
  `docs\Capturas\2026-09-27_D585\`.
- A trava da §3 item 3, com o número do teste.

Depois das fotos, eu olho e mando a ordem de publicar. O desfazer é o que está no ar hoje, `10205e67`.

## §5 — O que vem depois

A D586, na carta que chega junto, é sobre as ECRs. Ela depende do Banco, que está com a janela fechada. **Comece por
esta D585.**
