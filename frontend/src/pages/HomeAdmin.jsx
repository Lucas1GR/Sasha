import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomeAdmin.css";

const HomeAdmin = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header fade-in-down">
        <span className="admin-badge">ADMINISTRACIÓN CENTRAL</span>
        <h1 className="admin-welcome-title">
          HOLA,{" "}
          <span className="text-sasha-pink">{usuario?.nombre || "SASHA"}</span>
        </h1>
        <p className="admin-instruction">
          ¿Qué aspecto del salón vamos a coordinar hoy?
        </p>
      </div>

      <div className="admin-grid-menu fade-in-up">
        <div
          className="admin-card-btn"
          onClick={() => navigate("/admin/clientes")}
        >
          <div className="icon-wrap">👥</div>
          <h3>Clientes</h3>
          <p>Base de datos y perfiles</p>
        </div>

        <div
          className="admin-card-btn"
          onClick={() => navigate("/admin/turnos")}
        >
          <div className="icon-wrap">📅</div>
          <h3>Agenda</h3>
          <p>Control de turnos diarios</p>
        </div>
        {usuario?.rol === "admin" && (
          <>
            <div
              className="admin-card-btn"
              onClick={() => navigate("/admin/staff")}
            >
              <div className="icon-wrap">💄</div>
              <h3>Staff</h3>
              <p>Gestión de equipo y servicios</p>
            </div>

            <div
              className="admin-card-btn"
              onClick={() => navigate("/admin/servicios")}
            >
              <div className="icon-wrap">💅</div>
              <h3>Servicios</h3>
              <p>Precios y tratamientos</p>
            </div>

            <div
              className="admin-card-btn"
              onClick={() => navigate("/admin/galeria")}
            >
              <div className="icon-wrap">✨</div>
              <h3>Portfolio</h3>
              <p>Actualizar fotos de trabajos</p>
            </div>
          </>
        )}
      </div>

      <div className="logout-section mt-5">
        <button className="btn-logout-sasha" onClick={handleLogout}>
          Cerrar Sesión Administrativa
        </button>
      </div>
    </div>
  );
};

export default HomeAdmin;
