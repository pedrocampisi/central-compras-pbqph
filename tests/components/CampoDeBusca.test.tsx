import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { CampoDeBusca } from '../../src/components/CampoDeBusca/CampoDeBusca';
import { ListToolbar } from '../../src/components/ListToolbar/ListToolbar';

const NOMES = ['Alfa', 'Beta', 'Gama'];

function Tela() {
  const [busca, setBusca] = useState('');
  return (
    <>
      <ListToolbar searchValue={busca} searchPlaceholder="Buscar fornecedor…" onSearchChange={setBusca} />
      <ul>{NOMES.filter((n) => n.toLowerCase().includes(busca.toLowerCase())).map((n) => <li key={n}>{n}</li>)}</ul>
    </>
  );
}

describe('o X da busca (CTO-D975)', () => {
  it('sem texto o X não aparece; com texto aparece', async () => {
    render(<Tela />);
    expect(screen.queryByRole('button', { name: 'Limpar a busca' })).toBeNull();
    await userEvent.type(screen.getByRole('searchbox'), 'be');
    expect(screen.getByRole('button', { name: 'Limpar a busca' })).toBeTruthy();
  });

  it('o clique apaga tudo, a lista volta inteira e o cursor volta ao campo', async () => {
    render(<Tela />);
    const campo = screen.getByRole('searchbox');
    await userEvent.type(campo, 'be');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Limpar a busca' }));
    expect(campo).toHaveValue('');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(campo).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Limpar a busca' })).toBeNull();
  });

  it('o Esc dentro do campo faz o mesmo', async () => {
    render(<Tela />);
    const campo = screen.getByRole('searchbox');
    await userEvent.type(campo, 'ga');
    await userEvent.keyboard('{Escape}');
    expect(campo).toHaveValue('');
    expect(campo).toHaveFocus();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('é um botão de verdade (type=button), para não enviar formulário', () => {
    render(<CampoDeBusca value="x" onChange={() => {}} aria-label="Procurar" />);
    expect(screen.getByRole('button', { name: 'Limpar a busca' })).toHaveAttribute('type', 'button');
  });

  it('o X nativo do navegador fica escondido e o alvo tem 32 px', () => {
    const css = readFileSync('src/components/CampoDeBusca/CampoDeBusca.module.css', 'utf8');
    expect(css).toMatch(/::-webkit-search-cancel-button[\s\S]*display:\s*none/);
    expect(css).toMatch(/\.limpar\s*\{[^}]*width:\s*32px[^}]*height:\s*32px/);
  });

  it('todo campo de busca da casa usa o CampoDeBusca: nenhum type="search" solto', () => {
    const arquivos = [
      'src/components/ListToolbar/ListToolbar.tsx',
      'src/features/recebimento/MaterialAChegar.tsx',
    ];
    for (const a of arquivos) {
      const src = readFileSync(a, 'utf8');
      expect(src, a).toContain('<CampoDeBusca');
      expect(src, a).not.toMatch(/type="search"/);
    }
  });
});
