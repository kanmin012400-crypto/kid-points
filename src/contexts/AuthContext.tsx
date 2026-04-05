import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// 匿名用户接口
interface AnonymousUser {
  uid: string;
  isAnonymous: true;
}

interface AuthContextType {
  user: AnonymousUser | null;
  isLoading: boolean;
  error: null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 生成本地匿名用户ID
function getOrCreateAnonymousUser(): AnonymousUser {
  const storageKey = 'kids_points_anonymous_uid';
  let uid = localStorage.getItem(storageKey);
  if (!uid) {
    uid = 'anon_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(storageKey, uid);
  }
  return { uid, isAnonymous: true };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AnonymousUser | null>(null);
  const [isLoading] = useState(false);

  useEffect(() => {
    // 自动登录匿名用户
    setUser(getOrCreateAnonymousUser());
  }, []);

  const login = async (_email: string, _password: string) => {
    // 免登录模式，不需要登录
  };

  const register = async (_email: string, _password: string) => {
    // 免登录模式，不需要注册
  };

  const logout = async () => {
    // 免登录模式，不需要登出
  };

  const clearError = () => {};

  return (
    <AuthContext.Provider value={{ user, isLoading, error: null, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
