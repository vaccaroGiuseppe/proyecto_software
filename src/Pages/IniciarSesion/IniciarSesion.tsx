import { useState } from 'react';
import { FaSignInAlt, FaEnvelope, FaLock, FaTimes } from 'react-icons/fa';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./IniciarSesion.css";
import { supabase } from '../lib/../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const IniciarSesion = () => {
  const [formData, setFormData] = useState({
    correo: '',
    clave: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar que el correo sea institucional
      if (!formData.correo.endsWith('@unimet.edu.ve') && !formData.correo.endsWith('@correo.unimet.edu.ve')) {
        throw new Error('Debe usar un correo institucional UNIMET');
      }

      // Iniciar sesión con Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.correo,
        password: formData.clave
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Si el inicio de sesión es exitoso, redirigir al home
      navigate('/');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error durante el inicio de sesión');
      console.error('Error detallado:', err);
    } finally {
      setLoading(false);
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
            Error: {error}
            <button onClick={() => setError(null)} className="IniciarSesion_Cerrar_Error">
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
              />
            </div>
          </div>
          
          <button 
            type='submit' 
            className='IniciarSesion_Boton'
            disabled={loading}
          >
            <FaSignInAlt className='Boton_Icono' />
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
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