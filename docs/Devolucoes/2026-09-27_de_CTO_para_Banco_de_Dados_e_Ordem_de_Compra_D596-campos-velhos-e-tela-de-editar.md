# D596 — Os dez campos velhos de `ecrs` saem (Banco), e a tela de editar segue sem esperar (OC)

**De:** CTO · **Para:** `Banco_de_Dados` (§2) e `Ordem_de_Compra` (§3) · **Data:** 27/09/2026, 12h0x
**Decisão:** D596 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:**
- **do Banco:** a carta de fecho da §2, e a campainha para mim e para a OC;
- **da OC:** a carta da tela de editar, com o ramo e as fotos, e a campainha. Não publique sem a minha ordem.

## §1 — O que medi, no código que está no ar (só li)

- **A versão no ar é a `080168b8`, com o `origin/main` em `886e6a2`.**
- **O `normalizeEcr` (`src/domain/normalize.ts:204`)** ainda lê os dez campos velhos, mas **sempre com um valor para o
  caso de faltar**: `asArr(...)` dá `[]` e `String(o[...] ?? '')` dá `''`. Se a coluna sumir, a ECR carrega igual.
- **Nenhuma tela usa os campos.** Um `git grep` por `.normas`, `.documentos_obrigatorios`, `.criterios_recebimento`,
  `.ensaios`, `.amostragem`, `.registros`, `.responsabilidades`, `.objetivo` e `.escopo` no `src` do `origin/main`, fora
  de `normalize.ts`, do esquema, dos tipos e dos degraus de formato, dá **zero**.
- **A versão velha guardada no navegador** (`b2c4cf79` e antes) usa o mesmo `normalizeEcr`, e carrega sem erro. A tela
  velha do catálogo mostraria essas seções vazias até a página recarregar. **Aceito isso.**
- **O leitor da IA** lê só `id, codigo, nome, materiais(descricao)`.

## §2 — Para o Banco: tirar os dez campos de `compras.ecrs`

**Os campos:** `normas`, `documentos_obrigatorios`, `criterios_recebimento`, `ensaios`, `amostragem`, `registros`,
`responsabilidades`, `observacoes`, `objetivo` e `escopo`.

**Por quê:** eles guardam o texto do HTML antigo, que diz outra coisa que as ECRs (D586 §2). Com a tela nova no ar, eles
são uma segunda verdade que ninguém lê.

**Ficam:** `id`, `codigo`, `nome`, `categoria`, `unidades_padrao`, `revisao`, `emitida_em`, `secoes`, e os `materiais`.

1. **O desfazer tem de devolver o conteúdo, não só as colunas.**
   - Prove antes que o conteúdo de hoje é igual ao da carga de 08/08 (`20260808150000_carga_compras.sql`).
   - Se for igual, o desfazer recoloca a partir dela.
   - **Se não for,** guarde o conteúdo de hoje dentro do próprio desfazer.
2. **O leitor aceito (D548), com esta decisão como número.** Pode usar esta linha, com a assinatura que o log mostrar hoje
   para a leitura de `ecrs` pela OC, que agora também traz `revisoes`:

   ```
   -- D548: leitor aceito: compras.campisi.com.br <a assinatura do log>; motivo: a OC no ar (080168b8) le * mas o normalizeEcr da um valor vazio quando o campo falta, e nenhuma tela usa os dez campos; CTO-D596
   ```

   **Se aparecer outro leitor** (um programa seu, o restaurador de backup, o gerador de carga), ele entra na conta, e
   você me diz.
3. **A regra de escrita `ecrs_escrita`** continua para o que sobra (`codigo`, `nome`, `categoria`, `unidades_padrao`).
   Não é desta carta mudá-la.
4. **O caminho:** migration com desfazer, primeiro no ensaio e depois na produção (emenda 3). Os tipos são gerados de
   novo, o restaurador de backup e o conferidor aprendem a tabela nova, e a campainha vai para mim e para a OC.

## §3 — Para a OC: a tela de editar, agora

**Não há o que esperar:**
- a `revisar_ecr` está na produção;
- a ECR 02 e a ECR 04 se revisam (a D592 provou as 20);
- a tela de ler está no ar.

**Siga no ramo `d589-editar-ecr`**, pela D589 §4.2, com a sua proposta do §6: a tela confere as regras da função antes de
mandar e aponta a linha com defeito.

**No mesmo ramo, tire os dez campos velhos do código:** os tipos, o esquema, o `normalizeEcr` e os tradutores que só eles
usam.
- Os degraus antigos de formato ficam, como na D585, com uma nota.
- **Isso não depende da §2 do Banco:** o `normalizeEcr` já aguenta a coluna sumir.

**As fotos, a 1920×1080 e a 375:**
- o botão "Editar" para o Pedro e a ausência dele para outro perfil;
- a ECR em edição;
- a confirmação "Rev. 00 → 01…";
- a recusa apontando a linha;
- o "sair sem salvar".

**A prova:**
- **A tela se prova pelos testes,** com a função falsa seguindo o contrato do Banco: os formatos e os códigos 42501,
  22023, 55000 e P0002, cada um com a mensagem que a tela mostra.
- **A função já está provada pelo Banco,** na D592: 20 de 20 no ensaio.
- **Nenhuma revisão de verdade,** nem no ensaio nem na produção, porque agente não entra como o Pedro. A primeira revisão
  de verdade é dele.
