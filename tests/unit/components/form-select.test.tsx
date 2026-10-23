import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { FormSelect } from '@/src/components/form/Select';
import { FormMultiSelect } from '@/src/components/form/MultiSelect';

const courses = [
  { id: '1', name: 'Curso A' },
  { id: '2', name: 'Curso B' },
];

describe('FormSelect', () => {
  it('maps object data into value/label options using valueField/labelField', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormSelect
        label="Curso"
        data={courses}
        valueField="id"
        labelField="name"
        value={null}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Curso' }));
    await user.click(await screen.findByText('Curso B'));

    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('accepts data already in Mantine format when valueField/labelField are omitted', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormSelect
        label="Status"
        data={['Ativo', 'Inativo']}
        value={null}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(await screen.findByText('Inativo'));

    expect(onChange).toHaveBeenCalledWith('Inativo');
  });
});

describe('FormMultiSelect', () => {
  it('maps object data into value/label options and emits selected values', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormMultiSelect
        label="Cursos"
        data={courses}
        valueField="id"
        labelField="name"
        value={[]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Cursos' }));
    await user.click(await screen.findByText('Curso A'));

    expect(onChange).toHaveBeenCalledWith(['1']);
  });
});
