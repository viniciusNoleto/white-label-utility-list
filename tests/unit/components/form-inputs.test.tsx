import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { FormTextInput } from '@/src/components/form/TextInput';
import { FormPassword } from '@/src/components/form/Password';
import { FormTextarea } from '@/src/components/form/Textarea';
import { FormNumberInput } from '@/src/components/form/Number';
import { FormSwitch } from '@/src/components/form/Switch';
import { FormSegmentedControl } from '@/src/components/form/SegmentedControl';

describe('FormTextInput', () => {
  it('emits the extracted string value on change, not the event', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormTextInput
        label="Nome"
        value=""
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText('Nome'), 'a');

    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('trims the value on change when trim is set', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormTextInput
        label="Nome"
        value=""
        onChange={onChange}
        trim
      />,
    );

    await user.type(screen.getByLabelText('Nome'), ' ');

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('calls onValidate on blur', async () => {
    const onValidate = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormTextInput
        label="Nome"
        value=""
        onValidate={onValidate}
      />,
    );

    await user.click(screen.getByLabelText('Nome'));
    await user.tab();

    expect(onValidate).toHaveBeenCalled();
  });

  it('calls onValidate when the value prop changes (not on first render)', () => {
    const onValidate = vi.fn();

    const { rerender } = renderWithProviders(
      <FormTextInput
        label="Nome"
        value=""
        onValidate={onValidate}
      />,
    );

    expect(onValidate).not.toHaveBeenCalled();

    rerender(
      <FormTextInput
        label="Nome"
        value="Ana"
        onValidate={onValidate}
      />,
    );

    expect(onValidate).toHaveBeenCalledTimes(1);
  });
});

describe('FormPassword', () => {
  it('emits the extracted string value on change', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormPassword
        label="Senha"
        value=""
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText('Senha'), 's');

    expect(onChange).toHaveBeenCalledWith('s');
  });
});

describe('FormTextarea', () => {
  it('emits the extracted string value on change', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormTextarea
        label="Descrição"
        value=""
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText('Descrição'), 'x');

    expect(onChange).toHaveBeenCalledWith('x');
  });
});

describe('FormNumberInput', () => {
  it('emits the extracted numeric value on change', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormNumberInput
        label="Quantidade"
        value={undefined}
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText('Quantidade'), '5');

    expect(onChange).toHaveBeenCalledWith(5);
  });
});

describe('FormSwitch', () => {
  it('emits the boolean extracted from the change event, not the event itself', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormSwitch
        label="Ativo"
        value={false}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Ativo'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reflects value as the checked state', () => {
    renderWithProviders(
      <FormSwitch
        label="Ativo"
        value={true}
        onChange={() => {}}
      />,
    );

    expect(screen.getByLabelText('Ativo')).toBeChecked();
  });
});

describe('FormSegmentedControl', () => {
  it('emits the selected value on change', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormSegmentedControl
        value="a"
        onChange={onChange}
        data={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
      />,
    );

    await user.click(screen.getByText('B'));

    expect(onChange).toHaveBeenCalledWith('b');
  });
});
