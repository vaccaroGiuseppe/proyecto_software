import { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from "react-hook-form";
import { supabase } from '../lib/../../supabaseClient'; // Ajusta la ruta según tu estructura
import "./Registrar.css";

type UsuarioFormData = {
  nombre: string;
  apellido: string;
  correo: string;
  tipo: string; 
  //Recuerda gestionar esto luego, no se hace así-------------------------------------------------------
  contrasena: string; 
  confirmar_contrasena: string; 
  //-------------------------------------------------------------
  foto_perfil: null; // Esto también está pendiente
  fecha_nacimiento: string; 
  sexo: string; 
};


export default function UsuarioForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<UsuarioFormData>();
  
  const [SelectedValue, setSelectedValue] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
  };

  // Calendario
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Lógica para obtener el tipo de usuario, de estudiante o profesor
  const determinarTipoUsuario = (correo: string): string => {
    const profesor = /@unimet\.edu\.ve$/i;
    return profesor.test(correo) ? "profesor" : "estudiante";
  };

  // Función para observar cambios en el correo
  const correo = watch("correo");
  useEffect(() => {
    if (correo) {
      setValue("tipo", determinarTipoUsuario(correo));
    }
  }, [correo, setValue]);

  // Función para validar fecha
  useEffect(() => {
  if (startDate) {
    setValue('fecha_nacimiento', startDate.toISOString());
  }
}, [startDate, setValue]);

  // Observar cambios en la contraseña
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

    if (error) {
      console.error('Error detallado:', error);
      throw new Error(error.message);
    }

      if (data) {
        setSuccess(true);
        reset();
        setStartDate(null);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='Contenedor_Registro'>
      <h1>Registro</h1>
      {success && (
        <div>
          Usuario registrado exitosamente!
        </div>
      )}
      
      {error && (
        <div>
          Error: {error}
        </div>
      )}

      <div className="Contenedor_Formulario">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* NOMBRE */}
          <label htmlFor="nombre">Nombre</label>
          <input 
            type="text" 
            {...register("nombre", {required: "este campo es obligatorio"})} 
          />
          {errors.nombre && <span>{errors.nombre.message}</span>}

          {/* APELLIDO */}
          <label htmlFor="apellido">Apellido</label>
          <input 
            type="text" 
            {...register("apellido", {required: "este campo es obligatorio"})} 
          />
          {errors.apellido && <span>{errors.apellido.message}</span>}

          {/* CORREO */}
          <label htmlFor="correo">Correo Unimet</label>
          <input 
            type="text" 
            {...register("correo", {
              required: "este campo es obligatorio", 
              pattern: {
                value: /@(correo\.unimet\.edu\.ve|unimet\.edu\.ve)$/i,
                message: "Necesitas ingresar con tu correo institucional",
              } 
            })}
          />
          {errors.correo && <span>{errors.correo.message}</span>}

{/*------------------------------------------------------------------------------------------------------------*/}
          {/* CONTRASEÑA */}
          <div className='Contrasena_Contenedor'>
            <label htmlFor="contrasena">Contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('contrasena', {
                required: 'La contraseña es obligatoria',
                minLength: {
                  value: 8,
                  message: 'Mínimo 8 caracteres'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                  message: 'Debe contener: mayúscula, minúscula, número y carácter especial'
                }
              })} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ocultar" : 'Mostrar'}
            </button>
            {errors.contrasena && <span>{errors.contrasena.message}</span>}
          </div>

          {/* Verificación de Contraseña */}
          <div className='Confirmar_Contenedor'>
            <label htmlFor="confirmar_contrasena">Confirmar contraseña</label>
            <input 
              type={showConfirmation ? 'text' : 'password'}
              {...register("confirmar_contrasena", {
                required: "Por favor confirma tu contraseña", 
                validate: (value) => 
                  value === contrasena || 'Las contraseñas no coinciden'
              })} 
            />
            <button
              type="button"
              onClick={() => setShowConfirmation(!showConfirmation)}
            >
              {showConfirmation ? 'Ocultar' : 'Mostrar'}
            </button>
            {errors.confirmar_contrasena && <span>{errors.confirmar_contrasena.message}</span>}
          </div>

{/*------------------------------------------------------------------------------------------------------------*/}


          {/* IMAGEN DE USUARIO */}
          <label htmlFor="foto_perfil">Imágen</label>
          <input 
            type="text" 
            {...register("foto_perfil")} 
          />
          {errors.foto_perfil && <span>{errors.foto_perfil.message}</span>}

          {/* FECHA DE NACIMIENTO */}
          <div>
            <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
            <DatePicker
              id="fecha_nacimiento"
              selected={startDate}
              onChange={(date: Date | null) => {
                setStartDate(date);
                if (date) {
                  setValue('fecha_nacimiento', date.toISOString().split('T')[0]);
                }
              }}
              dateFormat="yyyy/MM/dd"
              placeholderText="Selecciona una fecha"
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
              yearDropdownItemNumber={100}
              scrollableYearDropdown
              required
              customInput={
                <input  
                  style={{cursor: "pointer"}}
                  onKeyDown={(e) => e.preventDefault()} 
                />
              }
            />
            {errors.fecha_nacimiento && <span>{errors.fecha_nacimiento.message}</span>}
          </div>

          {/* SEXO */}
          <div>
            <label htmlFor="sexo">Sexo:</label>
            <select
              id="sexo"
              {...register("sexo", { required: "Este campo es obligatorio" })}
            >
              <option value="">Seleccione una opción</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
              <option value="prefiero no decir">Prefiero no decir</option>
            </select>
            {errors.sexo && <span>{errors.sexo.message}</span>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}