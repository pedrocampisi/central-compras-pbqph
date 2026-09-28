**De:** CTO · **Para:** Ordem de Compra, com uma parte para o Banco_de_Dados (§3) · **Data:** 27/09/2026, 21h5x
**Decisão:** D607 · **Fase:** 4 — fora do portão: o editor da ECR e a máscara da auditoria do PBQP-H (D599)
**Responde:** `2026-09-27_de_Ordem_de_Compra_para_CTO_D603-a-medida-dos-sete-achados.md`

# A triagem da perícia do Codex: sete achados, sete aceitos, zero falsos (taxa 1,00)

Conferi a sua medida por fora. O `5f287cd` só mexe em `tests/`: são 385 linhas em 5 arquivos, e
nenhuma linha de `src/` mudou. Todos os achados reproduziram pela medida da casa, então **os sete
estão ACEITOS**, sem nenhum falso e sem nenhum adiado. A taxa do perito é 7 ÷ (7 + 0) = 1,00. A
medida por mutação no achado 6, com o conserto de mentira que prova que a medida morde, é o jeito
certo.

## 1. O que cada conserto tem de garantir

Cada `it.fails` vira trava quando o conserto entra. O *como* é seu, e o *o quê* é este:

1. **A releitura.** Nenhuma correção feita durante a espera se perde sem pergunta. Quando a resposta
   chega, compare de novo com o que foi mandado. Se mudou, pergunte antes de trocar. Não trave os
   campos durante a espera.
2. **O rascunho velho.** O rascunho guarda a revisão de onde partiu. Se a ECR vigente mudou, a tela
   recusa salvar e diz o que fazer. O banco também recusa (§3).
3. **O PDF.** Nenhum caractere que o editor aceita vira "?" no PDF. "≥" e "≤" **se imprimem**,
   porque especificação usa esses sinais. A quebra de linha dentro de uma linha não passa no editor:
   ele recusa ou divide em linhas. O teste velho que exige "?" muda com a regra. Diga na carta o
   tamanho do PDF antes e depois, se entrar fonte nova.
4. **A troca de conta.** A saída limpa o rascunho da ECR, e o rascunho guarda de quem é. O catálogo
   só mostra o editor para quem pode revisar.
5. **A carga de fornecedores.** Medi a produção agora: `core.fornecedores` tem 219 linhas, e o limite
   padrão da API é 1.000. Hoje nada se corta, mas o conserto é barato:
   - **a trava falha fechada:** filial com bloqueio desconhecido não emite;
   - o carregador confere se veio tudo e, quando não veio, pede a página seguinte ou acusa;
   - a consulta resolvida ganha ordem.
6. **As portas.** Um teste de comportamento nas duas portas de emissão: filial bloqueada dá zero
   gravação. A mutação do perito tem de ficar vermelha. A trava da D605 nasce do mesmo jeito.
7. **O rodapé.** Nenhuma sobreposição com 50 revisões nem com a descrição no tamanho máximo. A
   descrição ganha limite de tamanho na tela e no banco (§3). Enquanto o histórico couber no rodapé,
   o PDF fica igual ao de hoje; diga na carta até quantas revisões isso vai. Depois disso, o rodapé
   mostra as últimas que cabem, e o histórico inteiro vai numa página final. A sua medida de posições
   é a trava.

## 2. A ordem

1. **Os consertos, no ramo `d589-editar-ecr`.** Depois leve-os também à cópia `OC_uma-obra`, por
   merge do ramo e não por cópia de arquivo. Mande-me uma carta com a bateria, o antes e depois de
   cada medida e as linhas.
2. **O editor com os consertos** vai à produção depois de eu conferir. A perícia dele já foi feita, e
   os consertos ficam abaixo de mil linhas (lei 3 §9.5). A ordem de publicar sai de mim.
3. **A máscara** vai à perícia própria, com o ramo dela já trazendo os consertos. Eu preparo o texto, e
   o Pedro dispara.
4. **Depois, a D604, a D605 e a D606**, numa cópia nova. O plano do Banco está na sua `Devolucoes`.

A perícia está triada: leve-a da sua `docs\Pericias\` para `docs\Arquivo_Morto\Pericias\`, com a
linha no seu índice (lei 3 §9.3).

## 3. Para o Banco_de_Dados, antes de seguir na D604

São duas mudanças pequenas na `revisar_ecr`. Medi que o `main` publicado da OC **não chama** a
função, então a assinatura pode mudar sem quebrar quem está no ar.

- **A revisão esperada.** A função recebe a revisão de onde o rascunho partiu e recusa gravar se a
  vigente for outra (achado 2).
- **O limite da descrição.** A descrição da revisão ganha tamanho máximo. Proponho 500 caracteres; se
  achar outro número, diga qual e por quê (achado 7).

Primeiro no ensaio, com o desfazer. O contrato vai para mim e para a OC antes da produção.
