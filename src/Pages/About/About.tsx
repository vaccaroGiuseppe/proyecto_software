import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer"; // Asegúrate que este existe
import "./About.css";

export default function About() {
  const teamMembers = [
    {
      id: 1,
      name: "Juan Pérez",
      role: "Fundador & CEO",
      bio: "Apasionado por la tecnología y la innovación con más de 10 años de experiencia en el sector.",
      image: "/images/team/juan.jpg"
    },
    // ... otros miembros
  ];

  return (
    <div className="about-page">
      <Navbar />
      
      <main className="about-content">
        {/* ... otras secciones ... */}

        {/* Equipo - versión simplificada sin componente */}
        <section className="team-section">
          <div className="container">
            <h2>Conoce a nuestro equipo</h2>
            <p className="team-description">Un grupo apasionado de profesionales dedicados a hacer la diferencia.</p>
            <div className="team-grid">
              {teamMembers.map(member => (
                <div key={member.id} className="team-member">
                  <div className="member-image">
                    <img src={member.image} alt={member.name} />
                  </div>
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p className="role">{member.role}</p>
                    <p className="bio">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}