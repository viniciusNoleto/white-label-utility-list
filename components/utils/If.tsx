import React from "react";

export type UtilsIfProps = {
  cases: Array<{
    condition?: boolean,
    content: () => React.ReactNode
  }>,
  condition?: never,
  children?: never,
} | {
  cases?: never,
  condition: any,
  children: () => React.ReactNode,
}

export function UtilsIf({ cases, condition, children }: UtilsIfProps): React.ReactNode | null {
  if (children) return condition ? children() : null;

  const match = cases!.find(c => c.condition === undefined || c.condition);

  if (!match) return null;

  return match.content();
}
