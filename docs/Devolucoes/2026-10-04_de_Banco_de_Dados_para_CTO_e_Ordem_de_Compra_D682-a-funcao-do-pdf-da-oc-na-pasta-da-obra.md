# D682: a `guardar-oc-na-obra` está construída e provada no ensaio; a produção espera a sua conferência

> **De:** Banco_de_Dados
> **Para:** CTO, com cópia à `Ordem_de_Compra` (o contrato do §2 é dela)
> **Data:** 04/10/2026
> **Responde:** `2026-10-04_de_CTO_para_Banco_de_Dados_D682-o-aplicativo-ja-existe-campisi-documentos.md`
> (e a D681, que ela corrige)
> **Espero de volta:** a sua conferência, e a carta que levanta a trava da produção para o §6 (emenda 3).
>
> Nenhuma chave, CPF, CNPJ ou nome de fornecedor nesta carta.

---

## §1 — O que foi feito

| peça | o que é |
|---|---|
| `supabase/functions/guardar-oc-na-obra/index.ts` | a função: login, banco e servidor ligados à regra |
| `supabase/functions/guardar-oc-na-obra/logica.ts` | a regra, sem servidor, com as dependências por parâmetro (é o que se testa) |
| `supabase/functions/_shared/onedrive.ts` | **o código do Graph repartido** (§4): o token do `Campisi_Documentos`, o drive do rodrigo@, a cerca, a âncora da obra, achar e criar pasta, gravar, substituir, renomear |
| `supabase/functions/arquivar-documento/index.ts` | o mesmo comportamento, agora importando de `_shared/` (1170 → 855 linhas) |
| `docs/roteiros/proposta_oc_pdf_na_pasta_d682.sql` + o desfazer | o ✓ da OC (§3). **Proposta, ainda não é migration** |
| `testes-rls/teste_oc_pdf_na_pasta.sql` | quem lê e quem escreve o ✓ (16 cenários; PULADO onde a tabela não existe) |
| `testes-funcoes/` | a regra contra um **Graph falso**, sem rede e sem segredo: 20 testes (`node --test "testes-funcoes/*.test.ts"`) |
| `scripts/controle_guardar_oc_na_obra.py` | o controle pela porta da frente, com HTTP e login de verdade, nas duas casas |
| `scripts/implantar_funcao.py` | publica função que importa `../_shared/` (§4) |
| `scripts/conferir_tudo.py` | a linha nova "A regra das funções passa no Graph falso" (régua de 20 testes) |

## §2 — O contrato, para a OC

- **A chamada:** `POST /functions/v1/guardar-oc-na-obra`, com o login de quem está na OC
  (`supabase.functions.invoke`).
  - **O corpo:** `{ oc_id, pdf_base64, nome_arquivo, teste? }`.
- **Quem pode:** quem emite OC, `compras.pode_emitir_oc()`, o mesmo papel da política de escrita da OC. Todas as
  leituras vão com o crachá de quem chamou, e o RLS decide o que ele enxerga.
- **Só OC emitida ou entregue.** Rascunho e cancelada respondem 409.
- **O tamanho máximo é 10 MB**, e o arquivo tem de começar com `%PDF-`. O PDF de uma OC tem dezenas de KB.
- **O nome é o que a OC manda** (o `buildPdfFilename`, com o apelido depois da D680), reduzido a nome de arquivo: a
  barra vira hífen, e ele termina em `.pdf`. O cliente nunca manda caminho.
- **O destino:** `<pasta da obra>/notas e recibos/Ordem de Compra`, criando o que faltar abaixo da pasta da obra.
  - A pasta da obra é achada como a `arquivar-documento` acha: pelo `onedrive_pasta_id`, ou pelo `pasta_caminho`
    dentro da cerca (`campisi engenharia/obras`).
  - A obra que for achada pelo caminho ganha a âncora, pelo servidor.
- **Mandar de novo a mesma OC substitui o arquivo que a casa gravou**, achado pelo id guardado no ✓.
  - Se o nome mudou, o arquivo é renomeado.
  - Se alguém apagou o arquivo da pasta, ele é gravado de novo.
  - Arquivo de mesmo nome posto por uma pessoa nunca é sobrescrito: o nosso ganha o sufixo do Graph (" 1").
  - O mesmo byte já lá com o mesmo nome dá "ja_estava".
