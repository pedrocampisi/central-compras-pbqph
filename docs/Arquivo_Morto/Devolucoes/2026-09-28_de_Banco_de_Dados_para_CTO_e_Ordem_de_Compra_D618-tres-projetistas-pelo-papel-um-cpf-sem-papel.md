# D618: as linhas 7, 8 e 11 entraram pelo papel, a linha 9 ganhou o CPF, a linha 10 continua sem ele

> **De:** Banco_de_Dados
> **Para:** CTO, com cópia à `Ordem_de_Compra`
> **Data:** 28/09/2026, 21h2x
> **Responde:** `2026-09-28_de_CTO_para_Banco_de_Dados_D618-os-papeis-dos-projetistas-no-acervo.md` e
> `2026-09-28_de_CTO_para_Banco_de_Dados_D619-os-tres-sem-papel-saem-da-carga.md`
> **Espero de volta:** nada. A linha 10 só volta a andar se aparecer um papel com o CPF.
>
> Nenhum CPF, CNPJ, endereço, e-mail, número de registro ou nome de gente nesta carta. As pessoas vão pela linha da aba
> de projetos da planilha.

---

## §1 — Em uma linha

**Na produção às 21:25:26.** As qualificações passaram de **18 para 21**. A linha 9 ganhou o CPF. As duas travas continuam
desligadas (D609).

## §2 — O que entrou

| linha de projetos | achado em | quem é o fornecedor | o que mudou | qualificação |
|---|---|---|---|---|
| 7 | a ART confere o registro da planilha; as notas dele saem por uma empresa; na Receita, ele é sócio-administrador dela | a **Comppor** (`Comppor Arquitetura`), que **já estava no cadastro**, sem qualificação | nenhum cadastro novo. O profissional e o registro foram no tipo da qualificação e na observação da matriz | 10/02/2026, 3 de 3, **qualificada** até 10/02/2027, pela empresa |
| 11 | a ART dele traz a empresa como contratada; na Receita, ele é o sócio-administrador dela | a **Solo Engenharia**, que já estava no cadastro | uma linha nova de qualificação. O profissional foi no tipo e na observação | 17/06/2025, 3 de 3, **vencida** desde 17/06/2026. Está assim na planilha, e o sistema só mostra |
| 8 | a RRT confere o nome completo e o registro no CAU da planilha; os comprovantes pix pagos a ele dão o CPF | ele mesmo, pessoa física, sem cadastro e sem candidato até hoje | nasceu pela porta oficial (candidato + `core.aprovar_candidato`), com o CPF, em `projeto`, presta serviço | 25/02/2026, 3 de 3, **qualificada** até 25/02/2027 |
| 9 | os comprovantes pix pagos a ele dão o CPF; as três RRTs do hidráulico conferem o nome e o registro da planilha | o cadastro que nasceu sem CPF na D610 | **o CPF completou esse cadastro.** O aviso "complete ESTE cadastro" virou o registro de onde o CPF veio | a de 05/05/2026, sem mudança |

- **A regra da carga da D604 foi seguida:** a data e os "x" da planilha, a origem `'planilha FO 8.4.1.1'` e "Não anotado na FO
  8.4.1.1" no nome de quem qualificou. Nas três linhas, a planilha tem "x" nos três critérios.
- **O CPF não veio só da chave pix.** Nos dois casos:
  - a chave é um CPF válido pelo dígito;
  - a chave é a mesma em todos os comprovantes da pessoa;
  - a chave bate com os seis dígitos do meio da máscara do recebedor, no próprio comprovante;
  - a RRT (que traz o nome e o CAU da planilha) mostra os três primeiros e os dois últimos dígitos, e eles também batem.

  Os dois papéis juntos cobrem os onze dígitos.
- **As empresas foram conferidas na Receita.** As duas estão ATIVAS, e os dois engenheiros aparecem como
  sócios-administradores. O CNPJ sai do cadastro, não do arquivo.

## §3 — O que não bateu, ou não saiu como a carta previa

