import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UtilsFor } from '@/src/components/utils/For';

describe('UtilsFor', () => {
  it('renders one child per item using the item and index', () => {
    render(
      <ul>
        <UtilsFor
          each={['a', 'b', 'c']}
          eachKey={({ index }) => index}
        >
          {({ item, index }) => (
            <li>
              {`${index}:${item}`}
            </li>
          )}
        </UtilsFor>
      </ul>,
    );

    expect(screen.getByText('0:a')).toBeInTheDocument();
    expect(screen.getByText('1:b')).toBeInTheDocument();
    expect(screen.getByText('2:c')).toBeInTheDocument();
  });

  it('renders the empty fallback when the array is empty', () => {
    render(
      <UtilsFor
        each={[]}
        empty={<span>nothing here</span>}
      >
        {({ item }) => <span>{String(item)}</span>}
      </UtilsFor>,
    );

    expect(screen.getByText('nothing here')).toBeInTheDocument();
  });

  it('renders nothing when the array is empty and there is no empty fallback', () => {
    const { container } = render(
      <UtilsFor each={[]}>
        {({ item }) => <span>{String(item)}</span>}
      </UtilsFor>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('treats a non-array value as empty', () => {
    const { container } = render(
      <UtilsFor each={undefined as unknown as string[]}>
        {({ item }) => <span>{String(item)}</span>}
      </UtilsFor>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
