**De:** CTO · **Para:** Ordem de Compra · **Data:** 29/09/2026, 22h4x
**Decisão:** D641 · **Fase:** 4 — fora do portão: pedido direto do Pedro, como a D542; é a tela que o auditor do PBQP-H vai ver (16/11)
**Responde:** nada; é ordem nova, da foto do Pedro de 29/09, 22h4x
**Espero de volta:** o ramo, o CI, as fotos e a medida do §4. Não publique antes da minha linha sobre as fotos.

# A tela de Fornecedores por empresa: a empresa uma vez, as filiais dentro

## 1. O que o Pedro mostrou

- Ele abriu **Fornecedores**, buscou uma empresa e viu três linhas: uma por filial. As três trazem o mesmo selo,
  "Qualificada até 05/2027". Palavra dele: "aqui ainda está com as filiais".
- A regra é dele desde 25/09 (CTO-D501): a empresa existe, e existem as filiais; onde a filial não importa, entra
  a empresa como um todo. O portal já é assim (D504/D514), e a sua Nova OC também (D542/D549).
- A tela de Fornecedores ficou de fora. O erro é meu: na D613 eu aceitei a ficha da empresa aberta da gaveta de
  qualquer filial e não olhei a lista.

## 2. O que muda, só em `src/features/fornecedores/FornecedoresPage.tsx` e no que ela usar

1. **Uma linha por empresa**, pelo `agruparPorEmpresa` que você já tem:
   - o título é o apelido;
   - a linha menor traz a razão social (uma vez; se as filiais tiverem razões diferentes, as distintas) e
     "N filiais · cidades", do mesmo jeito que o `opcoesDeEmpresa`;
   - a ordem é a do apelido.
2. **Um selo de qualificação por empresa.** A qualificação é da empresa (D604), e a regra do selo é a de hoje.
3. **O que é da filial sai da linha da empresa:** CNPJ, e-mail e telefone, cidade. Ao clicar na empresa, as
   filiais abrem logo abaixo, recuadas. Cada filial mostra:
   - a cidade (e a rua quando a cidade empata, como na D542);
   - o CNPJ, o e-mail e o telefone;
   - se está ativa;
   - o **"Editar"**, que abre a gaveta de hoje, sem mudança.
4. **A empresa de uma filial só fica num nível só** (a regra do portal, D523): a linha dela já mostra o CNPJ e a
   cidade, e o "Editar" abre a gaveta direto.
5. **Ativo:**
   - se as filiais concordam, a empresa mostra como hoje;
   - se discordam, "N de M ativas";
   - "Ativos" mostra a empresa com alguma filial ativa, e "Inativos", a empresa com alguma filial inativa, para
     que a filial desativada continue achável.
6. **A busca** acha pelo apelido e pela razão social, fantasia, CNPJ, e-mail e cidade de qualquer filial:
   - se der uma empresa só, as filiais abrem sozinhas (D523);
   - a filial que casou fica marcada.
7. **O contador** passa a "N de M empresas · X filiais".
8. **Não mudam:** "+ Novo Fornecedor", "PDF dos qualificados", a gaveta, a ficha da empresa e o banco.

## 3. A prova

- **Testes:**
  - três filiais da mesma empresa dão uma linha;
  - a busca pelo CNPJ de uma filial abre a empresa e marca a filial;
  - ativo misto aparece nos dois filtros;
  - a filial sem `empresa_id` vira empresa sozinha.
- **Sabotagem:** agrupar por filial de novo tem de reprovar.
- **O caminho:**
  - um ramo a partir do `main`;
  - CI verde;
  - as fotos nas larguras de sempre, claro e escuro;
  - uma foto com a busca da empresa da foto do Pedro, fechada e aberta.
- Eu confiro as fotos. Com a minha linha, você publica pela emenda 3 e manda o `versao.txt`. São poucas linhas,
  longe de mil, então não há perícia.

## 4. Uma medida, sem consertar

Das três filiais da foto do Pedro, uma tem a razão social igual ao apelido, e não a razão social da Receita. Meça
só lendo quantas filiais estão assim. Diga o número na volta e **não conserte**: dado de cadastro é do Banco, e a
decisão é minha.

## 5. Junto, só documento: o `docs\Agente.md`

- A linha 23 diz que as seções 1 a 8 descrevem "a arquitetura da branch `main`" (JSON pelo File System Access API,
  sem login). O grafo dessas seções põe essa camada dentro do `App.tsx`.
- O `main` de hoje é a versão com banco, e o `App.tsx` não importa nada disso. O guia é o primeiro que o próximo
  agente lê.
- Conserte o texto: essas seções são a história da versão do arquivo, e o `main` é o banco.
- **O código dessa camada NÃO sai agora.** São 14 arquivos e 698 linhas que a tela não carrega (medição da
  manutenção, CTO-D640), e saem com a carta da D639, em 17/11, depois da auditoria.
