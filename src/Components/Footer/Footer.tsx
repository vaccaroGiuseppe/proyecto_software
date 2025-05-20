import { Link } from "react-router-dom";
import "./Footer.css";



function Footer() {
  return (
    <div className="Footer_Contenedor">
        <div className="Espacio1">
            <div className="Mapa_Contenedor">
                <h1 className="Mapa_Titulo">Sede de Caracas</h1>
                <div className="Contenedor_Frame">

                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7846.042804455661!2d-66.7868011!3d10.4989788!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a576d54142307%3A0x346aa4e5e126367e!2sUniversidad%20Metropolitana!5e0!3m2!1ses!2sve!4v1747756032276!5m2!1ses!2sve"
                        
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        className="Mapa_Frame"
                    ></iframe>;

                </div>


            </div>

            <div className="Contacto_Contenedor">
                <h3 className="Contacto_Titulo">Contacto</h3>
                <p className="Contacto_Info">soportevirtual@unimet.edu.ve</p>
            </div>


        </div>
    
    </div>
  );
}

export default Footer;
