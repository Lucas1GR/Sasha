import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";
import Swal from "sweetalert2";
import "./Turnos.css";

const Turnos = () => {
  const { usuario } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicios, setServicios] = useState([]);

  const [form, setForm] = useState({
    servicio: "",
    fecha: "",
    hora: "",
  });

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
      setTurnos(res.data);
    } catch (err) {
      console.error("Error cargando turnos:", err);
    }
  };

  const fetchDisponibles = async (fecha) => {
    if (!fecha) return;
    try {
      const res = await api.get(`/turnos/disponibles?fecha=${fecha}`);
      setHorasDisponibles(res.data);
    } catch (err) {
      console.error("Error cargando horarios:", err);
    }
  };

  useEffect(() => {
    if (usuario?._id) {
      fetchTurnos();
      fetchServicios();
    }
  }, [usuario]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "fecha") fetchDisponibles(e.target.value);
  };

  const handleSubmit = async () => {
    if (!form.servicio || !form.fecha || !form.hora) {
      return Swal.fire("Atención", "Completa todos los datos", "warning");
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
      console.error(err); // Esto quita el subrayado rojo
      Swal.fire("Error", "No se pudo agendar el turno", "error");
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

          {/* LISTA */}
          <div className="row">
            {turnos.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="empty-text">Aún no tenés turnos agendados 💖</p>
              </div>
            ) : (
              turnos.map((t) => (
                <div key={t._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="turno-card">
                    <div className="turno-header">
                      <span className="turno-servicio">
                        {t.servicio?.name || "Servicio General"}
                      </span>

                      <span className="turno-hora">{t.hora}:00</span>
                    </div>

                    <div className="turno-body">
                      <p>
                        📅{" "}
                        {new Date(t.fecha).toLocaleDateString("es-AR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>

                      <p>
                        👩‍⚕️ {t.profesional?.nombres} {t.profesional?.apellidos}
                      </p>

                      {t.bloqueado && (
                        <p className="turno-bloqueado">⛔ {t.motivo}</p>
                      )}
                    </div>

                    {/*BOTÓN CANCELAR */}
                    <div className="mt-2 text-end">
                      {puedeCancelar(t.fecha, t.hora) ? (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => cancelarTurno(t._id)}
                        >
                          Cancelar turno
                        </button>
                      ) : (
                        <small className="text-muted">
                          No se puede cancelar (menos de 24hs)
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              ))
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
