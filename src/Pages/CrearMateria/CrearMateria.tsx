import { useState } from 'react';
import { supabase } from '../lib/../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaBook, FaCalendarAlt, FaClock, FaSave, FaSpinner, FaChalkboardTeacher } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "./CrearMateria.css";

type Seccion = {
  dias: string;
  horario: string;
  cedula_profesor: string;
};

export default function CrearMateria() {
  const [nombreMateria, setNombreMateria] = useState('');
  const [numeroSecciones, setNumeroSecciones] = useState(1);
  const [secciones, setSecciones] = useState<Seccion[]>(Array(1).fill({ 
    dias: '', 
    horario: '', 
    cedula_profesor: '' 
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const diasOptions = [
    { value: 'Lunes y Miércoles', label: 'Lunes y Miércoles' },
    { value: 'Martes y Jueves', label: 'Martes y Jueves' },
    { value: 'Miércoles y Viernes', label: 'Miércoles y Viernes' }
  ];

  const horarioOptions = [
    { value: '7:00 AM - 8:30 AM', label: '7:00 AM - 8:30 AM' },
    { value: '8:45 AM - 10:15 AM', label: '8:45 AM - 10:15 AM' },
    { value: '10:30 AM - 12:00 PM', label: '10:30 AM - 12:00 PM' },
    { value: '12:15 PM - 1:45 PM', label: '12:15 PM - 1:45 PM' },
    { value: '2:00 PM - 3:30 PM', label: '2:00 PM - 3:30 PM' },
    { value: '3:45 PM - 5:15 PM', label: '3:45 PM - 5:15 PM' },
    { value: '5:30 PM - 7:00 PM', label: '5:30 PM - 7:00 PM' }
  ];

  const handleNumeroSeccionesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const num = parseInt(e.target.value);
    setNumeroSecciones(num);
    setSecciones(Array(num).fill({ dias: '', horario: '', cedula_profesor: '' }).map((_, i) => 
      secciones[i] || { dias: '', horario: '', cedula_profesor: '' }
    ));
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
      if (!nombreMateria.trim()) {
        throw new Error('El nombre de la materia es requerido');
      }

      for (let i = 0; i < secciones.length; i++) {
        if (!secciones[i].dias) {
          throw new Error(`Debes seleccionar los días para la sección ${i + 1}`);
        }
        if (!secciones[i].horario) {
          throw new Error(`Debes seleccionar el horario para la sección ${i + 1}`);
        }
        if (!secciones[i].cedula_profesor.trim()) {
          throw new Error(`Debes ingresar la cédula del profesor para la sección ${i + 1}`);
        }
      }

      // Insertar materia en la base de datos
      const { data: materiaData, error: materiaError } = await supabase
        .from('materias')
        .insert([{ 
          nombre: nombreMateria
        }])
        .select()
        .single();

      if (materiaError) throw materiaError;

      // Insertar secciones con sus respectivos profesores
      const seccionesToInsert = secciones.map(seccion => ({
        id_materia: materiaData.id,
        dias: seccion.dias,
        horario: seccion.horario,
        cedula_profesor: seccion.cedula_profesor
      }));

      const { error: seccionesError } = await supabase
        .from('secciones')
        .insert(seccionesToInsert);

      if (seccionesError) throw seccionesError;

      setSuccess('Materia creada exitosamente con sus secciones!');
      setTimeout(() => {
        navigate('/materias');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la materia');
      console.error('Error detallado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crear-materia-page">
      <Navbar />
      
      <div className="crear-materia-container">
        <div className="header-section">
          <h1 className="main-title">Crear Materia</h1>
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
                <label htmlFor="nombreMateria" className="form-label">
                  <FaBook /> Nombre de la Materia:
                </label>
                <input
                  type="text"
                  id="nombreMateria"
                  value={nombreMateria}
                  onChange={(e) => setNombreMateria(e.target.value)}
                  className="form-input"
                  placeholder="Ej: Matemáticas Avanzadas"
                />
              </div>

              <div className="form-group">
                <label htmlFor="numeroSecciones" className="form-label">
                  Número de Secciones:
                </label>
                <select
                  id="numeroSecciones"
                  value={numeroSecciones}
                  onChange={handleNumeroSeccionesChange}
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              {secciones.map((seccion, index) => (
                <div key={index} className="seccion-group">
                  <h3 className="seccion-title">Sección {index + 1}</h3>
                  
                  <div className="form-group">
                    <label htmlFor={`dias-${index}`} className="form-label">
                      <FaCalendarAlt /> Días de Clase:
                    </label>
                    <select
                      id={`dias-${index}`}
                      value={seccion.dias}
                      onChange={(e) => handleSeccionChange(index, 'dias', e.target.value)}
                      className="form-select"
                    >
                      <option value="">Seleccione los días...</option>
                      {diasOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`horario-${index}`} className="form-label">
                      <FaClock /> Horario:
                    </label>
                    <select
                      id={`horario-${index}`}
                      value={seccion.horario}
                      onChange={(e) => handleSeccionChange(index, 'horario', e.target.value)}
                      className="form-select"
                    >
                      <option value="">Seleccione el horario...</option>
                      {horarioOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`cedula-${index}`} className="form-label">
                      <FaChalkboardTeacher /> Cédula del Profesor:
                    </label>
                    <input
                      type="text"
                      id={`cedula-${index}`}
                      value={seccion.cedula_profesor}
                      onChange={(e) => handleSeccionChange(index, 'cedula_profesor', e.target.value)}
                      className="form-input"
                      placeholder={`Cédula profesor sección ${index + 1}`}
                    />
                  </div>
                </div>
              ))}

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />}
                {isSubmitting ? ' Creando...' : ' Crear Materia'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}