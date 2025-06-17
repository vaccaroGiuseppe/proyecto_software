import { useState } from 'react';
import { FaEnvelope, FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import "./RecuperarContrasena.css";

const RecuperarContrasena = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email.endsWith('@unimet.edu.ve') && !email.endsWith('@correo.unimet.edu.ve')) {
        throw new Error('Debe usar un correo institucional UNIMET');
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/actualizar-contrasena`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al enviar el correo');
      console.error('Error detallado:', err);
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
          <FaEnvelope className='RecuperarContrasena_Icono_Titulo' />
          <h1 className='RecuperarContrasena_Titulo'>
            {success ? 'Correo Enviado' : 'Recuperar Contraseña'}
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
                Hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>.
                Por favor revisa tu bandeja de entrada.
              </p>
            </div>
            <button 
              onClick={() => navigate('/iniciarsesion')}
              className="RecuperarContrasena_Volver"
              disabled={loading}
            >
              Volver a Iniciar Sesión
            </button>
          </div>
        ) : (
          <>
            <p className='RecuperarContrasena_Instrucciones'>
              Ingresa tu correo institucional UNIMET y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            
            <form className='RecuperarContrasena_Formulario' onSubmit={handleSubmit}>
              <div className='RecuperarContrasena_Campo'>
                <div className='Input_Container'>
                  <FaEnvelope className='Input_Icon' />
                  <input 
                    type='email' 
                    placeholder='correo@unimet.edu.ve'
                    className='RecuperarContrasena_Input'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                  <span className="loading-indicator">
                    <span className="loading-dot">.</span>
                    <span className="loading-dot">.</span>
                    <span className="loading-dot">.</span>
                  </span>
                ) : 'Enviar Enlace'}
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

export default RecuperarContrasena;