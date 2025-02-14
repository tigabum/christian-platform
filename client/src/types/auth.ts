export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  expertise?: string[];
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
