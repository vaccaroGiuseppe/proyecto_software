import { useEffect, useState } from 'react';
import Carrusel_Inicio from '../../Components/Carrusel_Inicio/Carusel_Inicio';
import Navbar from "../../Components/Navbar/Navbar";
import Flujogramas from "../../Components/Flujogramas/Flujogramas";
import DashboardAdmin from "../../Components/DasboardAdmin/DashboardAdmin";
import "./Home.css";
import Footer from "../../Components/Footer/Footer";
import { supabase } from '../lib/../../supabaseClient';

// Importa las imágenes correctamente
import Imagen1 from "../../Images/Carrusel_Inicio/Carrusel_Inicio_1.png";
import Imagen2 from "../../Images/Carrusel_Inicio/Carrusel_Inicio_2.png";
import Imagen3 from "../../Images/Carrusel_Inicio/Carrusel_Inicio_3.png";

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  //const [loading, setLoading] = useState(true);
  const imagenesCarrusel = [Imagen1, Imagen2, Imagen3];

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Verificar sesión
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Obtener tipo de usuario
          const { data: userData, error } = await supabase
            .from('usuario')
            .select('tipo')
            .eq('id_usuario', session.user.id)
            .single();

          if (!error && userData && userData.tipo === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Error al verificar estado de admin:', error);
      } finally {
        //setLoading(false);
      }
    };

    checkAdminStatus();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session) {
        const { data: userData } = await supabase
          .from('usuario')
          .select('tipo')
          .eq('id_usuario', session.user.id)
          .single();
        
        setIsAdmin(userData?.tipo === 'admin');
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  /*if (loading) {
    return (
      <div className='Home_Contenedor'>
        <Navbar />
        <div className="loading-container">
          <p>Cargando...</p>
        </div>
        <Footer />
      </div>
    );
  }*/

  return (
    <div className='Home_Contenedor'>
      <Navbar />
      <Carrusel_Inicio imagenes={imagenesCarrusel} />
      
      {/* Mostrar DashboardAdmin solo si es admin */}
      {isAdmin && <DashboardAdmin />}
      
      <Flujogramas />
      <div className='Centrar_Footer'>
        <Footer />  
      </div>
    </div>
  );
};

export default Home;