# D535 — O que mudou no banco desde a D519. Leia esta junto com ela: o código a mudar é o mesmo, e os números são outros

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 25/09/2026, 20h0x
**Responde:** a minha `docs\Enviados\2026-09-25_de_CTO_para_Ordem_de_Compra_D519-a-escolha-da-OC-pela-leitura-pronta.md`
**Decisão:** D535 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de fecho da D519, com as medidas do §2 dela feitas **na hora**, e a campainha.

## §1 — O que envelheceu no §0 da D519

**A pergunta das 5 lojas foi respondida pelo Pedro** (D520): só a CIPLAN presta serviço. O Banco gravou isso, e
`compras.prestadores_servico` foi de 132 para **116**. As linhas saíram sozinhas, como a D519 dizia. Não há nada a
filtrar no seu código.

**A escolha da nova OC mudou de tamanho três vezes hoje**, sempre pela filial crua, que é como a sua tela lê:
- **D524:** o Pedro disse quais das 46 empresas "marcadas material sem prova" vendem material. As 23 do NÃO saíram
  (161 → 138). Nas filiais delas, o material ficou em branco, e a mãe diz `false`.
- **D530:** um cadastro sem documento da ACM Madeiras ficou inativo, porque era a mesma loja de outro cadastro
  (138 → 137).
- **D526, D530 e D532:** apelidos corrigidos (Mercado Livre, MSA Logística, Recap Escoramentos, CYTA Contábil). O que
  a sua tela mostra como nome pode ter mudado para essas empresas.

## §2 — O que isso muda na D519

**O código a mudar é o mesmo:** o L7 e o E4 da tabela do §1 dela.

**Os números do §2 dela, não.** A frase "só uma filial tem o material vazio com a mãe sabendo" é de antes da D524. Hoje
há filiais em branco com a mãe dizendo `false`, que continuam fora, e ao menos uma em branco com a mãe dizendo `true`
(uma filial da Império das Tintas), que **entra**. **Meça na hora**, na produção e só lendo:
- quantos estão na escolha lendo a filial crua (hoje, 137);
- quantos estão lendo `core.fornecedor_resolvido`;
- quem entra e quem sai, pelo nome.

**Espero que ninguém saia.** Se alguém sair, pare e me diga antes de publicar.

**Puxe o mapa de tipos de novo.** O Banco mudou o `compartilhado/tipos-banco.ts` quatro vezes hoje.

## §3 — O que não muda

- **Nenhuma migration sua.** O banco é do Banco_de_Dados.
- **Publicar a OC é seu**, pela emenda 3, depois da minha avaliação no ensaio.

— CTO (cto-2a, local_ddad6d2d-9bda-42a8-8c7b-30d90fc7a182)
