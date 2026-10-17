# D855 — No ar em `10f05c50`: o título da OC nova

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 16/10/2026, 22h23
**Responde:** `2026-10-16_de_CTO_para_Ordem_de_Compra_D855-sim-conserte-o-titulo-da-OC-nova.md`

**Espero de volta:** nada.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O conserto

- **A mudança:** a `buildNewOc` lê o relógio uma vez só e usa a mesma hora no `criado_em` e no `atualizado_em`.
- **O ramo:** `d855-titulo-da-oc-nova` (`63b15fa`), com 2 arquivos, +72 e −2.
- **O teste novo:** `tests/components/TituloDaOcNova.test.tsx`. Ele usa o `App` de verdade, com o relógio andando 1 ms a cada leitura:
  - antes do conserto, ficou vermelho: veio "Editar OC" no lugar de "Nova Ordem de Compra";
  - depois, ficou verde, e as duas horas da OC nova são iguais.
- **A sabotagem:** voltei a segunda leitura do relógio. Ficou vermelha, com 2 testes caindo (o novo e o `TituloUmaVez`). Depois de desfeita, ficou verde.
- **O experimento de antes, de novo:** as 30 cópias do `TituloUmaVez` rodando juntas, 5 vezes, deram 1.050 casos sem
  queda. Antes do conserto, tinha caído 1 em 630. As cópias foram apagadas.
- **A bateria:** 1.259 testes, `tsc` e `eslint` limpos.
- **O CI:** verde no ramo (`63b15fa`) e no `main` (`48ff24c`).

## §2 — A publicação (emenda 3)

1. **A junção:** o ramo entrou no `main` em **`48ff24c`**, sem conflito.
2. **O desfazer, anotado antes:** `41898c74-39d7-475f-8d99-0cd9b7ece3fc`, que tinha 100% do tráfego.
3. **A publicação:** pelo PowerShell (`pnpm run deploy`), às 22h23.
   - A conferência do pacote deu 5 de 5.
   - **A versão no ar é `10f05c50-f264-43d7-984e-04aeb057a283`**, e o pacote é `20261017012248-48ff24c`.

**A medida por fora:**

| o que | deu |
|---|---|
| o `versao.txt` servido (com `?x=` ao acaso) | `20261017012248-48ff24c`, igual ao pacote |
| `assets/index-8YTL1b7-.js` (SHA-256) | servido = pacote (`be1b3a3d…`) |
| `assets/index-CQ64OBAD.css` (SHA-256) | servido = pacote (`7730b6c2…`) |
| a página servida | chama o `index-8YTL1b7-.js` |
| no código servido | `criado_em:i,atualizado_em:i`: a mesma hora nos dois |

A pendência 30 fecha.

## §3 — O "ver como" (o seu §2)

**Nada na OC depende de o Pedro ser `admin` o tempo todo.** Procurei e-mail, id de pessoa e conta fixa no código, e não
há. Tudo o que a tela libera ou trava vem do `papel` e da marca `sem_ordem_de_compra` do perfil.

**Um detalhe para o teste dele: a OC lê o perfil uma vez, quando a pessoa entra.** Ela não acompanha a troca ao vivo.
- **Com a OC já aberta,** a troca pela Central só aparece depois de recarregar a página.
- **Quando a hora acaba e o papel volta sozinho,** a aba que ficou aberta continua mostrando o papel do teste até
  recarregar.
- **Nos dois casos,** quem manda de verdade é o banco: ele recusa o que o papel do momento não pode. O que fica velho é
  só a tela.
- **Para o Pedro:** depois de trocar ou de voltar, recarregue a OC.

Não construí nada. Se o senhor quiser que a OC leia o perfil de novo sozinha (ao voltar para a aba, por exemplo), é
pequeno, mas é uma mudança, e espera a sua carta.

## §4 — O que fica

- **A parte B** continua no ramo dela, em http://localhost:5174, que respondeu `200` às 22h23.
- **O ramo `d855-titulo-da-oc-nova`** já está no `main`. Ele fica no repositório, como os outros.

A sua D855 vai ao meu Arquivo_Morto com esta carta, e a minha D853 também.

— `Ordem_de_Compra`
