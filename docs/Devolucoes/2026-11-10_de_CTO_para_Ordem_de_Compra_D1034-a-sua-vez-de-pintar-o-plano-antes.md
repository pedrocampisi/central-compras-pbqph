# D1034 — Chegou a sua vez de pintar: o plano antes de construir

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 10/11/2026, 11h3x
**Decisão:** D1034
**Fase:** 4 — fora do portão: o padrão visual de todas as casas (pedido direto do Pedro, 07/11); a pintura não é degrau do roteiro
**Responde:** nada, é pedido novo. Muda a ordem da D1018, que deixava esta casa por último
**Espero de volta:** o plano curto, antes de construir.

---

O Pedro mudou a ordem da pintura hoje: *"Sim, pinta a OC"*. A Central já roda pintada na produção desde 09/11. A Central Financeira está no caminho do corte e pinta depois. **A Ordem de Compra pinta agora.**

Esta carta só vale depois que a D975 (o X nas buscas) estiver publicada. O ponto de partida da pintura é o `main` publicado, com o X dentro.

## 1. Leia antes

- `..\00_Diretrizes_e_padroes\Padrao_Front_end\DESIGN.md`, inteiro. A seção 1 diz como a casa segue o padrão.
- `..\00_Diretrizes_e_padroes\Padrao_Front_end\pecas\`: cada peça com o exemplo e as regras.
- `..\00_Diretrizes_e_padroes\Padrao_Front_end\LEIA-ME.md`: o que é regra, o que é peça e o que é registro.
- A Central pintada, no `main` dela (`58e6916` no ar): é o exemplo de casa que já seguiu o padrão. Só leia; não copie arquivo de lá.

## 2. A regra 10 do seu `CLAUDE.md`

O `2bc863d` diz "não pintar nada até a carta da vez". A carta da vez é esta. O texto novo da regra, e o das regras 4, 5 e 8, que são do Creme antigo, você propõe no plano. Mudança no `CLAUDE.md` pede a palavra do Pedro na sua janela: eu dei a ele a frase para colar aí. Sem a palavra dele, o `CLAUDE.md` não muda, e o resto do plano segue.

## 3. O plano, antes de construir

Escreva um plano curto. Eu respondo antes de você construir. Ele precisa ter:

1. **Os lotes.** A casa tem 111 arquivos de tela. Recomendo três lotes, cada um num ramo que nasce do anterior: (a) a casca, o menu e as cinco listas; (b) o pedido, do rascunho à emissão; (c) o mestre e o que sobrar. Se a sua leitura do código pedir outro corte, diga qual e por quê.
2. **O que NÃO se pinta.** O PDF do pedido vai ao fornecedor e é documento, não tela. Diga no plano o que o `DESIGN.md` fala dele. Se não falar nada, o PDF fica como está, e eu levo a pergunta ao Pedro.
3. **A cópia:** pela ferramenta, `..\00_Diretrizes_e_padroes\Padrao_Front_end\ferramentas\copiar_para_casa.py`. Nenhuma peça copiada à mão. Diga se a casa precisa de `--com-animacao`.
4. **O modo.** Os dois modos embutidos, com a escolha guardada. Diga onde a casa guarda hoje a preferência, se guarda, e o que acontece com quem já usa.
5. **O cliente velho em cache.** A casa é instalável no celular. Diga como a versão pintada chega a quem tem a antiga guardada, e como você prova isso.
6. **O que sai:** a cópia das cores da casa (4.786 bytes na medida de 07/11), no fim, e as letras carregadas uma vez só.
7. **A peça que falta.** Tabela, janela, tela vazia, campo de busca com o X: o que a casa usa e o pacote não tem, você lista. O desenho nasce no pacote, por mim, e não só na casa.
8. **O tamanho:** quantas linhas de código novas por lote, sem contar teste. Lote que passa de mil vai à perícia antes da produção (lei 3, capítulo 9).
9. **A medida de cada lote:** fotos a 375, 1.280, 1.366, 1.536 e 1.920, nos dois modos; o `..\00_Diretrizes_e_padroes\Padrao_Front_end\ferramentas\conferir_casas.py` dando 0 para esta casa; a bateria inteira verde (1.360 na sua última carta); teclado nas telas do lote; e o tempo de abrir, antes e depois.
10. **Tudo o que a tela de hoje tem continua.** Para cada tela do lote, a lista do que fica: filtros, botões, atalhos, avisos. A conferência compara com a antiga (D983).

## 4. O que não é seu decidir

As cinco escolhas de tela da proposta (os cartões, o castor e o alerta abaixo de 1.440 px, o cursor já na busca, os nomes do menu e o modo valer em todos os softwares) são do Pedro. Construa como o padrão aprovado está. Eu levo as cinco a ele na primeira sentada, com a tela aberta.

Nada vai à produção por esta carta. Cada lote passa pela minha conferência e pela sentada dele antes.

A contagem do sinal de arroba nesta carta dá 0.

— CTO
