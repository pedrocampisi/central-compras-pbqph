# Palavra do Pedro, repassada: o campo Emitente SOME — ao escolher a obra, a OC lê o destinatário da nota dela (`nf_empresa_id` ou `nf_cliente_id` de `core.intervencoes`) e mostra em leitura; obra sem destinatário não emite OC e a tela diz que falta cadastrar no Central; o PDF ganha dois blocos, "Faturar para" (o destinatário, nome e CNPJ/CPF) e "Entregar em" (o endereço da obra); `compras.emitentes` deixa de ser lida

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 14/09/2026, 21h0x
**Decisão:** CTO-D390
**Espero de volta:** carta com o commit, a prova na tela (Aider → PNEUARA; Yuri Solaris 2 → YUKAER; Jardim Ipanema II → Rodrigo Campisi como cliente; obra sem destinatário → a mensagem) e o PDF de uma OC de ensaio com os dois blocos; e a sabotagem

---

## §1 — O que o Pedro viu e o que eu medi na produção (21h0x, só leitura)

Ele abriu o campo Emitente ("o emissor tem que ser o mesmo do destinatário da obra, certo? (...) tem vários itens que nem estão em nenhuma obra. Por exemplo, Pedro Paulo: tem alguma obra onde o destinatário da nota é Pedro Paulo? (...) Fora que está faltando um monte de destinatário da nota aí também"). Medido:

```
   compras.emitentes (5, à mão) .. Rodrigo Campisi (PF, padrão, 2 OCs) · Pedro Paulo Rodrigues Campisi (PF) ·
                                   Campisi Engenharia LTDA · Campisi Locações LTDA · Campisi e Campisi Engenharia LTDA
                                   — todos com o endereço do escritório; NENHUM é nf_empresa_id/nf_cliente_id de obra alguma
   core.intervencoes (9 ativas) .. destinatário da nota: PNEUARA (Aider) · YUKAER (Yuri Solaris, Solaris 2, Umuarama) ·
                                   Rodrigo Campisi como cliente PF (Alphaville 2 terreno, Jardim Ipanema II, UMC) ·
                                   Alfredo Paroneto (PF) · Glenio Damasceno (PF)
   core.empresas (7) ............. PNEUARA e YUKAER são destinatários e não estão nos emitentes; WR Empreendimentos e
                                   WR Holding não são de obra nenhuma hoje
   a OC hoje ..................... dados.ts:81 lê compras.emitentes; App.tsx:251 escolhe solto; generateOcPdf.ts:102
                                   imprime o emitente escolhido (ou emitentes[0]) com o endereço do escritório
```

Ou seja: a lista é uma tabela própria da OC, preenchida à mão em agosto, que nunca olhou para o cadastro de obras. O
cadastro já sabe o destinatário de cada obra; é dele que a OC passa a ler.

## §2 — A palavra, com as quatro coisas (emenda de 12/09, D363)

```
   as palavras dele .. "faça assim" — 14/09/2026, 21h0x, na janela do CTO, ao plano do §3
   o que autoriza .... o §3 inteiro, código e testes no repositório da OC, com a sabotagem
   o que NÃO ......... publicar (palavra dele na SUA janela); mexer no banco (o Banco aposenta compras.emitentes
                       pela carta dele, D390); o resto da pausa de 04/09
   efeitos ........... commits na OC; as duas OCs já emitidas (emitente_id = Rodrigo) continuam valendo como estão
   caminho de volta .. git revert
```

## §3 — O desenho

```
   escolher a obra ...... a OC lê nf_empresa_id (→ core.empresas) ou nf_cliente_id (→ core.clientes) da obra e mostra
                          "Faturar para: <nome> · <CNPJ/CPF>" em leitura. Sem campo Emitente
   obra sem destinatário  não emite: "Esta obra não tem destinatário da nota cadastrado. Cadastre no Central."
   o PDF ................ dois blocos: FATURAR PARA (destinatário: nome, documento, endereço se o cadastro tiver) e
                          ENTREGAR EM (endereço da obra: core.imoveis da obra). O endereço do escritório sai
   a gravação ........... ordens_compra guarda o destinatário resolvido no momento da emissão (nome e documento),
                          para a OC antiga não mudar se o cadastro mudar — o campo/coluna é com o Banco (carta dele)
   emitentes[] .......... deixa de ser lida; o Banco aposenta a tabela quando você confirmar que nada mais a lê
   o que eu não sei ..... se core.clientes tem endereço para o bloco FATURAR PARA de pessoa física; se não tiver,
                          imprime nome e CPF e pronto
```

— CTO
