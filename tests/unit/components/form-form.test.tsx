import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import { Form } from '@/src/components/form/Form';

describe('Form', () => {
  it('calls onSubmit without an event when submitted', () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <Form onSubmit={onSubmit}>
        <button type="submit">
          Enviar
        </button>
      </Form>,
    );

    fireEvent.click(screen.getByText('Enviar'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith();
  });

  it('prevents the native form submission', () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <Form
        onSubmit={onSubmit}
        data-testid="form"
      >
        <button type="submit">
          Enviar
        </button>
      </Form>,
    );

    const form = screen.getByTestId('form');
    const submitEvent = fireEvent.submit(form);

    expect(submitEvent).toBe(false);
  });

  it('forwards native form attributes such as className', () => {
    renderWithProviders(
      <Form
        onSubmit={() => {}}
        data-testid="form"
        className="my-form"
      >
        <span>content</span>
      </Form>,
    );

    expect(screen.getByTestId('form')).toHaveClass('my-form');
  });

  it('disables native browser validation so Yup messages are shown', () => {
    renderWithProviders(
      <Form
        onSubmit={() => {}}
        data-testid="form"
      >
        <input required />
      </Form>,
    );

    expect(screen.getByTestId('form')).toHaveAttribute('novalidate');
  });
});
