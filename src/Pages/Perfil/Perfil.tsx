import { useState, useEffect } from 'react';
import { supabase } from '../lib/../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaUser, FaEnvelope, FaUserTie, FaUserGraduate, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import "./Perfil.css";
import { useNavigate } from 'react-router-dom';

type UserProfileData = {
  nombre: string;
  apellido: string;
  correo: string;
  tipo: string;
  foto_perfil: string | null;
  fecha_creacion: string;
};

export default function Perfil() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [tempNombre, setTempNombre] = useState('');
  const [tempApellido, setTempApellido] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Obtener la sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error(sessionError?.message || 'No hay sesión activa');
        }

        // 2. Obtener datos del usuario desde la tabla 'usuario'
        const { data: userProfile, error: profileError } = await supabase
          .from('usuario')
          .select('nombre, apellido, correo, tipo, foto_perfil, fecha_creacion')
          .eq('id_usuario', session.user.id)
          .single();

        if (profileError) throw profileError;

        // 3. Actualizar el estado con los datos
        setUserData({
          nombre: userProfile.nombre,
          apellido: userProfile.apellido,
          correo: userProfile.correo,
          tipo: userProfile.tipo,
          foto_perfil: userProfile.foto_perfil,
          fecha_creacion: userProfile.fecha_creacion
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos del perfil');
        console.error('Error detallado:', err);
        navigate('/iniciarsesion');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const startEditingName = () => {
    if (userData) {
      setTempNombre(userData.nombre);
      setTempApellido(userData.apellido);
      setEditingName(true);
    }
  };

  const cancelEditingName = () => {
    setEditingName(false);
  };

  const saveNameChanges = async () => {
    if (!userData) return;

    setIsUpdating(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'No hay sesión activa');
      }

      const { error: updateError } = await supabase
        .from('usuario')
        .update({ 
          nombre: tempNombre,
          apellido: tempApellido
        })
        .eq('id_usuario', session.user.id);

      if (updateError) throw updateError;

      // Actualizar el estado local
      setUserData({
        ...userData,
        nombre: tempNombre,
        apellido: tempApellido
      });

      setEditingName(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el nombre');
      console.error('Error detallado:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="perfil-page">
        <Navbar />
        <div className="perfil-loading">
          <p>Cargando perfil...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="perfil-page">
        <Navbar />
        <div className="perfil-error">
          <p>No se pudieron cargar los datos del perfil</p>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(userData.fecha_creacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="perfil-page">
      <Navbar />
      
      <div className="perfil-container">
        <div className="form-container">
          <div className="perfil-card">
            <h1 className="perfil-title">Mi Perfil</h1>
            
            {error && (
              <div className="alert-message error-message">
                Error: {error}
              </div>
            )}

            <div className="perfil-content">
              <div className="perfil-avatar-container">
                {userData.foto_perfil ? (
                  <img 
                    src={userData.foto_perfil} 
                    alt="Foto de perfil" 
                    className="perfil-avatar"
                  />
                ) : (
                  <div className="perfil-avatar-placeholder">
                    <FaUser />
                  </div>
                )}
              </div>

              <div className="perfil-details">
                <div className="perfil-detail">
                  <span className="detail-label">Nombre completo:</span>
                  {editingName ? (
                    <div className="edit-field">
                      <div className="name-edit-fields">
                        <input
                          type="text"
                          value={tempNombre}
                          onChange={(e) => setTempNombre(e.target.value)}
                          className="edit-input"
                          placeholder="Nombre"
                        />
                        <input
                          type="text"
                          value={tempApellido}
                          onChange={(e) => setTempApellido(e.target.value)}
                          className="edit-input"
                          placeholder="Apellido"
                        />
                      </div>
                      <div className="edit-buttons">
                        <button 
                          onClick={saveNameChanges} 
                          className="save-button"
                          disabled={isUpdating}
                        >
                          <FaSave />
                        </button>
                        <button 
                          onClick={cancelEditingName} 
                          className="cancel-button"
                          disabled={isUpdating}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="detail-value">
                      {userData.nombre} {userData.apellido}
                      <button 
                        className="edit-button"
                        onClick={startEditingName}
                      >
                        <FaEdit />
                      </button>
                    </span>
                  )}
                </div>

                <div className="perfil-detail">
                  <span className="detail-label">
                    <FaEnvelope /> Correo:
                  </span>
                  <span className="detail-value">
                    {userData.correo}
                  </span>
                </div>

                <div className="perfil-detail">
                  <span className="detail-label">
                    {userData.tipo === 'profesor' ? <FaUserTie /> : <FaUserGraduate />} Tipo de usuario:
                  </span>
                  <span className="detail-value">
                    {userData.tipo === 'profesor' ? 'Profesor' : 'Estudiante'}
                  </span>
                </div>

                <div className="perfil-detail">
                  <span className="detail-label">Miembro desde:</span>
                  <span className="detail-value">{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="orange-panel">
          <div className="panel-content">
            <FaUser className="hero-icon" />
            <h1 className="hero-title">Mi Perfil</h1>
            <p className="hero-subtitle">Administra tu información personal</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}