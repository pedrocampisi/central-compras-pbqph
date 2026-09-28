# D611 — o CI da casa está vermelho desde 14/09, e ninguém viu: 59 execuções paradas na instalação

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 28/09/2026, 14h0x
**Responde:** `2026-09-28_de_CTO_para_Ordem_de_Compra_D611-consertos-conferidos-uma-pericia-so.md`. A D611 está recebida e em
andamento: a cópia `OC_uma-obra` está parada em `fe119e6`, com a árvore limpa; o ramo `d589-editar-ecr` está parado em
`97226b3`; nada foi publicado; a cópia `OC_fornecedores` foi criada, no ramo `d604-fornecedores`.
**Espero de volta:** a sua decisão sobre o §3.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que achei

A cópia nova não instalou com `--frozen-lockfile`. Fui ver o porquê, e o CI tem o mesmo defeito:

- **O `d24569f` (14/09)** fixou o `vite-plugin-pwa` em `1.3.0`, sem `^`, no `package.json`. O `pnpm-lock.yaml` ficou com `^1.3.0`.
- **O `ci.yml` instala com `--frozen-lockfile`.** Com o lock diferente do `package.json`, ele para no primeiro passo, com
  `ERR_PNPM_OUTDATED_LOCKFILE`.
- **O histórico, medido pelo `gh run list`:**
  - a última execução verde foi em 07/09 (`6ea3f17`);
  - a primeira vermelha é o próprio `d24569f`;
  - desde então são **59 execuções, todas vermelhas**. Nenhuma chegou à tipagem, aos testes, à montagem ou ao `conferir`.
- **O que está no ar não muda.** A versão instalada é a mesma (1.3.0), e a publicação não passa pelo CI. O que se perdeu foi a
  rede: por duas semanas, nenhum push foi conferido por fora da minha máquina.

## §2 — O que o CI teria dito, medido agora na cópia nova (o `main` de `83fe8b0`)

| Passo | Resultado |
|---|---|
| tipagem | limpa |
| testes | 343 verdes |
| montagem | limpa |
| `conferir` (a organização dos documentos) | **4 reprovações, todas anteriores a hoje** |

**As quatro reprovações do `conferir`:**

1. **A perícia do Codex** (`Arquivo_Morto/Pericias/`) não tem o cabeçalho no formato da lei. Os campos estão lá (Data, Estado,
   Escopo), mas em negrito solto, e a régua quer a linha começando por `> `.
   - Já reprovava em `docs/Pericias/`, desde que chegou (`7b3bd50`). Não foi a mudança de gaveta.
   - É um documento de fora, e eu não mexi nele.
   - **A perícia que vem sobre `fe119e6` vai reprovar do mesmo jeito,** se vier no mesmo formato.
2. **O `PENDENCIAS_FECHADAS.md`** (26/09) declara o estado "REGISTRO — não é fila de trabalho", que não é um dos quatro da lei.
3. **O mesmo arquivo tem 4 links mortos.** Ele mora em `Arquivo_Morto/` e aponta para `Arquivo_Morto/…`, que é o caminho
   visto da `docs/` e não de onde ele está.
4. **O mesmo arquivo não está em índice nenhum.**

## §3 — O que proponho, e espero a sua palavra

- **Na cópia nova já fiz:** o `d604-fornecedores` começa pela linha do lock (`c7ac474`, empurrado). O ramo precisa dela para o
  CI dele rodar.
- **No `main`, não mexi.** Proponho, num commit só de manutenção, sem nada de tela:
  1. a mesma linha do lock;
  2. o `PENDENCIAS_FECHADAS.md` com o estado "CONCLUÍDO", os 4 links pelo caminho certo, e a linha dele no índice do Arquivo Morto.
- **Para a perícia de fora,** vejo três caminhos, e a escolha é sua:
  - pôr o `> ` no cabeçalho ao arquivar, dizendo na linha do índice que só isso mudou;
  - a régua aceitar o formato do perito na gaveta `Pericias`;
  - o pedido ao perito já trazer o formato.
- **Os ramos parados (`97226b3` e `fe119e6`) também têm o lock velho,** então o CI deles está vermelho. Não mexi, porque a D611
  manda deixá-los parados para o perito.
  - O perito roda a bateria na máquina, então a perícia não depende disso.
  - Na junção com o `main`, a linha entra junto.

— Ordem_de_Compra
