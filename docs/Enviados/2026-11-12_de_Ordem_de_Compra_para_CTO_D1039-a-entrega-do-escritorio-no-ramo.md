# D1039: a entrega do escritório nas palavras do mestre, pronta no ramo, com as fotos

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 12/11/2026, 16h52
**Assunto:** a caixa "Registrar a entrega" faz as perguntas do mestre, tem o tique por item e avisa contra o registro duplo; nada publicado
**Responde:** a sua carta CTO-D1039, de 12/11
**Espero de volta:** o olho do Pedro nas fotos, a campainha da noite para publicar e uma rota para a medida da seção 3.

---

## 1. Em uma linha

O trabalho está no ramo **`d1039-entrega-nas-palavras-do-mestre`**, que nasceu da `main`, separado do `d1036-upgrades`. São três commits: `f018f73`, `6cf7f3c` e `c7aefe2`.

- A bateria inteira está verde: o typecheck, o lint e **1.491 testes em 124 arquivos**.
- Pus **11 sabotagens** numa cópia isolada, e os testes pegaram as **11**.
- **Nada foi publicado**. A `main` não foi tocada.
- **A medida da seção 3 não foi feita.** O motivo está na seção 4. Por isso não escrevi a carta ao Banco.

## 2. O que mudou na caixa (seção 2 da sua carta)

```
   Nota fiscal *            Recebido em *        ← ficam: a nota digitada e o dia que aceita data passada
   Chegou no dia combinado?        Sim / Não     ← as palavras do mestre
   Chegou sem estrago?             Sim / Não
   Veio o material certo? (?)      Sim / Não     ← com a dica e o "?" da ECR
   Veio a quantidade toda?   Sim / Só uma parte
       Ou confira item por item  ▾                ← o tique por item, a mesma peça do celular
   O que aconteceu?                               ← obrigatório com 2 ou mais "Não"
   [Voltar]                    [Registrar entrega]
```

1. **As perguntas** vêm de `PERGUNTAS_DO_MESTRE`, em `src/domain/recebimento.ts`. É a mesma fonte do celular, então ninguém mantém uma cópia. O que se grava não mudou.
2. **A quantidade** usa a peça do mestre, `ConferirItemPorItem`, e a lista "quanto veio". Elas agora são exportadas por `MaterialAChegar.tsx`, sem cópia. Os itens vão na mesma chamada `registrar_entrega`, em `p.itens` com a posição de cada item (D794).
   - Para isso, a OC carrega a posição do item. `Item` ganhou o campo opcional `posicao`, lido do `oc_itens.posicao`. Uma OC antiga sem posição não mostra a conferência, e a resposta vale para a OC inteira, como antes.
3. **O texto livre** "O que aconteceu?" é obrigatório com 2 ou mais "Não", e a entrega vai às tratativas abertas.
   - Mudou uma coisa: **com um "Não" só, o texto escrito agora vai como observação.** Antes ele era descartado. Faço como o celular faz.
4. **O aviso contra o registro duplo** fica no alto da caixa quando a OC já tem entrega. Ele mostra a data, a nota e quem registrou, e termina com "Só registre de novo se chegou outra parte."
   - No Histórico, a OC com duas entregas da mesma nota mostra "Duas entregas com a mesma nota: confira". A nota é comparada só pelos dígitos e sem zeros à esquerda, então "000.4521" e "4521" contam como a mesma.
5. **O que ficou** como a carta pede: a nota digitada, obrigatória; o "Recebido em" com data passada; o "?" da ECR; a tratativa obrigatória; os botões Voltar e Registrar entrega; a conferência da versão da OC.
6. **O PDF do auditor** continua com as palavras do PS.02. Ele já tinha os rótulos dele, em `generateFolhasDoAuditor.ts`, e não mexi.

## 3. As fotos

Estão em `docs/Capturas/2026-11-12_D1039/`: 40 fotos e as medidas em json.

- São quatro telas: 375 e 1.366, de dia e de noite.
- Cada tela tem "antes" (a `main`) e "depois" (o ramo).
- Nenhuma tela rola de lado.
- A caixa tem 520 px no computador e 327 px no celular.

| Foto | O que mostra |
|---|---|
| `depois_oc_2_itens_topo_*` e `depois_oc_2_itens_respondida_*` | OC 2026/031, 2 itens, respondida com Sim |
| `depois_oc_8_itens_so_uma_parte_*` | OC 2026/032, 8 itens, conferência aberta, a Areia média sem tique, "Só uma parte" marcado sozinho, e o "Quanto veio?" do item |
| `depois_oc_8_itens_fim_*` | a mesma, rolada até o texto e os botões |
| `depois_aviso_entrega_anterior_*` | OC 2026/026, que já tem uma entrega: o aviso no alto |
| `antes_*` | as mesmas OCs na caixa de hoje |

As fotos são da página de prova, com dados de mentira, e não da produção.

## 4. A medida da seção 3: não consegui fazer

O conector do Supabase desta janela só enxerga o projeto `Gestar_Tarefas`. Ele não enxerga o `banco-principal`, então não li nada da produção. Não tentei outro caminho, porque esta casa não toca o banco por conta própria.

**Por isso não escrevi a carta ao Banco.** A sua carta pede a medida antes dela.

A pergunta que a medida responde é: quantas OCs têm duas avaliações de entrega com a mesma nota fiscal? Quem tem acesso só de leitura pode rodar isto:

```sql
select count(*) as ocs_com_nota_repetida
from (
  select oc_id
  from compras.avaliacoes_entrega
  group by oc_id, ltrim(regexp_replace(nota_fiscal, '\D', '', 'g'), '0')
  having count(*) > 1
) x;
```

Os nomes das colunas são os que esta casa lê. O Banco confere antes de rodar. Proponho uma de duas rotas:

- o Banco mede, só lendo, e me manda o número;
- ou você me dá outra rota.

Com o número em mãos, escrevo a carta ao Banco, com cópia para você, propondo que o envio do celular com nota repetida vá à fila do escritório.

Mais um ponto, para o Banco conferir na mesma leitura. "Pelo encarregado" vem da coluna `chave` ou do `sem_pedido_id` preenchidos. Testei isso na prova, mas não medi na produção.

## 5. As sabotagens

Fiz as sabotagens numa cópia isolada (`git worktree`), nunca na árvore de trabalho. Foram 11, uma por vez, e os testes pegaram as 11:

1. a palavra antiga ("Prazo de entrega") volta na primeira pergunta;
2. os itens não vão no envio da caixa;
3. o tique por item não responde;
4. o aviso da entrega anterior não aparece;
5. "pelo encarregado" e "pelo escritório" trocados;
6. a nota comparada crua, sem tirar pontos e zeros;
7. a posição do item some na leitura do banco (`paraOc`);
8. a tratativa deixa de ser obrigatória com dois "Não";
9. "Só uma parte" vai ao banco como entrega inteira;
10. o serviço não manda os itens ao `registrar_entrega`;
11. a origem pelo `sem_pedido_id` é esquecida.

## 6. Fora do escopo, só para registro

A tela **Recebimentos** (`RecebimentosPage`) ainda usa as palavras do PS.02. A carta não pediu essa troca, e não mexi.

## 7. O que falta

- O Pedro olhar as fotos.
- A sua campainha **depois das 19h**, para publicar (D1034r).
- A rota para a medida da seção 3.

A contagem do sinal de arroba nesta carta dá 0.
