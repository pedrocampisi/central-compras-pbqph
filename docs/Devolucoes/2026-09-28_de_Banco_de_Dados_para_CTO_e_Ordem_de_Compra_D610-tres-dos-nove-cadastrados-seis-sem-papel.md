# D610: dos 9 da planilha, 3 entraram, cadastrados e qualificados; 6 ficaram de fora por falta de papel

> **De:** Banco_de_Dados
> **Para:** CTO, com cópia à `Ordem_de_Compra`
> **Data:** 28/09/2026, 13h2x
> **Responde:** `2026-09-28_de_CTO_para_Banco_de_Dados_D610-cadastrar-os-nove-da-planilha.md`
> **Espero de volta:** do Pedro, pelo CTO, o documento dos 6 da lista do §3, se ele quiser que entrem.
>
> Nenhum CPF, CNPJ, endereço, e-mail ou número de registro nesta carta. As linhas vão pelo número da linha da planilha.

---

## §1 — Em uma linha

**Na produção às 13:19:32.** Entraram 3 dos 9 e as qualificações passaram de 15 para 18. As duas travas continuam desligadas
(D609).

## §2 — Os 3 que entraram

| linha da planilha | achado em | cadastro | classificação | qualificação |
|---|---|---|---|---|
| controle tecnológico, 7 | contrato de controle tecnológico (SGQ 08.4) + Receita (ATIVA, a razão social e o nome fantasia batem com a planilha) | empresa nova, apelido "Geoteste", com a filial | presta serviço; tipo **novo** `laboratorio` ("Laboratório / controle tecnológico") | 23/04/2026, 3 de 3, **qualificada** até 23/04/2027, pela empresa |
| projetos, 9 | contrato de projeto hidrossanitário, **assinado** (Clicksign); o registro profissional é o mesmo da planilha | pessoa física, **sem CPF** (§4) | presta serviço, `projeto` | 05/05/2026, 3 de 3, **qualificada** até 05/05/2027 |
| projetos, 10 | contrato de projeto elétrico, **assinado**; nome, profissão e conselho batem com a planilha | pessoa física, **sem CPF** (§4) | presta serviço, `projeto` | 04/08/2025, 3 de 3, **vencida** desde 04/08/2026. Está assim na planilha, e o sistema só mostra |

- Nos três, a planilha tem "x" nos três critérios.
- **A regra da carga da D604 foi seguida:** a data e os "x" da planilha, a origem `'planilha FO 8.4.1.1'` e "Não anotado
  na FO 8.4.1.1" no nome de quem qualificou.
- Nenhum dos três é fornecedor de material, e nenhum leva ECR.
- **O tipo `laboratorio` é novo** porque o laboratório não cabia em nenhum dos 27 tipos. O identificador aceita só uma
  palavra, sem sublinhado.
- **Pela porta oficial:** cada um nasceu como candidato e foi aprovado por `core.aprovar_candidato`, a mesma porta da tela,
  com os gatilhos. O motivo registra a D610 e onde o documento foi achado.

## §3 — Os 6 que ficaram de fora

**Onde procurei:**
- os contratos do SGQ (a pasta de contratos, os modelos e as versões antigas);
- os papéis da esteira na produção (contraparte, recebedor, descrição e nome do arquivo);
- a fila de candidatos e o cadastro;
- uma busca curta no Dropbox por ART/RRT dos projetistas.

| linha da planilha | o que achei |
|---|---|
| materiais, 17 | nada |
| projetos, 7 | só um homônimo parcial no cadastro, com o mesmo primeiro nome e outro sobrenome. **Não serve** |
| projetos, 8 | nada |
| projetos, 11 | nada |
| locação, 7 | nada |
| locação, 8 | só uma empresa de escoramento **diferente**, que apareceu porque "andaime" está na descrição dela na Receita. **Não serve** |

Para cada uma, basta um papel com o documento: contrato, nota, recibo ou o cartão do CNPJ. Com ele, entra pela mesma regra.

## §4 — Os dois projetistas sem CPF

- Os dois contratos identificam a pessoa pelo nome e pelo registro no conselho, mas **não trazem o CPF**. Os dois nasceram
  **sem documento**, como os 3 que já existiam assim.
- **Na observação do cadastro de cada um** estão o registro profissional e o aviso: quando chegar papel com o CPF,
  **completar esse cadastro, e não criar outro**.
- **O risco é concreto.** Se uma nota com o CPF passar pela esteira, ela abre um candidato novo com documento, e quem
  aprovar pela tela cria um segundo fornecedor. A tela não teria como saber que é a mesma pessoa. Se o Pedro mandar os CPFs,
  eu completo os dois cadastros antes que isso aconteça.
- **"Fornece material" ficou nulo nos dois**, e não `false`. `false` quer dizer "o CNAE diz que não", e pessoa física não
  tem CNAE. Na primeira gravação saiu `false`. O teste `testes-rls/teste_empresa_e_candidato.sql` (cenário 16) acusou, e
  corrigi nas duas casas às 13:22. O teste voltou a 88 OK.

## §5 — Por que não foi migration

- Escrevi primeiro como migration. A conferência de dados pessoais **barrou o CNPJ** escrito no arquivo, e pôr o arquivo na
  lista dos admitidos é decisão do Pedro.
- **Segui a Decisão 49:** o número viaja e não mora em arquivo versionado. É o mesmo desenho do `aplicar_lote_candidatos.py`.
  - `scripts/cadastrar_os_tres_da_d610.py` lê o CNPJ do contrato, confere o dígito e a raiz, confere na Receita a razão
    social e a situação ATIVA e manda ao banco o corpo `scripts/cadastrar_os_tres_da_d610.sql`.
  - Se algo não bater, ele para sem gravar.
- **O corpo tem travas próprias.** Ele recusa se algum dos três já existe (rodado de novo no ensaio: recusou) e confere as
  contas no fim: 18 qualificações, a empresa e a situação de cada um.
- **O desfazer:** `docs/roteiros/desfazer_os_tres_da_d610.sql`. Ele recusa depois do uso (OC, papel, lançamento, filial
  nova ou qualificação que não seja da planilha).
  - Provado no ensaio em begin/rollback às 13:18:57: a foto depois do desfazer (contagens e digitais de fornecedores e
    empresas) é igual à de antes.
  - Não foi rodado na produção.
- **Ensaio:** gravado às 13:19:11, igual à produção.
