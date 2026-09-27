# D599 — "Mostrar só uma obra", no ramo `d599-uma-obra`, NÃO publicada

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 14h3x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D599-mostrar-so-uma-obra-auditoria-16-e-17-11.md`, inteira.
**Espero de volta:** o seu olhar nas fotos, e a ordem de publicar quando for a hora (a sua §4.5: depois da tela de
editar, até 06/11).
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** O id da obra da auditoria **não** está no
código nem aqui. Nas fotos, as obras têm nome inventado.

---

## §1 — Onde está

- **A cópia de trabalho:** `C:\Users\Pedro Paulo\Softwares\Copias_de_trabalho\OC_uma-obra`, como a sua §3 mandou.
- **O ramo:** `d599-uma-obra`, nascido de `7edb715`, empurrado. O código da máscara fecha em **`f7d5a53`**.
- **O `main` juntado ao ramo:** trouxe só papel (a caixa da D596 e a cópia da D598, `ed1f90d`). Assim a decisão e a
  pendência desta carta não brigam com as de lá no dia de juntar.
- **A pasta da casa:** continua parada em `d589-editar-ecr`, `7edb715`, com o `git status` vazio. Nenhum checkout e
  nenhum commit nela.
- **O servidor de teste:** subiu na porta **5174**, de dentro da própria cópia, só durante as fotos. A cópia não tem
  `.env.local`, e continua sem ele: o servidor rodou com endereço e chave falsos, e a prova trocou o banco inteiro por um
  falso dentro da página. Nada saiu da máquina.
- **Publicado:** nada. Continua no ar a `080168b8`.

## §2 — O que ficou pronto, item por item da sua §2

1. **A opção em Configurações:** "Mostrar só uma obra". Aparece só para quem a `core.pode_revisar_ecr()` diz sim, a
   mesma pergunta do "Editar" das ECRs. Se o banco disser não ou falhar, a opção não aparece.
2. **A obra e a janela:** a obra sai da lista das obras. A janela vem preenchida com **16/11/2026 00:00 até 17/11/2026
   23:59**, sempre no relógio de Brasília (`America/Sao_Paulo`), nunca no fuso do computador. "Até 23:59" vale o minuto
   inteiro: às 23:59:59 ainda está ligada. O Pedro arma antes; ela liga e desliga sozinha, com a página aberta ou não.
   A tela confere o relógio a cada 15 segundos e sempre que a janela volta a ficar à vista.
3. **Só neste navegador:** a opção fica guardada ali, como o tema, na chave `oc-mostrar-uma-obra`. Os outros computadores
   continuam vendo tudo.
4. **O filtro, num ponto só:** a busca `carregarDados` pergunta uma vez qual obra vale agora. Com a máscara ligada, ela
   pede **a obra pelo id** e **as OCs pela `intervencao_id`**. O aviso de mudanças em tempo real também escuta só
   aquela obra. As outras obras nem chegam ao navegador, e toda tela lê dali: Dashboard, Obras, Nova OC, Histórico e os
   totais.
   - **Uma correção de premissa sobre o `oc_totais`:** a tela não lê essa visão. A função `totaisDaOc` existe no
     código, mas ninguém a chama; os totais de todas as telas são somados no navegador a partir das OCs que chegaram.
     Como as OCs chegam já filtradas, os totais obedecem sem mais nada.
5. **O que o navegador guarda:** está medido na §3. O rascunho da Nova OC de outra obra **sai da tela e fica guardado**
   quando a máscara liga, e a tela vai para o Dashboard. Ele volta quando a máscara desliga. O rascunho da própria obra
   da máscara continua aberto.
6. **"Ver agora (ensaio)":** liga já, na obra escolhida, e desliga sozinho às 23:59 do dia, em Brasília. Se for armado às
   23h30, desliga meia hora depois, e não 24 horas depois.
7. **Desligar a qualquer hora:** com a máscara ligada, o botão diz "Desligar agora"; armada e esperando, diz "Desarmar".
   Passado o fim, ela se desarma sozinha: o navegador esquece.
8. **Navegador que não guarda nada:** a máscara não liga, e a tela diz por quê: "Este navegador não guarda a opção
   (janela anônima ou armazenamento bloqueado). A máscara não foi ligada." O resto segue normal. Um navegador que
   finge guardar e não guarda também conta como "não guarda": a gravação é conferida lendo de volta.
9. **Nenhuma marca fora de Configurações.** Lá aparece, por exemplo: "Ligada até 17/11/2026 23:59 (ensaio). Obra: …",
   ou "Armada: liga em 16/11/2026 00:00 e desliga em 17/11/2026 23:59. Obra: …". Nas outras telas, nada. As fotos 02 a
   05 não têm aviso, selo nem cor diferente.
10. **Não muda:** Fornecedores, ECRs e o número da OC.
11. **Banco:** nada. Nenhuma migration, nenhuma função nova, nenhuma carta ao Banco.

## §3 — Onde a OC guarda dado no navegador (a sua §2.5, medido)

| Onde | O quê | Obedece à máscara? |
|---|---|---|
| `localStorage` `tema` | claro ou escuro | não é por obra |
| `localStorage` `oc-mostrar-uma-obra` | a própria máscara | — |
| `localStorage` da sessão do login (Supabase) | o acesso, nada de obra | não é por obra |
| `localStorage` `central-compras-cache-v2` | **resto antigo:** a fotografia inteira dos dados da versão de arquivo | **ninguém lê.** O único que grava é código morto (`useAutoSave`, `fileSystem`), que não roda. Pode existir em navegador antigo, parado |
| `localStorage` `central-compras-ui-v1` | resto antigo | ninguém lê |
| `sessionStorage` `versao-tentada` | a versão que o aviso de atualização já tentou | não é por obra |
| IndexedDB `central-compras-db` / `handles` | a pasta de cada obra no computador, pela chave da obra | obedece sozinho: só é lida para a obra na tela |
| PWA (cache do service worker) | os arquivos do site e as bibliotecas do PDF (`pdf-libs`) | **nenhuma resposta do banco é guardada** |
| Lojas (zustand) | nenhuma persistida | o rascunho da Nova OC vive só na memória |

**Consequência para o rascunho:** como ele vive só na memória, recarregar a página perde o rascunho não salvo, com ou
sem máscara. Isso já era assim antes. O rascunho **salvo** é uma OC no banco; ele some com a máscara e volta com ela
desligada, como qualquer OC de outra obra.

## §4 — As provas

**Testes:** 397, todos verdes; eram 368 em `7edb715`. Os 29 novos:
- `tests/components/UmaObra.test.tsx` (11): o App inteiro sobre um banco falso, com duas obras inventadas e uma OC em
  cada. O banco falso **registra o filtro de cada busca** e filtra como o PostgREST.
  - Sem máscara, nada filtra e aparecem as duas obras.
  - Dentro da janela, a obra vai pelo id, as OCs e o aviso pela `intervencao_id`, e nada mais filtra. Dashboard, Obras,
    Nova OC (a lista de obras), Histórico e os totais mostram só ela.
  - **Às 23:59:59 de 15/11 e às 00:00:00 de 18/11 (Brasília), tudo aparece.** No segundo caso, a opção se desarma.
  - Liga sozinha no começo e desliga sozinha no fim, com a página aberta.
  - Outro perfil não vê a opção.
  - Armar mostra a janela da auditoria já preenchida; depois a tela diz quando liga e quando desliga, e desarma.
  - O ensaio liga já, vai até 23:59 de hoje, e "Desligar agora" volta tudo.
  - Sem armazenamento, a máscara não liga, a tela diz por quê e o resto segue.
  - O rascunho de outra obra sai e volta; o da obra da máscara fica.
- `tests/domain/umaObra.test.ts` (12): o relógio de Brasília e os limites da janela. **Roda com o computador em
  UTC:** o fuso muda antes de qualquer import, porque o formatador de horas nasce quando o módulo carrega. Com o fuso
  desta máquina, que já é o de Brasília, a sabotagem 5 abaixo passava sem acusar. Pegou isso a própria sabotagem, e está
  corrigido em `f7d5a53`.
- `tests/services/umaObraGuardada.test.ts` (6): o que fica guardado no navegador, o fim que desarma, a forma errada
  que vira "nada armado" e o navegador que não guarda.

**Verificação de tipos e revisão de estilo:** limpas.

**Sabotagens:** 13 novas, todas mordendo, cada arquivo restaurado com o mesmo sha256:

| # | A sabotagem | Vermelhos |
|---|---|---|
| 1 | a busca das obras sem o filtro | 1 |
| 2 | a busca das OCs sem o filtro | 3 |
| 3 | o aviso de mudanças sem o filtro | 1 |
| 4 | a janela pelo fuso do computador, e não o de Brasília (teste em UTC) | 6 |
| 5 | o texto da hora pelo fuso do computador (teste em UTC) | 5 |
| 6 | o ensaio pelo dia UTC, e não o de Brasília | 1 |
| 7 | "até 23:59" desliga às 23:59:00 | 3 |
| 8 | passado o fim, não se desarma | 2 |
| 9 | navegador que não guarda passa por "guardado" | 1 |
| 10 | a opção para qualquer perfil | 1 |
| 11 | o rascunho de outra obra fica aberto | 1 |
| 12 | o rascunho guardado não volta | 1 |
| 13 | a tela não recarrega na virada da máscara | 2 |

As de antes também foram rodadas na cópia de trabalho, e todas mordem:
- as 21 da D596;
- as 18 da D586;
- as 2 da D593;
- as 56 das cartas anteriores.

As duas pontas velhas da `557c` e da `557d` param num alvo que já mudou, antes de escrever, como antes.

**Fotos:** `docs/Capturas/2026-09-27_D599/`, cada estado a 1920 × 1080 e a 375. São quatro obras inventadas e oito OCs,
duas por obra. A máscara é da "Obra Aurora (teste)". O `carregarDados` de verdade roda sobre o banco falso, então o
filtro das fotos é o do código, e não um desenho.

| Foto | O quê | Medido na tela |
|---|---|---|
| 01a | Configurações, desarmada: a janela da auditoria já preenchida, "Armar" (laranja) e "Ver agora (ensaio)" (contorno) | — |
| 01b | Configurações, armada para 16/11 a 17/11 (hoje ainda não liga) | "Armada: liga em 16/11/2026 00:00 e desliga em 17/11/2026 23:59" |
| 01c | Configurações, ligada pelo ensaio | "Ligada até 27/09/2026 23:59 (ensaio)" |
| 02 | Dashboard com a máscara | 2 OCs, 1 obra ativa, R$ 7.050,00; nenhuma outra obra |
| 03 | Obras com a máscara | "1 de 1 cadastrada(s)" |
| 04 | Nova OC com a lista de obras aberta | na lista, só "Selecione…" e a obra da máscara |
| 05 | Histórico com a máscara | "2 de 2 registro(s)" |
| 06 | Dashboard sem a máscara, para comparar | 8 OCs, 4 obras, R$ 57.450,00 |
| 07, 08 | Obras e Histórico sem a máscara, a mais, para comparar | 4 obras; 8 OCs |

As 20 fotos foram medidas: nenhuma rolagem de lado, nada fora da tela, nada vazando do topo ou do menu. O único
"sobreposto" da medida é o da foto 04: a lista aberta cobre de propósito os rótulos logo abaixo.

**As fotos 02 a 05 usam o ensaio:** a janela da auditoria só liga em 16/11, e as fotos não mexem no relógio. O filtro é o
mesmo nos dois casos; o que muda é só o fim. Os limites de 16/11 e 18/11 estão provados nos testes.

## §5 — A linha medida do §9.5

As linhas novas fora de `docs\`:

| Contra | Linhas novas | Linhas tiradas |
|---|---|---|
| **`7edb715`** (o que a sua §4.4 pediu) | **981** | 12 |
| `main` (`origin/main`) | 2.304 | 229 |

- **As 981 contra `7edb715`:** 488 de código e 493 de teste, em 11 arquivos.
- **As 2.304 contra o `main`:** as 981 desta carta mais as 1.323 da tela de editar, que já esperam o perito.

Sozinha, a máscara fica abaixo das mil. Mas ela não vai ao ar sozinha: vai ao ar em cima da tela de editar, que já passa
das mil e já espera o perito. **A decisão sobre perícia é sua.** Se servir, as 981 cabem no mesmo pedido de perícia do
`d589-editar-ecr`.

## §6 — O que você precisa saber

1. **As datas da auditoria estão no código, como sugestão.** A sua §1 diz que as datas não entram no código, e a §2.2 pede a
   janela já preenchida com 16/11 00:00 a 17/11 23:59. Fiquei com a §2.2: `JANELA_SUGERIDA` só preenche os campos, e o
   Pedro pode mudar antes de armar. Nada liga sem ele apertar "Armar". Se preferir os campos vazios, é uma linha.
2. **O id da obra não está no código.** O Pedro escolhe a obra na lista.
3. **Se a perícia consertar o `d589-editar-ecr`,** trago o conserto para este ramo depois, como a sua §3 manda.
4. **O `pnpm-lock.yaml` já estava fora do `package.json` antes deste trabalho.** A instalação na cópia de trabalho só
   passou sem a trava do lockfile, e o lockfile foi devolvido como estava. O ramo não o altera. Não é desta carta
   consertar isso; fica registrado.
5. **Restos antigos no navegador:** `central-compras-cache-v2` e `central-compras-ui-v1` (§3). Ninguém lê, e não
   atrapalham a máscara. Apagá-los de vez, junto com o código morto que ainda sabe gravá-los, seria um passo separado,
   se você quiser.
6. **Na Nova OC com a máscara ligada, só a obra da auditoria aparece na lista.** Uma OC emitida no dia pega o próximo
   número do banco, como sempre. É o salto de número que o Pedro já conhece (a sua §2.10).

## §7 — O que fica de pé

- A cópia de trabalho fica de pé até a publicação. Ela sai só por `git worktree remove`.
- A pasta da casa segue parada para o perito, na D598.
- Quando a perícia chegar em `docs\Pericias\`, meço cada achado pelo "como conferir" do perito e respondo em carta,
  sem consertar antes da sua triagem.
