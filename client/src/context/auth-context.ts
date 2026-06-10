import { createContext } from 'react';
import type { AuthUser } from '../lib/auth-api';
import type { SignInValues, SignUpValues } from '../lib/validation';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (values: SignUpValues) => Promise<void>;
  signIn: (values: SignInValues) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
