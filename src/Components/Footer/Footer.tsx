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
                width="250"
                height="250"
                allowFullScreen
                loading="lazy"
                className="Mapa_Frame"
                ></iframe>
                
            </div>
            </div>

        </div> {/*Espacio 1*/}
        <div className="Espacio2">
            <div className="Campus_Contenedor">

                <h1 className="Campus_Titulo">campus puerto la cruz, lechería</h1>
                <p className="Campus_Descripcion">
                Av. Municipal con calle Carabobo, Centro Seguros La Previsora - Calle
                El Dorado, CC Guaica Center
                </p>

                <div className="Contacto_Contenedor">
                    <h3 className="Contacto_Titulo">Contacto</h3>
                </div>

                <div className="Campus_Info_Telefono">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="55"
                        height="55"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-phone Icono_Telefono"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                    </svg>
                    <div className="Info_Telefonos">
                        <p>(0424)-854.61.46</p>
                        <p>(0281)-281.45.30</p>

                    </div>
                    

                </div>
                        <p className="Contacto_Info">soportevirtual@unimet.edu.ve</p>
            </div>
        </div> {/*Espacio 2*/}

        <div className="Espacio3">
            <div className="Redes_Contenedor">

                <div className="Redes_Contenedor_Titulo">
                    <h1>Redes Sociales</h1>
                </div>

                <div className="Redes_Contenedor_Iconos">
                    <a href="https://www.instagram.com/unimet/?hl=es">
                        <div className="Instagram">
                            <svg  
                                xmlns="http://www.w3.org/2000/svg"  
                                width="37"  
                                height="37"  
                                viewBox="0 0 24 24"  
                                fill="none"  
                                stroke="#FFFFFF"  
                                stroke-width="2"  
                                stroke-linecap="round"  
                                stroke-linejoin="round"  
                                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-instagram">
                                <path stroke="none" d="M0 0h24v24H0z" 
                                fill="none"/><path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
                                <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M16.5 7.5v.01" />
                            </svg>
                        </div>
                    </a>
                    <a href="https://www.facebook.com/unimet/?locale=es_LA">
                        <div className="Facebook">
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="37"
                            height="37"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#FFFFFF"
                            stroke-width="2"  
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            >
                            <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
                            </svg>
                        </div>
                    </a>
                    <a href="https://www.youtube.com/user/canalunimet">
                        <div className="Youtube">

                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="37"
                            height="37"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#FFFFFF"
                            stroke-width="2"  
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            >
                            <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
                            <path d="M10 9l5 3l-5 3z" />
                            </svg>

                        </div>
                    </a>
                    <a href="https://x.com/unimet">
                        <div className="X">

                                
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="37"
                            height="37"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#FFFFFF"
                            stroke-width="2"  
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            className = "X.edit"
                            >
                            <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                            <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                            </svg>


                        </div>
                    </a>
                </div>
                <div className="Samancito_Contenedor">
                    <a  className="Samancito_Link" href="https://www.instagram.com/samanexcentrico/?hl=es">
                    @samanexcentrico</a>
                    <p className="Samancito_Descripcion">Mata e Mango Unimetana</p>
                    
                </div>

                   

            </div>
        </div> {/*Espacio 3*/}
    </div>
  );
}

export default Footer;
