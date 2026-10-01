**De:** CTO · **Para:** Ordem_de_Compra · **Data:** 01/10/2026, 09h2x
**Decisão:** D661 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (16/11), como a D604.
**Responde:** nada; é ordem nova, com a palavra do Pedro de hoje.
**Espero de volta:** o ramo, o CI, as provas do §5 e as fotos numeradas. **Não publique:** eu confiro as fotos, e a
ordem de publicar vai em carta curta.

# Uma tela "Qualificação" no menu, igual à planilha FO 8.4.1.1

## 1. A palavra do Pedro

- **A pergunta, hoje, na janela do CTO**, com a foto da aba MATERIAIS da planilha: "eu quero fazer isso daqui no
  software, onde eu faço".
- **Foi a terceira vez** que ele perguntou onde se qualifica fornecedor. Respondi com o caminho e recomendei uma
  tela no menu igual à planilha: uma aba por categoria, a tabela com as mesmas colunas, um "+ Qualificar fornecedor"
  e o requalificar na linha. As qualificações gravadas não mudam; a tela só mostra de outro jeito o que existe.
- **A resposta dele:** "pode, vamos ver se fica melhor".
- **A pausa da casa se levanta só para este item**, pela palavra dele.

## 2. O que existe hoje (lido no `main` cd8bacb)

- **O caminho tem cinco passos e esconde a qualificação:** Fornecedores → a empresa (ou Editar numa filial) → a
  gaveta → "Abrir a ficha da empresa" → Qualificar / Requalificar na categoria.
- **A ficha** (`src/features/fornecedores/FichaDaEmpresa.tsx`) mostra as cinco categorias, o selo, a linha que vale
  e o histórico. **O diálogo** (`QualificarDialogo.tsx`) grava. **A regra** está em `src/domain/qualificacao.ts`
  (`seloDaFilial`, `historicoDaFilial`, `desempenhoDaFilial`, `situacaoNoDia`, `travaDaQualificacao`). **Os dados**
  vêm de `useQualificacoesDoDia`.
- **Em Fornecedores** há a coluna do selo e o botão "PDF dos qualificados".
- **O menu** está em `src/App.tsx:58-65` (`NAV_COMPRAS`).
- **A frase da trava** para quem está fora do "Qualificar agora" manda à ficha: "Qualifique a empresa na ficha
  dela, em Fornecedores" (`domain/qualificacao.ts:266`).

## 3. A planilha que a tela imita

Cada aba tem a mesma tabela:

| Fornecedor | Tipo | Data da qualificação | Data para requalificar | critério 1 | critério 2 | critério 3 | Nota de desempenho | Situação |
|---|---|---|---|---|---|---|---|---|

- **Materiais** tem uma coluna a mais no fim: **Permissão para compra**.
- **Controle tecnológico** não tem Tipo, e a coluna do desempenho se chama "Desempenho".
- **Os textos dos três critérios** de cada aba já estão no banco (`criterios_qualificacao`), iguais aos da
  planilha.
- **Na planilha, o "x" marca o critério atendido**, e a data para requalificar, a nota e a situação estavam em
  branco. O sistema já calcula as três.

## 4. O que construir

O desenho e as palavras são seus; o conteúdo, não.

1. **"Qualificação" no menu, logo abaixo de Fornecedores.** Um título (uma vez só, como na D643) e uma linha
   dizendo o que é a tela: as qualificações da FO 8.4.1.1, por categoria.
2. **Cinco abas, na ordem da planilha:** Materiais, Serviço, Controle tecnológico, Projetos e Locação. Cada aba
   mostra quantas empresas tem.
3. **Uma linha por empresa que tem qualificação na categoria**, com a que vale. O fornecedor sem empresa
   cadastrada tem linha própria, como na ficha. A empresa com várias filiais é uma linha só. O histórico não vira
   linha.
4. **As colunas na ordem da planilha:**
   - Fornecedor;
   - Tipo (em Materiais, as ECRs junto);
   - Data da qualificação;
   - Data para requalificar;
   - os três critérios, com "atende" ou "não atende", e o texto inteiro e o motivo ao alcance de um passar do mouse
     ou de um clique;
   - a nota (quantos atendem, de 3, e o mínimo);
   - o desempenho dos últimos 12 meses, curto;
   - a situação, com o selo de sempre;
   - em Materiais, **Permissão para compra**.
5. **A Permissão para compra sai da mesma regra da trava da emissão** (as situações com que a OC emite, em
   `qualificacao.ts`), nunca de uma conta nova. Se a tela disser "sim", a Nova OC tem que emitir; se disser "não",
   tem que travar.
6. **O que pede ação salta aos olhos:** vencida, vence em 30 dias e desqualificada. A ordem e o filtro são seus.
   Hoje há quatro vencidas em Projetos.
7. **"+ Qualificar fornecedor" no alto de cada aba.**
   - Escolhe o fornecedor do cadastro, com busca pelo nome, e abre o mesmo `QualificarDialogo` na categoria da aba.
   - Se a empresa já tem linha nessa categoria, o título diz "Requalificar".
   - **Se o fornecedor não está no cadastro**, como o de blocos e as duas locações que ficaram fora da carga (D619):
     o caminho para cadastrar sem sair da tela, com a gaveta de novo fornecedor que já existe, e de volta para
     qualificar.
8. **Na linha, "Requalificar"** abre o mesmo diálogo, e o histórico (a ficha) fica a um clique.
9. **O "PDF dos qualificados" também nesta tela**, com o mesmo gerador.
10. **Só quem pode emitir OC qualifica** (D605 §4, `podeEmitirOc`). Os outros só leem, como na ficha.
11. **Uma fonte só:** os mesmos dados (`useQualificacoesDoDia`) e as mesmas funções da ficha. Nada de segunda conta
    da situação, do vencimento ou da nota.
12. **A frase da trava** (`qualificacao.ts:266`) passa a mandar à tela nova, pelo nome que ela tiver no menu.

**O que NÃO muda:** o banco (nenhuma migration; se precisar de uma, pare e me escreva antes), a ficha, a gaveta, a
coluna do selo em Fornecedores e o "Qualificar agora" da Nova OC.

## 5. As provas

1. **Testes da regra pura que monta as linhas da tela:**
   - uma linha por empresa e categoria, com a que vale;
   - empresa com duas filiais dá uma linha;
   - fornecedor sem empresa dá linha própria;
   - requalificar não duplica a linha;
   - a vencida aparece vencida no dia (a `situacaoNoDia`);
   - a Permissão para compra bate com a `travaDaQualificacao` para a mesma empresa.
   - Sabotagem: montar as linhas por filial, e não por empresa, reprova.
2. **As fotos**, do jeito das da D604 e da D644, numeradas, em `docs\Capturas\2026-10-01_D661\`, com dado inventado:
   - as cinco abas;
   - uma aba com vencida, uma com desqualificada e uma vazia;
   - o "+ Qualificar fornecedor": a escolha, o diálogo e o fornecedor que não está no cadastro;
   - a tela de quem só lê;
   - claro e escuro;
   - nas larguras 1920, 1366, 768 e 375, sem rolagem de lado na página.
3. **Na carta de volta** não vão nome, CPF, CNPJ nem endereço de ninguém.

## 6. O caminho

- Ramo novo a partir do `main` (cd8bacb), pela emenda 3. Deve ficar longe de mil linhas, então não precisa de
  perícia; se passar, diga antes de seguir.
- Não publique: eu confiro as fotos e o ramo, e a ordem de publicar vai em carta curta. A tela só acrescenta, e o
  caminho velho continua, então o Pedro a vê no ar.
