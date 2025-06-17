import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaDoorOpen, FaSave, FaSpinner, FaCheck } from 'react-icons/fa';
import "./AsignarSalon.css";


type SeccionFormateada = {
  id_seccion: string;
  codigo_materia: string;
  nombre_materia: string;
  nombre_profesor: string;
  horario: string;
  modalidad: string;
  salon: string | null;
};

export default function AsignarSalon() {
  const [secciones, setSecciones] = useState<SeccionFormateada[]>([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string>('');
  const [codigoSalon, setCodigoSalon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingSecciones, setLoadingSecciones] = useState(true);

  // Cargar secciones con datos relacionados
  useEffect(() => {
    const cargarSecciones = async () => {
      try {
        // Paso 1: Obtener todas las secciones
        const { data: seccionesData, error: seccionesError } = await supabase
          .from('seccion')
          .select('id_seccion, codigo_materia, id_profesor, id_horario, salon');

        if (seccionesError) throw seccionesError;

        // Paso 2: Obtener datos relacionados
        const codigosMateria = [...new Set(seccionesData?.map(s => s.codigo_materia))];
        const idsProfesores = [...new Set(seccionesData?.map(s => s.id_profesor))];
        const idsHorarios = [...new Set(seccionesData?.map(s => s.id_horario))];

        // Consultas en paralelo para mejor rendimiento
        const [
          { data: materiasData, error: materiasError },
          { data: profesoresData, error: profesoresError },
          { data: horariosData, error: horariosError }
        ] = await Promise.all([
          supabase
            .from('materia')
            .select('codigo_materia, nombre')
            .in('codigo_materia', codigosMateria),
          supabase
            .from('usuario')
            .select('id_usuario, nombre, apellido')
            .in('id_usuario', idsProfesores),
          supabase
            .from('horario_clase')
            .select('id_horario_clase, dia_semana, hora_inicio, hora_fin, modalidad')
            .in('id_horario_clase', idsHorarios)
        ]);

        if (materiasError) throw materiasError;
        if (profesoresError) throw profesoresError;
        if (horariosError) throw horariosError;

        // Formatear los datos para mostrar
        const seccionesFormateadas = seccionesData?.map(seccion => {
          const materia = materiasData?.find(m => m.codigo_materia === seccion.codigo_materia);
          const profesor = profesoresData?.find(p => p.id_usuario === seccion.id_profesor);
          const horario = horariosData?.find(h => h.id_horario_clase === seccion.id_horario);

          return {
            id_seccion: seccion.id_seccion,
            codigo_materia: seccion.codigo_materia,
            nombre_materia: materia?.nombre || 'Sin nombre',
            nombre_profesor: profesor 
              ? `${profesor.nombre} ${profesor.apellido}` 
              : 'Sin profesor',
            horario: horario
              ? `${horario.dia_semana} ${horario.hora_inicio}-${horario.hora_fin}`
              : 'Sin horario',
            modalidad: horario?.modalidad || '',
            salon: seccion.salon
          };
        }) || [];

        setSecciones(seccionesFormateadas);
      } catch (err) {
        setError('Error al cargar las secciones');
        console.error('Error al cargar secciones:', err);
      } finally {
        setLoadingSecciones(false);
      }
    };

    cargarSecciones();
  }, []);

  // Actualizar código de salón cuando se selecciona una sección
  useEffect(() => {
    if (seccionSeleccionada) {
      const seccion = secciones.find(s => s.id_seccion === seccionSeleccionada);
      setCodigoSalon(seccion?.salon || '');
    }
  }, [seccionSeleccionada, secciones]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validaciones
      if (!seccionSeleccionada) {
        throw new Error('Debes seleccionar una sección');
      }

      if (!codigoSalon.trim()) {
        throw new Error('Debes ingresar un código de salón');
      }

      // Actualizar el salón en la base de datos
      const { error } = await supabase
        .from('seccion')
        .update({ salon: codigoSalon.trim() })
        .eq('id_seccion', seccionSeleccionada);

      if (error) throw error;

      // Actualizar el estado local
      setSecciones(secciones.map(seccion => 
        seccion.id_seccion === seccionSeleccionada 
          ? { ...seccion, salon: codigoSalon.trim() } 
          : seccion
      ));

      setSuccess('Salón asignado correctamente!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar el salón');
      console.error('Error detallado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="asignar-salon-page">
      <Navbar />
      
      <div className="asignar-salon-container">
        <div className="header-section">
          <h1 className="main-title">Asignación de Salones</h1>
          <p className="subtitle">Asigna espacios físicos a las secciones</p>
        </div>

        <div className="form-container">
          <div className="asignar-salon-card">
            {error && (
              <div className="alert-message error-message">
                Error: {error}
              </div>
            )}

            {success && (
              <div className="alert-message success-message">
                <FaCheck /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="asignar-salon-form">
              <div className="form-group">
                <label htmlFor="seccion" className="form-label">
                  Seleccionar Sección:
                </label>
                {loadingSecciones ? (
                  <div className="loading-secciones">
                    <FaSpinner className="spinner" /> Cargando secciones...
                  </div>
                ) : (
                  <select
                    id="seccion"
                    value={seccionSeleccionada}
                    onChange={(e) => setSeccionSeleccionada(e.target.value)}
                    className="form-select"
                    disabled={loadingSecciones}
                  >
                    <option value="">Seleccione una sección...</option>
                    {secciones.map((seccion) => (
                      <option key={seccion.id_seccion} value={seccion.id_seccion}>
                        {seccion.codigo_materia} - {seccion.nombre_materia} | 
                        Prof: {seccion.nombre_profesor} | 
                        Horario: {seccion.horario} ({seccion.modalidad}) | 
                        Salón: {seccion.salon || 'No asignado'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {seccionSeleccionada && (
                <>
                  <div className="form-group">
                    <label htmlFor="codigoSalon" className="form-label">
                      <FaDoorOpen /> Código del Salón:
                    </label>
                    <input
                      type="text"
                      id="codigoSalon"
                      value={codigoSalon}
                      onChange={(e) => setCodigoSalon(e.target.value)}
                      className="form-input"
                      placeholder="Ej: A-201, B-305, LAB-1"
                      maxLength={20}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />}
                    {isSubmitting ? ' Guardando...' : ' Asignar Salón'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}