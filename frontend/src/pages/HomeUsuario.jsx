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
        api.get("/products"), // 👈 verificar después si esto es correcto
        api.get("/turnos/mis-turnos"),
      ]);

      console.log("SERVICIOS:", resServicios.data); // 👈 para debug
      console.log("TURNOS:", resTurnos.data);

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
      <h3 className="section-title-sasha mb-4"> Servicios disponibles</h3>

      <div className="row mb-5">
        {servicios.map((servicio) => (
          <div key={servicio._id} className="col-md-6 col-lg-4 mb-4">
            <div className="sasha-card-beauty">
              {/* 👇 IMAGEN (si existe) */}
              {servicio.image && (
                <img
                  src={servicio.image}
                  alt={servicio.name}
                  className="img-fluid mb-2"
                />
              )}

              {/* 👇 ACÁ ESTABA EL ERROR */}
              <h4 className="service-name">{servicio.name}</h4>

              <p className="small text-muted">
                {servicio.category || "Estética"}
              </p>

              <p className="service-description">
                {servicio.description || "Sin descripción"}
              </p>

              <div className="d-flex justify-content-between mt-3">
                <span className="price-sasha">${servicio.price}</span>

                <button
                  className="btn-turno-sasha"
                  onClick={() =>
                    navigate("/usuario/mis-turnos", {
                      state: {
                        servicioId: servicio._id,
                        servicioNombre: servicio.name,
                      },
                    })
                  }
                >
                  📅 Agendar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TURNOS */}
      <h3 className="section-title-sasha mb-4">Mis próximos turnos</h3>

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
                <p>
                  Profesional: {turno.profesional?.nombres}{" "}
                  {turno.profesional?.apellidos}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeUsuario;
