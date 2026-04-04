import { useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    // Check localStorage for stored user on mount
    const stored = localStorage.getItem('expense-tracker-user');
    let parsedUser: User | null = null;
    
    if (stored) {
      try {
        parsedUser = JSON.parse(stored);
        userRef.current = parsedUser;
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    
    setUser(parsedUser);
    setLoading(false);
  }, []);

  const login = useCallback((username: string, userId: string) => {
    const newUser: User = {
      id: userId,
      username,
      createdAt: Date.now(),
    };
    localStorage.setItem('expense-tracker-user', JSON.stringify(newUser));
    userRef.current = newUser;
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('expense-tracker-user');
    userRef.current = null;
    setUser(null);
  }, []);

  // Retornar userRef.current como fallback si user es null pero tenía un valor
  const currentUser = user || userRef.current;

  return {
    user: currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };
}
