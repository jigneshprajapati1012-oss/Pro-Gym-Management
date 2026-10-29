import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('gym_user');

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('gym_user');
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('gym_auth_token');
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const savedToken = localStorage.getItem('gym_auth_token');

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');

        setUser(response.data.user);

        localStorage.setItem(
          'gym_user',
          JSON.stringify(response.data.user)
        );
      } catch (error) {
        console.error('Session verification failed:', error);

        setUser(null);
        setToken(null);

        localStorage.removeItem('gym_auth_token');
        localStorage.removeItem('gym_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkLogin();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<User> => {
    const response = await api.post('/auth/login', {
      email,
      password
    });

    const newToken = response.data.token;
    const newUser = response.data.user;

    setToken(newToken);
    setUser(newUser);

    localStorage.setItem(
      'gym_auth_token',
      newToken
    );

    localStorage.setItem(
      'gym_user',
      JSON.stringify(newUser)
    );

    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('gym_auth_token');
    localStorage.removeItem('gym_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
};
