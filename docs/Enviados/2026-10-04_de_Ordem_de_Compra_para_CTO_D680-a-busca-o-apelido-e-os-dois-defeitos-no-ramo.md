# D680 — a busca pelo que bate melhor, o PDF com o apelido e os dois defeitos, no ramo (NÃO publicado)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 04/10/2026, 10h0x
**Responde:** `2026-10-04_de_CTO_para_Ordem_de_Compra_D680-a-busca-o-nome-do-pdf-e-dois-defeitos.md`.
**Espero de volta:** a sua conferência; depois dela, publico pela emenda 3.
**O banco não mudou.** Li a produção só para a medida do §2.4: os fornecedores e a contagem de obras e de OCs.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** Os únicos nomes são os
dois fornecedores que a sua carta já trazia. As fotos usam só dados inventados.

---

## §1 — O ramo

- **O ramo:** `d680-busca-apelido-defeitos`, commit **`c6c28a6`**, saído do `main` `1d13ede`.
- **O CI está verde** (execução 37204479177).
- **O tamanho (lei 3 §9.5):**
  - código (`src/`): **+248 / −40** (10 arquivos mexidos e 2 novos);
  - testes: +583.
  - Fica longe de mil linhas de código, então **não há perícia**.
- **A bateria:**
  - **689 testes**, todos verdes (eram 657; +32);
  - tipos e lint limpos.
- **Não publiquei.**

## §2 — A busca (o seu §2)

1. **A régua é a da Central**, num lugar só: `notaDaBusca` e `pelaNota`, em `src/domain/pesquisa.ts`.
   - **As notas, de 0 a 4:**
     - 0: o nome é o termo;
     - 1: o nome começa por ele;
     - 2: uma palavra do nome começa por ele;
     - 3: o termo está no meio do nome;
     - 4: casou só em outro campo.
   - **Como compara:** sem acento e sem caixa, com a pontuação virando espaço, como em `busca.js`.
   - **A ordem:** pela nota. Na mesma nota, o que desce vai para baixo. No resto, fica a ordem que já vinha.
   - **O que desce não some.**
2. **O que conta como "o nome" é o que a lista mostra, como a sua carta pede.** A razão social, a cidade e os
   termos levam 4. Em dois lugares eu me afastei disso, e digo por quê:
   - **Histórico:** a coluna Fornecedor mostra a razão social. Ali contam o apelido, a razão social e o número da OC.
   - **Documento:** na tela de Fornecedores, o CNPJ conta, e em Obras, o CNO, quando o termo tem 3 algarismos ou
     mais. Isso também vem da régua da Central: quem cola um CNPJ quer aquele em cima.
3. **As sete buscas da OC, todas com a régua.** Nenhuma ficou de fora.

| Busca | Onde está | O nome que conta | O que desce |
|---|---|---|---|
| Fornecedor da Nova OC, e a escolha do "+ Qualificar fornecedor" | `CampoPesquisavel` → `filtrarOpcoes` | o apelido | a empresa sem filial ativa e livre de bloqueio |
| Obra da Nova OC | o mesmo | o nome da obra | a encerrada |
| Filtros Fornecedor e Obra do Histórico | o mesmo | como acima | como acima |
| Caixa de busca do Histórico | `HistoricoPage.tsx` | apelido, razão social e número | a OC cancelada |
| Fornecedores | `empresasDaTela` (`domain/fornecedores.ts`) | apelido, e o CNPJ colado | a empresa sem filial ativa |
| Qualificação | `QualificacaoPage.tsx` | o nome da empresa (o tipo leva 4) | nada: na mesma nota fica a ordem da tela, o que pede ação primeiro |
| Catálogo de ECR | `CatalogoPage.tsx` | o nome e o código (a categoria leva 4) | nada |
| Obras | `ObrasPage.tsx` | o nome, e o CNO colado | a encerrada |

   - **Sem busca, nada muda:** cada lista fica na ordem de sempre.
   - **O que casa também não mudou.** Mudou só a ordem. Uma exceção: Obras e Catálogo comparavam só sem caixa, e
     agora também ignoram o acento, como as outras buscas.
   - **Os outros campos de escolha** (ECR, unidade, condição de pagamento) continuam listas simples, porque não têm
     busca.
4. **A prova com os fornecedores reais da produção, só lendo.** Rodei a mesma lógica da tela sobre o cadastro lido
   (223 filiais, 113 empresas na lista da Nova OC) e digitei "co":

| | Comarco | ABR Gesso | Casaram |
|---|---|---|---|
| **antes** (a ordem alfabética) | 14º | 1º | 51 |
| **depois** | **1º** | 18º | 51 |

   - Na tela de Fornecedores, filtro "Ativos", com "co": a Comarco fica em 1º de 81.
   - **Histórico:** a produção tem 3 OCs, todas da mesma empresa, então não há o que reordenar. A prova do Histórico
     é o teste com dados inventados, e a foto 06.
   - **Obra:** a prova também é o teste com dados inventados e as fotos 05 e 08. Não pus nome de obra real nesta
     carta.

## §3 — O nome do PDF (o seu §3)

- **Uma função só, `apelidoDoFornecedor`** (`domain/fornecedores.ts`): o apelido da empresa; sem apelido (ou com o
  apelido em branco), a razão social.
- **As duas portas usam a mesma função:** a emissão da Nova OC e o "PDF" do Histórico.
- **O exemplo da sua carta:** "comarco 2026-09-18 R-263-29 oc.pdf".
- **Há um teste por porta:** ele confere o nome que chega a quem salva o arquivo.

## §4 — Os dois defeitos (o seu §4)

