import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { FaSpinner, FaTimes, FaUserEdit, FaCalendarAlt, FaVenusMars } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import "./CompletarPerfil.css";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

export function CompletarPerfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: user?.user_metadata?.full_name?.split(' ')[0] || '',
    apellido: user?.user_metadata?.full_name?.split(' ')[1] || '',
    tipo: user?.email?.endsWith('@unimet.edu.ve') ? 'profesor' : 'estudiante',
    fecha_nacimiento: null as Date | null,
    sexo: ''
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validación de campos requeridos
      if (!formData.nombre || !formData.apellido || !formData.sexo) {
        throw new Error('Por favor completa todos los campos requeridos (*)');
      }

      const { error: upsertError } = await supabase
        .from('usuario')
        .upsert({
          id_usuario: user?.id,
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: user?.email,
          tipo: formData.tipo,
          sexo: formData.sexo,
          fecha_nacimiento: formData.fecha_nacimiento?.toISOString(),
          foto_perfil: user?.user_metadata?.avatar_url || null,
          fecha_creacion: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      navigate('/perfil');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="completar-perfil-page">
      <Navbar />
      
      <div className="completar-perfil-container">
        <div className="form-container">
          <div className="completar-perfil-card">
            <div className="completar-perfil-header">
              {user?.user_metadata?.avatar_url && (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="user-avatar"
                />
              )}
              <h2>Completa tu perfil</h2>
              <p>Por favor verifica o completa la siguiente información</p>
            </div>

            {error && (
              <div className="alert-message error-message">
                {error}
                <button onClick={() => setError(null)} className="close-alert">
                  <FaTimes />
                </button>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">Nombre <span className="required-field">*</span></label>
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido <span className="required-field">*</span></label>
                <input
                  id="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipo">Tipo de usuario</label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  disabled={user?.email?.endsWith('@unimet.edu.ve')} // Auto-detectado
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="profesor">Profesor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fecha_nacimiento">
                  <FaCalendarAlt /> Fecha de nacimiento
                </label>
                <DatePicker
                  selected={formData.fecha_nacimiento}
                  onChange={(date) => setFormData({...formData, fecha_nacimiento: date})}
                  dateFormat="yyyy/MM/dd"
                  placeholderText="Selecciona tu fecha"
                  showYearDropdown
                  maxDate={new Date()}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sexo">
                  <FaVenusMars /> Sexo <span className="required-field">*</span>
                </label>
                <select
                  id="sexo"
                  value={formData.sexo}
                  onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                  required
                >
                  <option value="">Seleccione una opción</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero no decir">Prefiero no decir</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="submit-button"
            >
              {loading ? <FaSpinner className="spinner" /> : 'Guardar y Continuar'}
            </button>
          </div>
        </div>

        <div className="orange-panel">
          <div className="panel-content">
            <FaUserEdit className="hero-icon" />
            <h1 className="hero-title">¡Último Paso!</h1>
            <p className="hero-subtitle">Completa tu perfil para acceder a todas las funciones</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}