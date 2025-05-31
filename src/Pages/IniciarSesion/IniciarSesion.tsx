import { useState } from 'react';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./IniciarSesion.css";

const IniciarSesion = () => {
  const [formData, setFormData] = useState({
    correo: '',
    clave: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos de inicio de sesión:", formData);
    // Aquí iría la conexión con Supabase
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
          
          <button type='submit' className='IniciarSesion_Boton'>
            <FaSignInAlt className='Boton_Icono' />
            Iniciar Sesión
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