import { useStoppableEffect } from '@/src/utils/hooks';
import { Suspense, useState, type ReactNode } from 'react';

type UtilsLoaderProps = {
  show: boolean;
  children: () => ReactNode;
  fallback?: ReactNode;
};

export function UtilsLoader({ show, children, fallback = null }: UtilsLoaderProps) {
  const [mounted, setMounted] = useState(show);

  function controllMounted() {
    if (show) {
      setMounted(true);

      // eslint-disable-next-line
      stop()
    }
  }

  const stop = useStoppableEffect(controllMounted, [show]);

  if (!mounted) return null;

  return (
    <section style={{ display: show ? 'block' : 'none' }}>
      <Suspense fallback={fallback}>
        {children()}
      </Suspense>	
    </section>
  );
}