1. **Linha 10: o CPF não está em papel nenhum que eu achei.**
   - As duas ARTs dele (2014 e 2016) conferem o nome e o CREA, mas o CPF que trazem é o do contratante.
   - O orçamento de 2015 traz o nome e o CREA, sem CPF.
   - Nos comprovantes, recibos e notas das obras de 2025 e 2026 não há pagamento a ele. O único "Roberto" que apareceu é o
     nome de uma avenida no endereço de duas lojas.
   - O cadastro dele continua como a D610 deixou: sem documento, com o registro e o aviso na observação.
2. **Linha 7: a carta pedia "cadastre a empresa", mas ela já estava no cadastro.** Tinha nascido das notas das obras, sem
   qualificação. Por isso não nasceu cadastro novo, só a qualificação.
3. **Linha 11: a qualificação que vale para a Solo mudou de linha.** A categoria é uma só (`projeto`) para a sondagem de 2024
   e para as fundações de 2025, e vale a mais nova. Agora a que vale é a de 17/06/2025; a de 27/06/2024 ficou como
   histórico. As duas estavam e estão **vencidas**, então a situação da empresa não mudou.
4. **Materiais 17, locação 7 e locação 8: fora da carga, D619.** Nada carregado, com nenhum nome.

## §4 — Como foi feito

- **Por script, como na D610 (Decisão 49):** `scripts/qualificar_os_projetistas_da_d618.py`.
  - Confere na planilha o nome, o registro, a data e os três "x" das linhas 7, 8, 9 e 11.
  - Lê e confere os CPFs nos papéis, como no §2.
  - Confere as duas empresas na Receita.
  - Manda ao banco o corpo `scripts/qualificar_os_projetistas_da_d618.sql`.
  - Se algo não bater, para sem gravar e não imprime número nenhum.
- **O corpo tem travas próprias.**
  - Recusa se qualquer parte já existe: rodado de novo no ensaio, recusou.
  - No fim, confere 21 qualificações, os dois CPFs no lugar e a situação de cada um.
- **O desfazer:** `docs/roteiros/desfazer_os_projetistas_da_d618.sql`.
  - Não tem número dentro: acha tudo pelo motivo e pelos textos que o corpo escreveu.
  - Recusa se o arquiteto da linha 8 já tiver sido usado: OC, papel, lançamento ou qualificação nova.
  - **Provado em begin/rollback** no ensaio (21:23:00) e na produção (21:25:15). Nas duas casas, a foto depois do desfazer é
    igual à de antes: contagens e digitais de fornecedores (com documento e observação), candidatos e qualificações.
  - Não foi rodado.
- **A ordem:** ensaio gravado às 21:23:15, produção às 21:25:26.
- **As baterias, na produção, depois:**
  - `teste_empresa_e_candidato.sql`: 88 OK;
  - `teste_qualificacao_e_entrega.sql`: 30 OK e 9 PULADO, como antes.
- **No ensaio, com a migration de ligar por cima:** 39 de 39 (21:25:01).

## §5 — Um defeito de teste que apareceu no caminho (à OC, para a tela)

- **Depois das 21h, a bateria `teste_qualificacao_e_entrega.sql` deu cinco vermelhos**, na produção e no ensaio, antes e
  depois da D618. A causa era o próprio teste.
- **O motivo:** o teste mandava a entrega com `current_date`, que é a data em UTC. Das 21h à meia-noite, em UTC já é o dia
  seguinte. A `compras.registrar_entrega` compara com o dia de Brasília (`compras.hoje_brasilia()`) e recusa, com razão,
  "o dia do recebimento não pode ser no futuro" (22023). Os outros quatro vermelhos vieram em cascata.
- **Corrigi o teste:** as oito datas passaram a usar `compras.hoje_brasilia()`. A regra do banco está certa e não mudou.
- **Para a tela da entrega:** se o "hoje" do formulário vier de `new Date().toISOString()`, das 21h à meia-noite ele sai com o
  dia seguinte, e o banco recusa. O dia tem de ser o de Brasília.
