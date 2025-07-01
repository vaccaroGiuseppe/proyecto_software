import "./Flujogramas.css";
import { FiDownload } from "react-icons/fi";

function Flujogramas() {
  const carreras = [

    { nombre: "Ingeniería de Sistemas", link: "https://docs.google.com/spreadsheets/d/1jtChQr9PEohHx2xOho3jYIXM9v6lhym5/edit?gid=1837161719#gid=1837161719" },
    { nombre: "Ingeniería Civil", link: "https://docs.google.com/spreadsheets/d/19zxMNyodRBsM-Gbeu53TthvSAiZS69Fz/edit?gid=1837161719#gid=1837161719" },
    { nombre: "Ingeniería de Producción", link: "https://docs.google.com/spreadsheets/d/16dHzcqRQ4CMdAIPHCUcejIdjSxNUU5oT/edit?gid=1837161719#gid=1837161719" },
    { nombre: "Ingeniería Química", link: "https://www.unimet.edu.ve/wp-content/uploads/2025/04/Flujograma-Ingenieria-Quimica-2025.pdf" },
    { nombre: "Derecho", link: "https://www.unimet.edu.ve/wp-content/uploads/2025/04/Flujograma-DERECHO-2025.pdf" },
    { nombre: "Ciencias Administrativas", link: "https://www.unimet.edu.ve/wp-content/uploads/2025/04/Flujograma-Ciencias-Administrativas-2025.pdf" },
    { nombre: "Psicología", link: "https://www.unimet.edu.ve/wp-content/uploads/2025/03/Flujograma-Psicologia-2025.pdf" },
    { nombre: "Comunicación Social y Empresarial", link: "https://www.unimet.edu.ve/wp-content/uploads/2025/03/Flujograma-Comunicacion-Social-y-Empresarial-2025.pdf" },
    { nombre: "Contaduría Pública", link: "https://docs.google.com/spreadsheets/d/1-N7VZjOln6Je5YysaiQ2Z3z_kW3y7iD3/edit?gid=1837161719#gid=1837161719" },
    { nombre: "Economía Empresarial", link: "https://docs.google.com/spreadsheets/d/1dLkpP7c9yWLkw_vIiYLXAjsUtCUCqFSo/edit?gid=1837161719#gid=1837161719" },
    { nombre: "Educación, Mención Educación Inicial", link: "https://www.unimet.edu.ve/wp-content/uploads/2025/03/Flujograma-Educacion-Inicial-2025.pdf" },
    { nombre: "Educación, Mención Gerencia", link: "https://docs.google.com/spreadsheets/d/1nwr8n6F-Wmlr564c5A8XHk152A20IoXR/edit?gid=1837161719#gid=1837161719" },
    { nombre: "Estudios Liberales", link: "https://www.unimet.edu.ve/wp-content/uploads/2025/04/Flujograma-Estudios-Liberales-2025.pdf" },
    { nombre: "Estudios Internacionales, mención Derecho Internacional", link: "https://www.unimet.edu.ve/wp-content/uploads/2025/04/Flujograma-Estudios-Internacionales-Mencion-Derecho-Internacional-2025.pdf" },
    { nombre: "Estudios Internacionales, mención Economía Internacional", link: "https://www.unimet.edu.ve/wp-content/uploads/2025/04/Flujograma-Estudios-Internacionales-Mencion-Economia-Internacional-2025.pdf" },
    { nombre: "Idiomas Modernos", link: "https://docs.google.com/spreadsheets/d/1WvID02xks1U2us_9Ghh-qzAak0WURaeN/edit?gid=1837161719#gid=1837161719" },
    { nombre: "Ingeniería Eléctrica", link: "https://docs.google.com/spreadsheets/d/1WqzmnfpqhR3KJkCpd5PNlvC4KXnZUwPN/edit?gid=1837161719#gid=1837161719" },
    { nombre: "Ingeniería Mecánica", link: "https://docs.google.com/spreadsheets/d/14XaleeUuAZCH_zbniQrUmGZuPGQeQO3N/edit?gid=1837161719#gid=1837161719" },
    { nombre: "Educación, Mención Educación Integral", link: "https://docs.google.com/spreadsheets/d/1taNS7aX2_P5BKN-PtwaaAVrl5Lrq6bdC/edit?gid=1837161719#gid=1837161719" },
    { nombre: "Matemáticas Industriales", link: "https://docs.google.com/spreadsheets/d/1qxJJ-WIAPyD7ppHtP-rosPqw6R_DgRaV/edit?gid=1837161719#gid=1837161719" }
  ];

  return (
    <div className="Flujograma_Contenedor">
      <div className="Contenedor_Titulo">
        <h1 className="Titulo">Flujogramas Interactivos</h1>
      </div>

      <div className="Carreras_Grid">
        {carreras.map((carrera, index) => (
          <a
            key={index}
            href={carrera.link}
            target="_blank" 
            rel="noopener noreferrer"
            className="Carrera_Item"
          >
            <FiDownload className="Icono_Descarga" />
            <span className="Nombre_Carrera">{carrera.nombre}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default Flujogramas;