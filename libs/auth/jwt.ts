import { SignJWT, jwtVerify } from 'jose';

export type SessionTokenPayload = {
  token: string;
  user_id: number;
  role: string;
};

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function encryptSessionToken(payload: SessionTokenPayload, expiresAt: Date) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(encodedKey);
}

export async function decryptSessionToken(jwt?: string | null): Promise<SessionTokenPayload | null> {
  if (!jwt) return null;

  try {
    const { payload } = await jwtVerify<SessionTokenPayload>(jwt, encodedKey, { algorithms: ['HS256'] });
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = 'session';
