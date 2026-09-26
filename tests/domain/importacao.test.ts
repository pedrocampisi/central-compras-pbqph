import { describe, expect, it } from 'vitest';
import {
  ACCEPT_DA_IMPORTACAO,
  MAX_PAGINAS,
  foraDeCampoDeTexto,
  mensagemDePaginas,
  mensagemDeTipo,
  tipoDoArquivo,
} from '../../src/domain/importacao';

describe('D554 — os tipos que a importação lê', () => {
  it('PDF, JPG e PNG pelo tipo do navegador; o print colado chega como image/png', () => {
    expect(tipoDoArquivo({ name: 'pedido.pdf', type: 'application/pdf' })).toBe('pdf');
    expect(tipoDoArquivo({ name: 'foto.jpg', type: 'image/jpeg' })).toBe('imagem');
    expect(tipoDoArquivo({ name: 'image.png', type: 'image/png' })).toBe('imagem');
  });

  it('sem tipo, vale a extensão (em qualquer caixa)', () => {
    expect(tipoDoArquivo({ name: 'PEDIDO.PDF', type: '' })).toBe('pdf');
    expect(tipoDoArquivo({ name: 'foto.JPEG', type: '' })).toBe('imagem');
    expect(tipoDoArquivo({ name: 'print.Png', type: '' })).toBe('imagem');
  });

  it('o resto não serve — nem quando a extensão finge ser PDF', () => {
    expect(tipoDoArquivo({ name: 'pedido.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })).toBeNull();
    expect(tipoDoArquivo({ name: 'foto.webp', type: 'image/webp' })).toBeNull();
    expect(tipoDoArquivo({ name: 'foto.heic', type: '' })).toBeNull();
    expect(tipoDoArquivo({ name: 'truque.pdf', type: 'image/gif' })).toBeNull();
    expect(tipoDoArquivo({ name: 'planilha.xlsx', type: '' })).toBeNull();
  });

  it('o "Escolher arquivo" oferece os mesmos três tipos', () => {
    expect(ACCEPT_DA_IMPORTACAO.split(',').sort()).toEqual(
      ['.jpeg', '.jpg', '.pdf', '.png', 'application/pdf', 'image/jpeg', 'image/png'],
    );
  });

  it('a mensagem do tipo errado diz qual não serve, quais servem, e que nada foi lido', () => {
    const uma = mensagemDeTipo(['pedido.docx']);
    expect(uma).toContain('"pedido.docx" não serve');
    expect(uma).toContain('PDF, JPG ou PNG');
    expect(uma).toContain('print colado com Ctrl+V');
    expect(uma).toContain('Nada foi lido');
    expect(mensagemDeTipo(['a.docx', 'b.xlsx'])).toContain('2 arquivos ("a.docx", "b.xlsx") não servem');
    expect(mensagemDeTipo([''])).toContain('Este arquivo não serve');
  });
});

describe('D554 — o limite de páginas', () => {
  it('continua 5, o de antes (o teto de tokens do servidor foi feito para ele)', () => {
    expect(MAX_PAGINAS).toBe(5);
  });

  it('a mensagem diz quantas chegaram, o limite, que nada foi lido e o que fazer', () => {
    const m = mensagemDePaginas(7);
    expect(m).toContain('Chegaram 7 páginas');
    expect(m).toContain('o limite de uma leitura é 5');
    expect(m).toContain('Nada foi lido');
    expect(m).toContain('duas vezes');
    expect(m).toContain('se somam');
  });
});

describe('D554 — o Ctrl+V só vai para a importação fora de campo de texto', () => {
  it('campo de texto: não vai', () => {
    expect(foraDeCampoDeTexto({ tagName: 'TEXTAREA' })).toBe(false);
    expect(foraDeCampoDeTexto({ tagName: 'INPUT', type: 'text' })).toBe(false);
    expect(foraDeCampoDeTexto({ tagName: 'INPUT' })).toBe(false);
    expect(foraDeCampoDeTexto({ tagName: 'INPUT', type: 'number' })).toBe(false);
    expect(foraDeCampoDeTexto({ tagName: 'INPUT', type: 'search' })).toBe(false);
    expect(foraDeCampoDeTexto({ tagName: 'SELECT' })).toBe(false);
    expect(foraDeCampoDeTexto({ tagName: 'DIV', isContentEditable: true })).toBe(false);
  });

  it('fora de campo de texto: vai', () => {
    expect(foraDeCampoDeTexto({ tagName: 'BODY' })).toBe(true);
    expect(foraDeCampoDeTexto({ tagName: 'DIV' })).toBe(true);
    expect(foraDeCampoDeTexto({ tagName: 'BUTTON' })).toBe(true);
    expect(foraDeCampoDeTexto({ tagName: 'INPUT', type: 'checkbox' })).toBe(true);
    expect(foraDeCampoDeTexto(null)).toBe(true);
  });
});
