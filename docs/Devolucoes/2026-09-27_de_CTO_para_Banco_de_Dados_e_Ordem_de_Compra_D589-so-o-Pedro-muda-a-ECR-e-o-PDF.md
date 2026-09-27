# D589 — Só o Pedro muda uma ECR, e salvar é aprovar; cada ECR ganha o PDF

**De:** CTO · **Para:** `Banco_de_Dados` (§3) e `Ordem_de_Compra` (§4) · **Data:** 27/09/2026, 10h2x
**Decisão:** D589 (completa a D588) · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:**
- **do Banco:** a carta de fecho da §3, com a campainha para mim e para a OC;
- **da OC:** duas cartas, uma por passo da §4.3, com o ramo e as fotos. Não publique antes da minha ordem.

## §1 — A palavra do Pedro

Às 10h2x de hoje, o Pedro respondeu a duas perguntas minhas.

1. **"Quando alguém mudar uma ECR no sistema, a mudança vale na hora ou só depois que você aprovar?"**
   Ele escolheu **"Só eu mudo":** só ele edita uma ECR, e salvar já é aprovar.
2. **"Sem o Word, como a obra e o auditor veem a ECR?"**
   Ele escolheu **"Botão de PDF em cada ECR":** o PDF leva o texto e a tabela de revisões, parecido com o Word de hoje.

## §2 — O que eu medi (só li)

- **Hoje há 3 perfis `admin` ativos na produção.** Por isso, "só o Pedro" **não** pode ser a regra "admin". Tem de ser o
  usuário dele, e mais ninguém.
- **`core.pode_editar_cadastro()` dá `true` a `admin`, `engenharia` e `financeiro`.** O comentário do `auth.ts` da OC
  diz "admin | engenharia" e está velho. **A OC conserta o comentário.**

## §3 — Para o Banco

1. **A permissão de revisar uma ECR é só do usuário do Pedro.**
   - A forma é sua: uma função nova, como `pode_revisar_ecr()`, que olha uma lista de um nome só ou uma marca no perfil.
   - **Você acha o usuário do Pedro pelo perfil dele.** Se houver dúvida entre dois, pergunte a ele na sua janela. Não
     ponha e-mail em carta.
   - **A trava que prova:** um outro `admin` tenta revisar e é recusado; o Pedro revisa e passa.
2. **Revisar é um caminho só,** uma função no banco. Ela recebe a ECR, o texto novo e a descrição do que mudou, e numa
   única gravação:
   - sobe a revisão (00 → 01, 01 → 02);
   - põe `emitida_em` = hoje;
   - troca o `secoes`;
   - escreve a linha nova no histórico, com a descrição e com o Pedro como quem revisou e quem aprovou.

   Regras da função:
   - **A descrição é obrigatória.** Sem ela, a função recusa.
   - **Texto igual ao de antes também é recusado.** Uma revisão que não muda nada não é revisão.
   - A escrita direta continua fechada, como a D588 mandou. Esta função é a única porta.
3. **O histórico guarda o texto inteiro de cada revisão.** A revisão velha fica guardada e se lê depois; é o que a norma
   pede do documento obsoleto.
   - Nas linhas que vieram da carga, o texto só se conhece onde a linha é a revisão vigente.
   - **A ECR 04:** a linha 00 fica sem texto, porque o vigente é o 01. **Não invente.**
4. **O caminho:** a mesma migration da D588 ou uma a mais, você escolhe. Sempre com desfazer, primeiro no ensaio e
   depois na produção. Os tipos são gerados de novo, e a campainha vai para mim e para a OC.
5. **Fica fora desta carta:** criar ECR nova, mudar código ou nome, e mexer nos materiais. Só quando o Pedro pedir.

## §4 — Para a OC

1. **O botão "PDF" em cada ECR.** Todo mundo que vê o catálogo vê o botão. O PDF da revisão vigente tem de ficar
   parecido com o Word:
   - **o cabeçalho:** "ECR – ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO", o nome, o código e "Rev.: 00";
   - **as cinco seções**, numeradas como no Word (1, 1.1, 1.2…), com a linha `numerado` false como nota sem número;
   - **no rodapé,** a tabela de revisões: revisão, data, descrição, quem revisou, quem aprovou.

   Use a mesma biblioteca do PDF da OC. **Nas fotos:** o PDF da ECR 03 e o da ECR 08, página por página.
2. **A tela de editar.** Só o Pedro vê o botão "Editar". Para os outros, ele nem aparece, e o banco recusa de qualquer
   jeito.
   - **Mudar dentro de cada seção:** mudar o texto de uma linha, o rótulo e a marca de nota; pôr uma linha, tirar uma
     linha e mudar a ordem.
   - **Ao salvar,** a tela pede "o que mudou" (obrigatório) e mostra, antes de gravar, por exemplo: "Rev. 00 → 01,
     emitida hoje, aprovada por você".
   - **Sair sem salvar** pergunta se é para perder as mudanças.
3. **Dois passos, cada um com as suas fotos e a minha ordem:**
   - **primeiro,** a tela de ler (D586 com a D588) e o PDF. Não dependem da §3;
   - **depois,** a tela de editar, quando a função da §3 estiver na produção.
4. **Conserte o comentário velho do `auth.ts`,** pela §2.
