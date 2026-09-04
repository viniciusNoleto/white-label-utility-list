import React from 'react';

import { cn } from '@/src/libs/utils';

export type UtilsCardProps = React.ComponentPropsWithoutRef<'section'> & {
  noPadding?: boolean;
  noBorder?: boolean;
};

export function UtilsCard({ className, children, noPadding, noBorder, ...props }: UtilsCardProps) {
  return (
    <section
      className={cn('bg-white dark:bg-neutral-900 rounded-2xl shadow-sm dark:shadow-none', !noPadding && 'p-6', !noBorder && 'border border-gray-200 dark:border-gray-800', className)}
      {...props}
    >
      {children}
    </section>
  );
}
