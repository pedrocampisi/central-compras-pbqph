# D957 — As ferramentas da OC estão na `mcp` do ensaio, com o teste das portas

**De:** Banco_de_Dados
**Para:** CTO (cópia à Ordem_de_Compra e à Central)
**Data:** 26/10/2026, 19h0x (hora de São Paulo)
**Responde:** `..._D957-as-ferramentas-da-OC-na-mcp.md`
**Espera:** a tela da OC e a página da Central no ensaio, e depois a perícia das três casas juntas.

**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

**A `mcp` do ensaio está na versão 7, com as três ferramentas da OC.**
- A produção continua na versão 3 e não foi tocada. A trava da produção no `implantar_funcao.py` segue baixada.
- O teste das portas deu verde, e as três iscas foram pegas.

## §2 — O que mudou no `supabase/functions/mcp/logica.ts`

No padrão das quatro que já existiam:

| ferramenta | chama | marca |
|---|---|---|
| `buscar_fornecedor_e_obra_da_oc` | `core.ia_buscar_para_oc` | só lê |
| `buscar_ordens_de_compra` | `core.ia_buscar_ocs` | só lê |
| `propor_rascunho_de_oc` | `core.ia_propor_rascunho_de_oc` | não grava. O `inputSchema` é fechado: de 1 a 60 itens, sem `status`, `oc_id`, `versao`, `numero` nem `origem` |

**O `tools/list` lê os dois campos novos da `core.ia_quem_sou`:**
- `ordem_de_compra` (a régua da tela, com a marca) mostra as duas buscas da OC;
- `ordem_de_compra` e `grava_oc` juntos mostram a proposta. Se o banco disser um sem o outro, vale o "não";
- o `confirmar` aparece para quem grava na Central **ou** grava na OC;
- **não saber é não:** se o banco falha ou responde torto, nenhuma ferramenta da OC aparece.

**Os outros pontos:**
- **O `tools/call`** só recusa cedo o que não tem forma (texto que não é texto, rascunho sem lista de itens). As
  chaves, o teto e as contas, quem confere é o banco.
- **O log** continua só com nomes fixos: os três nomes novos entraram na lista, e nada do que chega nos argumentos é
  escrito.
- **As instruções** ganharam a frase aprovada: "Para montar uma OC: busque o fornecedor e a obra, proponha o
  rascunho, mostre à pessoa cada linha e o total, e só então confirme. A OC nasce rascunho: emitir é na tela da
  Ordem de Compra."
- **A descrição do `confirmar`** passou a citar o rascunho da OC.

## §3 — O teste das portas (`testes-funcoes/mcp.test.ts`)

São nove casos novos, no Node, com o banco e a porta de login de mentira, como os de antes.

| porta | o que o teste exige |
|---|---|
| quem abre a OC e grava | vê as sete ferramentas; a proposta com o esquema fechado e sem os campos da emissão |
| **quem tem a marca `sem_ordem_de_compra`** | **não vê nenhuma ferramenta da OC**, grave na Central ou não; e `grava_oc` sem `ordem_de_compra` também não mostra a proposta |
| **o "só busca"** | **vê as duas buscas da OC e não vê a proposta nem o `confirmar`** |
| quem abre a OC mas não edita o cadastro | vê a proposta e o `confirmar`, e não vê as propostas da Central |
| o banco que falha ou responde torto | nada da OC aparece |
| as chamadas | cada ferramenta chama a sua função, no perfil `core`, com o token da pessoa; o que não tem forma não chega ao banco |
| a recusa da marca | volta como erro da ferramenta, com a frase do banco |
| **o log** | só os nomes fixos; **um nome fora da lista (`emitir_oc`, ou um nome com um CPF dentro) vira "desconhecida"**; nada do rascunho entra |
| as instruções | dizem que a OC nasce rascunho e que emitir é na tela |

**As três iscas**, cada uma sabotando a `logica.ts` no disco, com o arquivo devolvido byte a byte no fim:

| a isca | resultado |
|---|---|
| a marca não esconde as buscas da OC | pega |
| o "só busca" vê a proposta | pega |
| o log escreve o nome que veio | pega |

**As funções de borda inteiras** (`node --test testes-funcoes/*.test.ts`) dão 102 verdes, 1 pulado (o mesmo de
antes) e 0 falhas.

## §4 — No ar, no ensaio

1. Antes de publicar, conferi o que estava no ar no ensaio, a versão 4: era o mesmo texto do último commit. A
   diferença de bytes era só a quebra de linha, porque aquela versão foi publicada do disco do Windows.
2. Publiquei a nova. O `--conferir` diz que o publicado é o disco, byte a byte.
3. **O desfazer, provado no ensaio:**
   - publiquei o `--do-commit df57f97` (a `mcp` de antes) como versão 6, e o `--conferir` disse "igual ao commit,
     byte a byte";
   - depois publiquei a nova de volta, como versão 7, e o `--conferir` disse "igual ao disco".
4. **Pela rede, sem credencial:** o documento do recurso responde 200, e uma chamada sem token recebe 401 com o
   `resource_metadata`. A função está viva.

**O que não provei pela rede:** o `tools/list` com o token de uma IA de verdade. Esse token só nasce do login OAuth
de uma pessoa, e agente não entra com login. A prova está em duas metades que se encontram:
- a do banco: o `ia_quem_sou` com os claims de uma IA, na bateria `teste_oc_no_mcp.sql`, cenários 3 a 7;
- a da função: o teste das portas acima.

A prova de ponta a ponta é a primeira ligação do Antigravity no ensaio, pela pessoa, se o senhor quiser antes da
produção.

## §5 — Quem já ligou

Nada a refazer, e nada foi forçado. As ferramentas aparecem na próxima vez que a IA listar. Nenhuma sessão foi
tocada.

## §6 — O que não fiz

- Nada na produção: nem banco, nem função.
- Nenhuma linha na tela da OC nem na página da Central.
- Nenhum comando pediu licença.

— Banco_de_Dados
