import { useEffect, useState } from 'react';
import Carrusel_Inicio from '../../Components/Carrusel_Inicio/Carusel_Inicio';
import Navbar from "../../Components/Navbar/Navbar";
import Flujogramas from "../../Components/Flujogramas/Flujogramas";
import DashboardAdmin from "../../Components/DasboardAdmin/DashboardAdmin";
import DashboardProfesor from "../../Components/DashboardProfesor/DashboardProfesor"; // CREAAAAAR!!!!
//import DashboardEstudiante from "../../Components/DashboardEstudiante/DashboardEstudiante"; // Todavía no se ha creado entonces no se importa por ahora
import "./Home.css";
import Footer from "../../Components/Footer/Footer";
import { supabase } from '../lib/../../supabaseClient';

import Imagen1 from "../../Images/Carrusel_Inicio/Carrusel_Inicio_1.png";
import Imagen2 from "../../Images/Carrusel_Inicio/Carrusel_Inicio_2.png";
import Imagen3 from "../../Images/Carrusel_Inicio/Carrusel_Inicio_3.png";
import BuscadorSecciones from '../../Components/BuscadorSecciones/BuscadorSecciones';
import SeccionesProfesor from '../../Components/SeccionesProfesor/SeccionesProfesor';

const Home = () => {
  const [user, setUser] = useState({
    isAdmin: false,
    isProfesor: false,
    isEstudiante: false,
    isLoading: true
  });
  
  const imagenesCarrusel = [Imagen1, Imagen2, Imagen3];

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // Verificar sesión
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Obtener tipo de usuario en una sola consulta
          const { data: userData, error } = await supabase
            .from('usuario')
            .select('tipo')
            .eq('id_usuario', session.user.id)
            .single();

          if (!error && userData) {
            setUser({
              isAdmin: userData.tipo === 'admin',
              isProfesor: userData.tipo === 'profesor',
              isEstudiante: userData.tipo === 'estudiante',
              isLoading: false
            });
            return;
          }
        }
        
        // Si no hay sesión o hay error
        setUser({
          isAdmin: false,
          isProfesor: false,
          isEstudiante: false,
          isLoading: false
        });
      } catch (error) {
        console.error('Error al verificar rol:', error);
        setUser(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkUserRole();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session) {
        const { data: userData } = await supabase
          .from('usuario')
          .select('tipo')
          .eq('id_usuario', session.user.id)
          .single();
        
        setUser({
          isAdmin: userData?.tipo === 'admin',
          isProfesor: userData?.tipo === 'profesor',
          isEstudiante: userData?.tipo === 'estudiante',
          isLoading: false
        });
      } else {
        setUser({
          isAdmin: false,
          isProfesor: false,
          isEstudiante: false,
          isLoading: false
        });
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <div className='Home_Contenedor'>
      <Navbar />
      <Carrusel_Inicio imagenes={imagenesCarrusel} />
      {user.isEstudiante && <BuscadorSecciones />}      
      {user.isProfesor && <SeccionesProfesor />} 
      {/* DashBoard de usuario dependiendo del tipo */}
      {user.isLoading ? (
        <div className="loading-container">
          <p>Cargando información de usuario...</p>
        </div>
      ) : (
        <>
          {user.isAdmin && <DashboardAdmin />}
          {user.isProfesor && <DashboardProfesor />}
          {/*CUANDO VAYAMOS A UTILIZAR EL OTRO DASHBOARD-----------------------------------------------*/}
          {/*user.isEstudiante && <DashboardEstudiante />*/}
          {/*------------------------------------------------------------------------------------------*/}
        </>
      )}
      
      <Flujogramas />
      <div className='Centrar_Footer'>
        <Footer />  
      </div>
    </div>
  );
};

export default Home;