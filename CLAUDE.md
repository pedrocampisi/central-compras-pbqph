# Ordem de Compra

> **Data:** 01/09/2026
> **Estado:** VALE HOJE
> **Escopo:** o que é **só** do Ordem de Compra e por onde a IA começa. **NÃO** contém as leis (moram no `Padrao_Ouro/`) nem a arquitetura (mora em `docs/Agente.md`).

A Central de Compras PBQP-H: emissão, aprovação e controle das ordens de compra da Campisi
Engenharia, ligadas às obras.

Este agente assina `Ordem_de_Compra`.

---

## ⛔ PARE. Leia as leis antes de qualquer outra coisa

**Estes três arquivos são LEI e você ainda não os leu. Abra os três, agora, antes da sua
primeira resposta e antes de olhar qualquer código:**

```
..\00_Diretrizes_e_padroes\Padrao_Ouro\2_ORGANIZACAO_DOS_DOCUMENTOS.md
..\00_Diretrizes_e_padroes\Padrao_Ouro\3_AGENTES_E_CORREIO.md
..\00_Diretrizes_e_padroes\Padrao_Ouro\4_COMO_SE_CONSTROI_SOFTWARE.md
```

@../00_Diretrizes_e_padroes/Padrao_Ouro/2_ORGANIZACAO_DOS_DOCUMENTOS.md
@../00_Diretrizes_e_padroes/Padrao_Ouro/3_AGENTES_E_CORREIO.md
@../00_Diretrizes_e_padroes/Padrao_Ouro/4_COMO_SE_CONSTROI_SOFTWARE.md

A primeira lei — conduta e como se fala com o Pedro — chega pelo arquivo da raiz da Plataforma.

Este arquivo guarda **só o que é específico do Ordem de Compra**. Em conflito, vale a lei.

> ⚠️ **Se não conseguir abrir algum dos três, diga isso ao Pedro na primeira resposta**, com o
> nome do arquivo que faltou.

---

## ⚠️ Duas versões convivendo — leia antes de mexer em qualquer coisa

```
   main                              migracao-supabase
   ────                              ─────────────────
   guarda em arquivo no OneDrive     guarda no banco
   sem login                         com login e permissão
   número da OC no navegador         número da OC vem do banco
   chave de IA no arquivo            chave de IA no servidor
   É O QUE A EQUIPE USA HOJE         A VIRADA É APROVAÇÃO DO PEDRO
```

**`docs/Agente.md` seção 0 é a tradução completa entre as duas.** Onde houver conflito com o
resto daquele documento, a seção 0 vence. Leia-a antes de qualquer alteração — mexer na versão
errada é o erro mais fácil de cometer aqui.

Na versão de migração, algumas telas são **somente leitura de propósito** (obras, prestadores,
avaliações, configurações): a camada ainda não grava, e **tela que diz "salvo" e perde no
recarregar é pior que tela travada.**

---

## Por onde começar

```
1  docs/INDICE.md ············ o que vale hoje
2  docs/Agente.md, seção 0 ··· a diferença entre as duas versões
3  docs/Devolucoes_Agentes/ ·· a caixa de correio com o Banco_de_Dados
```

⚠️ **A caixa desta casa ainda usa o nome antigo** (`Devolucoes_Agentes`, sem gaveta de
`Enviados/`). A lei manda `Devolucoes/` + `Enviados/` + `Arquivo_Morto/`. **Está registrado como
pendência**, não conserte por conta própria.

---

## Antes de dar qualquer coisa por pronta

```
pnpm test
```

São 69 verificações, em três frentes: cálculo, normalização e migração de formato.

```
pnpm typecheck
```

> ⚠️ **As bibliotecas guardam o endereço desta pasta por dentro.** Se ela mudar de lugar, os 24
> mil atalhos quebram **de uma vez** e o teste morre antes da primeira linha. O conserto é
> `pnpm install` no lugar novo — aconteceu em 20/08/2026, na arrumação das pastas.

> ⚠️ **Não gere o pacote de publicação pelo Git Bash.** Ele corrompe o caminho base e o site
> sobe com **tela branca**. Use o PowerShell ou deixe a publicação automática fazer — o
> diagnóstico disso custou a tarde de 10/08/2026, e o sintoma não aponta para a causa.

---

## O que só vale aqui

1. **Esta casa não altera o banco.** Toda necessidade vira carta para o `Banco_de_Dados`.

2. **O número da OC é do banco, não do navegador.** Na versão nova ele nasce **na emissão**,
   dentro da função do banco — rascunho fica sem número. Ler o último e somar 1 no navegador faz
   duas pessoas emitirem a mesma OC ao mesmo tempo.

3. **A lógica de negócio (`src/domain/`) não conhece a tela.** É lógica pura, testada, sem
   React — foi ela que permitiu trocar arquivo por banco sem tocar em regra nenhuma. Mantenha
   assim.

4. **Cor, sombra, raio e fonte vêm todos de `src/styles/tokens.css`.** Nada de cor solta dentro
   de módulo. A fonte oficial do padrão visual é
   `..\00_Diretrizes_e_padroes\Padrao_Front_end\`.

5. **Uma ação principal (laranja) por tela.** Qualquer segundo botão é de contorno.

6. **Ícone é desenho, nunca emoji** — emoji desenha diferente em cada sistema e não aceita a cor
   do tema.

7. **Sem portão de boas-vindas e sem animação de entrada.** A cerimônia da marca é da `Central`,
   que será a porta de entrada da equipe. Aqui o login é só formulário, e some no dia em que a
   Central assumir a autenticação.

8. **Movimento só em espera e no login.** E a espera só aparece depois de um quarto de segundo —
   antes disso, pisca à toa.
