import Carrusel_Inicio from '../../Components/Carrusel_Inicio/Carusel_Inicio';
import Navbar from "../../Components/Navbar/Navbar";
import Flujogramas from "../../Components/Flujogramas/Flujogramas"
import "./Home.css"

// Importa las imágenes correctamente
import Imagen1 from "../../Images/Carrusel_Inicio/mobile1.png";
import Imagen2 from "../../Images/Carrusel_Inicio/mobile2.png";
import Imagen3 from "../../Images/Carrusel_Inicio/mobile3.png";




const Home = () => {
  // En tu archivo Home.tsx o donde tengas el carrusel

  const imagenesCarrusel = [
    Imagen1,
    Imagen2,
    Imagen3
  ];

  return (
    <div className='Home_Contenedor'>
      <Navbar />
      <div className='Home_Separador'></div>
      <Carrusel_Inicio imagenes={imagenesCarrusel} />
      <div className='Home_Separador'></div>
      <Flujogramas />


    </div>
    
  );
};

export default Home;