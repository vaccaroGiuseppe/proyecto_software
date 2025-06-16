import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaUser, FaEnvelope, FaUserTie, FaUserGraduate, FaEdit, FaSave, FaTimes, FaCamera, FaSpinner } from 'react-icons/fa';
import "./Perfil.css";
import { useNavigate } from 'react-router-dom';

type UserProfileData = {
  id_usuario?: string;
  nombre: string;
  apellido: string;
  correo: string;
  tipo: string;
  foto_perfil: string | null;
  fecha_creacion: string;
  fecha_nacimiento?: string;
  sexo?: string;
};

export default function Perfil() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [tempNombre, setTempNombre] = useState('');
  const [tempApellido, setTempApellido] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrCreateProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Obtener sesión activa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          navigate('/iniciarsesion');
          return;
        }

        // 2. Verificar si existe en la tabla 'usuario'
        const { data: existingProfile, error: fetchError } = await supabase
          .from('usuario')
          .select('*')
          .eq('id_usuario', session.user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        // 3. Si NO existe, crear perfil automáticamente
        if (!existingProfile) {
          // Extraer datos de Google Auth si están disponibles
          const fullName = session.user.user_metadata?.full_name || 'Usuario';
          const [nombre, apellido = ''] = fullName.split(' ');
          
          const profileData = {
            id_usuario: session.user.id,
            nombre: nombre || 'Usuario',
            apellido,
            correo: session.user.email || '',
            tipo: session.user.email?.endsWith('@unimet.edu.ve') ? 'profesor' : 'estudiante',
            foto_perfil: session.user.user_metadata?.avatar_url || null,
            fecha_creacion: new Date().toISOString(),
            sexo: 'prefiero no decir'
          };

          const { error: upsertError } = await supabase
            .from('usuario')
            .upsert(profileData);

          if (upsertError) throw upsertError;
          
          // Actualizar estado local con los nuevos datos
          setUserData(profileData);
        } else {
          // Si ya existe, mostrar los datos
          setUserData(existingProfile);
        }

      } catch (err) {
        setError("Error al cargar el perfil");
        console.error("Error detallado:", err);
        navigate('/iniciarsesion');
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateProfile();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/iniciarsesion');
      }
      if (event === 'SIGNED_IN') {
        fetchOrCreateProfile(); // Recargar al iniciar sesión
      }
    });

    return () => subscription.unsubscribe();
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
    setError(null);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'No hay sesión activa');
      }

      // Validar campos
      if (!tempNombre.trim()) {
        throw new Error('El nombre no puede estar vacío');
      }

      const { error: updateError } = await supabase
        .from('usuario')
        .update({ 
          nombre: tempNombre.trim(),
          apellido: tempApellido.trim()
        })
        .eq('id_usuario', session.user.id);

      if (updateError) throw updateError;

      // Actualizar el estado local
      setUserData({
        ...userData,
        nombre: tempNombre.trim(),
        apellido: tempApellido.trim()
      });

      setEditingName(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el nombre');
      console.error('Error detallado:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !userData) {
      return;
    }

    const file = e.target.files[0];
    
    // Validaciones de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('La imagen no puede superar los 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'No hay sesión activa');
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Subir la imagen al bucket de Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Obtener la URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Actualizar la referencia de la imagen en la tabla de usuario
      const { error: updateError } = await supabase
        .from('usuario')
        .update({ foto_perfil: publicUrl })
        .eq('id_usuario', session.user.id);

      if (updateError) throw updateError;

      // 4. Actualizar el estado local
      setUserData({
        ...userData,
        foto_perfil: publicUrl
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
      console.error('Error detallado:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="perfil-page">
        <Navbar />
        <div className="perfil-loading">
          <FaSpinner className="spinner" />
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
          {error && <p className="error-detail">{error}</p>}
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
                {error}
                <button onClick={() => setError(null)} className="close-alert">
                  <FaTimes />
                </button>
              </div>
            )}

            <div className="perfil-content">
              <div className="perfil-avatar-container">
                {userData.foto_perfil ? (
                  <>
                    <img 
                      src={userData.foto_perfil} 
                      alt="Foto de perfil" 
                      className="perfil-avatar"
                    />
                    <button 
                      className="change-avatar-button"
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      aria-label="Cambiar foto de perfil"
                    >
                      {isUploading ? <FaSpinner className="spinner" /> : <FaCamera />}
                    </button>
                  </>
                ) : (
                  <div 
                    className="perfil-avatar-placeholder"
                    onClick={triggerFileInput}
                    aria-label="Agregar foto de perfil"
                  >
                    <FaUser />
                    <div className="camera-icon">
                      <FaCamera />
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
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
                          aria-label="Editar nombre"
                        />
                        <input
                          type="text"
                          value={tempApellido}
                          onChange={(e) => setTempApellido(e.target.value)}
                          className="edit-input"
                          placeholder="Apellido"
                          aria-label="Editar apellido"
                        />
                      </div>
                      <div className="edit-buttons">
                        <button 
                          onClick={saveNameChanges} 
                          className="save-button"
                          disabled={isUpdating}
                          aria-label="Guardar cambios"
                        >
                          {isUpdating ? <FaSpinner className="spinner" /> : <FaSave />}
                        </button>
                        <button 
                          onClick={cancelEditingName} 
                          className="cancel-button"
                          disabled={isUpdating}
                          aria-label="Cancelar edición"
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
                        aria-label="Editar nombre"
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

                {/* Sección para campos adicionales (fecha_nacimiento, sexo) */}
                {userData.fecha_nacimiento && (
                  <div className="perfil-detail">
                    <span className="detail-label">Fecha de nacimiento:</span>
                    <span className="detail-value">
                      {new Date(userData.fecha_nacimiento).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}

                {userData.sexo && (
                  <div className="perfil-detail">
                    <span className="detail-label">Sexo:</span>
                    <span className="detail-value">
                      {userData.sexo === 'masculino' ? 'Masculino' : 
                       userData.sexo === 'femenino' ? 'Femenino' : 
                       userData.sexo === 'otro' ? 'Otro' : 'Prefiero no decir'}
                    </span>
                  </div>
                )}
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