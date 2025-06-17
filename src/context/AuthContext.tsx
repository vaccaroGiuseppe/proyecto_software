import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

type UserData = {
  nombre: string;
  apellido: string;
  tipo: string;
  fecha_nacimiento?: string;
  sexo: string;
  foto_perfil?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: UserData) => Promise<{
    user: User | null;
    session: Session | null;
  }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función para verificar si el perfil está completo
  const checkProfileComplete = useCallback(async (userId: string) => {
    try {
      const { data: usuario, error } = await supabase
        .from('usuario')
        .select('nombre, apellido, sexo, tipo')
        .eq('id_usuario', userId)
        .single();

      if (error) throw error;
      return !!usuario?.nombre && !!usuario?.apellido && !!usuario?.sexo && !!usuario?.tipo;
    } catch (error) {
      console.error('Error verificando perfil:', error);
      return false;
    }
  }, []);

  // Función para registro con email
  const signUp = useCallback(async (email: string, password: string, userData: UserData) => {
    try {
      setLoading(true);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: userData.nombre,
            apellido: userData.apellido,
          }
        }
      });

      if (authError) throw authError;

      const { error: insertError } = await supabase
        .from('usuario')
        .insert([{
          id_usuario: authData.user?.id,
          ...userData,
          fecha_creacion: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      return authData;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para login con email
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para login con Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error al verificar sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const isProfileComplete = await checkProfileComplete(session.user.id);
        if (!isProfileComplete) {
          navigate('/completar-perfil');
        }
      } else if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, checkProfileComplete]);

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    loginWithEmail,
    loginWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}