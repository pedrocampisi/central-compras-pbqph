# Pendências — Ordem de Compra

> **Data:** 04/11/2026
> **Estado:** VALE HOJE
> **Escopo:** só o que **esta casa** tem aberto. Fechado vai ao [`Arquivo_Morto/PENDENCIAS_FECHADAS.md`](Arquivo_Morto/PENDENCIAS_FECHADAS.md) no mesmo commit da decisão que fecha (D429, D972). O texto de antes da limpeza de 04/11/2026 (D972) está em [`Arquivo_Morto/PENDENCIAS_ate_2026-11-04.md`](Arquivo_Morto/PENDENCIAS_ate_2026-11-04.md). Teto: 300 linhas.

Número de item não se reaproveita (carta enviada aponta para ele). Fechados desde a última limpeza: 30, 36, 40, 41, 42, 43.
Pausa do Pedro de 04/09: trabalho novo só por carta do CTO; se a pausa ainda vale, não conferi.

## 🔴 Abertas

### 44. A OC no mesmo MCP (D953 a D961)
Tela no ar (`6bb4a34d`, dec. 147) e `regra_da_oc` na produção. **Falta:** a `mcp` (Banco), a página (Central) e o teste de gente no Antigravity (D961h, do CTO).

### 28. O app do mestre de obra (D693, D696)
No ar desde 05/10 (`73d2b3db`, dec. 88), conferido pelo CTO. **Espera:** o primeiro uso (D716); o engenheiro escolhido pelo Pedro cadastra o primeiro mestre. No dia, esta casa fica de prontidão.

### 31. O QR do mestre e o celular que guarda, em aparelho de verdade
Provado em teste e fotos sobre banco falso. **Espera:** o primeiro uso na produção, com o engenheiro ao lado.

### 37. O tutorial da Nova OC e a frase do 502 (D763 a D765)
No ar (`656d33e5`, dec. 101). **Espera:** a conferência do CTO por fora e o teste do Pedro com uma pessoa de verdade.

### 38. Ícone, perguntas, lista do mestre e "Só uma parte" (D792 a D797)
No ar (decisões 103 e 105). **Espera:** a medida do CTO da primeira entrega com itens; o Pedro e cada mestre trocarem o ícone no celular (remover e pôr de novo).

### 39. "Encarregado" nas telas e no rascunho do PS.02 (D799, D800)
Tudo desta casa está no ar (dec. 107 e 109). **Fora daqui:** o Banco trocar as recusas que dizem "mestre" (D800).

### 33. A coluna ECR da tabela de itens, a 375, corta o código
Aberta em 05/10 (dec. 90). No celular a coluna não mostra qual ECR o item tem. Para depois.

### 34. A pergunta longa do critério passa por cima da borda da caixa
Aberta em 05/10 (dec. 90). No "Qualificar", a legenda cruza a borda a 375 e a 1366. Para depois.

### 13. A sessão `campisi-oc` venceu: prova de tela logada parada
Aberta em 25/09 (dec. 34). Sem login de programa (D536): o Pedro entra uma vez com a Conta de ensaio, com o `restore` armado antes. Não segura publicação.

### 5 (passo 6). Trocar as cópias do atalho nas máquinas
O resto da virada fechou (03 e 04/09). Falta só a arrumação dos atalhos antigos. Se o `wrangler` reclamar do registro de DNS velho (`pedrocampisi.github.io`): parar e avisar, não apagar.

### 2. Dívida: `extractItems.ts` lê o endereço do banco sem conferir se veio
De 02/09, não é defeito vivo (a publicação sem endereço não sai mais). `client.ts:15` estoura se faltar; `extractItems.ts` lê `VITE_SUPABASE_URL` sem checar. Junto: banco gratuito pausado mostra o erro cru na tela. Construção, quando o CTO liberar.

### 3. A minha conferência de segurança é de mão e confunde menção com uso
De 02/09. A varredura antes de cada publicação é um comando avulso; acusa frase que proíbe a chave e `Eyj` dentro de base64 do lockfile. Quando virar peça: ler a árvore do código, JWT sensível a maiúsculas e ancorado; sobre texto, declarar que confunde menção com uso. Até lá, cada achado é conferido um a um.

### 4. A camada que fala com o banco não tem verificação nenhuma
Decidida em 28/08 (dec. 86 do CTO). 730 linhas, zero testes: verde aqui não quer dizer "grava certo". Gatilho: virada fechada e cadastro de fornecedor usando a fila de aprovação do banco. Caminho: ensaio contra o banco de ensaio, nunca dublê. O item é meu e espera o gatilho.
