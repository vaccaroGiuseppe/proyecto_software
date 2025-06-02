import { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from "react-hook-form";
import { supabase } from '../lib/../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaUserEdit, FaEye, FaEyeSlash, FaCalendarAlt, FaVenusMars } from 'react-icons/fa';
import "./Registrar.css";

type UsuarioFormData = {
  nombre: string;
  apellido: string;
  correo: string;
  tipo: string;
  contrasena: string;
  confirmar_contrasena: string;
  foto_perfil: null;
  fecha_nacimiento: string;
  sexo: string;
};

export default function UsuarioForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<UsuarioFormData>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const determinarTipoUsuario = (correo: string): string => {
    const profesor = /@unimet\.edu\.ve$/i;
    return profesor.test(correo) ? "profesor" : "estudiante";
  };

  const correo = watch("correo");
  useEffect(() => {
    if (correo) setValue("tipo", determinarTipoUsuario(correo));
  }, [correo, setValue]);

  useEffect(() => {
    if (startDate) setValue('fecha_nacimiento', startDate.toISOString());
  }, [startDate, setValue]);

  const contrasena = watch("contrasena");

  const onSubmit = async (formData: UsuarioFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const dataToInsert = {
        ...formData,
        fecha_nacimiento: startDate?.toISOString() || null
      };

      const { data, error } = await supabase
        .from('usuario')
        .insert([dataToInsert])
        .select();

      if (error) throw new Error(error.message);
      if (data) {
        setSuccess(true);
        reset();
        setStartDate(null);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='registro-page'>
      <Navbar />
      
      <div className="registro-container">
        {/* Panel de formulario (izquierda en desktop) */}
        <div className="form-container">
          <div className="registro-card">
            {success && <div className="alert-message success-message">Usuario registrado exitosamente!</div>}
            {error && <div className="alert-message error-message">Error: {error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
              <div className="form-grid">
                {/* Nombre y Apellido */}
                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input 
                    type="text" 
                    id="nombre"
                    {...register("nombre", {required: "Este campo es obligatorio"})} 
                  />
                  {errors.nombre && <span className="error-message">{errors.nombre.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="apellido">Apellido</label>
                  <input 
                    type="text" 
                    id="apellido"
                    {...register("apellido", {required: "Este campo es obligatorio"})} 
                  />
                  {errors.apellido && <span className="error-message">{errors.apellido.message}</span>}
                </div>

                {/* Correo */}
                <div className="form-group full-width">
                  <label htmlFor="correo">Correo Unimet</label>
                  <input 
                    type="email" 
                    id="correo"
                    {...register("correo", {
                      required: "Este campo es obligatorio", 
                      pattern: {
                        value: /@(correo\.unimet\.edu\.ve|unimet\.edu\.ve)$/i,
                        message: "Debe ser un correo institucional",
                      } 
                    })}
                  />
                  {errors.correo && <span className="error-message">{errors.correo.message}</span>}
                </div>

                {/* Contraseñas */}
                <div className="form-group">
                  <label htmlFor="contrasena">Contraseña</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="contrasena"
                      {...register('contrasena', {
                        required: 'La contraseña es obligatoria',
                        minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                          message: 'Debe contener mayúscula, minúscula, número y carácter especial'
                        }
                      })} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.contrasena && <span className="error-message">{errors.contrasena.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmar_contrasena">Confirmar Contraseña</label>
                  <div className="password-input">
                    <input 
                      type={showConfirmation ? 'text' : 'password'}
                      id="confirmar_contrasena"
                      {...register("confirmar_contrasena", {
                        required: "Por favor confirma tu contraseña", 
                        validate: (value) => 
                          value === contrasena || 'Las contraseñas no coinciden'
                      })} 
                    />
                    <button type="button" onClick={() => setShowConfirmation(!showConfirmation)}>
                      {showConfirmation ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmar_contrasena && <span className="error-message">{errors.confirmar_contrasena.message}</span>}
                </div>

                {/* Fecha de Nacimiento */}
                <div className="form-group">
                  <label htmlFor="fecha_nacimiento">
                    <FaCalendarAlt /> Fecha de Nacimiento
                  </label>
                  <DatePicker
                    id="fecha_nacimiento"
                    selected={startDate}
                    onChange={setStartDate}
                    dateFormat="yyyy/MM/dd"
                    placeholderText="Selecciona una fecha"
                    showYearDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    customInput={
                      <input onKeyDown={(e) => e.preventDefault()} />
                    }
                  />
                  {errors.fecha_nacimiento && <span className="error-message">{errors.fecha_nacimiento.message}</span>}
                </div>

                {/* Sexo */}
                <div className="form-group">
                  <label htmlFor="sexo">
                    <FaVenusMars /> Sexo
                  </label>
                  <select
                    id="sexo"
                    {...register("sexo", { required: "Este campo es obligatorio" })}
                    style={{ height: '52px' }}
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                    <option value="prefiero no decir">Prefiero no decir</option>
                  </select>
                  {errors.sexo && <span className="error-message">{errors.sexo.message}</span>}
                </div>
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Enviando...' : 'Registrarse'}
              </button>
            </form>
          </div>
        </div>

        {/* Panel naranja (derecha en desktop) */}
        <div className="orange-panel">
          <div className="panel-content">
            <FaUserEdit className="hero-icon" />
            <h1 className="hero-title">Registro de Usuario</h1>
            <p className="hero-subtitle">Únete a nuestra comunidad académica</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}