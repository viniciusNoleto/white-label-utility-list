export interface IAuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

// Payload devolvido por login/token/refresh — par de tokens + usuário atual.
// Ver docs/auth/backend-plan.md, seção "Rotas — contrato final".
export interface IAuthSession {
  user: IAuthUser;
  access_token: string;
  refresh_token: string;
}
