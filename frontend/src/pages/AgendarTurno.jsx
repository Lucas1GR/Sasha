import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import "./AgendarTurno.css";

const AgendarTurno = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  // Feriados 2026
  const feriadosBackend = [
    "01-01-2026",
    "16-02-2026",
    "17-02-2026",
    "24-03-2026",
    "02-04-2026",
    "01-05-2026",
    "25-05-2026",
    "20-06-2026",
    "09-07-2026",
    "17-08-2026",
    "12-10-2026",
    "20-11-2026",
    "08-12-2026",
    "25-12-2026",
  ];

  const feriadosBloqueados = feriadosBackend.map((f) => {
    const [dd, mm, yyyy] = f.split("-");
    return `${yyyy}-${mm}-${dd}`;
  });

  // 🔥 TRAER SERVICIOS
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await api.get("/products"); // 👈 endpoint real del backend
        setServicios(res.data);
      } catch (error) {
        console.error("Error al cargar servicios", error);
      }
    };
    fetchServicios();
  }, []);

  // VALIDACIÓN DE FECHA
  const handleFechaChange = (e) => {
    const fechaInput = e.target.value;
    if (!fechaInput) {
      setFecha("");
      return;
    }

    const diaSeleccionado = new Date(fechaInput + "T00:00:00");
    const esDomingo = diaSeleccionado.getDay() === 0;
    const esFeriado = feriadosBloqueados.includes(fechaInput);

    if (esDomingo) {
      Swal.fire({
        title: "Día de Descanso",
        text: "Los domingos el salón permanece cerrado.",
        icon: "info",
        confirmButtonColor: "#ad1457",
      });
      setFecha("");
      return;
    }

    if (esFeriado) {
      Swal.fire({
        title: "Día Festivo",
        text: "Estética Sasha permanece cerrado por feriado.",
        icon: "warning",
        confirmButtonColor: "#ad1457",
      });
      setFecha("");
      return;
    }

    setFecha(fechaInput);
    setHora("");
  };

  // 🔥 CONSULTAR HORAS DISPONIBLES
  useEffect(() => {
    const consultarHoras = async () => {
      if (!fecha) {
        setHorasDisponibles([]);
        return;
      }

      setCargandoHoras(true);

      try {
        const [yyyy, mm, dd] = fecha.split("-");
        const res = await api.get(
          `/turnos/disponibles?fecha=${dd}-${mm}-${yyyy}`,
        );
        setHorasDisponibles(res.data);
      } catch {
        setHorasDisponibles([]);
      } finally {
        setCargandoHoras(false);
      }
    };

    consultarHoras();
  }, [fecha]);

  // 🔥 RESERVAR TURNO
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!servicioSeleccionado || !fecha || !hora) {
      return Swal.fire({
        title: "Atención",
        text: "Completa todos los campos.",
        icon: "warning",
        confirmButtonColor: "#ad1457",
      });
    }

    try {
      await api.post("/turnos", {
        fecha,
        hora,
        servicio: servicioSeleccionado,
        // 👇 cliente NO se manda más
        // el backend lo toma del token automáticamente
      });

      await Swal.fire({
        title: "¡Reserva Confirmada!",
        text: "Tu cita fue agendada correctamente.",
        icon: "success",
        confirmButtonColor: "#ad1457",
      });

      navigate("/usuario");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.mensaje || "No se pudo agendar",
        icon: "error",
      });
    }
  };

  return (
    <div className="agendar-page">
      <div className="agendar-container">
        <div className="agendar-header">
          <span className="flower-icon">🌸</span>
          <h2 className="agendar-title">Reserva tu Cita</h2>
          <p className="agendar-subtitle">
            Elegí el tratamiento ideal para vos
          </p>
        </div>

        {!usuario ? (
          <p className="error-sesion">Iniciá sesión para reservar.</p>
        ) : (
          <form onSubmit={handleSubmit} className="agendar-form">
            <div className="form-group">
              <label className="agendar-label">Tratamiento</label>
              <select
                className="agendar-select"
                value={servicioSeleccionado}
                onChange={(e) => setServicioSeleccionado(e.target.value)}
                required
              >
                <option value="">Selecciona un servicio</option>
                {servicios.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.nombre} — {s.duracion || 60} min
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="agendar-label">Fecha</label>
              <input
                type="date"
                className="agendar-input"
                value={fecha}
                min={new Date().toISOString().split("T")[0]}
                onChange={handleFechaChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="agendar-label">Horario</label>

              {cargandoHoras ? (
                <div className="loading-spinner">
                  Buscando disponibilidad...
                </div>
              ) : (
                <select
                  className="agendar-select"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                  disabled={!fecha || horasDisponibles.length === 0}
                >
                  <option value="">
                    {!fecha
                      ? "Primero elige una fecha"
                      : horasDisponibles.length === 0
                        ? "Sin disponibilidad"
                        : "Selecciona horario"}
                  </option>

                  {horasDisponibles.map((h) => (
                    <option key={h} value={h}>
                      {h}:00 hs
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button type="submit" className="btn-confirmar-sasha">
              CONFIRMAR RESERVA
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AgendarTurno;
