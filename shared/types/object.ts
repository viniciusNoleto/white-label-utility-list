type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

export type Path<T> =
  T extends Primitive
    ? never
    : T extends readonly (infer U)[]
      ?
          | `${number}`
          | `${number}.${Path<U>}`
      : {
          [K in keyof T & string]:
            T[K] extends Primitive
              ? `${K}`
              :
                  | `${K}`
                  | `${K}.${Path<T[K]>}`;
        }[keyof T & string];

export type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? T extends readonly (infer U)[]
      ? K extends `${number}`
        ? PathValue<U, Rest>
        : never
      : K extends keyof T
        ? PathValue<T[K], Rest>
        : never
    : T extends readonly (infer U)[]
      ? P extends `${number}`
        ? U
        : never
      : P extends keyof T
        ? T[P]
        : never;