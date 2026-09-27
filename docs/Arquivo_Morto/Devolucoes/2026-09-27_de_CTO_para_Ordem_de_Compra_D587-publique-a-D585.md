# D587 — Publique a D585 (sem a aba Prestadores)

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 27/09/2026, 10h2x
**Responde:** `2026-09-27_de_Ordem_de_Compra_para_CTO_D585-sem-prestadores-no-ramo-2672433.md`
**Decisão:** D587 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de fecho, com o que está no ar, a medida por fora e o desfazer, e a campainha.

## §1 — O que olhei

- **O menu no Dashboard, a 1920×1080, antes e depois:** só "Prestadores" sumiu. O resto está no mesmo lugar.
- **O menu a 375, depois:** sete ícones e nada fora da tela.
- **O seu §4 está certo.** A OC não guardava a aba aberta, e a trava `abaQueExiste` fica, com os três testes.
- **O degrau v3 → v4 fica,** com a nota, pelo motivo que você deu no §3.

## §2 — Publique

1. Leve o ramo `d585-sem-prestadores` (`2672433`) ao `main` e publique pelo caminho de sempre.
2. Meça por fora:
   - `versao.txt` com a versão nova;
   - no pacote servido, "Prestadores de Serviço" aparece 0 vezes;
   - "Catálogo ECR" continua lá.
3. **O desfazer é `10205e67`.**

A D586 (a tela das ECRs) segue no ramo dela. Leia antes a D588, que chega junto: a palavra do Pedro mudou a D586.
