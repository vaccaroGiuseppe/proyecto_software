import React from 'react';
import { useState, useEffect } from 'react'; // Añade useEffect
import './Carrusel_Inicio.css';
import Left_Arrow from '../Arrows/Left_Arrow';
import Right_Arrow from '../Arrows/Right_Arrow';

interface CarouselProps {
  imagenes: string[];
}

const Carrusel_Inicio: React.FC<CarouselProps> = ({ imagenes }) => {
  const [imagenActual, setImagenActual] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true); 
  const tiempoTransicion: number = 5000; //  5 segundos entre transiciones

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  const anteriorImagen = () => {
    setImagenActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  useEffect(() => {
    let intervalo: NodeJS.Timeout;
    if (autoPlay) {
      intervalo = setInterval(() => {
        siguienteImagen();
      }, tiempoTransicion);
    }
    
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [imagenActual, autoPlay]); 
  return (
    <div 
      className="Carrusel_Contenedor"
      onMouseEnter={() => setAutoPlay(false)} // Pausar al pasar el ratón
      onMouseLeave={() => setAutoPlay(true)}  // Reanudar al quitar el ratón
    >
      <div className='Contenedor_Imagenes'>  
        <img
          src={imagenes[imagenActual]} 
          alt={`Imagen ${imagenActual + 1}`}
          className="Carrusel_Imagenes"
        />  
      </div>

      <div className='Boton_Contenedor'>
        <button 
          className="Carrusel_Boton Boton_Izq" 
          onClick={anteriorImagen}
        > 
          <Left_Arrow/>
        </button> 
        <button 
          className="Carrusel_Boton Boton_Der" 
          onClick={siguienteImagen}
        >  
          <Right_Arrow/>
        </button>    
      </div>
    </div>
  );
};

export default Carrusel_Inicio;