import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS } from '@/libs/auth/tokens';
import { validateAccessToken } from '@/libs/auth/accessToken';
import { rotateSession } from '@/libs/auth/refreshToken';

function setAuthCookies(response: NextResponse, tokens: { accessToken: string; refreshToken: string }) {
  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    path: '/',
    sameSite: 'strict',
    secure: isProduction,
    maxAge: ACCESS_TOKEN_TTL_MS / 1000,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    path: '/',
    sameSite: 'strict',
    secure: isProduction,
    maxAge: REFRESH_TOKEN_TTL_MS / 1000,
  });
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next')
    || pathname.startsWith('/api')
    || pathname.startsWith('/favicon')
    || pathname.startsWith('/site.webmanifest')
    || pathname.startsWith('/apple-touch-icon')
    || pathname.startsWith('/android-chrome')
  ) {
    return NextResponse.next();
  }

  const accessTokenCookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const refreshTokenCookie = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null;

  const hasValidAccessToken = !!(await validateAccessToken(accessTokenCookie));

  if (hasValidAccessToken || !refreshTokenCookie) return NextResponse.next();

  const rotated = await rotateSession(refreshTokenCookie);

  if (!rotated.ok) {
    if (pathname.startsWith('/auth/')) return NextResponse.next();

    const response = NextResponse.redirect(new URL('/auth/login', request.nextUrl));
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.next();

  setAuthCookies(response, { accessToken: rotated.accessToken, refreshToken: rotated.refreshToken });

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|svg|ico|webmanifest)$).*)'],
};
