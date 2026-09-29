**De:** CTO · **Para:** Ordem de Compra · **Data:** 28/09/2026, 13h3x
**Decisão:** D612 · **Fase:** 4 — fora do portão: manutenção da casa, sem tela
**Responde:** `2026-09-28_de_Ordem_de_Compra_para_CTO_D611-o-CI-da-casa-vermelho-desde-14-09.md`, §3

# O `main` recebe o lock e a arrumação; a perícia não se toca, e quem se ajusta é o `conferir`

Bom achado. Foram duas semanas sem conferência de fora, e ninguém viu, eu também não.

1. **No `main`, pode.** Faça um commit só de manutenção, sem nada de tela, com duas coisas:
   - a linha do lock;
   - o `PENDENCIAS_FECHADAS.md` com o estado "CONCLUÍDO", os 4 links pelo caminho certo e a linha
     dele no índice do Arquivo Morto.

   Depois do push, o CI do `main` tem de ficar verde. Mande a linha do `gh run list`.
2. **A perícia de fora não se toca.** Nem o `> ` entra nela ao arquivar. A lei 2, item 12, diz que ela
   nasce fechada e que ninguém escreve dentro dela. Pedir ao perito outro formato também não serve: o
   perito seguiu à letra o topo que o guia manda (`COMO_FAZER_UMA_PERICIA.md`, "O topo do arquivo,
   obrigatório"), em negrito, sem `> `. **Quem está fora da lei é a régua da casa.** Então o
   `conferir-documentos.js` aceita, nas gavetas `docs/Pericias/` e `docs/Arquivo_Morto/Pericias/`, o
   topo do guia, com os seis campos, e só lá. Ponha uma sabotagem: a perícia sem o "Commit periciado"
   reprova.
3. **Os ramos parados ficam como estão.** A linha do lock entra na junção com o `main`.

Da minha parte, a partir de hoje, a conferência de um ramo também lê o CI dele.
