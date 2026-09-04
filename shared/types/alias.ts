
// eslint-disable-next-line
export type Last<T extends readonly unknown[]> = T extends [...infer _, infer L] ? L : never;