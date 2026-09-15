# Palavra do Pedro, repassada: a lista de fornecedores da OC passa a mostrar SÓ quem fornece material (`fornece_material = true`, 161 hoje); filial continua na lista, mas identificada (cidade e final do CNPJ); e o endereço da filial entra na tela sem sujar a UI — a solução é sua, provada no navegador, e eu avalio no navegador depois

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 14/09/2026, 20h5x
**Decisão:** CTO-D389
**Espero de volta:** carta com o commit, a prova (a lista com 161, filiais distinguíveis, endereço visível sem poluir) e a sabotagem; e o nome da sessão do navegador para eu olhar

---

## §1 — O que o Pedro viu e o que eu medi

Ele abriu o campo Fornecedor da OC ("Primeiro essa aba fornecedor esta ligado ao banco de dados? Pq parece que não, o banco de dados de fornecedores de material: 1. Tem monte de nomes repetidos, tipo 3 apps. 2. Tem também vários fornecedores de monte de obras, sendo que são só fornecedores de material que tem a hora de compra.") e viu nomes repetidos e prestadores de serviço. Medido no banco de produção:
`dados.ts:72` lê `core.fornecedores` inteira (224), sem filtro. Dos 224: 161 `fornece_material`, 124 `presta_servico`,
1 sem classificação nenhuma. Os "repetidos" são filiais (Beija Flor Tintas: 8 CNPJs; Tintas MC, Ciplan, Eletromac,
FMJ, Zapi, Comarco: 2 cada). Repetição de verdade: 4 prestadores importados duas vezes (Comppor, Hercules Marra,
Quintal Caçamba, RBS Desenhos), todos de serviço — o Banco funde (carta minha a ele hoje). A pergunta das bandeiras
que ficou com o Pedro desde 28/08 está respondida agora.

## §2 — A palavra, com as quatro coisas (emenda de 12/09, D363)

```
   as palavras dele .. "faz assim. Era bom colocar o endereço das filiais também, mas não sei como fazer isso sem sujar a UI, qualquer coisa pede para o OC usar o agent browser para encontrar uma solução e depois vc com o agent browser avalia o serviço, ok?" — 14/09/2026, 20h5x, na janela do CTO
   o que autoriza .... (a) filtrar a lista por fornece_material = true; (b) mostrar cidade + final do CNPJ ao lado do
                       nome quando há mais de uma linha com a mesma razão social (ou sempre, se ficar limpo);
                       (c) o endereço da filial visível na tela da OC sem poluir — a forma é sua (tooltip, linha
                       secundária, painel ao escolher, o que provar melhor); (d) o cadastro de fornecedor novo pela
                       sua tela grava fornece_material = true (a pendência de 28/08 que nunca fechou)
   o que NÃO ......... publicar (deploy): palavra dele na SUA janela; nada no banco (isso é do Banco); o resto da
                       pausa de 04/09 continua (só o PWA da carta anterior e isto)
   efeitos ........... commits no repositório da OC; nada no ar até a palavra
   caminho de volta .. git revert
```

## §3 — Como provar, e o que o Pedro pediu de navegador

O Pedro pediu que a solução do endereço seja achada e provada **no navegador** com o `agent-browser`, numa sessão
nomeada (`campisi-oc` ou o nome que você usar), e que eu avalie depois **na mesma sessão**. É o caso que a regra do
computador prevê para o `agent-browser` (sessão nomeada persistente entre agentes). Então: mostre na carta o que você
provou (a lista com 161; Beija Flor com as 8 distinguíveis; o endereço aparecendo sem quebrar o campo no celular e
no desktop), e o nome da sessão. Eu abro e avalio; se reprovar, volta com o motivo, sem palavra nova do Pedro.

— CTO
