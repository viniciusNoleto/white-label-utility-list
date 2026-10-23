import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import * as yup from 'yup';
import { useImmediateState, useRecordState, useValidatedFormState } from '@/src/utils/state';

describe('useImmediateState', () => {
  it('updates the state value synchronously', () => {
    const { result } = renderHook(() => useImmediateState(1));

    act(() => {
      result.current[1](2);
    });

    expect(result.current[0]).toBe(2);
  });
});

describe('useRecordState', () => {
  it('reads and writes nested paths via field()', () => {
    const { result } = renderHook(() => useRecordState({ user: { name: 'Ana' } }));

    expect(result.current.field('user.name').value).toBe('Ana');

    act(() => {
      result.current.field('user.name').onChange('Bruno');
    });

    expect(result.current.state.user.name).toBe('Bruno');
  });

  it('setValue writes a deep path without mutating the previous state', () => {
    const { result } = renderHook(() => useRecordState({ user: { name: 'Ana' } }));
    const previous = result.current.state;

    act(() => {
      result.current.setValue('user.name', 'Carla');
    });

    expect(previous.user.name).toBe('Ana');
    expect(result.current.state.user.name).toBe('Carla');
  });
});

describe('useValidatedFormState', () => {
  const schema = yup.object({
    email: yup.string().default('').required('E-mail é obrigatório').email('E-mail inválido'),
    password: yup.string().default('').required('Senha é obrigatória'),
  });

  it('starts from the schema default values', () => {
    const { result } = renderHook(() => useValidatedFormState(schema));

    expect(result.current.state).toEqual({ email: '', password: '' });
    expect(result.current.errors).toEqual({});
  });

  it('field().onChange updates state and field().value reflects it', () => {
    const { result } = renderHook(() => useValidatedFormState(schema));

    act(() => {
      result.current.field('email').onChange('user@example.com');
    });

    expect(result.current.field('email').value).toBe('user@example.com');
  });

  it('validate() fails and populates errors for invalid data', async () => {
    const { result } = renderHook(() => useValidatedFormState(schema));

    let isValid: boolean = true;
    await act(async () => {
      isValid = await result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.email).toBe('E-mail é obrigatório');
    expect(result.current.errors.password).toBe('Senha é obrigatória');
  });

  it('validate() succeeds and clears errors for valid data', async () => {
    const { result } = renderHook(() => useValidatedFormState(schema));

    act(() => {
      result.current.setValue('email', 'user@example.com');
      result.current.setValue('password', 'secret123');
    });

    let isValid: boolean = false;
    await act(async () => {
      isValid = await result.current.validate();
    });

    expect(isValid).toBe(true);
  });

  it('field().onValidate sets a single field error without touching others', async () => {
    const { result } = renderHook(() => useValidatedFormState(schema));

    await act(async () => {
      result.current.field('email').onValidate();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.errors.email).toBe('E-mail é obrigatório');
    expect(result.current.errors.password).toBeUndefined();
  });
});
