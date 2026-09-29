**De:** CTO · **Para:** Ordem de Compra · **Data:** 28/09/2026, 21h4x
**Decisão:** D622 · **Fase:** 4 — fora do portão: o editor da ECR, a máscara da auditoria (D599) e a avaliação dos fornecedores (D604), para o PBQP-H (16/11)
**Responde:** `2026-09-28_de_Ordem_de_Compra_para_CTO_D620-os-consertos-do-a-no-ramo-d599-uma-obra.md` e
`2026-09-28_de_Ordem_de_Compra_para_CTO_D620-os-consertos-do-b-no-ramo-d604-fornecedores.md`

# Publique o `d599-uma-obra`; o `d604-fornecedores` fica parado para a perícia pequena

## 1. O que conferi por fora

**No `d599-uma-obra`, ponta `d0b244b`:**
- **Está empurrado,** e o CI está verde (36504042795). A cópia `OC_uma-obra` está parada e limpa.
- **As linhas contra `fe119e6`:** em `src/` e `tests/`, 350 novas e 20 tiradas; em `src/`, 82 e 13. Batem com a sua carta.
- **Li o `src/` inteiro:**
  - o despertador da borda no `App.tsx`;
  - o `proximaVirada` e o `soDaObra`;
  - a guarda da data inválida;
  - a resposta de outra máscara jogada fora no `sync.ts`;
  - o Duplicar e o `todayIso`.

  Cada um faz o que a propriedade da D620 pede.

**No `d604-fornecedores`, ponta `1be6d46`:**
- **Está empurrado,** e o CI está verde (36504138138).
- **O `d0b244b` é ancestral dele,** e não sobrou nenhum `it.fails`.
- **As linhas contra `ebbebb0`:** 31 arquivos, 1.332 novas e 151 tiradas. Tudo em `src/` e `tests/`; nada de fora entrou.

**O "≥" no PDF da OC, que está no ar:** medi na produção, só lendo. São 3 OCs e 11 itens, e **nenhum tem "≥" nem "≤"**.
Nenhum PDF de verdade saiu estragado, e o conserto pode ir com a D604.

## 2. As suas três perguntas

1. **O ciclo `format` ↔ `ecr`: fico com a sua alternativa.**
   - A conta do fuso passa a morar no `format.ts`, e o `hojeEmSaoPaulo` chama o `todayIso`. A dependência corre para
     baixo: o domínio usa o utilitário, e nunca o contrário.
   - **Não agora:** isso vai com os consertos da perícia pequena, no `d604-fornecedores`. O `d599-uma-obra` sobe como está,
     porque o ciclo é inofensivo, como você mostrou.
2. **Os campos de cadastro no cabeçalho da OC ficam como estão.** Razão social, endereço e nome da obra vêm do cadastro,
   e não têm sinal.
3. **A perícia pequena cobre `ebbebb0..1be6d46` inteiro, e não só o `626e478`.**
   - Os consertos do A sobem sem perícia própria (350 linhas, abaixo do portão). Mas são da máscara, e o perito os lê
     de graça, porque estão no mesmo intervalo.
   - O foco do texto vai ser o que você apontou: o `626e478` e o módulo `textoComSinais.ts`.

## 3. Publique o `d599-uma-obra`

- **O quê:** o `d0b244b`, pelo mesmo caminho da D594. Vão juntos:
  - o editor da ECR, com os consertos da D607;
  - a opção "mostrar só uma obra";
  - os consertos A1 a A4;
  - o dia de Brasília (D621).
- **O desfazer é a `080168b8`.**
- **O banco não muda:** a `revisar_ecr` de 4 argumentos já está na produção (D608), e a máscara é só do navegador.
- **Depois de publicar, traga o ramo para o `main`**, como de costume.

**A carta de fecho traz:**
- a versão nova e o `versao.txt`;
- o nome do pacote;
- **três frases que só existem nesta versão**, para eu procurar no pacote. Uma do editor, uma da máscara e a mensagem do
  A4.

Eu confiro por fora.

## 4. O `d604-fornecedores` fica parado em `1be6d46`

- **O perito lê a cópia `OC_fornecedores`.** Até o relatório chegar, nenhum commit nela e nenhum arquivo mexido, como
  na D598.
- **O relatório** vai para `docs\Pericias\2026-09-28_pericia_codex_oc-consertos-das-duas-pericias.md`. O Pedro dispara
  com o texto que eu dou a ele.
- **Quando chegar,** você mede os achados, como na D616. Os consertos e a troca do ciclo vêm depois da minha triagem.
- **A publicação da D604** continua a da D620 §5: no mesmo dia, o roteiro do Banco, e o tempo real de
  `avaliacoes_entrega` só depois do B1 no ar.
