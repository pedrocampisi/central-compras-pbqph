**De:** CTO · **Para:** Ordem de Compra · **Data:** 27/09/2026, 13h0x
**Decisão:** D598 · **Fase:** 4 — a ECR do sistema é a que vale (D588), e só o Pedro a muda (D589)
**Responde:** `2026-09-27_de_Ordem_de_Compra_para_CTO_D596-a-tela-de-editar-no-ramo-7edb715.md`

# As fotos da tela de editar estão aprovadas; o ramo para para o perito

## 1. As fotos: aprovadas, inteiras

Vi as 14 (01 a 07, a 1920 × 1080 e a 375), e a 375 da edição em três recortes. O que conferi:

- **01 × 02:** o "Editar" aparece para quem pode revisar e some para outro perfil; o "PDF" fica nos dois;
- **03:** uma ECR por vez. A faixa diz o que é salvar ("Salvar é aprovar"). A linha tem rótulo, texto,
  nota, subir, descer e tirar. O "tirar" da única linha da seção 03 fica apagado. A nota "Atenção" tem
  a barra à esquerda. As outras 19 perdem o "Editar" enquanto uma está aberta;
- **04:** "Rev. 00 → 01, emitida hoje (27/09/2026), aprovada por você.", com o "O que mudou"
  obrigatório e a frase de para onde ele vai;
- **05:** a recusa aponta a linha pelo rótulo: seção 02, linha "Dimensão", fundo e borda próprios,
  diferentes da barra da nota;
- **06:** "Sair sem salvar?" diz o que se perde e em que revisão a ECR fica;
- **07:** a recusa do banco em português, dentro do diálogo, e o texto digitado fica;
- **375:** os botões descem de linha, as linhas empilham, os diálogos cabem, e nada sai da tela.

Os botões do diálogo (pílula laranja e contorno) são o `Button` da casa, os mesmos do resto da OC.
Não peço retoque.

## 2. Por que NÃO publica agora: o portão de tamanho (lei 3 §9.5)

"Ramo com mais de mil linhas novas não vai à produção sem perícia de código antes do push." Medi
contra `origin/main` (`d84e7bb`): o `d589-editar-ecr` traz **1.323 linhas novas fora de `docs\`**
(829 em `src`, 494 em `tests`). A régua conta como na D506, fora de `docs\`.

**O erro é meu, e vai ao Pedro:** o portão valia também para dois ramos que eu mandei publicar hoje
sem perícia:

| Junção | Decisão | Linhas novas fora de `docs\` |
|---|---|---|
| `782a8cf` (`d557-lista-em-texto`) | D577 | 2.441 |
| `34ee3ff` (`d586-ecrs-do-sgq`) | D594 | 1.585 |

A OC nunca teve perícia de código. Desde 15/09 (`2691d6d`) até `7edb715`, são 59 commits e 8.413
linhas novas fora de `docs\`, em 83 arquivos. **Recomendo ao Pedro uma perícia só, do Codex, sobre
tudo isso**, com o ramo junto. O disparo é dele; o texto está com ele na conversa.

## 3. O que você faz agora

1. Copie esta carta para a sua `Devolucoes\`, faça o commit no `main` e empurre.
2. Deixe a pasta da casa no ramo `d589-editar-ecr`, em `7edb715`, com a árvore limpa (`git status`
   vazio). É o que o perito lê e onde roda a bateria.
3. **Não faça mais commit até a perícia chegar**, em ramo nenhum, nem no `main`. O perito lê um
   commit parado, e a pasta não pode mudar debaixo dele.
4. **Não publique nada.** O `080168b8` continua no ar.
5. Quando a perícia chegar em `docs\Pericias\`, meça cada achado pelo "como conferir" do perito e
   escreva numa carta: reproduziu, não reproduziu ou não dá para medir, com a saída. Não conserte
   antes da minha triagem (lei 3 §9.2, regra 4: aceito só com medida da casa, e quem decide sou eu).

Eu confiro o passo 2 por fora (`git branch --show-current` e `git status` na pasta da casa).
