import { flushSync } from 'react-dom';
import React, { useCallback, useState } from 'react';
import type { ObjectSchema } from 'yup';
import _get from 'lodash-es/get';
import _set from 'lodash-es/set';
import { produce } from 'immer';
import type { Path, PathValue } from '@/src/shared/types/object';

export function useTrimmedStringState(initialValue: string) {
  const [state, setState] = useState(initialValue)

  return [state, function(value: string) {
    return setState(value ? value.trim() : '')
  }] as const
}

export function useImmediateState<T>(initialValue: T) {
  const [state, setState] = useState(initialValue);

  return [state, (v: T) => flushSync(() => setState(v))] as const;
}

export function useBooleanRecordState<K extends string>(initialValue: Record<K, boolean|undefined>) {
  return useRecordState<Record<K, boolean|undefined>>(initialValue);
}

export function useRecordState<T extends object>(initialValue: T) {
  const [state, setState] = useState(initialValue);

  const setValue = <P extends Path<T>>(path: P, value: PathValue<T, P>) => setStateDeepValue(setState, path, value);

  const field = <P extends Path<T>>(path: P) => ({
    value: _get(state, path) as PathValue<T, P>,
    onChange: (value: PathValue<T, P>) => setValue(path, value)
  });

  return { state, setState, field, setValue };
}


function getValidError(errors: object, path: string) {
  const error = _get(errors, path);

  return typeof error === 'string' ? error : undefined;
}

export function useValidatedFormState<T extends object>(schema: ObjectSchema<T>) {
  const [state, setState] = useState<T>(schema.getDefault());
  
  const setValue = <P extends Path<T>>(path: P|string, value: PathValue<T, P>) => setStateDeepValue(setState, path, value);

  const [errors, setErrors] = useState<Record<string, any>>({});

  const setErrorValue = (path: string, value?: string) => setStateDeepValue(setErrors, path, value);

  const field = useCallback(<P extends Path<T>>(path: P) => ({
    error: getValidError(errors, path),

    value: _get(state, path) as any,

    onChange: (value: PathValue<T, P>) => setValue(path, value),

    onValidate: () => {
      setErrorValue(path);

      schema.validateAt(path, state).catch((error) => path === error.path && setErrorValue(error.path, error.errors[0]))
    }
  }), [state, errors]);

  const validate = async () => {
    return schema.validate(state, { abortEarly: false })
      .then(() => true)
      .catch((validationError) => {
        const newErrors: Record<string, any> = {};

        validationError.inner.forEach((error: any) => {
          if (error.path) newErrors[error.path] = error.errors[0];
        });

        globalThis.console.error('Validation failed:', newErrors);

        setErrors(newErrors);

        return false
      })
  };

  return {
    state,
    setState,
    setValue,
    errors,
    setErrors,
    setErrorValue,
    field,
    validate
  };
}

export function setStateByProduce<T extends object>(setState: React.Dispatch<React.SetStateAction<T>>, producer: (draft: T) => any) {
  setState(prev => produce(prev, producer));
}

export function setStateDeepValue<T extends object>(setState: React.Dispatch<React.SetStateAction<T>>, path: string, value: any) {
  setState(prev =>
    produce(prev, draft => 
      _set(draft, path, value)
    )
  );
}

