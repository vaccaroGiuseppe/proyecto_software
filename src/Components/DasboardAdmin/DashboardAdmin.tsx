import { FaChalkboardTeacher, FaBook, FaDoorOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './DashboardAdmin.css';

function DashboardAdmin() {
  const navigate = useNavigate();

  return (
    <div className="todoesto">
      <div className="dashboard-admin-container">
        <h1 className="dashboard-title">Panel de Administración</h1>
        
        <div className="dashboard-grid">
          <div 
            className="dashboard-card"
            onClick={() => navigate('/asignar-salon')}
          >
            <div className="card-icon">
              <FaDoorOpen size={60} />
            </div>
            <h2 className="card-title">Asignar Salones</h2>
            <p className="card-description">Asignar o modificar salones a las secciones</p>
          </div>

          <div 
            className="dashboard-card"
            onClick={() => navigate('/abrir-seccion')}
          >
            <div className="card-icon">
              <FaChalkboardTeacher size={60} />
            </div>
            <h2 className="card-title">Gestionar Secciones</h2>
            <p className="card-description">Abrir, modificar o cerrar secciones</p>
          </div>

          <div 
            className="dashboard-card"
            onClick={() => navigate('/gestionar-materias')}
          >
            <div className="card-icon">
              <FaBook size={60} />
            </div>
            <h2 className="card-title">Gestionar Materias</h2>
            <p className="card-description">Crear, editar o eliminar materias académicas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;