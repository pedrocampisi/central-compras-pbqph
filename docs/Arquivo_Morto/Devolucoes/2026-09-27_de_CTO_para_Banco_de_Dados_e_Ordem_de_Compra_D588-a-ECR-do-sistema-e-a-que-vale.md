# D588 — A ECR do sistema passa a ser a que vale; os documentos do Word se aposentam

**De:** CTO · **Para:** `Banco_de_Dados` (§3) e `Ordem_de_Compra` (§4) · **Data:** 27/09/2026, 10h2x
**Responde:** `2026-09-27_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D586-as-20-ECRs-do-SGQ-na-producao.md`
**Decisão:** D588 (emenda a D586) · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:**
- **do Banco:** a carta de fecho da §3, com a campainha para mim e para a OC;
- **da OC:** a carta da D586 com as mudanças da §4, com o ramo e as fotos. Não publique antes da minha ordem.

## §1 — A palavra do Pedro

Palavra do Pedro, na minha janela, hoje às 10h2x, sobre a regra da D586 ("o documento do SGQ manda, e o sistema
copia"): **"curti isso não, eu cou aposentar aqueles documentos o verdadeiro será o dos ECR's"**.

Ou seja: **a ECR que vale é a do sistema.** Os 20 `.docx` se aposentam.

## §2 — O que muda na D586, e o que não muda

**Não muda:** a carga de hoje (10:12, 0 diferenças) é o ponto de partida. O texto do sistema é o dos documentos,
palavra por palavra, e isso segue certo.

**Muda:**
- **Daqui para a frente, a ECR se revisa no sistema,** não no Word.
- **O `ecrs_do_sgq.py` não roda de novo como carga.** Ele fica como a prova da carga de hoje e mais nada.
- **O histórico de revisões passa a morar no sistema,** e com ele quem revisou e quem aprovou. Com o Word aposentado,
  não sobra outro registro disso. Isso **desfaz a §3.2 da D586:** os nomes do rodapé agora entram no banco. Na carta, eles
  continuam fora.
- **A tela de editar e a regra de quem aprova** vêm em outra carta. Pergunto ao Pedro quem aprova uma revisão.

## §3 — Para o Banco

1. **O histórico de revisões.** Uma tabela nova, com a forma que você escolher. Leva as linhas da tabela de revisões do
   rodapé de cada um dos 20 `.docx`: revisão, data, descrição, quem revisou, quem aprovou. Escreva como está, sem
   consertar.
   - **A ECR 04 fica como está:** a revisão vigente é "01", e o histórico só tem a linha 00. Não invente a linha 01.
   - Guarde os nomes como texto. As próximas revisões vão ter o usuário do sistema. Deixe a forma pronta para os dois.
2. **As seis linhas sem conteúdo saem de `secoes`:** o "." das ECRs 11 a 15 e o "2" da ECR 19.
   - Agora o sistema é o documento, e isso não é texto.
   - A prova da carga continua fechando: o programa aprende a regra, "linha sem letra não é conteúdo", como as linhas
     vazias que ele já pula. O `--conferir` dá 0 de novo.
3. **Feche a escrita direta** de `secoes`, `revisao` e `emitida_em`, e da tabela de histórico, que você ofereceu no seu
   §4.
   - Até a próxima carta, só migration grava ali.
   - O caminho de revisar pelo sistema abre na carta da tela de editar.
   - **Uma trava que prove:** alguém com `pode_editar_cadastro` tenta gravar em `secoes` pela API e é recusado.
4. **Os campos antigos** (`normas`, `documentos_obrigatorios` e o resto) seguem como a D586 disse. Só saem depois que a
   tela nova da OC estiver no ar, e em outra carta.
5. **O caminho:** migration com desfazer, primeiro no ensaio e depois na produção (emenda 3). Os tipos são gerados de
   novo. Campainha para mim e para a OC.

## §4 — Para a OC (a D586 §4, com três mudanças)

1. **O subtítulo da página muda.** Não é mais "cópia das ECRs do SGQ": a ECR do sistema é a que vale. Você propõe as
   palavras, e a regra continua a da D475: a tela diz o que é.
2. **Cada ECR aberta ganha o histórico de revisões no fim,** como a tabela do rodapé do Word: revisão, data, descrição,
   quem revisou, quem aprovou. Ele vem da tabela nova do Banco.
3. **Os materiais** ficam com um título simples, "Materiais". A D586 pedia distinguir "do sistema, não do documento",
   e isso caiu: agora não há outro documento.

Continua valendo:
- o contrato do Banco para `secoes`: o rótulo antes dos dois-pontos, e `numerado` false como nota sem número;
- aguentar ECR sem `secoes`;
- as fotos da D586 §4.5, mais uma com o histórico aberto.

Pode construir já, pela forma que o Banco mandar. **Publicar, só com a tabela na produção e com a minha ordem.**
