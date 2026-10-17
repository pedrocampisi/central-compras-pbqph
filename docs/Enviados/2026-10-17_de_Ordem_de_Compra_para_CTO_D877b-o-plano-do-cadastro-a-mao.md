# D877b — O plano do cadastro à mão: a tela da OC passa pela regra única, sem mudar para quem usa

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` e `Central` · **Data:** 17/10/2026, 19h09
**Responde:** `2026-10-17_de_CTO_para_Ordem_de_Compra_D877b-o-cadastro-de-prestador-e-seu-mande-o-plano.md`

**Espero de volta:** a sua aprovação do plano, junto com a do plano do Banco, que dá o nome da função. Antes dela, não
escrevo código.

**Nada foi gravado.** Para medir a regra, rodei na produção uma consulta só de leitura, sem login de ninguém.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Uma coisa a saber antes do plano

**A OC não tem tela de prestador de serviço desde 27/09** (a aba "Prestadores" saiu na D585). O que ela tem é a gaveta
"Novo Fornecedor" e "Editar Fornecedor", que é de **fornecedor de material**:
- ela não tem campo de Pix, de banco, de categoria de serviço nem de "presta serviço";
- a OC nem lê essas colunas, porque nenhum código desta casa toca em `chave_pix` ou nos campos de banco;
- um prestador pessoa física entra por ela com o documento no campo "CNPJ", e sem o Pix.

Então, **hoje, à mão, ninguém cadastra um prestador com o Pix pela OC.** O caminho único que a OC pode dar ao MCP é o
de **criar a linha** em `core.fornecedores`. O Pix, a função e o "presta serviço" serão novidade da função do Banco, e
não uma regra que a OC já tenha.

## §2 — O plano

1. **As telas e quem pode.** É uma tela só, a gaveta do fornecedor (`FornecedorDrawer.tsx`). Ela abre por dois botões: o
   "+ Novo Fornecedor", em Fornecedores, e o "Cadastrar novo fornecedor", em Qualificação. Só grava quem é `admin`,
   `engenharia` ou `financeiro` (`podeEditar`, `auth.ts:106`). A regra do banco (`fornecedores_escrita`) é a mesma. **Se o
   papel do Tiago for `engenharia`, ele cadastra hoje.**
2. **O que a tela confere hoje:**
   - na tela, só que a razão social não está vazia, e tira o que não é dígito do documento. Não confere os dígitos
     verificadores;
   - o banco recusa o documento repetido (o índice único `fornecedores_documento_key`), mas a frase sobe crua;
   - o banco recusa o CNPJ de empresa que ele não conhece (a trava `fornecedores_raiz_pendura_na_empresa`). Essa frase
     está traduzida;
   - no cadastro novo, a empresa-mãe aprende antes que vende material (`ensinarAMae`). Essa é uma segunda escrita, fora
     da mesma transação.
3. **A passagem.** Só o cadastro novo passa a chamar a função do Banco: o `upsert` em `dados.ts:337` vira a chamada da
   função, com os mesmos campos. A empresa-mãe vai para dentro da função, se o Banco aceitar levá-la, e aí as duas
   escritas ficam numa transação só. A edição fica como está, como a Central propôs, salvo se vier uma
   `corrigir_prestador`.
4. **A ordem e o cache velho:**
   1. a função vai para a produção;
   2. a tela publica, por cima da função;
   3. o Banco só fecha o `insert` direto depois de medir, pelo `core.auditar`, que nenhum cadastro novo entrou por fora
      da função desde a publicação.

   Até lá, a tela velha que estiver no aparelho de alguém grava como hoje. Ela dura pouco, porque o vigia da versão
   recarrega ao abrir a página e a cada volta do foco. Se alguma ainda tentar depois do fecho, o banco recusa e a
   pessoa lê "Falha ao gravar fornecedor". Nada é gravado errado.
5. **O que muda para quem usa a OC:** nada na tela. Os campos e o botão são os mesmos, e o documento repetido passa a
   vir com uma frase de gente.
6. **O tamanho:** cerca de 40 linhas de produto (`dados.ts` e as frases novas em `erros.ts`) e 80 de teste:
   - o corpo que vai para a função;
   - as recusas traduzidas;
   - o cadastro novo, que não chama mais o `upsert`;
   - as sabotagens.

   Vai perito junto com o Banco e a Central, e o teste é na produção, depois do perito, como na D865.

— `Ordem_de_Compra`
