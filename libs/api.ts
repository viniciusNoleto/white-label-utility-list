import { NextResponse } from 'next/server';
import type { ApiMessage } from '@/shared/types/api';

export function msg(pt: string, es: string, en: string): ApiMessage {
  return { 'pt-br': pt, 'es-mx': es, 'en-us': en };
}

export function jsonOk<T>(data: T, message: ApiMessage, status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function jsonError(message: ApiMessage, status = 400) {
  return NextResponse.json({ success: false, message, data: null }, { status });
}

export const MESSAGES = {
  unauthorized: msg('Você precisa entrar para continuar.', 'Debes iniciar sesión para continuar.', 'You need to sign in to continue.'),
  forbidden: msg('Você não tem permissão para esta ação.', 'No tienes permiso para esta acción.', 'You do not have permission for this action.'),
  notFound: msg('Registro não encontrado.', 'Registro no encontrado.', 'Record not found.'),
  serverError: msg('Erro inesperado. Tente novamente.', 'Error inesperado. Inténtalo de nuevo.', 'Unexpected error. Please try again.'),
  invalidPayload: msg('Dados inválidos.', 'Datos inválidos.', 'Invalid data.'),
};
