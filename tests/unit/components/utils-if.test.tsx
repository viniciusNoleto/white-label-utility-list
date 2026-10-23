import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UtilsIf } from '@/src/components/utils/If';

describe('UtilsIf — condition mode', () => {
  it('renders children when condition is truthy', () => {
    render(
      <UtilsIf condition={true}>
        {() => <span>visible</span>}
      </UtilsIf>,
    );

    expect(screen.getByText('visible')).toBeInTheDocument();
  });

  it('renders nothing when condition is falsy', () => {
    const { container } = render(
      <UtilsIf condition={false}>
        {() => <span>hidden</span>}
      </UtilsIf>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('UtilsIf — cases mode', () => {
  it('renders the first matching case', () => {
    render(
      <UtilsIf
        cases={[
          { condition: false, content: () => <span>first</span> },
          { condition: true, content: () => <span>second</span> },
          { content: () => <span>fallback</span> },
        ]}
      />,
    );

    expect(screen.getByText('second')).toBeInTheDocument();
    expect(screen.queryByText('first')).not.toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('renders the case without a condition as the else branch', () => {
    render(
      <UtilsIf
        cases={[
          { condition: false, content: () => <span>first</span> },
          { content: () => <span>fallback</span> },
        ]}
      />,
    );

    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  it('renders nothing when no case matches and there is no else branch', () => {
    const { container } = render(
      <UtilsIf
        cases={[
          { condition: false, content: () => <span>first</span> },
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