1. **A linha com quantidade 0 não emite, por nenhuma porta.** A regra está em `src/domain/itensDaEmissao.ts`.
   - **Na Nova OC:**
     - a linha em branco de verdade (sem descrição, sem quantidade e sem preço) some sozinha, e não vai para o banco;
     - a linha com quantidade 0, negativa ou vazia recusa. A mensagem diz qual é: "O item 2 (Luva de raspa) está com
       quantidade 0. Informe a quantidade ou apague a linha, e emita de novo."
   - **No "emitida" do Histórico:** essa porta só troca o status. A linha iria junto, então ali **até a linha em
     branco recusa**, e a mensagem manda abrir a OC em Editar.
   - **O rascunho continua salvando com a linha zerada**, para ninguém perder o que digitou. Cancelar também continua
     livre.
   - **O banco deve ter a mesma trava? Sim, recomendo.**
     - O pedido: o `salvar_oc` e o `definir_status_oc` recusam passar a `emitida` uma OC com item de quantidade
       menor ou igual a 0.
     - O porquê: a tela é uma porta, e o banco é a última.
     - Esta casa não altera o banco. Se o senhor concordar, a carta é para o Banco_de_Dados.
2. **O `&#x3D;` da leitura.**
   - **A correção:** `desfazerEntidades` (`src/domain/entidades.ts`), chamada em `paraResultado`, onde a resposta da
     leitura vira item. Vale para a descrição, a observação, a dúvida ("confira") e as linhas ignoradas.
   - **O que ela desfaz:**
     - as entidades numéricas (`&#61;`) e as hexadecimais (`&#x3D;`);
     - as nomeadas comuns: `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;` e `&nbsp;`.
   - **Uma passada só, de propósito:** "&amp;#x3D;" vira "&#x3D;" e para aí.
   - **O que fica como está:** um "&" solto, a entidade desconhecida e o caractere de controle.
   - **Não medi de onde a entidade vem** (do modelo ou da função `extrair-itens`). A correção fica na entrada do
     aplicativo, que pega as duas origens.
   - **A 2026/010 fica como está**, como a sua carta diz.

## §5 — As sabotagens (uma por regra, e uma por porta)

Cada uma foi desfeita depois, com o conteúdo do arquivo conferido (sha igual). **As 16 ficaram vermelhas.**

| # | A sabotagem | Testes que caíram |
|---|---|---|
| 1 | **a nota:** o nome que começa pelo termo vale como o que o tem no meio | 10 |
| 2 | a escolha de fornecedor e de obra volta à ordem alfabética (o "co" da foto) | 3 |
| 3 | o que desce (inativo, bloqueado, encerrada, cancelada) não desce | 4 |
| 4 | a tela de Fornecedores sem a nota | 1 |
| 5 | o Histórico sem a nota | 1 |
| 6 | Obras sem a nota | 1 |
| 7 | o Catálogo de ECR sem a nota | 1 |
| 8 | a Qualificação sem a nota | 1 |
| 9 | **o apelido:** a função volta à razão social | 3 |
| 10 | o apelido: a Nova OC volta a dar a razão social ao PDF | 1 |
| 11 | o apelido: o Histórico volta a dar a razão social ao PDF | 1 |
| 12 | **a quantidade 0:** a Nova OC emite com a linha zerada | 1 |
| 13 | a quantidade 0: a linha em branco vai para o banco | 1 |
| 14 | a quantidade 0: o Histórico emite com a linha zerada | 1 |
| 15 | **a entidade:** a leitura não desfaz | 1 |
| 16 | a entidade: só as nomeadas (a numérica, a do `&#x3D;`, passa) | 2 |

- Um teste antigo mudou: o das setas do `CampoPesquisavel`.
  - Com "e", a obra que começa por "e" agora vem primeiro, então a terceira da lista é outra.
  - O teste agora afirma a ordem nova antes de andar pelas setas.

## §6 — As fotos (o seu §6.2)

- **Onde estão:** `docs\Capturas\2026-10-04_D680\`, no ramo. São 58 fotos.
- **Larguras e temas:**
  - claro em 1920, 1366, 768 e 375;
  - escuro em 1366 e 375;
  - o "antes" em 1366 e 375, claro.
- **Os dados são inventados.** O caso do "co" imita o da foto do Pedro, com nomes "(teste)".
- **Em nenhuma das 58 a página rola de lado.**

| Nº | A cena |
|---|---|
| 01 | Nova OC, fornecedor com "co", **antes**: a ABR Gesso no alto, a Comarco em 4º |
| 02 | o mesmo, **depois**: a Comarco no alto, a ABR Gesso por último |
| 03 | Fornecedores com "co", **antes** |
| 04 | Fornecedores com "co", **depois** |
| 05 | Nova OC, obra com "re" |
| 06 | Histórico, busca "co": a OC emitida da Comarco no alto, a cancelada dela logo abaixo, a da ABR Gesso por último |
| 07 | Histórico, filtro Fornecedor com "co": a bloqueada logo abaixo da Comarco, na mesma nota |
| 08 | Obras com "re" |
| 09 | Catálogo de ECR com "cimento" |
| 10 | Qualificação com "c" |
| 11 | Nova OC: a linha de quantidade 0 não emite, e o aviso diz qual é |

- O "antes" foi tirado com a régua desligada só nos dois lugares que a foto mostra. Os arquivos voltaram depois,
  com sha igual.

## §7 — O que não medi

- **Logado, na produção:** não medi, porque a sessão do ensaio venceu (pendência 13) e eu não entro com senha.
- **O PDF real com o nome novo:** só pelos testes das duas portas.
- **De onde vem o `&#x3D;`:** fica para o §4.2.
- **Um caso real de obra:** não fiz, para não pôr nome de obra na carta. Fica o teste com dados inventados.
