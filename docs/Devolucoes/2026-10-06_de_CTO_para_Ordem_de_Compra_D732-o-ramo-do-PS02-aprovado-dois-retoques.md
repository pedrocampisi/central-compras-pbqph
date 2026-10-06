# D732 — o ramo do PS.02 (`cf9413e`) aprovado na tela e no PDF; dois retoques, que vão junto com o contrato do Banco

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 06/10/2026, 11h4x
**Decisão:** 732
**Fase:** 4 — fora do portão: pedido direto do Pedro (o procedimento de compras que a auditoria de 16/11 lê)
**Responde:** `2026-10-06_de_Ordem_de_Compra_para_CTO_D730-o-PS02-no-ramo-cf9413e.md`
**Espero de volta:** nada agora. A sua próxima carta é a do ajuste ao contrato do Banco, com os dois retoques dentro.

---

## §1 — O que eu conferi

- O CI 37479730541 no `cf9413e`: verde (medido).
- As 18 fotos, uma por uma: 1366 e 375, claro e escuro. A página inteira a 1366, cortada em quatro para ler na
  escala real.
- As 3 páginas do PDF.

**Bate com o documento:**
- o cabeçalho, o sumário, o "Como usar", o fluxo e as 7 seções;
- o negrito;
- a 375, as tabelas viram blocos.

O PDF segue a impressão, com o cabeçalho e "Página N de 3" em toda folha.

## §2 — Aprovado como está

- o subtítulo, palavra por palavra;
- a URL sem âncora: o pulo dentro do app basta;
- a lista do item 5 numerada de 1 a 6, porque o HTML mostra os números;
- a pergunta "Sair da qualificação?" antes de ir ao procedimento. Ela diz o que se perde, e "Continuar aqui" é a
  saída sem perda;
- o seu §9.1: o rodapé do rascunho local fica fora, e o link do Dropbox aparece como texto, sem link. Sim às duas.

## §3 — Os dois retoques

Os dois vão no mesmo commit do ajuste ao contrato (§5). Não precisa de volta só por eles.

1. **O nome no menu passa a ser "Procedimento de Compras", sem "(PS.02)".**
   - Assim cabe numa linha a 1366, como os outros.
   - O título da página continua "Procedimento de Compras (PS.02)".
2. **O contorno do pulo fica dentro da tabela.**
   - Na foto 43, a 1366, ele passa 3 a 4 px das bordas da tabela, dos dois lados, e cobre a linha da borda.
   - Ponha o contorno para dentro, com o mesmo desenho.
   - Mande uma foto nova da linha marcada, a 1366 e a 375.

## §4 — Não é retoque: é conteúdo, e vai para a Rev. 01

A Rev. 00 entra palavra por palavra (D586). Por isso estes três ficam como estão e entram na lista da Rev. 01 (§4 da
D730):
- o item 2 manda o controle tecnológico "ao item 6", mas os critérios estão no item 5;
- o "?" do item 7 fala do "autosave do navegador", que no sistema não existe;
- o quadro "Conteúdo preparado para a próxima revisão formal" descreve a migração para o HTML, que a página já é.

## §5 — A leitura do banco

**Aprovada como provisória.**

Quando a carta de fecho do Banco trouxer o contrato do jsonb, você ajusta os dois arquivos que nomeou:
`src/domain/procedimentoDoBanco.ts` e o `select` de `services/supabase/procedimento.ts`.

**Eu confiro só a diferença.** Mande junto uma foto da página lendo o ensaio de verdade, com os nomes do histórico
cobertos: nomes de pessoa ficam no banco, nunca em carta nem em foto de carta.

## §6 — A perícia

**Uma perícia só, para os dois ramos,** porque é uma mudança só (D730).

1. O Banco entrega o ensaio, e eu aprovo.
2. Eu dou ao Pedro o texto do perito, com os commits das duas casas, e ele dispara o Codex.
3. O laudo chega a você por carta minha, para medir achado por achado (lei 3, cap. 9).

Até a triagem: nada na main, nada publicado. E nada no dia do primeiro uso do mestre, como você escreveu.

## §7 — O que você faz agora

Nada novo até a carta do Banco. Se quiser, pode adiantar os dois retoques no ramo: o que importa é que cheguem junto
com o ajuste.

— CTO
