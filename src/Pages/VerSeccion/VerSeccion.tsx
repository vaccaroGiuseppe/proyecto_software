import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { FaSpinner, FaArrowLeft, FaCalendarAlt, FaChalkboardTeacher, FaClock, FaUniversity, FaUpload, FaUserGraduate } from 'react-icons/fa';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import "./VerSeccion.css";

type SeccionDetalle = {
  id_seccion: string;
  codigo_materia: string;
  nombre_materia: string;
  nombre_profesor: string;
  horario: string;
  modalidad: string;
  salon: string | null;
  dias_semana: string[];
  preparador?: {
    nombre: string;
    apellido: string;
    correo: string;
  } | null;
};

type DiaCronograma = {
  semana: number;
  dia_numero: number;
  actividad: string;
};

export default function VerSeccion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState<SeccionDetalle | null>(null);
  const [cronograma, setCronograma] = useState<DiaCronograma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarCronograma, setMostrarCronograma] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  // Obtener tipo de usuario
  useEffect(() => {
    const getUserType = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('usuario')
            .select('tipo')
            .eq('id_usuario', user.id)
            .single();
          
          if (data) setUserType(data.tipo);
          if (error) console.error('Error al obtener tipo de usuario:', error);
        }
      } catch (err) {
        console.error('Error al obtener tipo de usuario:', err);
      }
    };

    getUserType();
  }, []);

  // Cargar datos de la sección y cronograma
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (!id) throw new Error('No se proporcionó ID de sección');

        // Obtener datos de la sección
        const { data: seccionData, error: seccionError } = await supabase
          .from('seccion')
          .select('id_seccion, codigo_materia, id_profesor, id_horario, salon, id_preparador')
          .eq('id_seccion', id)
          .single();

        if (seccionError) throw seccionError;
        if (!seccionData) throw new Error('Sección no encontrada');

        // Obtener datos relacionados
        const [
          { data: materiaData },
          { data: profesorData },
          { data: horarioData },
          { data: preparadorData }
        ] = await Promise.all([
          supabase
            .from('materia')
            .select('codigo_materia, nombre')
            .eq('codigo_materia', seccionData.codigo_materia)
            .single(),
          supabase
            .from('usuario')
            .select('id_usuario, nombre, apellido')
            .eq('id_usuario', seccionData.id_profesor)
            .single(),
          supabase
            .from('horario_clase')
            .select('id_horario_clase, dia_semana, hora_inicio, hora_fin, modalidad')
            .eq('id_horario_clase', seccionData.id_horario)
            .single(),
          seccionData.id_preparador 
            ? supabase
                .from('usuario')
                .select('nombre, apellido, correo')
                .eq('id_usuario', seccionData.id_preparador)
                .single()
            : { data: null }
        ]);

        // Formatear datos de la sección
        const diasSemana = horarioData?.dia_semana 
          ? horarioData.dia_semana.split(' y ').map((d: string) => d.trim())
          : ['Día 1', 'Día 2'];

        const seccionFormateada: SeccionDetalle = {
          id_seccion: seccionData.id_seccion,
          codigo_materia: seccionData.codigo_materia,
          nombre_materia: materiaData?.nombre || 'Sin nombre',
          nombre_profesor: profesorData 
            ? `${profesorData.nombre} ${profesorData.apellido}` 
            : 'Sin profesor',
          horario: horarioData
            ? `${horarioData.dia_semana} ${horarioData.hora_inicio}-${horarioData.hora_fin}`
            : 'Sin horario',
          modalidad: horarioData?.modalidad || '',
          salon: seccionData.salon,
          dias_semana: diasSemana,
          preparador: preparadorData 
            ? {
                nombre: preparadorData.nombre,
                apellido: preparadorData.apellido,
                correo: preparadorData.correo
              }
            : null
          }

        setSeccion(seccionFormateada);

        // Obtener cronograma si existe
        const { data: cronogramaData, error: cronogramaError } = await supabase
          .from('cronogramas')
          .select('semana, dia_numero, actividad')
          .eq('id_seccion', id)
          .order('semana', { ascending: true })
          .order('dia_numero', { ascending: true });

        if (cronogramaError) console.error('Error al cargar cronograma:', cronogramaError);
        
        setCronograma(cronogramaData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const tieneCronograma = cronograma.length > 0;
  const puedePublicarCronograma = userType === 'profesor' || userType === 'admin';

  return (
    <div className="fullpues">
      <Navbar />

      <div className="ver-seccion-container">
        <div className="header-section">
          <button 
            onClick={() => navigate(-1)} 
            className="back-button"
          >
            <FaArrowLeft /> Volver
          </button>
          
          <h1 className="main-title">Detalle de Sección</h1>
          <p className="subtitle">Información completa y cronograma</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <FaSpinner className="spinner" /> Cargando información...
          </div>
        ) : error ? (
          <div className="error-message">
            Error: {error}
          </div>
        ) : seccion ? (
          <div className="seccion-content">
            <div className="seccion-card">
              <div className="seccion-header">
                <h2>{seccion.id_seccion} - {seccion.nombre_materia}</h2>
              </div>

              <div className="seccion-details">
                <div className="detail-item">
                  <FaChalkboardTeacher className="detail-icon" />
                  <span className="detail-label">Profesor:</span>
                  <span className="detail-value">{seccion.nombre_profesor}</span>
                </div>

                <div className="detail-item">
                  <FaClock className="detail-icon" />
                  <span className="detail-label">Horario:</span>
                  <span className="detail-value">{seccion.horario}</span>
                </div>

                <div className="detail-item">
                  <FaUniversity className="detail-icon" />
                  <span className="detail-label">Modalidad:</span>
                  <span className="detail-value">{seccion.modalidad}</span>
                </div>

                <div className="detail-item">
                  <FaUniversity className="detail-icon" />
                  <span className="detail-label">Salón:</span>
                  <span className="detail-value">{seccion.salon || 'No asignado'}</span>
                </div>

                {/* Nuevo recuadro para el preparador */}
                <div className="detail-item">
                  <FaUserGraduate className="detail-icon" />
                  <span className="detail-label">Preparador:</span>
                  <span className="detail-value">
                    {seccion.preparador 
                      ? `${seccion.preparador.apellido}, ${seccion.preparador.nombre}`
                      : 'No asignado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="cronograma-section">
              <div className="cronograma-header">
                <h3><FaCalendarAlt /> Cronograma de Clases</h3>
                
                {!tieneCronograma ? (
                  puedePublicarCronograma ? (
                    <button 
                      onClick={() => navigate('/publicar-cronograma')}
                      className="publish-button"
                    >
                      <FaUpload /> Publicar Cronograma
                    </button>
                  ) : (
                    <div className="no-permission-message">
                      Solo profesores y administradores pueden publicar cronogramas
                    </div>
                  )
                ) : (
                  <button 
                    onClick={() => setMostrarCronograma(!mostrarCronograma)}
                    className="toggle-button"
                  >
                    {mostrarCronograma ? 'Ocultar' : 'Mostrar'} Cronograma
                  </button>
                )}
              </div>

              {!tieneCronograma ? (
                <div className="no-cronograma">
                  <p>Esta sección no tiene un cronograma publicado aún.</p>
                  {!puedePublicarCronograma && (
                    <p className="contact-message">
                      Contacta al profesor o administrador para solicitar el cronograma.
                    </p>
                  )}
                </div>
              ) : mostrarCronograma && (
                <div className="cronograma-content">
                  <div className="calendario-cronograma">
                    {Array.from({ length: 12 }, (_, semanaIndex) => {
                      const semanaNum = semanaIndex + 1;
                      const diasSemana = cronograma.filter(d => d.semana === semanaNum);
                      
                      return (
                        <div key={`semana-${semanaNum}`} className="semana-calendario">
                          <div className="semana-header">Semana {semanaNum}</div>
                          <div className="dias-semana">
                            {diasSemana.map((dia, diaIndex) => (
                              <div key={`dia-${semanaNum}-${diaIndex}`} className="dia-calendario">
                                <div className="dia-header">{seccion.dias_semana[dia.dia_numero - 1] || `Día ${dia.dia_numero}`}</div>
                                <div className="dia-actividad">
                                  {dia.actividad || <span className="placeholder">Sin actividad programada</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-data">
            No se encontraron datos para esta sección.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}