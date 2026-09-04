import _get from 'lodash-es/get';

export type Hook<T = any> = string | number | ((obj: T) => any);

export function getter(obj: object, hook?: Hook) {
  if (!hook || !obj) return obj;
  if (typeof hook === 'function') return hook(obj);

  return _get(obj, hook);
}
