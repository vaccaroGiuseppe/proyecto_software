import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaUpload, FaDownload, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import "./PublicarCronograma.css";

type Seccion = {
  id_seccion: string;
  codigo_materia: string;
  nombre_materia: string;
  nombre_profesor: string;
  horario: string;
  modalidad: string;
};

type Cronograma = {
  id_cronograma: string;
  id_seccion: string;
  link_archivo: string;
  contenido?: Semana[]; // Para almacenar el contenido desglosado
};

type Semana = {
  semana: number;
  clase1: string;
  clase2: string;
};

export default function PublicarCronograma() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string>('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingSecciones, setLoadingSecciones] = useState(true);
  const [cronogramaActual, setCronogramaActual] = useState<Cronograma | null>(null);
  const [mostrarCronograma, setMostrarCronograma] = useState(false);

  // Cargar secciones con datos relacionados
  // Definir interfaces para los tipos de datos
interface Materia {
  codigo_materia: string;
  nombre: string;
}

interface Profesor {
  id_usuario: string;
  nombre: string;
  apellido: string;
}

interface Horario {
  id_horario_clase: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
}

interface SeccionDB {
  id_seccion: string;
  codigo_materia: string;
  id_profesor: string;
  id_horario: string;
  salon: string | null;
}

interface SeccionFormateada {
  id_seccion: string;
  codigo_materia: string;
  nombre_materia: string;
  nombre_profesor: string;
  horario: string;
  modalidad: string;
  salon: string | null;
}

// Dentro de tu componente, modifica el useEffect así:
useEffect(() => {
  const cargarSecciones = async () => {
    try {
      // Paso 1: Obtener todas las secciones con tipos explícitos
      const { data: seccionesData, error: seccionesError } = await supabase
        .from('seccion')
        .select('*')
        .returns<SeccionDB[]>();

      if (seccionesError) throw seccionesError;
      if (!seccionesData) throw new Error('No se encontraron secciones');

      // Paso 2: Obtener datos relacionados con tipos explícitos
      const codigosMateria = seccionesData.map(s => s.codigo_materia);
      const idsProfesores = seccionesData.map(s => s.id_profesor);
      const idsHorarios = seccionesData.map(s => s.id_horario);

      // Consultas en paralelo con tipos definidos
      const [
        { data: materiasData, error: materiasError },
        { data: profesoresData, error: profesoresError },
        { data: horariosData, error: horariosError }
      ] = await Promise.all([
        supabase
          .from('materia')
          .select('codigo_materia, nombre')
          .in('codigo_materia', codigosMateria)
          .returns<Materia[]>(),
        supabase
          .from('usuario')
          .select('id_usuario, nombre, apellido')
          .in('id_usuario', idsProfesores)
          .returns<Profesor[]>(),
        supabase
          .from('horario_clase')
          .select('id_horario_clase, dia_semana, hora_inicio, hora_fin, modalidad')
          .in('id_horario_clase', idsHorarios)
          .returns<Horario[]>()
      ]);

      if (materiasError) throw materiasError;
      if (profesoresError) throw profesoresError;
      if (horariosError) throw horariosError;

      // Formatear los datos con seguridad de tipos
      const seccionesFormateadas: SeccionFormateada[] = seccionesData.map(seccion => {
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
      });

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

  // Cargar cronograma existente cuando se selecciona una sección
  useEffect(() => {
    const cargarCronograma = async () => {
      if (!seccionSeleccionada) return;
      
      try {
        const { data, error } = await supabase
          .from('cronograma')
          .select('*')
          .eq('id_seccion', seccionSeleccionada)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignorar error "No rows found"
        
        setCronogramaActual(data || null);
        
        // Si hay un cronograma, intentar cargar y parsear el archivo
        if (data?.link_archivo) {
          await cargarYParsearCronograma(data.link_archivo);
        }
      } catch (err) {
        console.error('Error al cargar cronograma:', err);
        setError('Error al cargar el cronograma existente');
      }
    };

    cargarCronograma();
  }, [seccionSeleccionada]);

  const cargarYParsearCronograma = async (filePath: string) => {
    try {
      // Descargar el archivo
      const { data, error } = await supabase.storage
        .from('cronogramas') // Asegúrate de que este bucket exista
        .download(filePath);

      if (error) throw error;
      if (!data) throw new Error('No se pudo descargar el archivo');

      // Aquí iría la lógica para parsear el archivo según su formato
      // Por ahora simulamos un parseo básico
      //const contenido = await parsearArchivo(data);
      //setCronogramaActual(prev => prev ? { ...prev, contenido } : null);
    } catch (err) {
      console.error('Error al parsear cronograma:', err);
      setError('Error al procesar el cronograma');
    }
  };


  const descargarPlantilla = () => {
    // Crear una plantilla básica (en una implementación real sería un archivo Excel o CSV)
    const plantilla = `Semana,Clase 1,Clase 2\n${Array.from({ length: 12 }, (_, i) => 
      `${i + 1},Tema semana ${i + 1} clase 1,Tema semana ${i + 1} clase 2`).join('\n')}`;
    
    const blob = new Blob([plantilla], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_cronograma.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

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

      if (!archivo) {
        throw new Error('Debes seleccionar un archivo');
      }

      // Subir el archivo a Supabase Storage
      const fileExt = archivo.name.split('.').pop();
      const fileName = `${seccionSeleccionada}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cronogramas')
        .upload(filePath, archivo);

      if (uploadError) throw uploadError;

      // Guardar referencia en la tabla cronograma
      const { error: dbError } = await supabase
        .from('cronograma')
        .upsert({
          id_seccion: seccionSeleccionada,
          link_archivo: filePath
        }, {
          onConflict: 'id_seccion'
        });

      if (dbError) throw dbError;

      // Parsear el archivo para mostrar el contenido
      //const contenido = await parsearArchivo(archivo);

      setSuccess('Cronograma subido correctamente!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el cronograma');
      console.error('Error detallado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="publicar-cronograma-page">
      <Navbar />
      
      <div className="publicar-cronograma-container">
        <div className="header-section">
          <h1 className="main-title">Publicación de Cronogramas</h1>
          <p className="subtitle">Sube y gestiona los cronogramas de tus secciones</p>
        </div>

        <div className="form-container">
          <div className="publicar-cronograma-card">
            {error && (
              <div className="alert-message error-message">
                <FaTimes /> Error: {error}
              </div>
            )}

            {success && (
              <div className="alert-message success-message">
                <FaCheck /> {success}
              </div>
            )}

            <div className="seleccion-seccion">
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
                      Horario: {seccion.horario} ({seccion.modalidad})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {seccionSeleccionada && (
              <div className="acciones-cronograma">
                <div className="botones-accion">
                  <button 
                    type="button" 
                    className="action-button download-button"
                    onClick={descargarPlantilla}
                  >
                    <FaDownload /> Descargar Plantilla
                  </button>

                  <form onSubmit={handleSubmit} className="upload-form">
                    <label className="file-upload-label">
                      <FaUpload /> Subir Cronograma
                      <input 
                        type="file" 
                        onChange={handleFileChange} 
                        accept=".xlsx,.xls,.csv"
                        className="file-input"
                      />
                    </label>
                    {archivo && (
                      <div className="file-info">
                        Archivo seleccionado: {archivo.name}
                        <button 
                          type="submit" 
                          className="submit-button"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? <FaSpinner className="spinner" /> : <FaUpload />}
                          {isSubmitting ? ' Subiendo...' : ' Confirmar Subida'}
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {cronogramaActual && (
                  <div className="ver-cronograma-section">
                    <button 
                      className="toggle-button"
                      onClick={() => setMostrarCronograma(!mostrarCronograma)}
                    >
                      {mostrarCronograma ? 'Ocultar Cronograma' : 'Ver Cronograma Actual'}
                    </button>

                    {mostrarCronograma && (
                      <div className="cronograma-detalle">
                        <h3>Cronograma de la Sección</h3>
                        <div className="cronograma-grid">
                          <div className="grid-header">
                            <div>Semana</div>
                            <div>Clase 1</div>
                            <div>Clase 2</div>
                          </div>
                          {cronogramaActual.contenido ? (
                            cronogramaActual.contenido.map((semana) => (
                              <div key={semana.semana} className="grid-row">
                                <div>{semana.semana}</div>
                                <div>{semana.clase1}</div>
                                <div>{semana.clase2}</div>
                              </div>
                            ))
                          ) : (
                            <div className="no-contenido">
                              No se pudo cargar el contenido del cronograma
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}