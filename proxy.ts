// Renovação silenciosa do access_token antes da renderização de páginas —
// ver docs/auth/README.md, docs/auth/frontend-plan.md (seção 4) e
// docs/auth/reference-backend-analysis.md.
//
// Fluxo (o mesmo descrito para GET /api/auth/token + POST
// /api/auth/token/refresh, só que rodando direto contra o banco em vez de
// via HTTP, porque já estamos no processo Node.js do Next):
//   1. access_token do cookie ainda válido -> segue sem tocar em nada.
//   2. access_token inválido/expirado, mas há refresh_token -> tenta
//      rotacioná-lo (processo padrão de refresh — espelha
//      admin.process_new_refresh_token do eventure-api).
//   3. refresh também inválido/expirado/reutilizado (ou ausente) -> sessão
//      morta: limpa os dois cookies e redireciona para /auth/login.
//
// Este arquivo não faz guarda de rota por página/role — isso é feito pelos
// Server Components (`verifySession()`/`requireAdmin()` em
// `app/(protected)/layout.tsx` e `app/admin/layout.tsx`, e o redirect de
// quem já está logado em `app/auth/layout.tsx`), que só precisam ler cookie
// + `redirect()`. A etapa 3 acima é a única peça que também precisa
// continuar aqui: Server Components não conseguem gravar/limpar cookies, só
// Route Handlers e este arquivo conseguem.
// Rotas de API (`/api/**`) nunca passam por aqui — autenticam via header
// `Authorization` (requireApiUser/requireApiAdmin) e têm seu próprio fluxo
// de refresh no client (utils/app-client.ts). Rotacionar por aqui também
// para `/api/**` colidiria com esse fluxo (consumiria o mesmo refresh_token
// que o client ainda tem em memória).
//
// Decisão de runtime (ver frontend-plan.md, seção 4): este projeto roda
// `next@16.2.9`, onde o arquivo `middleware.ts` está **deprecated** e foi
// renomeado para `proxy.ts` — ver
// `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
// e `.../02-guides/upgrading/version-16.md`, seção "middleware to proxy".
// A partir do Next 16, o runtime Edge **não é suportado** em `proxy.ts` —
// ele roda sempre em Node.js, então dá pra importar `rotateSession`
// (Drizzle/Postgres) direto aqui sem precisar de fallback via HTTP interno.
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

  // access_token ainda válido: nada a fazer. Sem refresh_token e sem
  // access_token válido: visitante anônimo, nada a renovar (páginas
  // protegidas são bloqueadas pelos layouts via `verifySession()`).
  if (hasValidAccessToken || !refreshTokenCookie) return NextResponse.next();

  const rotated = await rotateSession(refreshTokenCookie);

  // Sessão morta: o refresh_token que existia não é mais válido (expirado,
  // já usado/rotacionado antes — incluindo reuso detectado, que revoga a
  // família inteira — ou revogado por logout em outra aba). Não basta
  // deixar passar — os cookies inválidos ficariam presos no browser e
  // `verifySession()` redirecionaria de qualquer forma, mas sem nunca
  // limpar esse lixo. Limpa os dois e manda pro login já aqui.
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
