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
  const [menuOpen, setMenuOpen] = useState(false);

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
           src="/Sasha/SB-logo.png"
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
      <div className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>      
      <div className={`nav-right ${menuOpen ? "open" : ""}`}>
        {!usuario ? (
          <Link 
            to="/login" 
            className="nav-btn login-btn"
            onClick={() => setMenuOpen(false)}
          >
            INICIAR SESIÓN
          </Link>
        ) : (
          <>
            <div className="nav-user-info d-none d-lg-flex">
              <span className="nav-saludo">
                Hola, <span>
                  {usuario.nombres?.split(" ")[0] || "Bella"}
                </span>{" "}
                🌸
              </span>
            </div>

            {/* 🟣 1. SERVICIOS */}
            <Link
              to={
                usuario.rol === "admin" || usuario.rol === "profesional"
                  ? "/admin"
                  : "/usuario"
              }
              className="nav-btn panel-btn"
              onClick={() => setMenuOpen(false)}
            >
              {usuario.rol === "admin" || usuario.rol === "profesional"
                ? "GESTIÓN"
                : "SERVICIOS"}
            </Link>

            {/* 🟣 2. MIS TURNOS (solo usuario) */}
            {usuario.rol === "usuario" && (
              <Link 
                to="/usuario/mis-turnos" 
                className="nav-btn panel-btn"
                onClick={() => setMenuOpen(false)}
              >
                MIS TURNOS
              </Link>
            )}

            {/* 🟣 3. MI PERFIL */}
            <Link
              to={
                usuario.rol === "admin" || usuario.rol === "profesional"
                  ? "/admin/perfil"
                  : "/usuario/perfil"
              }
              className="nav-btn panel-btn"
              onClick={() => setMenuOpen(false)}
            >
              MI PERFIL
            </Link>

            {/* 🟣 4. NOSOTROS */}
            {usuario.rol === "usuario" && (
              <Link 
                to="/galeria" 
                className="nav-link-galeria"
                onClick={() => setMenuOpen(false)}
              >
                NOSOTROS
              </Link>
            )}

            {/* 🟣 5. SALIR */}
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
