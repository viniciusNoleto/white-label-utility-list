export interface IAuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface IAuthSession {
  user: IAuthUser;
  access_token: string;
  refresh_token: string;
}
