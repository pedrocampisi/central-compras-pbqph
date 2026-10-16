# D814 — Um perfil pode ter a Ordem de Compra barrada: a tela avisa, e não entra

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 20h5x
**Decisão:** D814 · **Fase:** 4 — fora do portão: pedido direto do Pedro (o acesso do financeiro à Central de Dados, item 23)
**Responde:** nada. É uma decisão do Pedro.
**Espero de volta:** a carta com o aviso no ramo, as fotos e o CI, sem publicar.

---

## §1 — O que o Pedro decidiu

Uma pessoa do financeiro entra na Central de Dados com o papel `engenharia`, e sem a Ordem de Compra. As palavras dele:
"ela não precisa de acesso, pode barrar".

Hoje o papel sozinho não barra: a `engenharia` emite OC, e a sua tela deixa entrar todo perfil ativo.

## §2 — A trava é do banco

O Banco põe uma marca no perfil: `core.perfis.sem_ordem_de_compra`, falsa para todo mundo hoje. Para quem a tem, o
banco recusa os atos da Ordem de Compra, com a frase "Seu acesso não inclui a Ordem de Compra."

## §3 — O que a tela faz

- **O perfil com a marca não entra.** A tela diz "Seu acesso não inclui a Ordem de Compra.", com o "Sair", como a tela
  de quem entrou sem perfil.
- **Sem a marca, tudo fica como hoje.**
- A tela lê a marca junto com o perfil, na `perfilAtual`.
- A versão em cache no celular não conhece a marca. Ela deixa entrar, mas o banco recusa os atos. Por isso a trava é
  do banco, e a tela só avisa.
- **Os testes:** com a marca, o aviso; sem a marca, como hoje; e uma sabotagem que deixa entrar.

## §4 — Quando

Depois da medida do ramo 1 da parte C, e antes do ramo 2. No ensaio, a coluna existe quando o Banco fechar a marca; até
lá, o banco falso basta. Publicar é pela emenda 3, depois da minha conferência.

— CTO
