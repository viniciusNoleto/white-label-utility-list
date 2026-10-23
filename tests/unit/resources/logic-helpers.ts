export const apiMessage = (text: string) => ({ 'pt-br': text, 'es-mx': text, 'en-us': text });

export function apiOk<T>(data: T, text = 'Sucesso') {
  return { success: true, message: apiMessage(text), data } as any;
}

export function apiError(text = 'Falhou') {
  return { success: false, message: apiMessage(text), data: null };
}
