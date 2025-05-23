 
import "./Flujogramas.css";
import { FiDownload } from "react-icons/fi"; // Importar icono de descarga

function Flujogramas() {
  // Lista de carreras (ejemplo con 20 carreras)
  const carreras = [
    "Ingeniería de Sistemas",
    "Ingeniería Civil",
    "Ingeniería de Producción",
    "Ingeniería Química",
    "Derecho",
    "Ciencias Administrativas (Ambas Menciones)",
    "Psicología",
    "Comunicación Social y Empresarial",
    "Contaduría Pública",
    "Economía Empresarial",
    "Educación, Mención Educación Inicial",
    "Educación, Mención Gerencia",
    "Estudios Liberales",
    "Estudios Internacionales, mención Derecho Internacional",
    "Estudios Internacionales, mención Economía Internacional",
    "Idiomas Modernos",
    "Ingeniería Eléctrica",
    "Ingeniería Mecánica",
    "Idiomas Modernos",
    "Matemáticas Industriales"
  ];

  return (
    <div className="Flujograma_Contenedor">
      <div className="Contenedor_Titulo">
        <h1 className="Titulo">Flujogramas</h1>
      </div>

      <div className="Carreras_Grid">
        {carreras.map((carrera, index) => (
          <div key={index} className="Carrera_Item">
            <FiDownload className="Icono_Descarga" />
            <span className="Nombre_Carrera">Flujograma {carrera}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Flujogramas;