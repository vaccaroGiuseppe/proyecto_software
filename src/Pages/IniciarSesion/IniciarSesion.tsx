import { useState } from 'react';
import { FaSignInAlt, FaEnvelope, FaLock, FaTimes } from 'react-icons/fa';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./IniciarSesion.css";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const IniciarSesion = () => {
  const [formData, setFormData] = useState({
    correo: '',
    clave: ''
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle, loading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.correo.endsWith('@unimet.edu.ve') && !formData.correo.endsWith('@correo.unimet.edu.ve')) {
        throw new Error('Debe usar un correo institucional UNIMET');
      }

      await loginWithEmail(formData.correo, formData.clave);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error durante el inicio de sesión');
      console.error('Error detallado:', err);
    }
  };

  return (
    <div className='IniciarSesion_Contenedor'>
      <Navbar />
      <div className='Home_Separador'></div>
      <div className='IniciarSesion_Cuerpo'>
        <div className='IniciarSesion_Titulo_Contenedor'>
          <FaSignInAlt className='IniciarSesion_Icono_Titulo' />
          <h1 className='IniciarSesion_Titulo'>Iniciar Sesión</h1>
        </div>

        {error && (
          <div className="IniciarSesion_Error">
            <span>Error: {error}</span>
            <button 
              onClick={() => setError(null)} 
              className="IniciarSesion_Cerrar_Error"
              aria-label="Cerrar mensaje de error"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <form className='IniciarSesion_Formulario' onSubmit={handleSubmit}>
          <div className='IniciarSesion_Campo'>
            <div className='Input_Container'>
              <FaEnvelope className='Input_Icon' />
              <input 
                type='email' 
                name='correo'
                placeholder='correo@unimet.edu.ve'
                className='IniciarSesion_Input'
                value={formData.correo}
                onChange={handleChange}
                required
                autoComplete='username'
              />
            </div>
          </div>

          <div className='IniciarSesion_Campo'>
            <div className='Input_Container'>
              <FaLock className='Input_Icon' />
              <input 
                type='password' 
                name='clave'
                placeholder='Ingresa tu contraseña'
                className='IniciarSesion_Input'
                value={formData.clave}
                onChange={handleChange}
                required
                autoComplete='current-password'
              />
            </div>
          </div>

          <div className="olvido-contrasena">
            <Link 
              to="/recuperar-contrasena" 
              className="olvido-contrasena-link"
              aria-label="Recuperar contraseña"
            >
              ¿Olvidó su Contraseña?
            </Link>
          </div>

          <button 
            type='submit' 
            className='IniciarSesion_Boton'
            disabled={loading}
            aria-busy={loading}
          >
            <FaSignInAlt className='Boton_Icono' />
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="google-login-wrapper">
            <button 
              type="button" 
              className="google-button" 
              onClick={loginWithGoogle}
              disabled={loading}
              aria-label="Iniciar sesión con Google"
            >
              <img 
                src="/googleicon.png" 
                alt="Logo de Google" 
                className="google-icon" 
                width={20}
                height={20}
              />
              Iniciar sesión con Google
            </button>
          </div>
        </form>
      </div>

      <div className='Home_Separador'></div>
      <div className='Centrar_Footer'>
        <Footer />
      </div>
    </div>
  );
};

export default IniciarSesion;