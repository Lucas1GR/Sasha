import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";
import Swal from "sweetalert2";
import "./Turnos.css";
import { useLocation } from "react-router-dom";
import api from "../api/axios";

const Turnos = () => {
  const { usuario } = useAuth();
  const location = useLocation();

  const [turnos, setTurnos] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [fechasBloqueadas, setFechasBloqueadas] = useState([]);

  const [form, setForm] = useState({
    servicio: "",
    fecha: "",
    hora: "",
  });

  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // 🔥 ESTE ES EL FIX IMPORTANTE
  useEffect(() => {
    if (location.state?.servicioId) {
      setIsModalOpen(true);
      setForm((prev) => ({
        ...prev,
        servicio: location.state.servicioId,
      }));
    }
  }, [location.state]);

  const fetchServicios = async () => {
    try {
      const res = await api.get("/products");
      setServicios(res.data);
    } catch (err) {
      console.error("Error cargando servicios:", err);
    }
  };

  const fetchTurnos = async () => {
  try {
    const res = await api.get("/turnos/mis-turnos");

    const ordenados = res.data.sort((a, b) => {
      const fechaA = new Date(a.fecha);
      fechaA.setHours(parseInt(a.hora), 0, 0, 0);

      const fechaB = new Date(b.fecha);
      fechaB.setHours(parseInt(b.hora), 0, 0, 0);

      return fechaA - fechaB;
    });

    setTurnos(ordenados);
  } catch (err) {
    console.error("Error cargando turnos:", err);
  }
};

  const fetchFechasBloqueadas = async () => {
    try {
      const res = await api.get("/turnos/feriados");
      setFechasBloqueadas(res.data.feriados || []);
    } catch (err) {
      console.error("Error cargando fechas bloqueadas:", err);
    }
  };

  useEffect(() => {
    if (usuario?._id) {
      fetchTurnos();
      fetchServicios();
      fetchFechasBloqueadas();
    }
  }, [usuario]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "fecha") {
      setForm((prev) => ({ ...prev, hora: "" }));

      try {
        const res = await api.get(`/turnos/disponibles?fecha=${value}`);

        if (!res.data || res.data.length === 0) {
  setIsModalOpen(false); // 👈 CERRÁS EL MODAL

  Swal.fire({
    title: "Día no disponible",
    text: "Este día está cerrado o sin turnos 💔",
    icon: "warning",
    confirmButtonColor: "#ad1457",
  });

  setForm((prev) => ({ ...prev, fecha: "", hora: "" }));
  setHorasDisponibles([]);
  return;
}

        setHorasDisponibles(res.data);
      } catch (err) {
        console.error("Error cargando horarios:", err);

        Swal.fire({
          title: "Error",
          text: "No se pudieron cargar los horarios",
          icon: "error",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.servicio || !form.fecha || !form.hora) {
      setIsModalOpen(false);

      return Swal.fire({
        title: "Faltan datos",
        text: "Por favor completá todos los campos 😊",
        icon: "warning",
        confirmButtonColor: "#ad1457",
      });
    }

    try {
      await api.post("/turnos", form);

      Swal.fire({
        title: "¡Turno Reservado!",
        text: "Te esperamos para brillar",
        icon: "success",
        confirmButtonColor: "#ad1457",
      });

      setForm({ servicio: "", fecha: "", hora: "" });
      setIsModalOpen(false);
      fetchTurnos();
    } catch (err) {
      console.error(err);

      setIsModalOpen(false);

      Swal.fire({
        title: "Horario no disponible",
        text: "Ese turno ya no está disponible o el día está cerrado 💔",
        icon: "error",
        confirmButtonColor: "#ad1457",
      });
    }
  };

  const cancelarTurno = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: "¿Cancelar turno?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Sí, cancelar",
      });

      if (!confirm.isConfirmed) return;

      await api.patch(`/turnos/cancelar/${id}`);

      Swal.fire("Cancelado", "Tu turno fue cancelado", "success");

      fetchTurnos();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cancelar el turno", "error");
    }
  };

  const puedeCancelar = (fecha, hora) => {
    const turnoFecha = new Date(fecha);
    turnoFecha.setHours(parseInt(hora), 0, 0, 0);

    const ahora = new Date();
    const diffHoras = (turnoFecha - ahora) / (1000 * 60 * 60);

    return diffHoras > 24;
  };
  const ahora = new Date();

  const turnosFuturos = turnos.filter((t) => {
    const fecha = new Date(t.fecha);
    fecha.setHours(parseInt(t.hora), 0, 0, 0);
    return fecha >= ahora;
  });

  const turnosPasados = turnos.filter((t) => {
    const fecha = new Date(t.fecha);
    fecha.setHours(parseInt(t.hora), 0, 0, 0);
    return fecha < ahora;
  });
  
  return (
    <div className="turnos-page">
      <div className="turnos-overlay">
        <div className="turnos-container fade-in">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="turnos-title">Mis Turnos</h2>
              <p className="turnos-subtitle">
                Gestiona tus citas y reserva nuevos momentos para vos
              </p>
            </div>

            <button
              className="btn-sasha-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Nueva Reserva
            </button>
          </div>

          {/* PRÓXIMOS TURNOS */}
          <h4 style={{ color: "white", marginBottom: "10px" }}>
            Próximos turnos
          </h4>

          <div className="agenda-container">
            {turnosFuturos.length === 0 ? (
              <p className="empty-text">No tenés turnos próximos</p>
            ) : (
              turnosFuturos.map((t) => {
                const fechaFormateada = new Date(t.fecha).toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });

                return (
                  <div key={t._id} className="agenda-item">
                    <div className="agenda-fecha">{fechaFormateada}</div>

                    <div className="agenda-info">
                      <div className="agenda-header">
                        <span className="agenda-servicio">
                          {t.servicio?.name || "Servicio"}
                        </span>
                        <span className="agenda-hora">{t.hora}:00 hs</span>
                      </div>

                      <div className="agenda-body">
                        👩‍⚕️ {t.profesional?.nombres} {t.profesional?.apellidos}
                      </div>
                    </div>

                    <div className="agenda-acciones">
                      {puedeCancelar(t.fecha, t.hora) ? (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => cancelarTurno(t._id)}
                        >
                          Cancelar
                        </button>
                      ) : (
                        <small className="text-muted">
                          No se puede cancelar (menos de 24hs)
                        </small>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* HISTORIAL (COLAPSABLE) */}
          <div style={{ marginTop: "30px" }}>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
            >
              {mostrarHistorial ? "Ocultar historial ▲" : "Ver historial ▼"}
            </button>

            {mostrarHistorial && (
              <div className="agenda-container mt-3">
                {turnosPasados.length === 0 ? (
                  <p className="empty-text">Sin historial</p>
                ) : (
                  turnosPasados.map((t) => {
                    const fechaFormateada = new Date(t.fecha).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });

                    return (
                      <div key={t._id} className="agenda-item" style={{ opacity: 0.6 }}>
                        <div className="agenda-fecha">{fechaFormateada}</div>

                        <div className="agenda-info">
                          <div className="agenda-header">
                            <span>{t.servicio?.name}</span>
                            <span>{t.hora}:00 hs</span>
                          </div>

                          <div className="agenda-body">
                            👩‍⚕️ {t.profesional?.nombres} {t.profesional?.apellidos}
                          </div>
                        </div>

                        <div className="agenda-acciones">
                          <small>Finalizado</small>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* MODAL */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSubmit}
            title="Reservar Momento Sasha"
          >
            <div className="mb-3">
              <label className="modal-label">¿Qué servicio deseas?</label>
              <select
                name="servicio"
                className="modal-input"
                value={form.servicio}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                {servicios.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="modal-label">Fecha</label>
              <input
                type="date"
                name="fecha"
                className="modal-input"
                value={form.fecha}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="modal-label">Horario</label>
              <select
                name="hora"
                className="modal-input"
                value={form.hora}
                onChange={handleChange}
                disabled={!form.fecha}
              >
                <option value="">Seleccionar horario</option>
                {horasDisponibles.map((h) => (
                  <option key={h} value={h}>
                    {h}:00 hs
                  </option>
                ))}
              </select>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Turnos;
