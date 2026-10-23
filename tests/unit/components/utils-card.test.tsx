import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UtilsCard } from '@/src/components/utils/Card';

describe('UtilsCard', () => {
  it('renders children inside a <section>', () => {
    render(
      <UtilsCard>
        <p>content</p>
      </UtilsCard>,
    );

    const section = screen.getByText('content').closest('section');
    expect(section).toBeInTheDocument();
  });

  it('applies the default padding and border classes', () => {
    render(
      <UtilsCard data-testid="card">
        <p>content</p>
      </UtilsCard>,
    );

    const card = screen.getByTestId('card');
    expect(card.className).toContain('p-6');
    expect(card.className).toContain('border');
  });

  it('removes padding when noPadding is set', () => {
    render(
      <UtilsCard
        data-testid="card"
        noPadding
      >
        <p>content</p>
      </UtilsCard>,
    );

    expect(screen.getByTestId('card').className).not.toContain('p-6');
  });

  it('removes the border when noBorder is set', () => {
    render(
      <UtilsCard
        data-testid="card"
        noBorder
      >
        <p>content</p>
      </UtilsCard>,
    );

    expect(screen.getByTestId('card').className).not.toContain('border-gray-200');
  });

  it('merges a custom className with the defaults', () => {
    render(
      <UtilsCard
        data-testid="card"
        className="custom-class"
      >
        <p>content</p>
      </UtilsCard>,
    );

    expect(screen.getByTestId('card').className).toContain('custom-class');
  });
});
