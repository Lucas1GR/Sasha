import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./HomeUsuario.css";

const HomeUsuario = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [servicios, setServicios] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const cargarDatos = async () => {
    try {
      const [resServicios, resTurnos] = await Promise.all([
        api.get("/products"), // servicios del backend
        api.get("/turnos/mis-turnos"), // turnos de la clienta logueada
      ]);

      setServicios(resServicios.data);
      setTurnos(resTurnos.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario]);

  return (
    <div className="user-container">
      {/* HEADER */}
      <div className="user-welcome-header mb-5">
        <span className="user-badge">CLIENTA</span>
        <h1 className="user-title">Hola, {usuario?.nombres}</h1>
        <p>Elegí un servicio y agenda tu turno.</p>
      </div>

      {/* SERVICIOS */}
      <h3 className="section-title-sasha mb-4">✨ Servicios disponibles</h3>

      <div className="row mb-5">
        {servicios.map((servicio) => (
          <div key={servicio._id} className="col-md-6 col-lg-4 mb-4">
            <div className="sasha-card-beauty">
              <h4 className="service-name">{servicio.nombre}</h4>

              <p className="small text-muted">
                {servicio.categoria || "Estética"}
              </p>

              <p className="service-description">
                {servicio.descripcion || "Sin descripción"}
              </p>

              <div className="d-flex justify-content-between mt-3">
                <span className="price-sasha">${servicio.precio}</span>

                <button
                  className="btn-turno-sasha"
                  onClick={() => navigate(`/agendar/${servicio._id}`)}
                >
                  📅 Agendar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TURNOS */}
      <h3 className="section-title-sasha mb-4">📅 Mis próximos turnos</h3>

      <div className="row">
        {turnos.length === 0 ? (
          <p>No tenés turnos agendados todavía.</p>
        ) : (
          turnos.map((turno) => (
            <div key={turno._id} className="col-md-6 col-lg-4 mb-4">
              <div className="sasha-card-beauty">
                <h4>{turno.servicio?.nombre}</h4>
                <p>Fecha: {new Date(turno.fecha).toLocaleDateString()}</p>
                <p>Hora: {turno.hora}:00</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeUsuario;
