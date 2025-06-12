import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaEnvelope, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import "./ConfirmacionCorreo.css";

export default function ConfirmacionCorreo() {
  const navigate = useNavigate();

  // Redirigir al inicio después de 10 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000); // 10 segundos
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="confirmacion-page">
      <Navbar />
      
      <div className="confirmacion-container">
        <div className="confirmacion-card">
          <div className="confirmacion-icon">
            <FaEnvelope className="envelope-icon" />
            <FaCheckCircle className="check-icon" />
          </div>
          
          <h1 className="confirmacion-title">¡Confirma tu correo electrónico!</h1>
          
          <div className="confirmacion-message">
            <p>Hemos enviado un enlace de confirmación a tu correo electrónico.</p>
            <p>Por favor revisa tu bandeja de entrada y haz clic en el enlace para completar tu registro.</p>
          </div>
          
          <div className="tips-container">
            <h3>¿No encuentras el correo?</h3>
            <ul className="tips-list">
              <li>Revisa tu carpeta de spam o correo no deseado</li>
              <li>Verifica que el correo esté correctamente escrito</li>
              <li>Espera unos minutos, puede tardar en llegar</li>
            </ul>
          </div>
          
          <button 
            className="continue-button"
            onClick={() => navigate('/')}
          >
            Continuar al inicio <FaArrowRight className="arrow-icon" />
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}