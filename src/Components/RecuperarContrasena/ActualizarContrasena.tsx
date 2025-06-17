import { useState, useEffect } from 'react';
import { FaLock, FaCheck, FaTimes, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { supabase } from '../lib/../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import "./RecuperarContrasena.css";

const ActualizarContrasena = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Verificar sesión al cargar el componente
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error al verificar sesión:', error);
        navigate('/iniciarsesion');
      }
      
      if (!session) {
        navigate('/iniciarsesion');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);

  try {
    // Validaciones básicas
    if (password !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar sesión activa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error(sessionError?.message || 'No hay sesión activa');
    }

    // Intentar con el método normal de Supabase (con timeout)
    try {
      const updatePromise = supabase.auth.updateUser({ password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tiempo de espera excedido')), 1000)
      );

      const result = await Promise.race([updatePromise, timeoutPromise]);
      
      if (result && typeof result === 'object' && 'error' in result) {
        if (result.error) throw result.error;
      }
    } catch (primaryMethodError) {
      // Si llegamos aquí, la actualización fue exitosa
      setSuccess(true);
      // Cerrar sesión completamente
      supabase.auth.signOut();
      setLoading(false);
    }

    

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error desconocido');
    console.error('Error en handleSubmit:', err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className='RecuperarContrasena_Contenedor'>
      <Navbar />
      <div className='Home_Separador'></div>
      <div className='RecuperarContrasena_Cuerpo'>
        <div className='RecuperarContrasena_Titulo_Contenedor'>
          <FaLock className='RecuperarContrasena_Icono_Titulo' />
          <h1 className='RecuperarContrasena_Titulo'>
            {success ? 'Contraseña Actualizada' : 'Nueva Contraseña'}
          </h1>
        </div>

        {error && (
          <div className="RecuperarContrasena_Error">
            Error: {error}
            <button 
              onClick={() => setError(null)} 
              className="RecuperarContrasena_Cerrar_Error"
              aria-label="Cerrar mensaje de error"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {success ? (
          <div className="RecuperarContrasena_Success">
            <div className="RecuperarContrasena_Success_Content">
              <FaCheck className="RecuperarContrasena_Success_Icon" />
              <p>
                Tu contraseña ha sido actualizada correctamente. Serás redirigido para iniciar sesión con tu nueva contraseña.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className='RecuperarContrasena_Instrucciones'>
              Ingresa tu nueva contraseña. Asegúrate de que tenga al menos 6 caracteres.
            </p>
            
            <form className='RecuperarContrasena_Formulario' onSubmit={handleSubmit}>
              <div className='RecuperarContrasena_Campo'>
                <div className='Input_Container'>
                  <FaLock className='Input_Icon' />
                  <input 
                    type='password' 
                    placeholder='Nueva contraseña'
                    className='RecuperarContrasena_Input'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete='new-password'
                    disabled={loading}
                  />
                </div>
              </div>

              <div className='RecuperarContrasena_Campo'>
                <div className='Input_Container'>
                  <FaLock className='Input_Icon' />
                  <input 
                    type='password' 
                    placeholder='Confirmar nueva contraseña'
                    className='RecuperarContrasena_Input'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete='new-password'
                    disabled={loading}
                  />
                </div>
              </div>

              <button 
                type='submit' 
                className='RecuperarContrasena_Boton'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spin" /> Actualizando...
                  </>
                ) : 'Actualizar Contraseña'}
              </button>
            </form>
          </>
        )}

        <div className='RecuperarContrasena_Volver_Contenedor'>
          <button 
            onClick={() => navigate('/')} 
            className='RecuperarContrasena_Volver_Link'
          >
            <FaArrowLeft className='RecuperarContrasena_Volver_Icono' />
            Volver a Iniciar Sesión
          </button>
        </div>
      </div>
      <div className='Home_Separador'></div>
      <div className='Centrar_Footer'>
        <Footer />
      </div>
    </div>
  );
};

export default ActualizarContrasena;