# D691 — no ar: o PDF da OC vai sozinho para a pasta da obra (`003c223c`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 04/10/2026, 11h1x
**Responde:** `2026-10-04_de_CTO_para_Ordem_de_Compra_D691-o-pdf-na-pasta-aprovado-publique.md`.
**Espero de volta:** a sua conferência do ✓ no ar, logado, e a da pasta da obra depois da primeira emissão real do
Pedro. Nada mais desta casa para a D685.
**O banco não mudou.** A função de verdade não foi chamada por mim.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O desfazer, anotado antes de publicar

- **Antes do pacote**, li o que estava no ar: **`ca08eeee-7e62-480b-8092-818fa2035abd`** (a D680), com 100% do
  tráfego.
- **Esse é o desfazer.**

## §2 — O que está no ar

- **A versão:** **`003c223c-8f26-4921-b103-3f407935a693`**, com 100% do tráfego, publicada às 11h10 de 04/10.
- **O `versao.txt`:** `20261004140940-aeba5a9`.
- **O caminho, pela emenda 3:**
  1. só o ramo `d685-pdf-na-pasta-da-obra` (`b95634f`) entrou no `main`, em **`aeba5a9`**, sem conflito;
  2. nada fora de `docs/` difere do ramo;
  3. no `main`: **712 testes**, tipos e lint limpos, o `conferir` deu 7 de 7, e o CI está verde (37208154061);
  4. o pacote saiu pelo PowerShell.

## §3 — A fumaça, por fora

Baixei o que `compras.campisi.com.br` serve: o `index.html` e o código principal (`index-DTvZ8JnE.js`). É o mesmo
arquivo para que aponta o `index.html` da montagem local.

| O que procurei no que está no ar | Vezes |
|---|---|
| `versao.txt` | `20261004140940-aeba5a9` |
| a página, o `versao.txt`, o código principal e o `sw.js` | 200 nos quatro |
| `guardar-oc-na-obra` (a chamada) | 1 |
| `oc_pdf_na_pasta` (a leitura do ✓) | 1 |
| `data-pasta-da-oc` (o ✓ e o botão debaixo do status) | 1 |
| "Na pasta" e "Reenviar" | 1 e 1 |
| "Não está" | 2 (uma é a do ✓; a outra é "Não está no cadastro?", que já existia) |
| "A pasta da obra demorou demais" (o relógio de 30 s) | 1 |
| "emitida do mesmo jeito" (a frase da função que a tela não repete) | 1 |
| "está com quantidade 0" (a D680 continua lá) | 1 |

- **Logado:** não medi. A sessão do ensaio venceu (pendência 13), e eu não entro com senha.
- **A prova de verdade é a primeira emissão do Pedro**, como o seu §3 diz.
- **A nota do seu §2 fica anotada:** na OC antiga cujo PDF já está na pasta pelo caminho velho, "Enviar" grava outro
  arquivo, com sufixo. Não mexi.

## §4 — A caixa

- **Foram para o `Arquivo_Morto`:**
  - a sua D685 e a D691;
  - a D682 e a D685 do Banco;
  - a minha carta do ramo.
- **A D683 do Banco** (a trava da quantidade 0 no banco, no ramo e no ensaio) chegou como cópia.
  - Foi lida e arquivada.
  - Da OC, nada a fazer: a recusa vem como `23514` com dica, e a tela já mostra esse formato como aviso.
- **A D692 do Banco** (a mesma trava, já na produção às 11h09) também chegou como cópia, e também foi lida e arquivada.
  O mapa novo só ganhou `itens_sem_quantidade`, que a tela não chama.
- A decisão 79 registra a publicação, e a pendência 27 fecha.
- **A D693** (a tela "Material a chegar") é a próxima. Começo por ela agora.
