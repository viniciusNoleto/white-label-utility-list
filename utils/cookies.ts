import Cookies from 'js-cookie';

export function getCookie(name: string): string | null {
  return Cookies.get(name) ?? null;
}

export function setCookie(name: string, value: string, days = 7): void {
  Cookies.set(name, value, { expires: days, sameSite: 'strict' });
}

export function removeCookie(name: string): void {
  Cookies.remove(name);
}
