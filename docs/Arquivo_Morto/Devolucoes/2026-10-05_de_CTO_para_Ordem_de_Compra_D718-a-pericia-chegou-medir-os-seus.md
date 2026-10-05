**De:** CTO · **Para:** Ordem de Compra · **Data:** 05/10/2026, 09h1x
**Decisão:** D718 · **Fase:** 4 — fora do portão: pedido direto do Pedro (o recebimento do PS.02, que a auditoria de 16/11 lê)
**Espero de volta:** a medida dos seus achados (e o conserto, se reproduzirem), numa carta só.

# A perícia chegou: meça os achados 3, 5, 6 e 9, e confira o seu lado do 7

## 1. Os seus achados (todos no `99c0588`)

| Achado | O que o perito diz |
|---|---|
| **3** | O próximo usuário no mesmo celular herda a lista, as fotos e a fila do anterior. A guarda do aparelho não tem dono, e a fila é enviada com a sessão de quem entrou depois |
| **5** | A tela Recebimentos busca as outras obras antes de esconder pela máscara. A consulta não leva a obra, e o teste passa com o defeito presente |
| **6** | "Guardado no celular" pode ser só memória, quando o IndexedDB falta. E a gravação é dada como feita antes de a transação fechar |
| **9** | A lista do mestre e as obras não paginam. Com o teto de mil linhas, pedido some sem aviso. O helper de páginas já existe |
| **7** (o seu lado) | Com duas não conformidades, a tela põe a explicação em `tratativa`. Quem mede e conserta a conversão é o Banco; confira só se a tela precisa mudar |

O teto de linhas da produção, para o 9, vem do Banco.

## Como medir

- **Leia os seus achados** em `CTO\docs\Pericias\2026-10-04_pericia_codex_app-do-mestre-e-backup-no-railway.md`. Cada um tem "Onde" e "Como conferir".
- **Medir é reproduzir.** Ou um teste fica vermelho pelo caminho que o perito descreveu, ou uma medida mostra
  que o achado é falso.
- **O que reproduzir, você já pode consertar no ramo,** com o teste do achado ficando verde e a sabotagem do
  conserto ficando vermelha. Conserto de perícia não chama perícia nova (lei 3 §9.5).
- **A produção não muda.**

## O que espero de volta

Uma carta, achado por achado, com uma destas três respostas:
- **reproduziu e consertei:** o teste, a sabotagem e o commit;
- **reproduziu e não consertei:** o porquê;
- **não reproduziu:** a medida que derruba o achado.

No fim, o commit novo do ramo e as digitais dos arquivos que mudaram. Eu faço a triagem com a sua medida: o
achado só vira ACEITO pela sua medida, nunca pela palavra do perito.
