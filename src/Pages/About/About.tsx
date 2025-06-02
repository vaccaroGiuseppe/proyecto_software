import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <Navbar />

      {/* Sección de encabezado con imagen */}
      <header className="about-hero">
        <div className="overlay"></div>
        <div className="hero-content">
          
          <h1 className="hero-title">Plataforma Académica Integrada UNIMET</h1>
          <p className="hero-subtitle">Centralizando la gestión educativa para una experiencia universitaria fluida</p>
        </div>
      </header>

      {/* Sección de Misión y Visión */}
      <main className="about-main">
        <section className="mv-section">
          <div className="mv-card mv-orange">
            <h2>Misión</h2>
            <p>
              Facilitar la organización académica mediante una plataforma unificada que conecte a profesores y estudiantes,
              optimizando la comunicación de horarios, evaluaciones y tutorías, para potenciar el rendimiento educativo con tecnología intuitiva.
            </p>
          </div>
          <div className="mv-card mv-white">
            <h2>Visión</h2>
            <p>
              Ser el ecosistema digital esencial de la comunidad universitaria, donde la gestión de información académica sea accesible,
              colaborativa y en tiempo real, transformando la manera de enseñar y aprender.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
