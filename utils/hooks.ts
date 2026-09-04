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