# D641 e D643 — prontas no ramo, esperando a sua linha sobre as fotos

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 29/09/2026, 23h2x
**Responde:** `2026-09-29_de_CTO_para_Ordem_de_Compra_D641-a-tela-de-fornecedores-por-empresa.md` e
`2026-09-29_de_CTO_para_Ordem_de_Compra_D643-o-titulo-de-cada-tela-aparece-uma-vez.md`.
**Espero de volta:** a sua linha sobre as fotos. **Nada foi publicado.** Com a linha, publico pela emenda 3 e mando o
`versao.txt`.
**O banco não mudou.** A §4 foi só leitura.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** Os CNPJs das fotos são inventados.

---

## §1 — O ramo

- **Ramo:** `d641-fornecedores-por-empresa`, a partir do `main` `c0f0899`.
- **Commits:**
  - `548b165` — as duas cartas;
  - `4ca0741` — um conserto que as fotos mostraram (§3) e as fotos.
- **CI verde nos dois** (execuções 36658267383 e 36659529600).
- **Tamanho fora de `docs/`:** 11 arquivos, +753 −145. Em `src/`: 7 arquivos, +442 −134. Longe de mil: sem perícia,
  como a D641 §3 diz.
- **Bateria no ramo:**
  - 609 testes em 47 arquivos, todos verdes;
  - no `main` eram 589: são 13 novos da D641 e 7 da D643;
  - tipos, lint e build limpos (build pelo PowerShell).

## §2 — O que mudou na tela

**D641, a aba Fornecedores:**
- Uma linha por empresa, pelo `agruparPorEmpresa`, em ordem de apelido.
- Embaixo do apelido: a razão social (as distintas, se as filiais diferem) e "N filiais · cidades".
- Um selo por empresa. CNPJ, contato e cidade saíram da linha da empresa.
- Clicar abre as filiais logo abaixo, recuadas. Cada uma mostra:
  - a cidade, e a rua quando a cidade empata (como a D542);
  - o CNPJ, o contato e o ativo;
  - o "Editar", que abre a mesma gaveta.
- A empresa de uma filial só fica num nível. A filial sem `empresa_id` vira empresa sozinha.
- **Ativo:** quando as filiais discordam, a empresa diz "N de M ativas". "Ativos" mostra a empresa com alguma filial
  ativa; "Inativos", a empresa com alguma inativa.
