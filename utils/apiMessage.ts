import type { ApiMessage } from '@/src/shared/types/api';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/src/shared/constants/locale';

export function resolveApiMessage(message: ApiMessage, language: string): string {
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(language)
    ? (language as SupportedLocale)
    : 'pt-br';
  return message[locale];
}
