import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { FormButton } from '@/src/components/form/Button';

describe('FormButton', () => {
  it('renders children with priority over label', () => {
    renderWithProviders(
      <FormButton label="Label">
        Children
      </FormButton>,
    );

    expect(screen.getByRole('button', { name: 'Children' })).toBeInTheDocument();
  });

  it('renders the label when there are no children', () => {
    renderWithProviders(<FormButton label="Salvar" />);

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FormButton
        label="Salvar"
        onClick={onClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('wraps the button with a visible tooltip when tooltip is provided', () => {
    renderWithProviders(
      <FormButton
        icon="lucide:trash-2"
        tooltip="Excluir"
        aria-label="Excluir"
      />,
    );

    expect(screen.getByLabelText('Excluir')).toBeInTheDocument();
  });
});