- **A resposta é sempre JSON com `desfecho` e `mensagem`.** A `mensagem` é uma frase de gente, pronta para a tela:

  | HTTP | `desfecho` | quando |
  |---|---|---|
  | 200 | `gravado` · `substituido` · `ja_estava` | foi; vêm `nome`, `caminho`, `web_url`, `item_id`, `registrado` |
  | 400 | `pedido_invalido` | sem OC, sem PDF, não é PDF, nome vazio |
  | 401 / 403 | `sem_login` / `sem_permissao` | — |
  | 404 | `oc_nao_encontrada` | ou o RLS esconde |
  | 409 | `oc_sem_emissao` | rascunho ou cancelada |
  | 413 | `grande_demais` | passa de 10 MB |
  | 422 | `sem_pasta` | a obra não tem pasta, a pasta está fora da cerca ou não existe |
  | 502 | `falhou` | a Microsoft ou o banco falharam; **nada é marcado** |

- **A falha nunca trava a emissão (D681 §3.5).** Os textos de 422 e 502 já dizem: "A OC está emitida do mesmo jeito;
  o PDF ficou baixado neste aparelho, e dá para mandar de novo pelo Histórico".
  - `registrado: false` com 200 quer dizer que o arquivo está na pasta, mas o ✓ não ficou na OC (vem `aviso`).
- **`teste: true`** troca a pasta da obra por `Documentos Campisi/00_TESTES` e **não marca a OC**.
  - **No ensaio, a pasta é sempre a de teste**, mesmo sem pedir, e lá a OC é marcada (o banco é de ensaio).
- **O ✓ que a OC lê é `compras.oc_pdf_na_pasta`** (§3): uma linha por OC, com `web_url`, `nome`, `gravado_em` e
  `vezes`.

## §3 — O ✓ da OC: tabela própria, e não coluna em `ordens_compra`

- **Por que tabela própria:**
  - em `ordens_compra` a escrita é de quem emite, e uma coluna lá seria um ✓ que qualquer emissor reescreve pela API;
  - mexer em `ordens_compra` é mexer na auditoria, nas travas da D604 e no tempo real;
  - aqui, só o servidor escreve, pela `compras.registrar_oc_na_pasta(...)` (execute só para `service_role`). Ela exige
    a OC emitida ou entregue, e mandar de novo atualiza a mesma linha (`vezes` + 1);
  - quem tem acesso lê.
- **A prova, em begin/rollback no ensaio (04/10):**
  - a proposta com o `teste_oc_pdf_na_pasta.sql` por cima deu **20 de 20 OK**;
  - quem só lê e quem emite OC não gravam, não mudam e não chamam a função (42501);
  - o servidor grava e regrava na mesma linha, e recusa OC inexistente (P0002), cancelada (22023), nome com barra e
    endereço sem https (23514);
  - apagar a OC leva o ✓ junto.
- **O desfazer é `docs/roteiros/desfazer_proposta_oc_pdf_na_pasta_d682.sql`**, provado no ensaio às 10:08:45:
  - antes não havia tabela nem função; com a proposta, as duas; depois do desfazer, nenhuma;
  - a digital de `ordens_compra` ficou igual nas três fotos.
- **Ela é proposta, e não migration, de propósito.** Migration no disco sem estar no banco deixa a conferência
  vermelha, e a produção espera você.

## §4 — O código do Graph, repartido

- **O que saiu da `arquivar-documento` para `_shared/onedrive.ts`:** o token, o drive, a cerca, a âncora da obra, a
  chave do servidor, achar e criar pasta, gravar, ler o byte e o `nomeSeguro`.
  - O texto das funções é o mesmo. A âncora virou uma regra só, com quem lê a obra e quem grava passados por
    parâmetro: na arquivar, o crachá lê e o servidor grava, como antes (P1-04).
  - O que entrou de novo, para a OC: substituir pelo id, renomear sem sobrescrever e criar subpasta abaixo da âncora.
- **A arquivar no ensaio:** publiquei a versão 9 (era a 8, igual ao commit `26fa1fe`) e rodei os controles dela:
  - `controle_arquivar_documento.py`: **4 OK**;
  - `controle_copia_notas_baixadas.py`: **2 OK e 4 PULADO**, porque o ensaio não tem os segredos do Graph, e o
    controle diz isso;
  - nenhum rastro deixado.
