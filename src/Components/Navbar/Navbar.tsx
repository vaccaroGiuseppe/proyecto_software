import { Link } from "react-router-dom";
import Logo_Blanco from "../../Images/Logo_Blanco.png";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="Navbar">
      <div className="Navbar_Contenedor Contenedor">
        <div className="Navbar_Contenedor_Logo">
          <Link to="/">
            <img src={Logo_Blanco} alt="Logo Unimet" className="Navbar_Logo" />
          </Link>
        </div>

        <div className="Navbar_Contenedor_Links">
          <div className="Contenedor_Links">
            <Link className="Navbar_Link" to="/about">Nosotros</Link>
            <Link className="Navbar_Link Navbar_Link_Acceder" to="/">Acceder</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;