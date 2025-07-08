import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabaseClient";
import { FaSpinner } from 'react-icons/fa';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserProfile = async (userId: string) => {
      try {
        const { data: usuario, error } = await supabase
          .from('usuario')
          .select('nombre, apellido, sexo, tipo')
          .eq('id_usuario', userId)
          .maybeSingle();

        if (error) throw error;

        if (!usuario?.nombre || !usuario?.apellido || !usuario?.sexo || !usuario?.tipo) {
          navigate('/completar-perfil');
        } else {
          navigate('/perfil');
        }
      } catch (error) {
        console.error("Error verificando perfil:", error);
        navigate('/completar-perfil', { state: { error: "Error verificando tu perfil" } });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await checkUserProfile(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <FaSpinner className="spinner" size={50} style={{ animation: 'spin 1s linear infinite' }} />
      <p>Procesando autenticación...</p>
    </div>
  );
}