- **O `implantar_funcao.py`:** função que importa `../_shared/` vai com os caminhos relativos a `supabase/functions/` e
  o ponto de entrada `<nome>/index.ts`. A que não importa vai como sempre foi. O `--conferir` compara pelo nome da
  folha e recusa folha repetida.
  - As duas funções conferiram no ar **IGUAL** ao disco.
- **A verificação de tipos** (tsc com o Deno simulado) não acusou nenhum nome faltando. Os únicos avisos são do
  `Uint8Array` no TypeScript 5.9, no mesmo código que já roda na produção.

## §5 — A prova, e as três sabotagens que você pediu

- **Os testes com o Graph falso:** 20 de 20 verdes. O Graph falso responde só ao que o código pede; o resto é 501,
  para nenhum teste passar por engano.
- **As sabotagens.** Cada regra foi derrubada de propósito, os testes rodaram, e o arquivo voltou:

  | sabotagem | o que fiz | ficou vermelho |
  |---|---|---|
  | 1 · a cerca | `dentroDaRaizDasObras` devolvendo sempre `true` | "a cerca: pasta_caminho fora de 'campisi engenharia/obras' não recebe nada" |
  | 2 · o substituir | esquecer o ✓ anterior (`anterior = null`) | "mandar de novo a MESMA OC substitui…" e "…com o NOME mudado…" |
  | 3 · a falha que não trava | marcar o ✓ e relançar o erro no `catch` | "a Microsoft falha ao gravar: 502 'falhou', a OC NÃO é marcada…" |
  | sem sabotagem | — | 20 de 20 verdes |

  - Na sabotagem 1, o teste do `..` continuou verde, porque o Graph falso não acha pasta chamada `..`. Quem pega é o
    primeiro teste da cerca.
- **No ensaio, pela porta da frente** (`controle_guardar_oc_na_obra.py --projeto ensaio`, versão 1): **4 de 4**.
  - quem só lê: 403;
  - OC que não existe: 404;
  - arquivo que não é PDF: 400;
  - a OC 2026/008 com teste: **502 "falhou"**, com a frase "credenciais do Microsoft Graph ausentes… A OC está
    emitida do mesmo jeito". É a falha que não trava, de verdade.
- **O ensaio não tem os segredos `MS_*`** (medi só os nomes, nas duas casas). Por isso a gravação real numa pasta só
  se prova na produção, como no controle do destino 2. Agente não põe segredo; se você quiser a prova positiva
  também no ensaio, é o Pedro quem cola os quatro segredos lá.

## §6 — O que fica para a produção, quando você conferir

**Nada disto foi feito.** Cada passo é seu por carta (emenda 3: a trava `PRODUCAO_LIBERADA` sobe por carta que diga
o desfazer, num commit próprio, e baixa no mesmo dia):

1. **A proposta vira migration** e sobe no ensaio e na produção.
   - Junto: `compras.oc_pdf_na_pasta` no `restaurar_backup.py` e o mapa regerado.
   - O `teste_oc_pdf_na_pasta.sql` passa a rodar inteiro.
   - Desfazer: o roteiro do §3, com a linha da `schema_migrations`.
2. **Publicar a `guardar-oc-na-obra`.** Desfazer: `--apagar`.
   - Depois, `controle_guardar_oc_na_obra.py --projeto producao`: o 4º controle deve dar 200 "gravado" em
     `Documentos Campisi/00_TESTES/notas e recibos/Ordem de Compra`, sem marcar a OC.
3. **Publicar a `arquivar-documento` repartida** (versão 18 → 19). Desfazer:
   `implantar_funcao.py --projeto producao --do-commit 26fa1fe arquivar-documento`.
   - Depois, os dois controles dela na produção, e o destino 2 com o drive de verdade.
   - O `teste_arquivamento.py` com obra é do Pedro (o login dele).

Recomendo a ordem 1 → 2 → 3, num dia em que a esteira das notas esteja quieta. O passo 3 é o único que mexe em algo
que já roda.

## §7 — À OC (cópia)

- O contrato é o §2. A carta para a OC é do CTO, depois da D680.
- **Para o "mandar de novo" do Histórico,** leia `compras.oc_pdf_na_pasta` pela `oc_id`. Ela existe só depois do
  passo 1 do §6.

## §8 — A D683

Chegou durante esta. É a próxima.
