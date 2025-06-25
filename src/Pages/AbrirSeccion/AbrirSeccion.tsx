import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaBook, FaClock, FaSave, FaSpinner, FaChalkboardTeacher, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "./AbrirSeccion.css";

type Seccion = {
  id_seccion?: string; // Nuevo campo para identificar secciones existentes
  id_horario: string;
  id_profesor: string;
  isExisting?: boolean; // Para identificar si es una sección existente
};

type Profesor = {
  id_usuario: string;
  nombre: string;
  apellido: string;
};

type Materia = {
  codigo_materia: string;
  nombre: string;
};

type HorarioClase = {
  id_horario_clase: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
};

export default function AbrirSeccion() {
  const [codigoMateria, setCodigoMateria] = useState('');
  const [numeroSecciones, setNumeroSecciones] = useState('');
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [existingSecciones, setExistingSecciones] = useState<Seccion[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [horariosClase, setHorariosClase] = useState<HorarioClase[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingProfesores, setLoadingProfesores] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(true);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const navigate = useNavigate();

  // Cargar profesores, materias y horarios al iniciar
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // Cargar profesores
        const { data: profesoresData, error: profesoresError } = await supabase
          .from('usuario')
          .select('id_usuario, nombre, apellido')
          .eq('tipo', 'profesor')
          .order('nombre', { ascending: true });

        if (profesoresError) throw profesoresError;
        setProfesores(profesoresData || []);

        // Cargar materias
        const { data: materiasData, error: materiasError } = await supabase
          .from('materia')
          .select('codigo_materia, nombre')
          .order('nombre', { ascending: true });

        if (materiasError) throw materiasError;
        setMaterias(materiasData || []);

        // Cargar horarios de clase
        const { data: horariosData, error: horariosError } = await supabase
          .from('horario_clase')
          .select('id_horario_clase, dia_semana, hora_inicio, hora_fin, modalidad')
          .order('dia_semana', { ascending: true })
          .order('hora_inicio', { ascending: true });

        if (horariosError) throw horariosError;
        setHorariosClase(horariosData || []);

      } catch (err) {
        setError('Error al cargar los datos iniciales');
        console.error('Error al cargar datos iniciales:', err);
      } finally {
        setLoadingProfesores(false);
        setLoadingMaterias(false);
        setLoadingHorarios(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // Cargar secciones existentes cuando se selecciona una materia
  useEffect(() => {
    if (!codigoMateria) return;

    const cargarSeccionesExistentes = async () => {
      setLoadingExisting(true);
      try {
        const { data: seccionesData, error } = await supabase
          .from('seccion')
          .select('id_seccion, id_horario, id_profesor')
          .eq('codigo_materia', codigoMateria);

        if (error) throw error;

        const seccionesConFlag = seccionesData?.map(seccion => ({
          ...seccion,
          isExisting: true
        })) || [];

        setExistingSecciones(seccionesConFlag);
        
        // Si hay secciones existentes, actualizamos el número de secciones
        if (seccionesConFlag.length > 0) {
          setNumeroSecciones(seccionesConFlag.length.toString());
        }
      } catch (err) {
        setError('Error al cargar secciones existentes');
        console.error('Error al cargar secciones existentes:', err);
      } finally {
        setLoadingExisting(false);
      }
    };

    cargarSeccionesExistentes();
  }, [codigoMateria]);

  const handleNumeroSeccionesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setNumeroSecciones(value);
      
      const num = value === '' ? 0 : parseInt(value);
      if (num >= 0 && num <= 15) {
        // Mantenemos las secciones existentes y agregamos nuevas si es necesario
        const totalSecciones = [...existingSecciones];
        
        // Agregamos nuevas secciones si el número es mayor que las existentes
        if (num > existingSecciones.length) {
          const nuevasSecciones = Array(num - existingSecciones.length)
            .fill({ id_horario: '', id_profesor: '' })
            .map((_, i) => secciones[existingSecciones.length + i] || { id_horario: '', id_profesor: '' });
          
          totalSecciones.push(...nuevasSecciones);
        }
        
        // Si el número es menor, solo mantenemos las primeras 'num' secciones
        setSecciones(totalSecciones.slice(0, num));
      }
    }
  };

  const handleSeccionChange = (index: number, field: keyof Seccion, value: string) => {
    const newSecciones = [...secciones];
    newSecciones[index] = { ...newSecciones[index], [field]: value };
    setSecciones(newSecciones);
  };

  const handleDeleteSeccion = async (idSeccion: string, index: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta sección?')) return;

    try {
      const { error } = await supabase
        .from('seccion')
        .delete()
        .eq('id_seccion', idSeccion);

      if (error) throw error;

      // Eliminar la sección del estado
      const newSecciones = [...secciones];
      newSecciones.splice(index, 1);
      setSecciones(newSecciones);
      setExistingSecciones(existingSecciones.filter(s => s.id_seccion !== idSeccion));
      setNumeroSecciones((parseInt(numeroSecciones) - 1).toString());
      setSuccess('Sección eliminada correctamente');
    } catch (err) {
      setError('Error al eliminar la sección');
      console.error('Error al eliminar sección:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validar campos
      if (!codigoMateria.trim()) {
        throw new Error('Debes seleccionar una materia');
      }

      if (!numeroSecciones || parseInt(numeroSecciones) <= 0) {
        throw new Error('Debes ingresar un número válido de secciones');
      }

      for (let i = 0; i < secciones.length; i++) {
        if (!secciones[i].id_horario) {
          throw new Error(`Debes seleccionar un horario para la sección ${i + 1}`);
        }
        if (!secciones[i].id_profesor) {
          throw new Error(`Debes seleccionar un profesor para la sección ${i + 1}`);
        }
      }

      // Separar secciones existentes y nuevas
      const seccionesParaActualizar = secciones.filter(s => s.isExisting);
      const seccionesParaInsertar = secciones.filter(s => !s.isExisting);

      // Actualizar secciones existentes
      const updates = seccionesParaActualizar.map(async seccion => {
        const { error } = await supabase
          .from('seccion')
          .update({
            id_horario: seccion.id_horario,
            id_profesor: seccion.id_profesor
          })
          .eq('id_seccion', seccion.id_seccion);

        if (error) throw error;
      });

      await Promise.all(updates);

      // Insertar nuevas secciones
      if (seccionesParaInsertar.length > 0) {
        const { error: insertError } = await supabase
          .from('seccion')
          .insert(seccionesParaInsertar.map(seccion => ({
            codigo_materia: codigoMateria,
            id_horario: seccion.id_horario,
            id_profesor: seccion.id_profesor
          })));

        if (insertError) throw insertError;
      }

      setSuccess('Secciones guardadas exitosamente!');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar las secciones');
      console.error('Error detallado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para formatear la hora
  const formatHora = (hora: string) => {
    return new Date(`1970-01-01T${hora}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="crear-materia-page">
      <Navbar />
      
      <div className="crear-materia-container">
        <div className="header-section">
          <h1 className="main-title">Apertura de Secciones</h1>
          <p className="subtitle">Organiza el aprendizaje de tus estudiantes</p>
        </div>

        <div className="form-container">
          <div className="crear-materia-card">
            {error && (
              <div className="alert-message error-message">
                Error: {error}
              </div>
            )}

            {success && (
              <div className="alert-message success-message">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="crear-materia-form">
              <div className="form-group">
                <label htmlFor="codigoMateria" className="form-label">
                  <FaBook /> Seleccionar Materia:
                </label>
                {loadingMaterias ? (
                  <div className="loading-profesores">
                    <FaSpinner className="spinner" /> Cargando materias...
                  </div>
                ) : (
                  <select
                    id="codigoMateria"
                    value={codigoMateria}
                    onChange={(e) => setCodigoMateria(e.target.value)}
                    className="form-select"
                    disabled={loadingMaterias}
                  >
                    <option value="">Seleccione una materia...</option>
                    {materias.map((materia) => (
                      <option key={materia.codigo_materia} value={materia.codigo_materia}>
                        {materia.nombre} ({materia.codigo_materia})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {codigoMateria && loadingExisting && (
                <div className="loading-profesores">
                  <FaSpinner className="spinner" /> Cargando secciones existentes...
                </div>
              )}

              <div className="form-group">
                <label htmlFor="numeroSecciones" className="form-label">
                  Número Total de Secciones (incluyendo las existentes):
                </label>
                <input
                  type="text"
                  id="numeroSecciones"
                  value={numeroSecciones}
                  onChange={handleNumeroSeccionesChange}
                  className="form-input"
                  placeholder={`Ej: ${existingSecciones.length > 0 ? existingSecciones.length + 1 : '2'}`}
                  inputMode="numeric"
                />
                {existingSecciones.length > 0 && (
                  <p className="info-text">
                    Esta materia ya tiene {existingSecciones.length} sección(es). 
                    Ingresa el número total deseado (actual + nuevas).
                  </p>
                )}
              </div>

              {loadingProfesores || loadingHorarios ? (
                <div className="loading-profesores">
                  <FaSpinner className="spinner" /> Cargando datos...
                </div>
              ) : (
                secciones.map((seccion, index) => (
                  <div key={index} className={`seccion-group ${seccion.isExisting ? 'existing-section' : ''}`}>
                    <div className="seccion-header">
                      <h3 className="seccion-title">
                        Sección {index + 1} 
                        {seccion.isExisting && <span className="existing-badge">Existente</span>}
                      </h3>
                      {seccion.isExisting && (
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteSeccion(seccion.id_seccion!, index)}
                        >
                          <FaTrash /> Eliminar
                        </button>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor={`horario-${index}`} className="form-label">
                        <FaClock /> Horario:
                      </label>
                      <select
                        id={`horario-${index}`}
                        value={seccion.id_horario}
                        onChange={(e) => handleSeccionChange(index, 'id_horario', e.target.value)}
                        className="form-select"
                      >
                        <option value="">Seleccione un horario...</option>
                        {horariosClase.map(horario => (
                          <option key={horario.id_horario_clase} value={horario.id_horario_clase}>
                            {horario.dia_semana} - {formatHora(horario.hora_inicio)} a {formatHora(horario.hora_fin)} ({horario.modalidad})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`profesor-${index}`} className="form-label">
                        <FaChalkboardTeacher /> Profesor:
                      </label>
                      <select
                        id={`profesor-${index}`}
                        value={seccion.id_profesor}
                        onChange={(e) => handleSeccionChange(index, 'id_profesor', e.target.value)}
                        className="form-select"
                      >
                        <option value="">Seleccione un profesor...</option>
                        {profesores.map(profesor => (
                          <option key={profesor.id_usuario} value={profesor.id_usuario}>
                            {profesor.nombre} {profesor.apellido} 
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting || secciones.length === 0 || loadingProfesores || loadingMaterias || loadingHorarios || loadingExisting}
              >
                {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />}
                {isSubmitting ? ' Guardando...' : ' Guardar Secciones'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}