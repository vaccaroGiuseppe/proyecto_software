import "./Flujogramas.css";
import { FiDownload } from "react-icons/fi";

function Flujogramas() {
  // Lista de carreras con sus respectivos enlaces (ejemplo)
  const carreras = [
    { nombre: "Ingeniería de Sistemas", link: "https://google.com" },
    { nombre: "Ingeniería Civil", link: "https://yahoo.com" },
    { nombre: "Ingeniería de Producción", link: "https://bing.com" },
    { nombre: "Ingeniería Química", link: "https://duckduckgo.com" },
    { nombre: "Derecho", link: "https://wikipedia.org" },
    { nombre: "Ciencias Administrativas (Ambas Menciones)", link: "https://microsoft.com" },
    { nombre: "Psicología", link: "https://apple.com" },
    { nombre: "Comunicación Social y Empresarial", link: "https://amazon.com" },
    { nombre: "Contaduría Pública", link: "https://twitter.com" },
    { nombre: "Economía Empresarial", link: "https://facebook.com" },
    { nombre: "Educación, Mención Educación Inicial", link: "https://instagram.com" },
    { nombre: "Educación, Mención Gerencia", link: "https://linkedin.com" },
    { nombre: "Estudios Liberales", link: "https://reddit.com" },
    { nombre: "Estudios Internacionales, mención Derecho Internacional", link: "https://netflix.com" },
    { nombre: "Estudios Internacionales, mención Economía Internacional", link: "https://youtube.com" },
    { nombre: "Idiomas Modernos", link: "https://github.com" },
    { nombre: "Ingeniería Eléctrica", link: "https://stackoverflow.com" },
    { nombre: "Ingeniería Mecánica", link: "https://medium.com" },
    { nombre: "Idiomas Modernos", link: "https://wordpress.com" },
    { nombre: "Matemáticas Industriales", link: "https://dropbox.com" }
  ];

  return (
    <div className="Flujograma_Contenedor">
      <div className="Contenedor_Titulo">
        <h1 className="Titulo">Flujogramas</h1>
      </div>

      <div className="Carreras_Grid">
        {carreras.map((carrera, index) => (
          <a
            key={index}
            href={carrera.link}
            target="_blank"  // Abre en nueva pestaña
            rel="noopener noreferrer"  // Seguridad para target="_blank"
            className="Carrera_Item"
          >
            <FiDownload className="Icono_Descarga" />
            <span className="Nombre_Carrera">Flujograma {carrera.nombre}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default Flujogramas;