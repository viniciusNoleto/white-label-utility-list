import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UtilsLoader } from '@/src/components/utils/Loader';

describe('UtilsLoader', () => {
  it('renders nothing when show is false and it was never shown', () => {
    const { container } = render(
      <UtilsLoader show={false}>
        {() => <span>content</span>}
      </UtilsLoader>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('mounts the children once show becomes true', () => {
    const { rerender } = render(
      <UtilsLoader show={false}>
        {() => <span>content</span>}
      </UtilsLoader>,
    );

    rerender(
      <UtilsLoader show={true}>
        {() => <span>content</span>}
      </UtilsLoader>,
    );

    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('keeps the content mounted (display:none) after show goes back to false', () => {
    const { rerender } = render(
      <UtilsLoader show={true}>
        {() => <span>content</span>}
      </UtilsLoader>,
    );

    rerender(
      <UtilsLoader show={false}>
        {() => <span>content</span>}
      </UtilsLoader>,
    );

    const content = screen.getByText('content');
    expect(content).toBeInTheDocument();
    expect(content.closest('section')).toHaveStyle({ display: 'none' });
  });
});
