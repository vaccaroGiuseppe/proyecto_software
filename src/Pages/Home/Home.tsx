import Carousel_Inicio from '../../Components/Carrusel_Inicio/Carusel_Inicio';
import Navbar from "../../Components/Navbar/Navbar";

// Importa las imágenes correctamente
import Imagen1 from '../../Images/Imagen_Prueba1.jpg';
import Imagen2 from '../../Images/Imagen_Prueba2.jpg';
import Imagen3 from '../../Images/Imagen_Prueba3.jpg';

const Home = () => {
  const imagenesCarousel = [
    Imagen1,
    Imagen2,
    Imagen3
  ];

  return (
    <div>
      <Navbar />
      <Carousel_Inicio imagenes={imagenesCarousel} />
      
    </div>
  );
};

export default Home;