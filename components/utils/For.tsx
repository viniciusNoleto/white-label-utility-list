import React from 'react';

export type UtilsForProps<T> = {
  each: T[];
  children: (ctx: { item: T, index: number }) => React.ReactNode;
  eachKey?: (ctx: { item: T, index: number }) => React.Key;
  empty?: React.ReactNode;
};

export const nFor = (n: number) => Array.from({ length: n }, (_, i) => i);

export function UtilsFor<T>({
  each = [],
  eachKey = ({index}) => index,
  children,
  empty,
}: UtilsForProps<T>) {
  if (!Array.isArray(each) || each.length === 0) return empty ?? null;

  return (
    <>
      {each.map((item, index) => (
        <React.Fragment key={eachKey?.({item, index}) ?? index}>
          {children({item, index})}
        </React.Fragment>
      ))}
    </>
  );
}