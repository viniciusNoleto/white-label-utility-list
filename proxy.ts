import { NextRequest, NextResponse } from 'next/server';
import { decryptSessionToken, SESSION_COOKIE } from '@/libs/auth/jwt';

const PUBLIC_PREFIXES = ['/auth/login', '/auth/register', '/api/auth'];

function isPublicPath(pathname: string) {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next')
    || pathname.startsWith('/favicon')
    || pathname.startsWith('/site.webmanifest')
    || pathname.startsWith('/apple-touch-icon')
    || pathname.startsWith('/android-chrome')
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = await decryptSessionToken(cookie);

  const isPublic = isPublicPath(pathname);

  // Optimistic check only — the real authorization (session validity, role,
  // account status) is always re-verified against the database via
  // verifySession()/requireAdmin() in every page/layout/route handler.
  if (!isPublic && !payload) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, message: 'Não autenticado.', data: null }, { status: 401 });
    }

    return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
  }

  if ((pathname === '/auth/login' || pathname === '/auth/register') && payload) {
    return NextResponse.redirect(new URL('/list', req.nextUrl));
  }

  if (pathname.startsWith('/admin') && payload && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/list', req.nextUrl));
  }

  if (pathname.startsWith('/api/admin') && payload && payload.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Acesso restrito a administradores.', data: null }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|svg|ico|webmanifest)$).*)'],
};
