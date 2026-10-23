import { describe, expect, it } from 'vitest';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { formatCpf, formatFileSize, formatPhone } from '@/src/utils/format';
import { chain, mapper } from '@/src/utils/chain';
import { cn } from '@/src/utils/ui';
import { cn as libCn } from '@/src/libs/utils';
import { getter } from '@/src/utils/data';

describe('resolveApiMessage', () => {
  const message = { 'pt-br': 'Olá', 'es-mx': 'Hola', 'en-us': 'Hello' };

  it('returns the message in the requested locale', () => {
    expect(resolveApiMessage(message, 'en-us')).toBe('Hello');
    expect(resolveApiMessage(message, 'es-mx')).toBe('Hola');
  });

  it('falls back to pt-br for unsupported locales', () => {
    expect(resolveApiMessage(message, 'fr-fr')).toBe('Olá');
  });
});

describe('format', () => {
  it('formatCpf', () => {
    expect(formatCpf(null)).toBe('—');
    expect(formatCpf('12345678901')).toBe('123.456.789-01');
    expect(formatCpf('123')).toBe('123');
  });

  it('formatFileSize', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatFileSize(3 * 1024 ** 3)).toBe('3.0 GB');
    expect(formatFileSize(5 * 1024 ** 4)).toBe('5120.0 GB');
  });

  it('formatPhone', () => {
    expect(formatPhone(undefined)).toBe('—');
    expect(formatPhone('5511987654321')).toBe('+55 (11) 98765-4321');
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
    expect(formatPhone('123')).toBe('123');
  });
});

describe('chain / mapper', () => {
  it('applies the transformations in sequence', async () => {
    const result = await chain(
      Promise.resolve({ success: true, message: 'ok', data: [1, 2] } as any),
      mapper((res: any) => res.data.map((n: number) => n * 10)),
    );

    expect((result as any).data).toEqual([10, 20]);
  });
});

describe('cn', () => {
  it('merges tailwind classes', () => {
    expect(cn('p-2', false && 'hidden', 'p-4')).toBe('p-4');
    expect(libCn('text-sm', 'text-lg')).toBe('text-lg');
  });
});

describe('getter', () => {
  it('reads by path, by function and returns the object without hook', () => {
    const obj = { a: { b: 2 } };

    expect(getter(obj, 'a.b')).toBe(2);
    expect(getter(obj, (o: any) => o.a)).toEqual({ b: 2 });
    expect(getter(obj)).toBe(obj);
  });
});
