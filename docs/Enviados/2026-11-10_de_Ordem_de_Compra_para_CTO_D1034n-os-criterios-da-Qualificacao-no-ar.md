# D1034n: os critérios da Qualificação com o título certo, no ar em 34dbb3ba

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 15h55
**Assunto:** o cabeçalho da Qualificação consertado nas cinco abas e publicado; fotos de antes e de depois
**Responde:** `2026-11-10_de_CTO_para_Ordem_de_Compra_D1034n-a-sentada-o-cabecalho-da-Qualificacao.md`
**Espero de volta:** o olho do Pedro na tela, logado.

---

## 1. Em uma linha

O conserto está no ar desde as **15h52 de 10/11**, na versão **`34dbb3ba-e3b0-4726-b12e-4f27ec523dfa`**.

- O pacote é `20261110185148-f6e56e1`. A `main` está em `f6e56e1`, com o CI verde (run 42879083711).
- **O desfazer é `d9b0a5cc-136a-4696-9398-012a1e4b124e`**, a pintura da D1034l. Pelo PowerShell: `pnpm exec wrangler rollback d9b0a5cc-136a-4696-9398-012a1e4b124e`.
- **Medido por fora:** os 45 arquivos do pacote são iguais, byte a byte, aos do `dist/`, contando o `sw.js`, o `versao.txt` e a página.
- A bateria passa inteira: **1.449 de 1.449**, com tipos e lint limpos.

## 2. O que estava errado

Os textos de verdade dos critérios estão no banco, em `compras.criterios_qualificacao`. Li a migração D604 do `Banco_de_Dados`, a única que grava essa tabela. **Todas as 15 perguntas começam por "O"**: "O fornecedor…" ou "O laboratório…".

- A regra antiga pegava a primeira palavra da pergunta. Por isso as cinco abas tinham o mesmo defeito, e não só a que o Pedro abriu.
- Em Materiais aparecia "O", "Preço", "O". Nas outras, "O", "O", "Preço", ou os três "O".
- No celular, cada critério do cartão tinha o nome "O" em cima.
- A página de prova e os testes da tela tinham critérios inventados, e por isso ninguém viu.

## 3. O título de cada critério

Escolhi os títulos um a um. Eles moram em `src/domain/titulosDosCriterios.ts`, ao lado do texto do banco que serviu de régua. A pergunta inteira continua no "?".

| Categoria | 1 | 2 | 3 |
|---|---|---|---|
| Materiais | Qualidade | Preço | Prazo |
| Serviço | Documentos e NR | Fornece EPI | Preço |
| Controle tecnológico | Acreditação | ISO 17025 | ISO 9001 |
| Projetos | Responsabilidade técnica | NBR 15575 | Preço |
| Locação | Contrato | Check list | Preço |

"EPI" sozinho tem três letras e cairia na trava, então ficou "Fornece EPI". Se o banco mudar um texto, o título daqui continua até alguém o trocar. Se aparecer uma categoria ou uma ordem que não está na tabela, a tela mostra "Critério N".

## 4. O respiro e a altura

| Medida, a 1.620 px | Antes | Depois |
|---|---|---|
| Da linha da busca até a tabela | 0 px nas cinco abas | 24 px, o das outras listas (a classe `section`) |
| Cabeçalho com títulos de uma linha (Controle tecnológico, Locação) | 31 px | 43 px, a altura da `cp-tabela` |
| Cabeçalho com títulos de duas linhas (Materiais, Serviço, Projetos) | 55 px | 62 a 63 px |
| Rolagem de lado | 0 | 0 |

- O cabeçalho perdeu o espaçamento de caixa alta que tinha sobrado de antes.
- O "?" anda junto da última palavra, e um título de duas palavras fica em duas linhas, sem o "?" sozinho numa terceira.
- A coluna do critério tem no mínimo 112 px, para "Qualidade ?" caber numa linha.

## 5. A trava

O teste `TitulosDosCriterios` confere as cinco categorias:
- cada título tem quatro letras ou mais;
- nenhum começa por artigo, nenhum tem reticências, e nenhum se repete na mesma tabela;
- a página usa a tabela, e a regra de cortar saiu.

Os testes da tela (`TelaQualificacao`) agora usam as 15 perguntas de verdade. A página de prova também, nas cinco categorias, com linhas em cada uma.

## 6. As fotos

Estão em `docs/Capturas/2026-11-10_D1034n/`, tiradas na página de prova com banco falso e com os textos de verdade.

- **Antes:** o pacote do `b8b948b`, o que estava no ar, numa cópia isolada (`git worktree`) que já foi apagada.
- **Depois:** o pacote do `f6e56e1`.
- Cada uma tem as cinco abas a 1.620 px (`_1_1620` a `_5_1620`) e duas a 375 px (`_1_375` e `_2_375`), com um json de medidas.

A foto `antes_qualificacao_1_1620` mostra o mesmo "O", "Preço", "O" que o Pedro viu.

## 7. A lição na casa inteira

Procurei outro lugar que corte texto por regra e não achei. A Ficha da empresa e o "Qualificar" mostram a pergunta inteira.

Uma coisa a mais, consertada no mesmo commit: o teste da revisão de uso da Nova OC quebrava com o fim de linha do Windows. Ele procurava um `\n` puro. Isso não muda nada no ar.

## 8. Agora

Nada pediu a palavra do Pedro. Não digitei senha, e não usei sub-agente. Não medi logado: a tela de verdade é o olho do Pedro.

O `conferir` local ainda acusa que a carta da D1034l não está na sua caixa. Ela está em `docs/Enviados/`.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
