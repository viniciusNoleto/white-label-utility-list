import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { users } from '@/db/schema';
import { verifyPassword } from '@/libs/auth/password';
import { createSession } from '@/libs/auth/refreshToken';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

const INVALID_CREDENTIALS = msg(
  'E-mail ou senha inválidos.',
  'Correo o contraseña inválidos.',
  'Invalid email or password.',
);

const PENDING_APPROVAL = msg(
  'Sua conta ainda não foi aprovada por um administrador.',
  'Tu cuenta aún no ha sido aprobada por un administrador.',
  'Your account has not been approved by an administrator yet.',
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) return jsonError(MESSAGES.invalidPayload, 422);

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return jsonError(INVALID_CREDENTIALS, 401);
    }

    if (user.status !== 'approved') {
      return jsonError(PENDING_APPROVAL, 403);
    }

    const session = await createSession(user.id);

    return jsonOk(
      {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
        access_token: session.accessToken,
        refresh_token: session.refreshToken,
      },
      msg('Login realizado com sucesso.', 'Inicio de sesión exitoso.', 'Logged in successfully.'),
    );
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
