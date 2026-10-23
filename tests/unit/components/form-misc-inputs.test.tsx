import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { FormAutocomplete } from '@/src/components/form/Autocomplete';
import { FormDateTimePicker } from '@/src/components/form/DateTimePicker';
import { FormSegmentedControl } from '@/src/components/form/SegmentedControl';

describe('FormAutocomplete', () => {
  it('debounces onComplete, maps object data and returns the selected value', async () => {
    const onComplete = vi.fn();
    const onChange = vi.fn();
    const onValidate = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormAutocomplete
        label="Aluno"
        data={[{ id: 'a1', name: 'Ana' }, { id: 'b2', name: 'Bruno' }]}
        valueField="id"
        labelField="name"
        onComplete={onComplete}
        onChange={onChange}
        onValidate={onValidate}
      />,
    );

    const input = screen.getByLabelText('Aluno');
    await user.type(input, 'an');

    await waitFor(() => expect(onComplete).toHaveBeenLastCalledWith('an'), { timeout: 1500 });

    await user.click(await screen.findByRole('option', { name: 'Bruno', hidden: true }));

    expect(onChange).toHaveBeenCalledWith('b2');
    expect(input).toHaveValue('Bruno');

    await user.tab();
    expect(onValidate).toHaveBeenCalled();
  });

  it('accepts plain string data and respects the limit', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <FormAutocomplete
        label="Cidade"
        data={['Recife', 'Natal', 'Fortaleza']}
        limit={2}
      />,
    );

    await user.click(screen.getByLabelText('Cidade'));

    expect(await screen.findAllByRole('option', { hidden: true })).toHaveLength(2);
  });
});

describe('FormDateTimePicker', () => {
  it('renders a datetime-local input trimming fractional seconds', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = renderWithProviders(
      <FormDateTimePicker
        label="Início"
        value="2026-10-23T10:30:00.000"
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText('Início');
    expect(input).toHaveAttribute('type', 'datetime-local');
    expect(input).toHaveValue('2026-10-23T10:30');

    rerender(
      <FormDateTimePicker
        label="Início"
        value=""
        onChange={onChange}
      />,
    );

    await user.type(input, '2026-10-24T08:00');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('FormSegmentedControl', () => {
  it('returns the selected value and validates after changes', async () => {
    const onChange = vi.fn();
    const onValidate = vi.fn();
    const user = userEvent.setup();

    const { rerender } = renderWithProviders(
      <FormSegmentedControl
        value="a"
        data={[{ value: 'a', label: 'Aba A' }, { value: 'b', label: 'Aba B' }]}
        onChange={onChange}
        onValidate={onValidate}
      />,
    );

    await user.click(screen.getByText('Aba B'));
    expect(onChange).toHaveBeenCalledWith('b');

    rerender(
      <FormSegmentedControl
        value="b"
        data={[{ value: 'a', label: 'Aba A' }, { value: 'b', label: 'Aba B' }]}
        onChange={onChange}
        onValidate={onValidate}
      />,
    );

    expect(onValidate).toHaveBeenCalled();
  });
});
