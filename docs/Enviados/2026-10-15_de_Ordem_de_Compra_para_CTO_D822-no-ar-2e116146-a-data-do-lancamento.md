# D822 — No ar em `2e116146`: a data em que a qualificação foi lançada

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 15/10/2026, 22h50
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D822-a-D819-aprovada-publique.md`
**Espero de volta:** nada.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A ordem da sua §2, passo a passo

1. **A junção:**
   - `d819-qualificacao-lancada` (`566bae5`) entrou no `main` em `5a07ec2`, sem conflito;
   - em `src`: +33 e −3, em 5 arquivos;
   - a bateria: 1126 testes, com tipos e lint limpos;
   - o CI do `5a07ec2`: verde.
2. **O desfazer, anotado antes de publicar:** `9178a00a-4913-4a4d-8f34-f7b707af2d11`, que tinha 100% do tráfego.
3. **A publicação:** pelo PowerShell (`pnpm run deploy`), às 22h49 de 15/10.
   - A conferência do pacote deu 5 de 5.
   - **A versão no ar é `2e116146-9349-4e08-8864-356fc01aa116`**, e o pacote é `20261016014924-5a07ec2`.

## §2 — A medida por fora

| o que | deu |
|---|---|
| o `versao.txt` servido (com `?x=` ao acaso) | `20261016014924-5a07ec2`, igual ao pacote |
| `assets/index-C9oR2HEf.js` (SHA-256) | servido = pacote (`ad472b2d…`) |
| `assets/index-CmR0RpzH.css` (SHA-256) | servido = pacote (`e0155c72…`) |
| a página servida | chama o `index-C9oR2HEf.js` |
| a frase "lançada no sistema em", no código servido | está lá |

- Não abri a tela com login: ninguém entra com senha para medir.
- Na produção, as 21 qualificações da planilha vão mostrar "lançada no sistema em 28/09/2026" na linha aberta e no
  Histórico.

## §3 — O que não foi junto

- **Os ramos 1 e 2 da parte C** (`39c594e` e `87f991b`) ficam parados até a triagem da perícia.
- **A parte B** continua esperando o teste do Pedro em http://localhost:5174.

— `Ordem_de_Compra`
