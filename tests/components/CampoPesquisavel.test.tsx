import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { CampoPesquisavel } from '../../src/components/CampoPesquisavel/CampoPesquisavel';

const opcoes = [
  { valor: 'o1', rotulo: 'Residencial Jardim das Flores' },
  { valor: 'o2', rotulo: 'Reforma Galpão Industrial' },
  { valor: 'o3', rotulo: 'Edifício São João' },
];

function montar(valor = '') {
  const onEscolher = vi.fn();
  render(
    <CampoPesquisavel ariaLabel="Obra" rotuloVazio="Selecione…" opcoes={opcoes} valor={valor} onEscolher={onEscolher} />,
  );
  return { campo: screen.getByRole('combobox', { name: 'Obra' }), onEscolher };
}

describe('CampoPesquisavel — pelo teclado (D541)', () => {
  it('abrir sem digitar mostra a opção vazia e a lista inteira', async () => {
    const { campo } = montar();
    await userEvent.click(campo);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Selecione…', 'Residencial Jardim das Flores', 'Reforma Galpão Industrial', 'Edifício São João',
    ]);
  });

  it('digitar filtra, e Enter escolhe o primeiro que casou', async () => {
    const { campo, onEscolher } = montar();
    await userEvent.type(campo, 'galpao');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{Enter}');
    expect(onEscolher).toHaveBeenCalledWith('o2');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('setas andam na lista; Enter escolhe o destacado', async () => {
    const { campo, onEscolher } = montar();
    await userEvent.type(campo, 'e'); // as três têm "e"
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onEscolher).toHaveBeenCalledWith('o3');
  });

  it('Esc fecha sem mudar nada, e o campo volta a mostrar a escolha de antes', async () => {
    const { campo, onEscolher } = montar('o1');
    await userEvent.type(campo, 'galp');
    await userEvent.keyboard('{Escape}');
    expect(onEscolher).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(campo).toHaveValue('Residencial Jardim das Flores');
  });

  it('Tab sai sem escolher', async () => {
    const { campo, onEscolher } = montar();
    await userEvent.type(campo, 'galp');
    await userEvent.tab();
    expect(onEscolher).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('nada encontrado diz o que foi procurado', async () => {
    const { campo } = montar();
    await userEvent.type(campo, 'zzz');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText(/Nada encontrado/)).toBeInTheDocument();
  });

  it('clicar numa opção escolhe', async () => {
    const { campo, onEscolher } = montar();
    await userEvent.click(campo);
    await userEvent.click(screen.getByRole('option', { name: 'Edifício São João' }));
    expect(onEscolher).toHaveBeenCalledWith('o3');
  });
});

describe('só Obra e Fornecedor têm pesquisa (palavra do Pedro: "os outros não precisa")', () => {
  const ler = (p: string) => readFileSync(p, 'utf-8');
  const nova = ler('src/features/ordens-compra/NovaOcPage.tsx');
  const hist = ler('src/features/ordens-compra/HistoricoPage.tsx');

  it('são exatamente quatro lugares: Nova OC (2) e os filtros do Histórico (2)', () => {
    expect(nova.match(/<CampoPesquisavel\b/g)).toHaveLength(2);
    expect(hist.match(/<CampoPesquisavel\b/g)).toHaveLength(2);
    expect(nova).toContain('opcoesDeEmpresa(empresas)');
    expect(nova).toContain('opcoesDeObra(obrasAtivas)');
  });

  it('ECR, unidade, condição de pagamento e status continuam listas simples', () => {
    expect(nova).toMatch(/<select[\s\S]*?ecr_id/);
    expect(nova).toMatch(/<select[\s\S]*?UN_PADRAO/);
    expect(nova).toMatch(/as="select"\s+label="Condição de Pagamento"/);
    expect(hist).toMatch(/<FilterSelect[\s\S]*?Todos os status/);
    // O campo Filial da D542 saiu (D549): a OC escolhe só a empresa.
    expect(nova).not.toContain('oc-filial');
    expect(nova).not.toMatch(/label="Filial"/);
  });
});
