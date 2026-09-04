import { ApiReponse } from '../shared/types/api';
type CaseA<Input, A> = [(arg0: Input) => A]
type CaseB<Input, A, B> = [(arg0: Input) => A, (arg0: A) => B];

export function chain<Input, A>(promise: Promise<Input>, ...fns: CaseA<Input, A>): Promise<A>
export function chain<Input, A, B>(promise: Promise<Input>, ...fns: CaseB<Input, A, B>): Promise<A>
export function chain<
  Input,
  Fns extends unknown[]
>(
  promise: Promise<Input>,
  ...fns: Fns
) {
  return fns.reduce(
    // @ts-expect-error each chain function has a type
    async (acc, fn) => fn(await acc),
    promise
  );
}

export function mapper<T, U>(fn: (_response: ApiReponse<T>) => U) {
  return (response: ApiReponse<T>) => {
    // @ts-expect-error in this case the data should be changed
    response.data = fn(response)
  
    return response as unknown as ApiReponse<U>
  }
}