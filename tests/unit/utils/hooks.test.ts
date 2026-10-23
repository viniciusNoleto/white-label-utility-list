import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDebouncedEffect, useNotFirstEffect, useQueryParamState } from '@/src/utils/hooks';

describe('useNotFirstEffect', () => {
  it('does not run the effect on the initial render', () => {
    const effect = vi.fn();

    renderHook(({ dep }) => useNotFirstEffect(effect, [dep]), { initialProps: { dep: 1 } });

    expect(effect).not.toHaveBeenCalled();
  });

  it('runs the effect on subsequent dependency changes', () => {
    const effect = vi.fn();

    const { rerender } = renderHook(({ dep }) => useNotFirstEffect(effect, [dep]), { initialProps: { dep: 1 } });

    rerender({ dep: 2 });

    expect(effect).toHaveBeenCalledTimes(1);
  });
});

describe('useDebouncedEffect', () => {
  it('debounces the effect and skips the first render', () => {
    vi.useFakeTimers();

    const effect = vi.fn();
    const { rerender } = renderHook(({ dep }) => useDebouncedEffect(effect, [dep], 500), { initialProps: { dep: { n: 1 } } });

    expect(effect).not.toHaveBeenCalled();

    rerender({ dep: { n: 2 } });

    expect(effect).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(effect).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});

describe('useQueryParamState', () => {
  it('reads the initial value from the URL query string', () => {
    window.history.replaceState(null, '', '/?status=active');

    const { result } = renderHook(() => useQueryParamState('status', 'all'));

    expect(result.current[0]).toBe('active');
  });

  it('falls back to the default value when the param is absent', () => {
    window.history.replaceState(null, '', '/');

    const { result } = renderHook(() => useQueryParamState('status', 'all'));

    expect(result.current[0]).toBe('all');
  });

  it('setter updates state and rewrites the URL', () => {
    window.history.replaceState(null, '', '/');

    const { result } = renderHook(() => useQueryParamState<string>('status', 'all'));

    act(() => {
      result.current[1]('archived');
    });

    expect(result.current[0]).toBe('archived');
    expect(window.location.search).toBe('?status=archived');
  });
});
