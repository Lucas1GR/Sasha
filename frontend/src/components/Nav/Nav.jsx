import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Nav.css";

const Nav = () => {
  // usuario viene del Contexto. Asegúrate que en AuthContext
  // estés usando los datos que guardamos en el Login.
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) setShrink(true);
      else setShrink(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={`nav-container ${shrink ? "nav-shrink" : ""}`}>
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <img
            src="/SB-logo.png"
            alt="Estética Sasha"
            className="nav-logo-img"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <span className="nav-logo-text">
            Sasha <span className="text-thin">Estética</span>
          </span>
        </Link>
      </div>

      <div className="nav-right">
        <Link to="/galeria" className="nav-link-galeria">
          📷 GALERÍA
        </Link>

        {!usuario ? (
          <Link to="/login" className="nav-btn login-btn">
            INICIAR SESIÓN
          </Link>
        ) : (
          <>
            <div className="nav-user-info d-none d-lg-flex">
              <span className="nav-saludo">
                {/* Ajustamos a 'nombres' que es como viene de tu DB */}
                Hola, <span>
                  {usuario.nombres?.split(" ")[0] || "Bella"}
                </span>{" "}
                ✨
              </span>
            </div>

            {/* Botón dinámico según Rol */}
            <Link
              to={
                usuario.rol === "admin" || usuario.rol === "admin"
                  ? "/admin"
                  : "/mis-turnos" // Ajustado a una ruta más común
              }
              className="nav-btn panel-btn"
            >
              {usuario.rol === "admin" || usuario.rol === "admin"
                ? "GESTIÓN"
                : "MIS TURNOS"}
            </Link>

            <button className="nav-btn logout-btn" onClick={handleLogout}>
              SALIR
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
