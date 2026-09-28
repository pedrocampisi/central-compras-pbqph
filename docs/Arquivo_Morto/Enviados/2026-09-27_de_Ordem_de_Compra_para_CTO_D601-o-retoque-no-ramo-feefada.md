# D601 — o retoque em Configurações, no ramo `d599-uma-obra` (`feefada`), NÃO publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 15h0x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D601-uma-obra-aprovada-com-um-retoque.md`
**Espero de volta:** a sua decisão sobre a §3 (a linha passou de mil por 3) e, na hora certa, a ordem de publicar.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** Nas fotos, as obras têm nome inventado.

---

## §1 — Onde está

- **Ramo:** `d599-uma-obra`, commit **`feefada`**, empurrado.
- **Feito na cópia** `Copias_de_trabalho\OC_uma-obra`. A pasta da casa continua parada em `7edb715`, com o status vazio.
- **Publicado:** nada. Continua no ar a `080168b8`.

## §2 — O retoque, item por item da sua §2

1. **A opção fica em cima, separada do resto da página:** uma linha fina (`var(--borda)`) fecha o bloco "Mostrar só uma
   obra" antes de qualquer outra coisa. A separação mora na própria opção, então quem não vê a opção também não vê a
   linha.
2. **O aviso vem depois da linha e diz do que fala:** "Somente leitura nesta versão — o resto desta tela ainda não é
   gravado no banco." O componente `AvisoSomenteLeitura` não mudou; só o `oQue` da tela de Configurações.
3. **O subtítulo:** "Mostrar só uma obra, textos legais e integração com IA."
4. **As fotos 01a, 01b e 01c foram refeitas**, a 1920 × 1080 e a 375, em `docs/Capturas/2026-09-27_D599/`, no lugar das
   de antes. Na medida, nenhuma rolagem de lado, nada fora da tela, nada vazado e nada sobreposto. As fotos 02 a 08 não
   mudaram: o retoque não toca nessas telas.

## §3 — As provas e a linha medida

**Testes:** 398, todos verdes. Uma trava nova em `tests/components/UmaObra.test.tsx` confere três coisas:
- o aviso diz "o resto desta tela";
- o aviso fica fora do bloco da opção, e depois dele;
- o subtítulo novo aparece.

**Verificação de tipos e revisão de estilo:** limpas.

**Sabotagens:** 3 novas, todas mordendo, cada arquivo restaurado com o mesmo sha256:

| # | A sabotagem | Vermelhos |
|---|---|---|
| 14 | o aviso volta a dizer "as configurações" | 1 |
| 15 | o aviso volta para cima, colado na opção | 1 |
| 16 | o subtítulo não diz que a tela tem a opção | 1 |

**A linha medida do §9.5, contra `7edb715`, fora de `docs\`: 1.003 linhas novas** (499 de código, 504 de teste) e 14
tiradas. Na D599 eram 981; o retoque somou 22, e 11 delas são a trava nova.

**Isso passa do portão por 3 linhas.** A sua §3 diz que, se passar de mil, vai ao perito antes. Não enxuguei nada para
caber na régua: a régua mede o que existe. A decisão é sua. Há dois caminhos:
- a máscara vai ao perito, por exemplo no mesmo pedido da tela de editar;
- você mede outra vez na ordem de publicar, contra o `main` que já terá a tela de editar, como a sua §3 previa.

## §4 — O que fica de pé

- A cópia de trabalho continua até a publicação e sai só por `git worktree remove`.
- O lockfile e os restos antigos esperam a triagem da perícia de código, como a sua §3 decidiu.
- Quando a perícia chegar, meço cada achado pelo "como conferir" e respondo em carta, sem consertar antes da sua
  triagem.
