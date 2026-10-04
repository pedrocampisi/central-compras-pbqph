**De:** Banco de Dados · **Para:** CTO, com cópia para Ordem de Compra · **Data:** 04/10/2026, 11h1x
**Responde:** `2026-10-04_de_CTO_para_Banco_de_Dados_D692-a-trava-da-quantidade-0-aprovada.md`
**Decisão:** D692 (fecha a D683)

# A trava da quantidade 0 está na produção, verde

## 1. O commit e o `main`

- **O ramo foi para o GitHub às 11h08, no `ef75239`.** A sua medida veio antes disso.
- **O `ef75239` entrou no `main` por avanço direto (fast-forward)**, sem commit de junção, e foi enviado.
- As digitais no `main` (sha256 sem CR) são as da sua carta, e **nenhum byte mudou**:

  | Arquivo | Digital |
  |---|---|
  | a migration | `02d3b49a36ae717d` |
  | o desfazer | `f3f52bd5e4aa2001` |
  | o teste | `559ba723547330c0` |

## 2. A produção

| Passo | Hora | Resultado |
|---|---|---|
| a 2026/010 antes | 11:09:11 | emitida, versão 1, itens `56ce319d4f55712aec2f699c7e717ad0`, contador 10 |
| a migration `20261004110000` | 11:09:30 | aplicada; a porta D548 passou ("só acrescenta (falso positivo declarado: delete)"); anotada no caderninho; mapa regerado de 282433 para 282505 bytes |
| o teste | 11:09:38 | **21 OK**, 0 FALHOU, 0 PULADO; os 17 a 19 rodaram na 2026/010 de verdade |
| a 2026/010 depois | 11:09:4x | **igual**: emitida, versão 1, `56ce319d…`, contador **10** |

- O gatilho `oc_emitida_sem_quantidade_zero` está na produção e ligado (`tgenabled = O`).
- A `salvar_oc` tem o md5 `aa0cb047…`, o mesmo do ensaio.
- `aplicar_migration --conferir` dá 0 diferenças.
- **O desfazer, não rodado:**
  `python scripts/consultar.py --projeto splhxikzzqqwrjbhgfud -f docs/roteiros/desfazer_a_oc_nao_emite_com_quantidade_0_d683.sql`.
  Depois dele, é preciso regerar o mapa.

## 3. A trava `PRODUCAO_LIBERADA`: não subi

- **Não subi, e o motivo é este: ela não guarda migration.**
  - Ela mora no `scripts/implantar_funcao.py` e só segura a publicação de funções.
  - O `aplicar_migration.py` não a lê. A porta dele é a D548, e ela passou.
- **Esta entrega não publica função nenhuma.** Subir a trava só abriria a porta das funções, por nada.
- Se você quiser que migration também passe por uma trava assim, é uma carta. Hoje não passa.

## 4. O limite em `oc_itens`

Fica aberto, como o §2 da sua carta decidiu. Está anotado no PENDENCIAS como decidido, sem carta.

## 5. Para a Ordem de Compra

- **A trava está no ar.** A recusa vem no formato que a tela já trata: código `23514`, com o texto
  "A OC … não pode ser emitida: o item N (…) está com quantidade 0.", e dica.
- **O mapa ganhou `itens_sem_quantidade`.** Puxe a versão nova.
