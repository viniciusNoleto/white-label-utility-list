import { SupportedLocale } from '@/src/shared/constants/locale';

export type ApiMessage = Record<SupportedLocale, string>;

export type ApiReponse<T> = {
  data: T,
  message: ApiMessage
}

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginatedMeta;
}

export type PaginatedMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export type PayloadBody<T extends FormData | object> = {
  body: T
}

export type PayloadQuery<T extends object> = {
  query?: T
}