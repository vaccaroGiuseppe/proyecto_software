import { useState } from 'react';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaUserEdit, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import "./Registrar.css";

const Registrar = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    clave: '',
    confirmarClave: '',
    tipoUsuario: 'estudiante'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar contraseñas y enviar datos
    if (formData.clave !== formData.confirmarClave) {
      alert("Las contraseñas no coinciden");
      return;
    }
    console.log("Datos a enviar:", formData);
    // Aquí iría la conexión con Supabase
  };

  return (
    <div className='Registrar_Contenedor'>
      <Navbar />
      <div className='Home_Separador'></div>
      
      <div className='Registrar_Cuerpo'>
        <div className='Registrar_Titulo_Contenedor'>
          <FaUserEdit className='Registrar_Icono_Titulo' />
          <h1 className='Registrar_Titulo'>Registro de Usuario</h1>
        </div>
        
        <form className='Registrar_Formulario' onSubmit={handleSubmit}>
          <div className='Formulario_Grupo'>
            <div className='Registrar_Campo'>
              <label htmlFor='nombre' className='Registrar_Label'>Nombre:</label>
              <input 
                type='text' 
                id='nombre' 
                name='nombre'
                placeholder='Ej: Luis'
                className='Registrar_Input'
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className='Registrar_Campo'>
              <label htmlFor='apellido' className='Registrar_Label'>Apellido:</label>
              <input 
                type='text' 
                id='apellido' 
                name='apellido'
                placeholder='Ej: Pérez'
                className='Registrar_Input'
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className='Registrar_Campo'>
            <label htmlFor='correo' className='Registrar_Label'>Correo electrónico:</label>
            <input 
              type='email' 
              id='correo' 
              name='correo'
              placeholder='correo@unimet.edu.ve'
              className='Registrar_Input'
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className='Formulario_Grupo'>
            <div className='Registrar_Campo'>
              <label htmlFor='clave' className='Registrar_Label'>Contraseña:</label>
              <input 
                type='password' 
                id='clave' 
                name='clave'
                placeholder='Mínimo 8 caracteres'
                className='Registrar_Input'
                value={formData.clave}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>
            
            <div className='Registrar_Campo'>
              <label htmlFor='confirmarClave' className='Registrar_Label'>Confirmar Contraseña:</label>
              <input 
                type='password' 
                id='confirmarClave' 
                name='confirmarClave'
                placeholder='Repite tu contraseña'
                className='Registrar_Input'
                value={formData.confirmarClave}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>
          </div>
          
          <div className='Registrar_Campo'>
            <label htmlFor='tipoUsuario' className='Registrar_Label'>Registrarme como:</label>
            <div className='Select_Container'>
              <select 
                id='tipoUsuario' 
                name='tipoUsuario'
                className='Registrar_Select'
                value={formData.tipoUsuario}
                onChange={handleChange}
                required
              >
                <option value='estudiante'>Estudiante</option>
                <option value='profesor'>Profesor</option>
              </select>
              {formData.tipoUsuario === 'estudiante' ? (
                <FaUserGraduate className='Select_Icon' />
              ) : (
                <FaChalkboardTeacher className='Select_Icon' />
              )}
            </div>
          </div>
          
          <button type='submit' className='Registrar_Boton_Principal'>
            Confirmar Registro
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

export default Registrar;