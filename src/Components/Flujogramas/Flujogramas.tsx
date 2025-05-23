import "./Flujogramas.css";
import { FiDownload } from "react-icons/fi";

function Flujogramas() {
  const carreras = [
    { nombre: "Ingeniería de Sistemas", link: "https://docs.google.com/spreadsheets/d/1aa4OponlNMNCY1-9_A8ACP1EaQJ55eue/edit?usp=sharing&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Ingeniería Civil", link: "https://docs.google.com/spreadsheets/d/1SCMRR0vIbrGgFN6qJgmRKI_d3YuwqmNf/edit?usp=sharing&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Ingeniería de Producción", link: "https://docs.google.com/spreadsheets/d/1o97owsDH0hSvrEj8Zqfh686cMpUCC2j-/edit?usp=share_link&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Ingeniería Química", link: "https://docs.google.com/spreadsheets/d/1o97owsDH0hSvrEj8Zqfh686cMpUCC2j-/edit?usp=share_link&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Derecho", link: "https://wikipedia.org" },
    { nombre: "Ciencias Administrativas (Ambas Menciones)", link: "https://docs.google.com/spreadsheets/d/1FkctKvPGYNRTO5eda298t4xb5WQ7Yts6/edit?usp=share_link&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Psicología", link: "https://apple.com" },
    { nombre: "Comunicación Social y Empresarial", link: "https://amazon.com" },
    { nombre: "Contaduría Pública", link: "https://docs.google.com/spreadsheets/d/1p9r7hYLdzz1Gbr11wLNKyR4bSXFrQNHS/edit?usp=share_link&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Economía Empresarial", link: "https://docs.google.com/spreadsheets/d/1FkctKvPGYNRTO5eda298t4xb5WQ7Yts6/edit?usp=share_link&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Educación, Mención Educación Inicial", link: "https://docs.google.com/spreadsheets/d/1MZFG6wxIzVi3LA_CRuhnrsjJwvDxA0Ja/edit?usp=share_link&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Educación, Mención Gerencia", link: "https://docs.google.com/spreadsheets/d/1415m6pwcI6u5IX5yTNLULfhP-dFejURY/edit?usp=share_link&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Estudios Liberales", link: "https://reddit.com" },
    { nombre: "Estudios Internacionales, mención Derecho Internacional", link: "https://netflix.com" },
    { nombre: "Estudios Internacionales, mención Economía Internacional", link: "https://youtube.com" },
    { nombre: "Idiomas Modernos", link: "https://docs.google.com/spreadsheets/d/1UTrqHfAbiz1n0KqTcisthvdDoin82ndw/edit?usp=share_link&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Ingeniería Eléctrica", link: "https://docs.google.com/spreadsheets/d/14LCIF-rM-NaksU-ZBMJuSD_FNDiZSiu3/edit?usp=sharing&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Ingeniería Mecánica", link: "https://docs.google.com/spreadsheets/d/1VloXKOJuuq-p8TVqHY7z1E8BwMDh2032/edit?usp=sharing&ouid=115070425939654893584&rtpof=true&sd=true" },
    { nombre: "Idiomas Modernos", link: "https://wordpress.com" },
    { nombre: "Matemáticas Industriales", link: "https://docs.google.com/spreadsheets/d/1jHbwynhmpgv9Q6HN0IigQe4elwz-szqd/edit?usp=share_link&ouid=115070425939654893584&rtpof=true&sd=true" }
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
            <span className="Nombre_Carrera">Flujograma {carrera.nombre}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default Flujogramas;