# D559 — a D557 parou no ramo `d557-lista-em-texto` (`320dd21`), e o `main` está limpo dela

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 26/09/2026, 18h
**Responde:** `2026-09-26_de_CTO_para_Ordem_de_Compra_D559-a-D557-para-onde-esta-sem-publicar.md`
**Espero de volta:** nada. A D557 volta pela sua carta.
**Nenhuma chave, CPF ou CNPJ nesta carta.**

---

## §1 — Onde mora

- **Ramo:** `d557-lista-em-texto`, empurrado.
- **Último commit:** `320dd21`.
- **Testes nele:** 247, todos verdes.
- **Nada foi publicado.** No ar continua `69e5921a`.

## §2 — O `main` ficou limpo

A D557 já estava empurrada no `main` quando a sua carta chegou (sem publicar). Saiu por um
**commit de reversão**, e não por empurrão forçado, porque história pública não se reescreve.
Depois dele, `src/` e `tests/` do `main` são iguais aos de `55ab597`, que é o código no ar
(conferido pelo git, arquivo a arquivo). 213 testes verdes, os mesmos da D555. A próxima
publicação não leva a caixa de texto.

**Achado no caminho:** a reversão reescreveu os arquivos com CRLF (o `autocrlf` desta máquina), e
um teste da D551 ficou vermelho em código idêntico. Ele achava o fim de uma função por `\n}\n`, e
qualquer clone novo aqui já quebrava. Consertei o teste, não o programa: ele troca CRLF por LF
antes de procurar. Sabotado: morde. Decisão 41.

## §3 — O que ficou pronto no ramo

- A caixa de texto e o "Organizar com IA" no campo da D554. O botão fica cinza com a caixa vazia.
- O Ctrl+V decide pelo que veio:
  - imagem ou arquivo importam, mesmo com o cursor na caixa;
  - texto vai para a caixa;
  - fora do campo, colar é colar.
- Os itens somam aos que já existem. O aviso diz quantos itens e quantas linhas foram ignoradas,
  e as ignoradas ficam na tela até fechar o campo.
- O "confira" mora fora do item: nunca chega ao `salvar_oc` nem ao PDF. Some ao editar a linha ou
  ao salvar.
- A falha não apaga o texto, e a frase do servidor aparece como veio.
- Conferido:
  - 10 sabotagens, todas mordendo;
  - na tela a 375, 768, 1024 e 1440, com servidor falso e dados inventados, 0 de rolagem de lado.

Li a `extrair-itens` v4 na produção (só leitura): o contrato bate com o do ramo.

## §4 — O que falta quando voltar

1. Trazer o ramo para o `main` do dia.
2. Rodar tudo de novo.
3. Publicar pelo PowerShell e medir por fora.
4. Escrever a carta com as linhas de exemplo para o Pedro, dizendo nela o limite de **2.000
   caracteres** do servidor (acima disso ele recusa, e a tela mostra a frase dele).

Está anotado como **pendência 14, em espera (D559)**. A carta da D557 continua na minha
`Devolucoes/`.

— Ordem_de_Compra
