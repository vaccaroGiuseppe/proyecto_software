import { Link } from "react-router-dom";
import Logo_Blanco from "../../Images/Logo_Blanco.png";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="Navbar">
      
        <div className="Navbar_Contenedor_Logo">
          <Link to="/">
            <img src={Logo_Blanco} alt="Logo Unimet" className="Logo" />
          </Link>
        </div>

        <div className="Navbar_Contenedor_Links">
            <Link className="Link Link_Nosotros" to="/about">Nosotros</Link>
            <Link className="Link Link_Acceder" to="/">Acceder</Link>
        </div>

    
    </nav>
  );
}

export default Navbar;