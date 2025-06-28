import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaUpload, FaDownload, FaSpinner, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import "./PublicarCronograma.css";
import * as XLSX from 'xlsx';

type Seccion = {
  id_seccion: string;
  codigo_materia: string;
  nombre_materia: string;
  nombre_profesor: string;
  horario: string;
  modalidad: string;
  salon?: string | null;
};

type DiaCronograma = {
  semana: number;
  dia_numero: number; // 1 o 2
  actividad: string;
};

type Cronograma = {
  id_seccion: string;
  dias: DiaCronograma[];
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
  const [mostrarContenido, setMostrarContenido] = useState(false);

  // Cargar secciones con datos relacionados
  useEffect(() => {
    const cargarSecciones = async () => {
      try {
        const { data: seccionesData, error: seccionesError } = await supabase
          .from('seccion')
          .select('*');

        if (seccionesError) throw seccionesError;
        if (!seccionesData) throw new Error('No se encontraron secciones');

        const codigosMateria = seccionesData.map(s => s.codigo_materia);
        const idsProfesores = seccionesData.map(s => s.id_profesor);
        const idsHorarios = seccionesData.map(s => s.id_horario);

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

        const seccionesFormateadas: Seccion[] = seccionesData.map(seccion => {
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

  // Cargar cronograma existente al seleccionar sección
  useEffect(() => {
    const cargarCronogramaExistente = async () => {
      if (!seccionSeleccionada) return;
      
      try {
        
        const {data,error } = await supabase
          .from('cronogramas')
          .select('semana, dia_numero, actividad')
          .eq('id_seccion', seccionSeleccionada)
          .order('semana', { ascending: true })
          .order('dia_numero', { ascending: true });

        if (error) throw error;
        
        setCronogramaActual({
          id_seccion: seccionSeleccionada,
          dias: data || []
        });
      } catch (err) {
        console.error('Error al cargar cronograma:', err);
        setError('Error al cargar el cronograma existente');
      }
    };

    cargarCronogramaExistente();
  }, [seccionSeleccionada]);

  const descargarPlantilla = () => {
    const wb = XLSX.utils.book_new();
    
    const datos = [
      ["Semana", "Clase 1", "Clase 2"],
      ...Array.from({ length: 12 }, (_, i) => [
        i + 1,
        `Tema semana ${i + 1} clase 1`,
        `Tema semana ${i + 1} clase 2`
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(datos);
    
    if (ws['!cols'] === undefined) ws['!cols'] = [];
    ws['!cols'][0] = { wch: 10 };
    ws['!cols'][1] = { wch: 30 };
    ws['!cols'][2] = { wch: 30 };

    XLSX.utils.book_append_sheet(wb, ws, "Cronograma");
    XLSX.writeFile(wb, "plantilla_cronograma.xlsx");
  };

  const parsearArchivoExcel = async (file: File): Promise<DiaCronograma[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
          interface ExcelRow {
            Semana: number;
            'Clase 1': string;
            'Clase 2': string;
          }

          const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(firstSheet);

          // Validar estructura del archivo
          if (jsonData.length === 0) {
            throw new Error('El archivo está vacío');
          }

          const primeraFila = jsonData[0];
          if (!('Semana' in primeraFila) || !('Clase 1' in primeraFila) || !('Clase 2' in primeraFila)) {
            throw new Error('El archivo no tiene el formato correcto. Debe contener columnas: Semana, Clase 1, Clase 2');
          }

          // Convertir a formato de días del cronograma
          const dias: DiaCronograma[] = [];
          
          jsonData.forEach(row => {
            dias.push({
              semana: row.Semana,
              dia_numero: 1,
              actividad: row['Clase 1'] || ''
            });
            
            dias.push({
              semana: row.Semana,
              dia_numero: 2,
              actividad: row['Clase 2'] || ''
            });
          });

          resolve(dias);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsArrayBuffer(file);
    });
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
      if (!seccionSeleccionada) {
        throw new Error('Debes seleccionar una sección');
      }

      if (!archivo) {
        throw new Error('Debes seleccionar un archivo');
      }

      // Parsear el archivo Excel
      const dias = await parsearArchivoExcel(archivo);
      console.log(dias)
      console.log(seccionSeleccionada)
      
      // Verificar que tenga 24 registros (12 semanas × 2 días)
      if (dias.length !== 24) {
        console.warn(`El archivo contiene ${dias.length} registros, se esperaban 24 (12 semanas × 2 días)`);
      }

      //1. Eliminar cronograma existente (si lo hay)
      const { error: deleteError } = await supabase
        .from('cronogramas')
        .delete()
        .eq('id_seccion', seccionSeleccionada);

      if (deleteError) console.warn('No se pudo eliminar cronograma anterior:', deleteError);

      // 2. Insertar nuevo cronograma
      console.log("hola")
      const { error: insertError } = await supabase
        .from('cronogramas')
        .insert(
          dias.map(dia => ({
            id_seccion: seccionSeleccionada,
            semana: dia.semana,
            dia_numero: dia.dia_numero,
            actividad: dia.actividad,
          }))
        );
        

      if (insertError) throw insertError;

      //3. Actualizar estado
      setCronogramaActual({
        id_seccion: seccionSeleccionada,
        dias: dias
      });
      
      setSuccess('Cronograma guardado correctamente!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar el cronograma';
      setError(errorMsg);
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
                        accept=".xlsx,.xls"
                        className="file-input"
                        required
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
                  <div className="cronograma-existente">
                    <div className="cronograma-info">
                      <span>Cronograma existente para esta sección</span>
                      <div className="cronograma-actions">
                        <button 
                          onClick={() => setMostrarContenido(!mostrarContenido)}
                          className="action-button toggle-button"
                        >
                          <FaEye /> {mostrarContenido ? 'Ocultar' : 'Ver'}
                        </button>
                      </div>
                    </div>

                    {mostrarContenido && (
                      <div className="cronograma-contenido">
                        <div className="calendario-cronograma">
                          {Array.from({ length: 12 }, (_, semanaIndex) => {
                            const semanaNum = semanaIndex + 1;
                            const diasSemana = cronogramaActual.dias.filter(d => d.semana === semanaNum);
                            
                            return (
                              <div key={`semana-${semanaNum}`} className="semana-calendario">
                                <div className="semana-header">Semana {semanaNum}</div>
                                <div className="dias-semana">
                                  {diasSemana.map((dia, diaIndex) => (
                                    <div key={`dia-${semanaNum}-${diaIndex}`} className="dia-calendario">
                                      <div className="dia-header">Día {dia.dia_numero}</div>
                                      <div className="dia-actividad">{dia.actividad}</div>
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