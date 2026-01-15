import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseAdminAuthReturn {
  user: any;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Cache admin status to avoid repeated calls on navigation
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useAdminAuth(): UseAdminAuthReturn {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = useCallback(async (userId: string, accessToken: string): Promise<boolean> => {
    // Check cache first
    const cached = adminCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.isAdmin;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        console.error('check-admin failed:', await res.text());
        return false;
      }

      const json = await res.json();
      const adminStatus = json?.isAdmin === true;

      // Cache the result
      adminCache.set(userId, { isAdmin: adminStatus, timestamp: Date.now() });
      
      return adminStatus;
    } catch (err) {
      console.error('Exception checking admin role:', err);
      return false;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('getSession error:', error);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        const adminStatus = await checkAdminRole(session.user.id, session.access_token);
        setIsAdmin(adminStatus);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (e) {
      console.error('getSession exception:', e);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, [checkAdminRole]);

  useEffect(() => {
    let isMounted = true;

    // Safety timer - never hang forever
    const safetyTimer = window.setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 5000);

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        adminCache.clear();
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        const adminStatus = await checkAdminRole(session.user.id, session.access_token);
        if (isMounted) setIsAdmin(adminStatus);
      } else {
        setUser(null);
        setIsAdmin(false);
      }

      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      window.clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [initializeAuth, checkAdminRole]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error('Ошибка входа: ' + error.message);
      return false;
    }
    toast.success('Успешный вход!');
    return true;
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      toast.error('Ошибка регистрации: ' + error.message);
      return false;
    }

    if (data.session) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assign-first-admin`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.session.access_token}`,
            },
          }
        );
        
        const result = await response.json();
        
        if (result.isAdmin) {
          // Clear cache so we refetch
          adminCache.clear();
          toast.success('Вы зарегистрированы как администратор!');
        } else {
          toast.success('Регистрация успешна!');
        }
      } catch (err) {
        console.error('Error calling assign-first-admin:', err);
        toast.success('Регистрация успешна!');
      }
    } else {
      toast.success('Регистрация успешна! Проверьте почту для подтверждения.');
    }
    
    return true;
  };

  const logout = async () => {
    adminCache.clear();
    await supabase.auth.signOut();
    toast.info('Вы вышли из системы');
  };

  return { user, isAdmin, isLoading, login, register, logout };
}
