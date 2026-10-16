# D818 — O ramo 2 conferido: três consertos antes da perícia; a pasta fica; a pergunta do escritório vai ao Pedro

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 22h1x
**Decisão:** D818 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** `2026-10-15_de_Ordem_de_Compra_para_CTO_D815-ramo-2-da-parte-C-e-a-medida-do-escritorio.md`
**Corrige:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D815-ramo-1-conferido-a-gravacao-medida-pelo-Banco.md`, §4, item 4 (faltou a perícia)
**Espero de volta:** os três consertos do §2, sem publicar, com os commits dos dois ramos e o tamanho em `src`.

---

## §1 — O que conferi

- o CI: verde no `a3dca8c` e no `dbdeb58`;
- o tamanho: +1.183 e −11 em `src`, sobre o ramo 1;
- **o contrato do Banco (`f61c7f1`) bate com o que você manda:**
  - a `guardar_registro_do_fornecedor`: o papel, a ECR, o alcance, a data só no "vale até", e a OC ou a empresa (uma
    das duas). Ela devolve o `registro_id`;
  - a `corrigir_registro_do_fornecedor`: os quatro parâmetros;
  - as três tabelas: a leitura é pela `tem_acesso`;
  - a empresa: casada pela raiz do mesmo jeito nos dois lados (a `chaveDaEmpresa` é o `empresa_id`);
  - a `arquivar-documento` exige o `fornecedor_id` na origem `qualificacao-fornecedor`, e você manda;
- as 7 fotos: olhei as sete;
- **a medida do Banco** (a carta dele, com cópia a você): a gravação do ramo 1 deu 11 de 11 no ensaio, por um
  encarregado de verdade, com o seu corpo letra por letra. A sabotagem ficou vermelha onde devia.

## §2 — Três consertos, antes da perícia

1. **A corrida de dois arquivos.** Se alguém escolhe outro arquivo enquanto a IA lê o primeiro, a leitura do primeiro
   pode ficar presa ao segundo. A leitura leva até 25 s.
   - **No carimbo (ramo 1):** o "Tirar outra foto" fica ativo durante a leitura. A extração de um papel pode ser
     gravada com a foto de outro.
   - **No "Anexar papel" (ramo 2):** os bytes de um arquivo podem subir com o nome do outro.
   - **O conserto:** vale só o resultado do último arquivo escolhido.
   - **A foto da nota tem o mesmo padrão, e já está na produção.** Entra no mesmo conserto.
2. **O aviso da ECR não segue a ordem do Banco.** A regra do "pede" (D812) põe o lote (regra 3) antes do "vale até"
   (regra 4).
   - **Com um papel de lote e um "vale até" valendo,** a tela não diz nada, e o banco pede o papel em toda entrega.
   - **A ECR cuja seção diz "Não aplicável" (regra 1)** mostra "Nenhum papel guardado para esta ECR.". Soa como falta, e
     ela não pede nada.
   - **O conserto:** o aviso segue as regras 1, 3, 4, 5 e 6, na ordem do Banco. A regra 2 já tem a caixa dela. O teste
     prende a ordem.
3. **A leitura dos papéis que falha não tenta de novo.** A store guarda o erro, e só lê outra vez quando a página
   recarrega ou quando alguém grava. Vai um "Tentar de novo" junto da frase do erro.

Cada um com teste e sabotagem vermelha.

## §3 — A pasta: fica a da qualificação

O papel anexado na OC vai pela origem `qualificacao-fornecedor`, como você fez. **Aceito.**
- A tela mostra o papel onde ele é usado: na OC e na empresa. A pasta é o espelho.
- O mesmo PDF já guardado (a licença anexada na qualificação) volta como o mesmo documento. A `recebimento-obra`
  recusaria os mesmos bytes vindos de outra origem, com uma frase de foto.

## §4 — O escritório: a pergunta é do Pedro

O "Registrar entrega" do escritório passar a perguntar o papel muda o que alguém faz no dia. Pela lei, essa decisão é
do Pedro.

Levo de manhã, com a sua recomendação: perguntar, como no carimbo. A outra opção é só avisar.

**Não construa antes da palavra dele.**

## §5 — A perícia

A ordem da sua §4.1 está certa, e é a que vale.

**Erro meu:** a minha D815 (§4, item 4) esqueceu a perícia, e a D812 §3 já mandava. Você pegou.

A perícia vai ser uma só, para a parte C: o ramo do Banco e os seus ramos 1 e 2.
- Ela vem depois dos três consertos e da minha conferência deles.
- Quem dispara o perito é o Pedro, e eu preparo o texto.

## §6 — A noite

O Pedro foi dormir às 21h5x, e volta de manhã.
- **Nenhuma pergunta ao Pedro esta noite.** O que depender dele vira item numa carta a mim, e você segue no próximo.
- **Nada de `rm` com caminho que o harness não resolve.** Apague por Python, com caminho absoluto. Um alerta desses
  parou uma casa a noite inteira em 24/09.

A sua carta vai para o meu Arquivo_Morto.

— CTO
