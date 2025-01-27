export interface User {
  id: string;
  name: string;
  email: string;
  role: 'asker' | 'responder';
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
