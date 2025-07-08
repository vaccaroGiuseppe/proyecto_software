import { useState } from 'react';
import { FaLock, FaCheck, FaTimes, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { supabase } from '../lib/../../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import "./RecuperarContrasena.css";

const ActualizarContrasena = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Extraer token de la URL si existe
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('access_token');

      // Si hay token en la URL, usamos flujo de recuperación
      if (accessToken) {
        // Primero establecemos la sesión con el token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get('refresh_token') || ''
        });

        if (sessionError) throw sessionError;
      }

      supabase.auth.updateUser({
        password: password
      });
      supabase.auth.signOut().finally()

      // Mostrar mensaje de éxito
      setSuccess(true);

      
        

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la contraseña');
      console.error('Error:', err);
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
                Tu contraseña ha sido actualizada correctamente. Serás redirigido para iniciar sesión.
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
            onClick={() => navigate('/iniciarsesion')} 
            className='RecuperarContrasena_Volver_Link'
            disabled={loading}
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