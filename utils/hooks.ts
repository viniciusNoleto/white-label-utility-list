import { useEffect, useRef, useState, type DependencyList } from "react";
import { useDebouncedCallback } from '@mantine/hooks';
import { BRAND_NAME } from "../shared/constants/brand";

export function usePageTitle(...parts: string[]) {
  const title = [...parts, BRAND_NAME].join(' | ');
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}

export function useDebouncedEffect(
  effect: () => void,
  deps: DependencyList,
  delay: number
) {
  const debouncedEffect = useDebouncedCallback(effect, delay)

  useNotFirstEffect(() => {
    debouncedEffect()
  }, deps)
}

export function useNotFirstEffect(effect: () => void, deps: DependencyList) {
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!rendered) setRendered(true)
    else effect()
  }, deps);
}

export function useQueryParamState<T extends string>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;

    const params = new URLSearchParams(window.location.search);

    return (params.get(key) as T) || defaultValue;
  });

  function setQueryParamValue(newValue: T) {
    setValue(newValue);

    const params = new URLSearchParams(window.location.search);
    params.set(key, newValue);

    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }

  return [value, setQueryParamValue] as const;
}

export function useStoppableEffect(
  effect: () => void,
  deps: unknown[]
) {
  const stopped = useRef(false);

  const stop = () => (stopped.current = true)

  useEffect(() => {
    if (stopped.current) return

    effect();
  }, deps);

  return stop;
}