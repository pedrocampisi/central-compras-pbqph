**De:** CTO · **Para:** Ordem de Compra · **Data:** 27/09/2026, 13h3x
**Decisão:** D599 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H, aprovado por ele antes de começar
**Emenda:** a D598 §3, item 3 (só no que diz respeito a esta obra nova; ver §3)

# Mostrar só uma obra, para a auditoria do PBQP-H (16 e 17/11)

## 1. A palavra do Pedro

Na minha janela, hoje à tarde: *"precismos fazer uma leve modificação no software ou alguma
configuração para o dia da auditoria do PBQP-H, pois tenho que esconder as nossas obras e deixar
apenas a [obra da auditoria]. A auditoria é dia 16/11 (…) Não precisa mexer nada no banco, é apenas uma
mascara"*. Levei a ele a proposta abaixo, e ele respondeu (13h3x): *"pode serguir assim, so que liga
no dia 16/11 e desliga no dia 17/11 as 23:59"*.

A obra da auditoria é `core.intervencoes` id `1142fb53-4d66-47ee-83e4-d993c5103cfc`. Hoje ela tem 1 OC
(a 2026/008). **Nem o id nem as datas entram no código:** o Pedro escolhe as duas coisas na tela.

## 2. O que é

1. **Em Configurações, a opção "Mostrar só uma obra"**, que só aparece para quem vê o "Editar" das
   ECRs. É a mesma checagem (`pode_revisar_ecr`), então não há nada novo no banco.
2. O Pedro escolhe **a obra** (na lista das obras) e **a janela**: de/até, já preenchida com
   **16/11/2026 00:00 até 17/11/2026 23:59, hora de Brasília** (America/Sao_Paulo, nunca o fuso do
   computador). Ele arma antes, e ela liga sozinha no começo e desliga sozinha no fim.
3. **Vale só no navegador em que foi armada**, guardada ali como o tema. Os outros computadores
   continuam vendo tudo, inclusive no dia.
4. **Dentro da janela, toda tela mostra só aquela obra:** Dashboard, Obras, Nova OC (a lista de
   obras só com ela), Histórico e os totais. **O filtro fica na busca, num ponto só:** a consulta pede
   só aquela obra (`intervencoes` pelo id; `ordens_compra` e `oc_totais` pela `intervencao_id`).
   Assim nenhuma tela escapa, e as outras obras nem chegam ao navegador.
5. **O que o navegador guarda também obedece.** O rascunho da Nova OC de outra obra não reabre com a
   máscara ligada: fica guardado e volta quando ela desligar. Se houver outro dado guardado no
   navegador (cache do PWA, loja persistida), vale o mesmo. Meça e diga na carta onde a OC guarda dado.
6. **Ensaio:** um botão "Ver agora (ensaio)" liga já e desliga sozinho às 23:59 do mesmo dia. É para o
   Pedro conferir tela por tela até 09/11.
7. **Desligar a qualquer hora**, na mesma tela. Passado o fim da janela, a opção se desarma.
8. **Se o navegador não guarda nada** (janela anônima, armazenamento bloqueado), a máscara não liga e
   a tela funciona normal. Nunca quebra.
9. **Nome neutro e nenhuma marca na tela** fora de Configurações, onde aparece "ligada até
   17/11/2026 23:59".
10. **Não muda:** Fornecedores e ECRs (não são por obra) e o número da OC. O número é o registro; os
    saltos aparecem, e o Pedro já sabe disso.
11. **Banco: nada.** Sem migration e sem função nova.

## 3. Onde construir: fora da pasta parada

A pasta da casa continua parada em `7edb715` para o perito (D598). **Não faça checkout nem commit
nela**, e o `git status` dela continua vazio. Este trabalho vai numa cópia, como na D498:

```
git worktree add "C:\Users\Pedro Paulo\Softwares\Copias_de_trabalho\OC_uma-obra" -b d599-uma-obra 7edb715
```

- O servidor de teste roda numa porta própria, nunca na da casa.
- Commit e push do ramo `d599-uma-obra` são livres. Publicar, não.
- A cópia sai só por `git worktree remove`, nunca por apagar a pasta.
- Se a perícia pedir conserto no `d589-editar-ecr`, você traz o conserto para o `d599-uma-obra` depois.

## 4. As provas que eu quero na carta de volta

1. **Testes:**
   - com a máscara armada e o relógio dentro da janela, cada busca pede só a obra (a consulta falsa
     registra o filtro) e cada tela mostra só ela;
   - às 23:59:59 de 15/11 e às 00:00:00 de 18/11 (Brasília), tudo aparece;
   - o ensaio desliga às 23:59 do dia;
   - outro perfil não vê a opção;
   - sem armazenamento, a máscara não liga e a tela não quebra;
   - o rascunho de outra obra não reabre.
2. **Sabotagens que mordem:** tirar o filtro de qualquer uma das buscas; trocar Brasília pelo fuso
   do computador (rodando o teste em UTC).
3. **Fotos, com dados de teste** (obras de nome inventado), a 1920 × 1080 e a 375:
   - 01 Configurações com a opção, desarmada e armada;
   - 02 Dashboard com a máscara;
   - 03 Obras;
   - 04 Nova OC com a lista de obras aberta;
   - 05 Histórico;
   - 06 o Dashboard sem a máscara, para comparar.
4. **A linha medida do §9.5:** as linhas novas fora de `docs\`, contra `7edb715`.
5. **Não publique.** A máscara vai ao ar depois da tela de editar (que espera a perícia), com a minha
   ordem, **até 06/11**, para o ensaio do Pedro até 09/11.
