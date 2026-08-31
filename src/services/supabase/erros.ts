/**
 * Traduz a recusa do banco para uma frase que a pessoa da tela entende.
 *
 * Existe porque o que subia até 28/08/2026 era a mensagem crua do Postgres,
 * com o nome da trava dentro — para alguém que só queria apagar um nome. O
 * `Banco_de_Dados` avisou por carta em 26/08 (`a-carta-que-vem-antes-do-pessoa-id`,
 * item 4, e `a-sua-janela-agora-esconde-quem-nao-pode-comprar`, item 3).
 *
 * Sem React e sem Supabase de propósito: é função pura, e por isso tem teste.
 *
 * A régua para crescer esta lista: só entra trava que uma pessoa consegue
 * disparar pela tela. Erro que só nasce de código errado continua subindo cru —
 * ali a mensagem técnica é a informação útil, e mascarar esconde o defeito.
 */

/** Cada trava do banco e a frase que a pessoa lê no lugar do nome dela. */
const TRAVAS: ReadonlyArray<readonly [string, string]> = [
  [
    // Enquanto o fornecedor tiver uma pessoa física ligada a ele, o banco
    // exige um nome de contato junto. A trava morre quando `cpf_pessoa` sair
    // de cena, na etapa 2 do cadastro de pessoa — e esta linha sai com ela.
    'fornecedores_cpf_pessoa_exige_pessoa',
    'Este fornecedor tem uma pessoa ligada ao cadastro, e por isso o contato responsável não pode ficar em branco. Preencha o contato e grave de novo.',
  ],
  [
    // Desde 26/08/2026 todo CNPJ novo precisa da empresa dele já cadastrada.
    // Fornecedor de empresa nova entra por uma fila de aprovação que esta tela
    // ainda não sabe usar — dizer isso é mais honesto que oferecer um botão
    // que o banco vai recusar.
    'fornecedores_raiz_pendura_na_empresa',
    'O CNPJ é de uma empresa que ainda não está cadastrada. Fornecedor de empresa nova precisa ser aprovado antes de entrar por esta tela — peça o cadastro da empresa e tente de novo.',
  ],
];

/**
 * Devolve a frase para a pessoa, ou a mensagem original quando a recusa não é
 * de nenhuma trava conhecida.
 */
export function traduzirErroDoBanco(mensagem: string): string {
  for (const [trava, frase] of TRAVAS) {
    if (mensagem.includes(trava)) return frase;
  }
  return mensagem;
}

/** Os nomes das travas cobertas — serve ao teste e a quem for conferir. */
export const TRAVAS_TRADUZIDAS: readonly string[] = TRAVAS.map(([nome]) => nome);
