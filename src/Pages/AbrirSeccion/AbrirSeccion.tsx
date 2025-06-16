import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaBook, FaClock, FaSave, FaSpinner, FaChalkboardTeacher } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "./AbrirSeccion.css";

type Seccion = {
  id_horario: string; // Nuevo campo para guardar el ID del horario
  cedula_profesor: string;
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
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [horariosClase, setHorariosClase] = useState<HorarioClase[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingProfesores, setLoadingProfesores] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(true);
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

  const handleNumeroSeccionesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setNumeroSecciones(value);
      
      const num = value === '' ? 0 : parseInt(value);
      if (num >= 0 && num <= 15) {
        setSecciones(Array(num).fill({ id_horario: '', cedula_profesor: '' }).map((_, i) => 
          secciones[i] || { id_horario: '', cedula_profesor: '' }
        ));
      }
    }
  };

  const handleSeccionChange = (index: number, field: keyof Seccion, value: string) => {
    const newSecciones = [...secciones];
    newSecciones[index] = { ...newSecciones[index], [field]: value };
    setSecciones(newSecciones);
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
        if (!secciones[i].cedula_profesor) {
          throw new Error(`Debes seleccionar un profesor para la sección ${i + 1}`);
        }
      }

      // Insertar secciones con sus respectivos profesores y horarios
      const seccionesToInsert = secciones.map(seccion => {
        const horarioSeleccionado = horariosClase.find(h => h.id_horario_clase === seccion.id_horario);
        
        return {
          codigo_materia: codigoMateria,
          id_horario_clase: seccion.id_horario,
          cedula_profesor: seccion.cedula_profesor,
          // Incluimos los datos del horario por si los necesitas en otras consultas
          dia_semana: horarioSeleccionado?.dia_semana,
          hora_inicio: horarioSeleccionado?.hora_inicio,
          hora_fin: horarioSeleccionado?.hora_fin,
          modalidad: horarioSeleccionado?.modalidad,
        };
      });

      const { error: seccionesError } = await supabase
        .from('secciones')
        .insert(seccionesToInsert);

      if (seccionesError) throw seccionesError;

      setSuccess('Secciones creadas exitosamente!');
      setTimeout(() => {
        navigate('/materias');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear las secciones');
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

              <div className="form-group">
                <label htmlFor="numeroSecciones" className="form-label">
                  Número de Secciones:
                </label>
                <input
                  type="text"
                  id="numeroSecciones"
                  value={numeroSecciones}
                  onChange={handleNumeroSeccionesChange}
                  className="form-input"
                  placeholder="Ej: 2"
                  inputMode="numeric"
                />
              </div>

              {loadingProfesores || loadingHorarios ? (
                <div className="loading-profesores">
                  <FaSpinner className="spinner" /> Cargando datos...
                </div>
              ) : (
                secciones.map((seccion, index) => (
                  <div key={index} className="seccion-group">
                    <h3 className="seccion-title">Sección {index + 1}</h3>
                    
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
                            {horario.dia_semana} - {formatHora(horario.hora_inicio)} a {formatHora(horario.hora_fin)}, ({horario.modalidad})
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
                        value={seccion.cedula_profesor}
                        onChange={(e) => handleSeccionChange(index, 'cedula_profesor', e.target.value)}
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
                disabled={isSubmitting || secciones.length === 0 || loadingProfesores || loadingMaterias || loadingHorarios}
              >
                {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />}
                {isSubmitting ? ' Creando...' : ' Crear Secciones'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}