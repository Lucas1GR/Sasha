import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";
import Swal from "sweetalert2";

const Turnos = () => {
  const { usuario } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    servicio: "",
    fecha: "",
    hora: "",
  });

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
      const [yyyy, mm, dd] = fecha.split("-");
      const res = await api.get(
        `/turnos/disponibles?fecha=${dd}-${mm}-${yyyy}`,
      );
      setHorasDisponibles(res.data);
    } catch (err) {
      console.error("Error cargando horarios:", err);
    }
  };

  useEffect(() => {
    if (usuario?._id) fetchTurnos();
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

  return (
    <div className="admin-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="admin-title-sasha">Mis Turnos</h2>
          <p className="text-muted">
            Gestiona tus citas y reserva nuevos momentos para vos
          </p>
        </div>
        <button className="btn-save-sasha" onClick={() => setIsModalOpen(true)}>
          ✨ Nueva Reserva
        </button>
      </div>

      {/* LISTA DE TURNOS */}
      <div className="row">
        {turnos.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-muted">Aún no tenés turnos agendados.</p>
          </div>
        ) : (
          turnos.map((t) => (
            <div key={t._id} className="col-md-6 col-lg-4 mb-3">
              <div className="sasha-card p-3 shadow-sm border-0 h-100">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold text-pink">
                    {t.servicio || "Servicio General"}
                  </span>
                  <span className="badge rounded-pill bg-light text-dark">
                    {t.hora}:00 hs
                  </span>
                </div>
                <hr className="my-2 opacity-25" />
                <div className="small text-muted">
                  <p className="mb-1">
                    📅{" "}
                    {new Date(t.fecha).toLocaleDateString("es-AR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {t.bloqueado && (
                    <p className="text-danger mb-0">⛔ Bloqueado: {t.motivo}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE RESERVA (Usando tu componente Modal) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSubmit}
        title="Reservar Momento Sasha"
      >
        <div className="mb-3">
          <label className="form-label small fw-bold">
            ¿Qué servicio deseas?
          </label>
          <select
            name="servicio"
            className="form-select"
            value={form.servicio}
            onChange={handleChange}
          >
            <option value="">Seleccionar...</option>
            <option value="Uñas Esculpidas">Uñas Esculpidas</option>
            <option value="Perfilado de Cejas">Perfilado de Cejas</option>
            <option value="Masajes Relajantes">Masajes Relajantes</option>
            <option value="Limpieza Facial">Limpieza Facial</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold">Fecha</label>
          <input
            type="date"
            name="fecha"
            className="form-control"
            value={form.fecha}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold">Horario Disponible</label>
          <select
            name="hora"
            className="form-select"
            value={form.hora}
            onChange={handleChange}
            disabled={!form.fecha}
          >
            <option value="">Seleccionar Horario</option>
            {horasDisponibles.map((h) => (
              <option key={h} value={h}>
                {h}:00 hs
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default Turnos;
