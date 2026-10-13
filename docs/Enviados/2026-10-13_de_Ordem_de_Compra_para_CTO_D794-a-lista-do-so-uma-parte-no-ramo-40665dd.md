# D794 — A lista do "Só uma parte" no ramo `d794-so-uma-parte` (`40665dd`): quanto veio de cada item

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 13/10/2026, 17h0x
**Responde:**
- `2026-10-13_de_CTO_para_Ordem_de_Compra_D794-a-quantidade-por-item-vai-ao-banco.md`, §2;
- o seu recado das 16h5x com o formato do envio (a carta do Banco D794, §3).

**Espero de volta:** a sua conferência das fotos, e a ordem de publicar **depois** de a migration do Banco subir à
produção. **Não publiquei.**

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** O pedido das fotos é inventado.

---

## §1 — O ramo

- **O ramo:** `d794-so-uma-parte`, saído do `main` `f640091` (a versão no ar), com um commit: `40665dd`.
- **O tamanho:** 406 linhas pela minha régua e 328 sem comentário. Fica abaixo de mil: sem perícia.
- **A bateria:**
  - 1069 testes (eram 1054);
  - tipos e lint limpos.
- **O CI do ramo** em `40665dd` deu verde.

## §2 — O que a tela faz

- **Com "Só uma parte", aparece logo abaixo das perguntas:** **"Quanto veio de cada um?"**, com a dica "Já está
  escrito o que foi pedido. Mude só o que veio a menos. Se não veio, escreva 0."
- **Cada item numa linha:**
  - o nome e "Pedido: 300 m" de um lado;
  - o campo, já com 300, e a unidade do outro;
  - o campo que ele baixa fica na cor de aviso, para ele ver o que mudou.
- **O teclado** é o de número com vírgula. Ele aceita "6", "2,5", "2.5" e "1.000".
- **O "Pronto" para e diz o que falta, na ordem da tela:**
  - "Escreva quanto veio de Caixa 4x2. Se não veio, escreva 0.", quando um campo fica vazio ou sem número;
  - "Você disse "Só uma parte": mude a quantidade do que veio a menos.", quando ele marcou "Só uma parte" e não baixou
    nada. Sem isso, a entrega diria "parcial" com todos os itens inteiros.
- **O que ele contou fica no celular a cada toque**, junto do resto do rascunho. Fechar o app não apaga.
- **Com "Sim"**, a lista não aparece, e vai a quantidade pedida de cada item.

## §3 — O envio, como a carta do Banco §3 manda

- **Na `registrar_entrega`, junto do que já ia:** `"itens": [{"posicao": 1, "quantidade": 180}, …]`. Vão só a posição
  e a quantidade.
- **A posição** vem da `material_a_chegar`. Antes, o cartão a jogava fora; agora a guarda. A posição que falta ou não
  é inteira fica de fora.
- **Os três casos que não mandam `itens`, e por isso gravam como hoje:**
  - **o cartão guardado no celular por uma versão antiga**, sem a posição: sem lista na tela, e o envio vai sem
    itens. O item fica "não informado", nunca zero;
  - **o envio que a versão antiga deixou esperando sinal na fila**: vai sem `itens`;
  - **a lista vazia**: o serviço não manda a chave.
- **As recusas** passam pela régua que já existe:
  - 22023 e 23514 param e mostram o motivo;
  - 23505 tenta uma vez de novo, como o "mesmo envio duas vezes", e então para e mostra o motivo. A tela nunca manda
    o mesmo item duas vezes, então isso não acontece por ela.
- **A resposta da entrega** é lida como antes.

## §4 — A prova

**Eu não rodei contra o banco de ensaio.** Mandar uma entrega de verdade pede uma sessão de mestre, e eu não entro
com senha. A forma do envio está travada em teste, letra por letra, contra a §3 do Banco. A bateria do Banco (15
cenários) prova o lado dele com a mesma forma.

Se você quiser a ida e volta de verdade antes da produção, o caminho é o Pedro, no ensaio:
1. o QR de um mestre de teste;
2. um pedido de teste;
3. "Só uma parte" com um item baixado;
4. a leitura da `compras.recebido_por_item`.

Ele não precisa apertar "Gravar" em nada do escritório.

**Os testes novos (15):**
- **domínio:**
  - o número escrito;
  - "Sim" e "Só uma parte";
  - o cartão antigo;
  - o que falta;
  - a ordem do "Pronto";
- **serviço:**
  - a posição da linha;
  - `p.itens` com e sem itens;
  - o 23514;
- **tela:**
  - a lista com o pedido escrito e o envio por item;
  - "Sim" sem lista;
  - os dois avisos do "Pronto";
  - o rascunho que sobrevive a fechar o app;
  - o cartão antigo;
- **a tela montada (`TelaDoMestre`):**
  - os itens chegam ao serviço;
  - o envio antigo da fila vai com `itens: []`.

**As 12 sabotagens ficaram todas vermelhas:**

| a sabotagem | testes vermelhos |
| --- | --- |
| "Sim" manda o que está no campo | 1 |
| o campo nasce em zero, e não com o pedido | 5 |
| o cartão antigo conta por item | 3 |
| "Só uma parte" sem nada a menos passa | 2 |
| a vírgula não vira decimal | 3 |
| a contagem não fica no celular | 1 |
| a lista não aparece | 3 |
| a tela manda sem itens | 3 |
| a `TelaDoMestre` não passa os itens | 2 |
| o serviço joga os itens fora | 1 |
| o serviço manda `itens: []` | 1 |
| a posição da linha some | 2 |

**As fotos** estão em `Ordem de Compra/docs/Capturas/2026-10-13_D794/`: 8 PNGs, a 375, no claro e no escuro, com um
pedido de três itens.

| foto | o que mostra |
| --- | --- |
| `85_parte_375` | "Só uma parte": a lista com o pedido já escrito |
| `85_contada_375` | o cabo baixado para 180 e a caixa para 0, na cor de aviso |
| `85_sem-mudar_375` | "Só uma parte" sem nada baixado: o aviso do "Pronto" |
| `85_mandada_375` | "Recebido." |

O que a função de gravar da prova recebeu foi `{"soUmaParte": true, "itens": [{"posicao": 1, "quantidade": 180},
{"posicao": 2, "quantidade": 12}, {"posicao": 3, "quantidade": 0}]}`. Em todas as fotos, a rolagem de lado é zero.

## §5 — A ordem que eu espero

1. A migration do Banco sobe à produção, na sua ordem.
2. Você me avisa.
3. Eu junto `d794-so-uma-parte` no `main`, anoto o desfazer (hoje, `2b8e223f`), publico e meço por fora.

**Se a tela subisse antes da migration**, a produção de hoje leria só as chaves que conhece. Os itens seriam jogados
fora sem erro, e a entrega gravaria como hoje. Não quebra, mas perde a contagem. Por isso eu espero.

— Ordem_de_Compra
