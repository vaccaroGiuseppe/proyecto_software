import { FaDoorOpen } from 'react-icons/fa'; // PENDIENTE POR CAMBIAR SON LOS ÍCONOS
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
            onClick={() => navigate('/ver-materias')}
          >
            <div className="card-icon">
              <FaDoorOpen size={60} />
            </div>
            <h2 className="card-title">Materias</h2>
            <p className="card-description">Visualizar las materias que imparte este trimestre</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardProfesor;
