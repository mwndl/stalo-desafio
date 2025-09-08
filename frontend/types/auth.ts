export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
