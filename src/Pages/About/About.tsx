import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <Navbar />

      <main className="about-content">
        <section className="intro-section">
          <div className="intro-container">
            <img src="/images/logo-unimet.png" alt="Logo UNIMET" className="intro-logo" />
            <h1 className="intro-title">Plataforma Académica Integrada UNIMET</h1>
            <p className="intro-slogan">Centralizando la gestión educativa para una experiencia universitaria fluida</p>
          </div>
        </section>

        <section className="mv-section">
          <div className="mv-container">
            <div className="mv-card">
              <h2 className="mv-heading">Misión</h2>
              <p className="mv-text">
                Facilitar la organización académica mediante una plataforma unificada que conecte a profesores y estudiantes,
                optimizando la comunicación de horarios, evaluaciones y tutorías, para potenciar el rendimiento educativo con tecnología intuitiva.
              </p>
            </div>
            <div className="mv-card">
              <h2 className="mv-heading">Visión</h2>
              <p className="mv-text">
                Ser el ecosistema digital esencial de la comunidad universitaria, donde la gestión de información académica sea accesible,
                colaborativa y en tiempo real, transformando la manera de enseñar y aprender.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
