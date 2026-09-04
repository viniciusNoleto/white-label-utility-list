import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/libs/auth/password';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email || !password || password.length < 8) {
      return jsonError(MESSAGES.invalidPayload, 422);
    }

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

    if (existing) {
      return jsonError(
        msg('Este e-mail já está cadastrado.', 'Este correo ya está registrado.', 'This email is already registered.'),
        409,
      );
    }

    await db.insert(users).values({
      name,
      email,
      password_hash: await hashPassword(password),
      role: 'user',
      status: 'pending',
    });

    return jsonOk(
      null,
      msg(
        'Cadastro realizado! Sua conta está aguardando aprovação de um administrador.',
        '¡Registro realizado! Tu cuenta está esperando la aprobación de un administrador.',
        'Registration complete! Your account is awaiting administrator approval.',
      ),
      201,
    );
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
