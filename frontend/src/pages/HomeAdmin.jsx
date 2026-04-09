import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomeAdmin.css";

const HomeAdmin = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header fade-in-down">
        <span className="admin-badge">ADMINISTRACIÓN CENTRAL</span>
        <h1 className="admin-welcome-title">
          HOLA,{" "}
          <span className="text-sasha-pink">{usuario?.nombres || "SASHA"}</span>
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
              <p>Perfiles del staff</p>
            </div>

            <div
              className="admin-card-btn"
              onClick={() => navigate("/admin/servicios")}
            >
              <div className="icon-wrap">💅</div>
              <h3>Servicios</h3>
              <p>Precios y tratamientos</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeAdmin;
