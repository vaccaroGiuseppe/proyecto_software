import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaUserEdit } from "react-icons/fa"; //
import "./Registrar.css";

const Registrar = () => {
  return (
    <div className='Registrar_Contenedor'>
      <Navbar />
      <div className='Home_Separador'></div>
      
      <div className='Registrar_Cuerpo'>
        <div className='Registrar_Titulo_Contenedor'>
          <FaUserEdit className='Registrar_Icono_Titulo' />
          <h1 className='Registrar_Titulo'>Registrar Usuario</h1>
        </div>
        
        <div className='Registrar_Formulario'>
          <div className='Registrar_Campo'>
            <label htmlFor='email' className='Registrar_Label'>Ingrese Correo electrónico:</label>
            <input 
              type='email' 
              id='email' 
              placeholder='correo@unimet.com' 
              className='Registrar_Input'
            />
          </div>
          
          <div className='Registrar_Botones'>
            <button className='Registrar_Boton Registrar_Boton_Estudiante'>
              Registrar como Estudiante
            </button>
            <button className='Registrar_Boton Registrar_Boton_Profesor'>
              Registrar como Profesor
            </button>
          </div>
        </div>
      </div>
      
      <div className='Home_Separador'></div>
      <div className='Centrar_Footer'>
        <Footer />  
      </div>
    </div>
  );
};

export default Registrar;