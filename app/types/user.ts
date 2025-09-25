export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}