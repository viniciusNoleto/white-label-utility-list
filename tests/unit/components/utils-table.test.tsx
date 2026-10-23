import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { UtilsTable, UtilsTableDragHandle } from '@/src/components/utils/Table';

const rows = [
  { id: 1, name: 'Ana', city: 'Recife' },
  { id: 2, name: 'Bruno', city: 'Natal' },
];

function headers() {
  return screen.getAllByRole('columnheader').map(header => header.textContent);
}

describe('UtilsTable', () => {
  it('renders columns, raw values, custom cells, title and alias', () => {
    renderWithProviders(
      <UtilsTable
        title="Pessoas"
        alias={<button type="button">Nova</button>}
        rows={rows}
        rowKey={({ item }) => item.id}
        columns={{ name: 'Nome', city: 'Cidade' }}
        renderCells={{ city: ({ item }) => <strong>{item.city.toUpperCase()}</strong> }}
      />,
    );

    expect(screen.getByText('Pessoas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova' })).toBeInTheDocument();
    expect(headers()).toEqual(['Nome', 'Cidade']);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('NATAL').tagName).toBe('STRONG');
  });

  it('shows the custom or default empty text', () => {
    const { unmount } = renderWithProviders(
      <UtilsTable
        rows={[]}
        columns={{ name: 'Nome' }}
        emptyText="Nada aqui."
      />,
    );

    expect(screen.getByText('Nada aqui.')).toBeInTheDocument();
    unmount();

    renderWithProviders(
      <UtilsTable
        rows={[]}
        columns={{ name: 'Nome' }}
      />,
    );

    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
  });

  it('renders static and per-row actions with accessible labels', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    const { unmount } = renderWithProviders(
      <UtilsTable
        rows={rows}
        rowKey={({ item }) => item.id}
        columns={{ name: 'Nome' }}
        actions={[{ icon: 'lucide:pencil', label: 'Editar', onClick: onEdit }]}
      />,
    );

    expect(headers()).toEqual(['Nome', 'Ações']);
    await user.click(screen.getAllByRole('button', { name: 'Editar' })[1]);
    expect(onEdit).toHaveBeenCalledWith({ item: rows[1], index: 1 });
    unmount();

    renderWithProviders(
      <UtilsTable
        rows={rows}
        columns={{ name: 'Nome' }}
        actions={({ item }) => [{ label: item.id === 1 ? 'Aprovar' : 'Rejeitar' }]}
      />,
    );

    expect(screen.getByRole('button', { name: 'Aprovar' })).toHaveTextContent('Aprovar');
    expect(screen.getByRole('button', { name: 'Rejeitar' })).toBeInTheDocument();
  });

  it('adds row numbers offset by the current page', () => {
    renderWithProviders(
      <UtilsTable
        rows={rows}
        columns={{ name: 'Nome' }}
        showRowNumber
        page={3}
        perPage={10}
        lastPage={3}
        setPage={() => {}}
      />,
    );

    expect(headers()[0]).toBe('#');

    const bodyRows = screen.getAllByRole('row').slice(1);
    expect(within(bodyRows[0]).getAllByRole('cell')[0]).toHaveTextContent('21');
    expect(within(bodyRows[1]).getAllByRole('cell')[0]).toHaveTextContent('22');
  });

  it('paginates and changes the per page value', async () => {
    const setPage = vi.fn();
    const setPerPage = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <UtilsTable
        rows={rows}
        columns={{ name: 'Nome' }}
        page={1}
        perPage={10}
        lastPage={3}
        setPage={setPage}
        setPerPage={setPerPage}
        perPageOptions={[10, 25]}
        paginationPosition="top"
      />,
    );

    expect(screen.getByText('Registros por página')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(setPage).toHaveBeenCalledWith(2);

    await user.click(screen.getAllByDisplayValue('10').find(input => input.getAttribute('role') === 'combobox')!);
    await user.click(await screen.findByRole('option', { name: '25', hidden: true }));
    expect(setPerPage).toHaveBeenCalledWith(25);
  });

  it('hides the pagination when there is a single page and no per page selector', () => {
    renderWithProviders(
      <UtilsTable
        rows={rows}
        columns={{ name: 'Nome' }}
        page={1}
        perPage={10}
        lastPage={1}
        setPage={() => {}}
      />,
    );

    expect(screen.queryByText('Registros por página')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument();
  });

  it('moves the order column first without a title and renders drag handles when reorderable', () => {
    renderWithProviders(
      <UtilsTable
        rows={rows}
        rowKey={({ item }) => item.id}
        columns={{ name: 'Nome', order: 'Ordem' }}
        onReorder={vi.fn()}
        renderCells={{ order: () => <UtilsTableDragHandle /> }}
      />,
    );

    expect(headers()).toEqual(['', 'Nome']);

    const handles = screen.getAllByRole('button');
    expect(handles).toHaveLength(2);
    expect(handles[0]).toHaveAttribute('aria-roledescription', 'sortable');
  });

  it('renders the drag handle standalone without a sortable row', () => {
    renderWithProviders(<UtilsTableDragHandle />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
