import { FaUserGraduate, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './DashboardProfesor.css';

function DashboardProfesor() {
  const navigate = useNavigate();

  return (
    <div className="todoesto">
      <div className="dashboard-admin-container">
        <h1 className="dashboard-title">Panel de Profesor</h1>
        
        <div className="dashboard-grid">
          <div 
            className="dashboard-card"
            onClick={() => navigate('/asignar-preparador')}
          >
            <div className="card-icon">
              <FaUserGraduate size={60} />
            </div>
            <h2 className="card-title">Preparadores</h2>
            <p className="card-description">Asignar estudiante como preparador de mi sección</p>
          </div>
          <div 
            className="dashboard-card"
            onClick={() => navigate('/publicar-cronograma')}
          >
            <div className="card-icon">
              <FaCalendarAlt size={60} />
            </div>
            <h2 className="card-title">Gestión de Cronogramas</h2>
            <p className="card-description">Publicar y editar calendarios académicos</p>
          </div>
          <div 
            className="dashboard-card"
            onClick={() => navigate('/gestion-consultas')}
          >
            <div className="card-icon">
              <FaClock size={60} />
            </div>
            <h2 className="card-title">Horarios de Consulta</h2>
            <p className="card-description">Gestiona tus horarios de consulta</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardProfesor;