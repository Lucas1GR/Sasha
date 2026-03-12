import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import "./TurnosAdmin.css";

const TurnosAdmin = () => {
  const { usuario } = useAuth();

  const [todosLosTurnos, setTodosLosTurnos] = useState([]);
  const [listaClientes, setListaClientes] = useState([]);
  const [listaFichas, setListaFichas] = useState([]);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showModal, setShowModal] = useState(false);
  const [turnoEnProceso, setTurnoEnProceso] = useState({ hora: "", fecha: "" });

  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [fichaSeleccionada, setFichaSeleccionada] = useState("");

  const [esBloqueo, setEsBloqueo] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState("");

  // Horarios de la Estética (puedes ajustarlos aquí)
  const HORARIOS_LABORALES = [
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
  ];

  const cargarDatos = async () => {
  try {
    const [resTurnos, resClientes, resServicios] = await Promise.all([
      api.get("/turnos/agenda-completa"),
      api.get("/clientes"),
      api.get("/products"),
    ]);

    setTodosLosTurnos(resTurnos.data);
    setListaClientes(resClientes.data);
    setListaFichas(resServicios.data);
  } catch (error) {
    console.error("Error al cargar agenda:", error);
  }
};

  useEffect(() => {
    cargarDatos();
  }, []);

  const clickTurnoLibre = (hora) => {
    setTurnoEnProceso({ fecha: fechaSeleccionada, hora });
    setClienteSeleccionado("");
    setFichaSeleccionada("");
    setEsBloqueo(false);
    setMotivoBloqueo("");
    setShowModal(true);
  };

  const handleBloquearDia = async () => {
    const { value: motivo } = await Swal.fire({
      title: "Cerrar Agenda del Día",
      text: `Se bloquearán todos los horarios del ${new Date(fechaSeleccionada + "T00:00:00").toLocaleDateString()}.`,
      input: "text",
      inputLabel: "Razón del cierre",
      inputPlaceholder: "Ej: Capacitación, Feriado...",
      showCancelButton: true,
      confirmButtonColor: "#ad1457",
      confirmButtonText: "🔒 Bloquear Todo",
    });

    if (!motivo) return;

    const promesas = [];
    HORARIOS_LABORALES.forEach((hora) => {
      const ocupado = todosLosTurnos.find((t) => {
        const fechaTurno = t.fecha.split("T")[0];
        return fechaTurno === fechaSeleccionada && t.hora === hora;
      });

      if (!ocupado) {
        promesas.push(
          api.post("/turnos", {
            fecha: fechaSeleccionada + "T12:00:00",
            hora: hora,
            bloqueado: true,
            nombreCliente: motivo,
            mascota: null,
            dueno: usuario._id,
          }),
        );
      }
    });

    try {
      Swal.fire({
        title: "Actualizando agenda...",
        didOpen: () => Swal.showLoading(),
      });
      await Promise.all(promesas);
      await cargarDatos();
      Swal.fire({ title: "Día Cerrado", icon: "success" });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo bloquear el día",
        icon: "error",
      });
    }
  };

  const handleGuardar = async () => {
    if (esBloqueo && !motivoBloqueo.trim())
      return Swal.fire({ title: "Falta motivo", icon: "warning" });
    if (!esBloqueo && (!clienteSeleccionado || !fichaSeleccionada))
      return Swal.fire({
        title: "Faltan datos",
        text: "Selecciona clienta y servicio",
        icon: "warning",
      });

    try {
      const payload = {
        fecha: turnoEnProceso.fecha + "T12:00:00",
        hora: turnoEnProceso.hora,
        bloqueado: esBloqueo,
        nombreCliente: esBloqueo ? motivoBloqueo : null,
        servicio: esBloqueo ? null : fichaSeleccionada,
        cliente: esBloqueo ? usuario._id : clienteSeleccionado,
      };

      await api.post("/turnos", payload);
      Swal.fire({
        title: esBloqueo ? "Horario Bloqueado" : "Turno Confirmado",
        icon: "success",
        confirmButtonColor: "#ad1457",
      });
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Este horario ya fue tomado.",
        icon: "error",
      });
    }
  };

  const handleCancelarTurno = async (id) => {
    const result = await Swal.fire({
      title: "¿Cancelar este turno?",
      text: "Esta acción liberará el horario inmediatamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ad1457",
      confirmButtonText: "Sí, cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/turnos/cancelar/${id}`);
        cargarDatos();
        Swal.fire("Cancelado", "", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo cancelar", "error");
      }
    }
  };

  const turnosDelDia = HORARIOS_LABORALES.map((hora) => {
    return todosLosTurnos.find(
      (t) => t.fecha.split("T")[0] === fechaSeleccionada && t.hora === hora,
    );
  });

  return (
    <div className="admin-container fade-in">
      <div className="admin-header-flex">
        <div>
          <h2 className="admin-title-sasha">Agenda de Turnos</h2>
          <p className="admin-subtitle-sasha">
            Control diario de citas y bloqueos
          </p>
        </div>
        <Button
          variant="outline-danger"
          className="btn-sasha-outline"
          onClick={handleBloquearDia}
        >
          🔒 Cerrar Día Completo
        </Button>
      </div>

      <div className="filtros-agenda mb-4">
        <Form.Label className="fw-bold">Seleccionar Fecha:</Form.Label>
        <Form.Control
          type="date"
          className="input-sasha-date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
      </div>

      <div className="grilla-turnos-sasha">
        {HORARIOS_LABORALES.map((hora, index) => {
          const turno = turnosDelDia[index];
          return (
            <div
              key={hora}
              className={`turno-card-sasha ${!turno ? "libre" : turno.bloqueado ? "bloqueado" : "ocupado"}`}
              onClick={!turno ? () => clickTurnoLibre(hora) : null}
            >
              <div className="hora-label">{hora}:00 hs</div>
              <div className="content-label">
                {!turno ? (
                  <span className="text-muted">+ Disponible</span>
                ) : turno.bloqueado ? (
                  <span className="text-danger">⛔ {turno.nombreCliente}</span>
                ) : (
                  <>
                    <div className="client-name">
                      {turno.cliente?.nombres} {turno.cliente?.apellidos}
                    </div>
                    <div className="service-name">{turno.servicio?.name}</div>
                    <button
                      className="btn-cancel-mini"
                      onClick={() => handleCancelarTurno(turno._id)}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Gestión */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="sasha-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Agendar {turnoEnProceso.hora}:00 hs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Check
            type="switch"
            label="Bloquear horario (No disponible)"
            checked={esBloqueo}
            onChange={(e) => setEsBloqueo(e.target.checked)}
            className="mb-4 fw-bold text-pink"
          />
          {esBloqueo ? (
            <Form.Group>
              <Form.Label>Motivo</Form.Label>
              <Form.Control
                placeholder="Ej: Almuerzo, Trámite"
                value={motivoBloqueo}
                onChange={(e) => setMotivoBloqueo(e.target.value)}
              />
            </Form.Group>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Clienta</Form.Label>
                <Form.Select
                  value={clienteSeleccionado}
                  onChange={(e) => setClienteSeleccionado(e.target.value)}
                >
                  <option value="">-- Seleccionar --</option>
                  {listaClientes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.apellidos}, {c.nombres}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Servicio / Ficha</Form.Label>
                <Form.Select
                  value={fichaSeleccionada}
                  onChange={(e) => setFichaSeleccionada(e.target.value)}
                  disabled={!clienteSeleccionado}
                >
                  <option value="">-- Seleccionar --</option>
                  {listaFichas.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button className="btn-save-sasha" onClick={handleGuardar}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TurnosAdmin;
