# D795 — No ar: o ícone do castor, as perguntas, o número em dígitos e a lista com busca por palavra, em `2b8e223f`; o desfazer é `656d33e5`

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 13/10/2026, 16h5x
**Responde:** `2026-10-13_de_CTO_para_Ordem_de_Compra_D795-aprovado-com-a-busca-por-palavra-pode-publicar.md`
**Espero de volta:** a sua conferência por fora, e o aviso ao Pedro para trocar o ícone no celular.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O retoque da busca

- **O commit:** **`0b97589`**, no ramo `d792-mestre`.
- **O que mudou:** a busca acha pelo começo de **qualquer palavra** do nome, sem acento e sem maiúscula. "beta" acha
  "Cerâmica Beta", "ceramica be" também, e "sig" acha "Ferragens-Sigma". Pelo meio da palavra não acha: "eta" e
  "amica" não acham nada.
- **O nome da função** passou a ser `empresaAchada`, porque `empresaComecaCom` já não dizia o que ela faz.
- **A tela não mudou.** A frase sem achado continua "Nenhuma empresa começa com “…”".
- **As quatro sabotagens ficaram vermelhas:**

  | a sabotagem | testes vermelhos |
  | --- | --- |
  | só o começo do nome | 2 |
  | acha pelo meio | 3 |
  | só o espaço separa palavra | 1 |
  | sem tirar acento | 2 |

## §2 — As três coisas de sempre

1. **O commit no main:** **`2bb9b4b`**, a junção de `d792-mestre` (`0b97589`) sem conflito. Fora de `docs/`, nada
   difere do ramo.
2. **O desfazer:** **`656d33e5-b679-4538-b6eb-0ba09cbfe441`**. Anotei antes da publicação: ele tinha 100% do tráfego
   no `wrangler deployments list`. Voltar é:

   ```
   wrangler rollback 656d33e5-b679-4538-b6eb-0ba09cbfe441
   ```

   O banco não mudou, então não há o que desfazer nele. Quem já pôs o ícone novo na tela fica com ele, mesmo depois
   de voltar.
3. **A prova de que a produção serve a versão nova**, medida às 16h5x:
   - **A versão:** o `versao.txt` no ar é **`20261013195159-2bb9b4b`**, igual ao do pacote.
   - **O manifesto** (`manifest.webmanifest`, 200):
     - aponta `icons/icon-192.png`, `icons/icon-512.png` e `icons/icon-512-maskable.png`, este com
       `purpose: maskable`;
     - o fundo é `#FBF3DE`.
   - **Os ícones:** os quatro, baixados do site, têm a mesma impressão SHA-256 do pacote.

     | ícone | impressão no ar = no pacote |
     | --- | --- |
     | `icon-192.png` | `9100985E04F2…` |
     | `icon-512.png` | `90CFB5D118C9…` |
     | `icon-512-maskable.png` | `749513A2F204…` |
     | `apple-touch-icon.png` | `C0187C7FACED…` |

   - **A página:** o `index.html` responde 200 e traz o `apple-touch-icon`.
   - **O código servido:** `assets/index-Dkvm6JWO.js` responde 200 e tem:
     - "Veio o material certo?" e "Veio a quantidade toda?";
     - as duas dicas;
     - "Procurar a empresa".
   - **"Chegou o que foi pedido?" não aparece mais.**
   - **"Chegou tudo?" ainda aparece**, de propósito: é a pergunta da tela do **escritório**, quando ele liga um "sem
     pedido" a uma OC. Essa tela a carta não tocou, e o teste do mestre confere que lá ela não aparece.
   - **O `sw.js`** responde 200.

## §3 — Como foi

- **A bateria no `main`, antes de publicar:**
  - 1054 testes;
  - tipos e lint limpos;
  - o `conferir` 7 de 7.
- **O CI:**
  - o do ramo em `f2fdde2` deu verde;
  - o do `main` (`2bb9b4b`) estava rodando quando escrevi. Se ele não ficar verde, eu te escrevo.
- **Publicado pelo PowerShell às 16h52 de 13/10:** **`2b8e223f-c3a3-4e10-b56f-36794db0e556`**. Subiram 10 arquivos, e
  27 já estavam lá.

## §4 — Depois

1. **Você confere por fora.**
2. **O Pedro troca o ícone no celular**, pelo caminho da minha carta anterior, §2: remover o ícone antigo e pôr de
   novo pelo Chrome. O mesmo vale para o celular de cada mestre.
3. **A lista do "Só uma parte"** espera a tabela do Banco e o seu aviso com o formato do envio (D794).

— Ordem_de_Compra
