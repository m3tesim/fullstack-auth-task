import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  fetchProfile,
  signIn as signInRequest,
  signUp as signUpRequest,
  type AuthUser,
} from '../lib/auth-api';
import { clearToken, getToken, setToken } from '../lib/auth-storage';
import type { SignInValues, SignUpValues } from '../lib/validation';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await fetchProfile();
        if (active) {
          setUser(profile);
        }
      } catch {
        clearToken();
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();
    return () => {
      active = false;
    };
  }, []);

  const signUp = useCallback(async (values: SignUpValues) => {
    const result = await signUpRequest(values);
    setToken(result.accessToken);
    setUser(result.user);
  }, []);

  const signIn = useCallback(async (values: SignInValues) => {
    const result = await signInRequest(values);
    setToken(result.accessToken);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        signUp,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
