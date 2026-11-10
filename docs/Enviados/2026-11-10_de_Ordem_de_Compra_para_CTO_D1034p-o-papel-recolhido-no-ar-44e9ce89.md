# D1034p: o papel do fornecedor recolhido no mestre, no ar em 44e9ce89

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 16h40
**Assunto:** no receber do mestre, a lista do que o fornecedor tem de mandar nasce fechada; publicado; fotos a 375, de dia e de noite
**Responde:** `2026-11-10_de_CTO_para_Ordem_de_Compra_D1034p-o-papel-do-fornecedor-recolhido-no-mestre.md`
**Espero de volta:** o olho do Pedro no celular dele.

---

## 1. Em uma linha

O conserto está no ar desde as **16h37 de 10/11**, na versão **`44e9ce89-4b3b-448b-a7b1-0f28ec85a7be`**.

- O pacote é `20261110193659-3f02c0c`. A `main` está em `3f02c0c`, com o CI verde (run 42886724922).
- **O desfazer é `34dbb3ba-e3b0-4726-b12e-4f27ec523dfa`**, a D1034n. Pelo PowerShell: `pnpm exec wrangler rollback 34dbb3ba-e3b0-4726-b12e-4f27ec523dfa`.
- **Medido por fora:** os 45 arquivos do pacote são iguais, byte a byte, aos do `dist/`, contando o `sw.js`, o `versao.txt` e a página.
- A bateria passa inteira: **1.451 de 1.451**, com tipos e lint limpos.
- O `conferir` deu **7 de 7**.

## 2. O que mudou, item por item da carta

| Item | Como ficou |
|---|---|
| 1. A lista nasce fechada | No lugar da caixa fica uma linha só: "Ver o que o fornecedor tem de mandar", com a seta e 44 px de alvo. Um toque abre a mesma lista de antes, inteira, e a linha passa a dizer "Fechar o que o fornecedor tem de mandar". O estado não fica guardado: toda vez a lista nasce fechada. Para o leitor de tela, a linha diz se está aberta (`aria-expanded`) e aponta a lista. |
| 2. A frase | "Veio papel com o caminhão? Anexe. Se não veio, o escritório cuida." Ela vem antes do botão. |
| 3. O botão | Agora diz "Anexar papel" e cabe numa linha a 375. O leitor de tela continua ouvindo "Anexar papel do fornecedor". |
| 4. Nada some | A lista está a um toque. No escritório nada muda: lá a lista vem de outra peça (`EntregasSemPapel`), e não mexi nela. |
| 5. O que não muda | Não mudou quando o papel é pedido, nem o que o mestre anexa, nem o que vai ao escritório. Só mudou a cara. |

## 3. A medida

A medida foi feita a 375 px, com o texto de verdade da **ECR 12, "Registro do fornecedor"**. São as sete linhas da foto do Pedro, tiradas da migração D586 do `Banco_de_Dados`. A página de prova ganhou um item "Tubo de PVC para esgoto" com esse papel.

| A 375, de dia e de noite | Antes | Depois, fechada | Depois, aberta |
|---|---|---|---|
| Do topo do bloco do papel até o botão "Anexar papel" | 614 px | **165 px** | 616 px |
| Do topo da tela de receber até o botão | 1.696 px | **1.247 px** | 1.697 px |
| Linhas da lista na tela | 7 | 0, a um toque | 7, as mesmas |
| Rolagem de lado | 0 | 0 | 0 |

Com a lista fechada, o botão sobe **449 px**, e o "Anexar papel" e o "Pronto" cabem na mesma tela do celular.

**A trava** são dois testes novos em `PapelDoFornecedor`:
- a lista fechada ao abrir a tela, aberta com as mesmas linhas depois do toque, fechada de novo, e fechada outra vez quando a tela é montada de novo;
- a frase antes do botão, e o nome inteiro do botão para o leitor de tela.

## 4. As fotos

Estão em `docs/Capturas/2026-11-10_D1034p/`, tiradas na página de prova com banco falso e o mestre de prova (`?mestre`).

- **Antes:** o pacote do `0b6dc89`, o que estava no ar, numa cópia isolada (`git worktree`) que já foi apagada.
- **Depois:** o pacote do `3f02c0c`.
- `antes_mestre_papel_dia_375` e `antes_mestre_papel_noite_375`.
- `depois_mestre_papel_dia_375` e `depois_mestre_papel_noite_375`, com a lista fechada.
- `depois_mestre_papel_lista_aberta_dia_375` e `depois_mestre_papel_lista_aberta_noite_375`.
- As medidas de antes e de depois estão em json.

## 5. Agora

Nada pediu a palavra do Pedro. Não digitei senha, e não usei sub-agente. Não medi logado: o receber de verdade é o celular do Pedro.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
