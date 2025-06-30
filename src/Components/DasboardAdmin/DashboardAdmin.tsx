import { FaChalkboardTeacher, FaBook, FaDoorOpen, FaSyncAlt, FaCalendarAlt,FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; // Asegúrate de que la ruta sea correcta
import './DashboardAdmin.css';
import { useState } from 'react';

function DashboardAdmin() {
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetSections = async () => {
    if (!window.confirm('¿Estás seguro que deseas vaciar todas las secciones? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsResetting(true);
    try {
      // Solución 2: Llamar a una función RPC
      const { error } = await supabase
        .rpc('truncate_seccion');

      if (error) throw error;

      alert('✅ Todas las secciones han sido reiniciadas correctamente');
    } catch (error) {
      console.error('Error al reiniciar secciones:', error);
      alert('❌ Ocurrió un error al reiniciar las secciones');
    } finally {
      setIsResetting(false);
    }
  };

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

          <div 
            className={`dashboard-card ${isResetting ? 'disabled-card' : ''}`}
            onClick={!isResetting ? handleResetSections : undefined}
            aria-disabled={isResetting}
          >
            <div className="card-icon">
              <FaSyncAlt size={60} className={isResetting ? 'spin-animation' : ''} />
            </div>
            <h2 className="card-title">
              {isResetting ? 'Reiniciando...' : 'Reiniciar Secciones'}
            </h2>
            <p className="card-description">Vaciar todas las secciones de la base de datos</p>
          </div>
          <div 
            className="dashboard-card"
            onClick={() => navigate('/publicar-cronograma')}
          >
            <div className="card-icon">
              <FaCalendarAlt size={60} />
            </div>
            <h2 className="card-title">Publicar Cronogramas</h2>
            <p className="card-description">Gestionar y publicar calendarios académicos</p>
          </div>
          <div 
            className="dashboard-card"
            onClick={() => navigate('/buscar-seccion')}
          >
            <div className="card-icon">
              <FaSearch size={60} />
            </div>
            <h2 className="card-title">Buscar Secciones</h2>
            <p className="card-description">Buscar y visualizar información de secciones</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;