- **Busca:** pelo apelido e pela razão, fantasia, CNPJ (com ou sem pontuação), e-mail e cidade (sem acento) de
  qualquer filial. Se der uma empresa só, as filiais abrem sozinhas, e a filial que casou fica marcada ("achada pela
  busca").
- **Contador:** "N de M empresas · X filiais".
- **Não mudaram:** "+ Novo Fornecedor", "PDF dos qualificados", a gaveta, a ficha e o banco.

**D643, o título uma vez:**
- A barra do alto ficou com "Central de Compras" e o estado do banco. O título mora só no cabeçalho da página.
- **O Dashboard não tinha título na página** (só na barra): ganhou o seu, para o nome não sumir.
- **Uma contradição saiu junto:** editando um rascunho, a barra dizia "Nova Ordem de Compra" e a página dizia "Editar
  OC". Agora só a página fala.
- Os dois testes antigos que olhavam o título na barra passaram a conferir que ele aparece uma vez.

## §3 — Duas decisões minhas, para você conferir

1. **A marca da busca só aparece quando separa.** A foto da busca pelo nome da empresa mostrou "achada pela busca" em
   todas as filiais, porque o nome está na razão e no e-mail de cada uma. Marcar todas não diz nada.
   - **A regra ficou:** marca a filial que casou só quando ela casou e alguma irmã não.
   - **O teste novo:** a razão comum às três filiais acha e abre, mas não marca nenhuma.
   - Se preferir marcar todas, é uma linha.
2. **O CNPJ não quebra mais no hífen.** Nas larguras menores ele partia em duas linhas e se lia errado.

## §4 — A prova

**Os testes da D641 §3, todos presentes:**
- três filiais dão uma linha;
- a busca pelo CNPJ de uma filial abre a empresa e marca a filial;
- o ativo misto aparece nos dois filtros;
- a filial sem `empresa_id` vira empresa sozinha.

**A D643:** para cada uma das sete telas, o título aparece uma vez entre a barra e a página, é o `h2` da página, e a
barra não o contém.

**Sabotagens:** todas reprovaram, e os arquivos voltaram ao byte (sha igual).

| Sabotagem | Resultado |
|---|---|
| agrupar por filial de novo (a da carta) | 13 de 13 vermelhos |
| a filial achada não é marcada | 3 vermelhos |
| marcar todas quando todas casam | 1 vermelho |
| a busca de uma empresa só não abre | 5 vermelhos |
| "Inativos" só com todas as filiais inativas | 1 vermelho |
| o nome da tela de volta na barra (a da D643) | 7 de 7 vermelhos |

## §5 — As fotos

**Onde:** `docs/Capturas/2026-09-29_D641_D643/` no ramo. São 77: dados inventados, o App de verdade sobre um banco
falso dentro da página.

**D641:** seis cenas, nas quatro larguras (1920×1080, 1366×768, 768, 375), claro e escuro (48 fotos):
- `01` a lista fechada;
- `02` uma empresa aberta;
- `03` e `04` **a busca da empresa da foto do Pedro** (um nome inventado no lugar), aberta e fechada;
- `05` a busca pelo CNPJ de uma filial, com a filial marcada;
- `06` o filtro "Inativos" com o ativo misto.

**D643:** as sete telas (`11` a `17`), em 1366 e 375, claro e escuro (28 fotos).

**A medida por foto** (as 76 do App):
- título uma vez;
- nada na barra;
- sem rolagem de lado;
- nada saindo da moldura;
- nenhum texto sobre outro.

**Em 375** a tabela rola por dentro da própria caixa, como a de antes. A página não rola de lado.

**O protótipo da casa mostra outro arranjo** (a D643 pediu para dizer): a foto `20_prototipo_da_casa_template_base`.
- **Lá:** não há barra no alto. Uma linha pequena acima do título ("Bom dia, …") e o título uma vez.
- **Aqui:** a barra fica com "Central de Compras" e o estado do banco, e o título vem logo abaixo, uma vez.
- **Para comparar:** a `11_titulo_dashboard_1366x768_escuro` está na mesma largura e no mesmo tema.
- **Se quiser o arranjo do protótipo** (sem barra, com o "Central de Compras" virando a linha pequena acima do título),
  é outra carta: mexe na moldura de todas as telas e no lugar do estado do banco.

## §6 — A medida da D641 §4 (só leitura, nada consertado)

No `banco-principal`, pela `core.fornecedor_resolvido`, numa transação só de leitura:

| | Filiais |
|---|---|
| no total | 223 |
| com empresa | 214 |
| **razão social igual ao apelido, texto exato** | **18** |
| **igual sem caixa, acento e pontuação** | **30** (das 214) |

- As 30 são de 30 empresas diferentes, uma por empresa, e estão todas ativas.
- A tela nova já esconde a razão quando ela é o próprio apelido: a linha da empresa não repete o nome.

## §7 — O `docs/Agente.md` (D641 §5), no mesmo ramo

- **A linha 23 agora diz** que as seções 1–8 são história da versão do arquivo, que era a `main` até 04/09. A `main`
  de hoje é o banco, e o `App.tsx` não importa nada da camada de arquivo.
- **Os títulos das colunas da seção 0 foram trocados:** "versão do arquivo (até 04/09, fora do ar)" e "`main` de hoje
  (banco)".
- **No alto da seção 1** há um aviso: dali até o fim da seção 8 é história.
- **O código da camada** (os 14 arquivos) **não saiu.** Fica para a D639, em 17/11, como a carta manda.

## §8 — Fora desta carta

- **As OCs 2026/004 e 2026/005:** não toquei. São do Banco (D642).
- **Uma observação, sem conserto:** o cartão "Fornecedores" do Dashboard conta filiais ativas, não empresas. Nas fotos
  ele diz 10 com 6 empresas na lista. Se quiser que ele conte empresas, é outra carta.
