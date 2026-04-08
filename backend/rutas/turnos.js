const express = require("express");
const router = express.Router();
const Turno = require("../modelos/turno");
const Usuario = require("../modelos/usuario");
const Servicio = require("../modelos/servicios");
const autenticarToken = require("../middlewares/autorizaciones");

// Feriados actualizados a 2026
const diasFeriados = [
  "2026-01-01",
  "2026-03-24",
  "2026-04-02",
  "2026-05-01",
  "2026-05-25",
  "2026-07-09",
  "2026-12-25",
];

const formatearFechaString = (dateObj) => {
  const dd = String(dateObj.getUTCDate()).padStart(2, "0");
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = dateObj.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const getTiempoArgentina = () => {
  const now = new Date();
  const offsetArgentina = -3;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const fechaArg = new Date(utc + 3600000 * offsetArgentina);
  return {
    fechaString: `${fechaArg.getFullYear()}-${String(
      fechaArg.getMonth() + 1,
    ).padStart(2, "0")}-${String(fechaArg.getDate()).padStart(2, "0")}`,
    hora: fechaArg.getHours(),
  };
};

router.get("/feriados", (req, res) => res.json({ feriados: diasFeriados }));

// 1. Disponibles (Sigue igual, solo cambiamos el nombre de la lógica interna)
router.get("/disponibles", async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ mensaje: "Fecha requerida" });
    }

    if (diasFeriados.includes(fecha)) {
      return res.json([]);
    }

    const fechaObj = new Date(fecha);

    const fechaBusqueda = new Date(
      Date.UTC(
        fechaObj.getFullYear(),
        fechaObj.getMonth(),
        fechaObj.getDate(),
        12,
        0,
        0,
      ),
    );

    if (fechaBusqueda.getUTCDay() === 0) {
      return res.json([]);
    }

    const horarios = [
      "09",
      "10",
      "11",
      "12",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
    ];

    // buscar profesionales
    const profesionales = await Usuario.find({
      rol: { $in: ["admin", "profesional"] },
    });

    const totalProfesionales = profesionales.length;

    // turnos del día
    const turnosDelDia = await Turno.find({
      fecha: fechaBusqueda,
      estado: { $ne: "cancelado" },
    });

    let disponibles = [];

    for (const hora of horarios) {
      const turnosEnHora = turnosDelDia.filter((t) => t.hora === hora);

      const hayBloqueo = turnosEnHora.some((t) => t.bloqueado);

      if (hayBloqueo) {
        continue; // no mostrar ese horario
      }

      if (turnosEnHora.length < totalProfesionales) {
        disponibles.push(hora);
      }
    }

    const tiempoArg = getTiempoArgentina();

    if (fecha === tiempoArg.fechaString) {
      disponibles = disponibles.filter(
        (h) => parseInt(h, 10) >= tiempoArg.hora + 3,
      );
    }

    res.json(disponibles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error" });
  }
});

// 2. Crear Turno (Aquí hicimos el cambio a 'servicio' y 'cliente')
router.post("/", autenticarToken, async (req, res) => {
  try {
    let { fecha, hora, servicio, cliente, bloqueado, nombreClienteManual } =
      req.body;
    const { rol, id: usuarioId } = req.usuario;

    if (rol === "usuario") {
      cliente = usuarioId;
      bloqueado = false;
      if (!servicio)
        return res.status(400).json({ mensaje: "Selecciona un tratamiento" });
    }
    // buscar servicio para conocer duración
    let duracionServicio = 60;

    if (servicio) {
      const servicioDB = await Servicio.findById(servicio);
      if (servicioDB) {
        duracionServicio = servicioDB.duration;
      }
    }

    const fechaObj = new Date(fecha);

    const fechaGuardar = new Date(
      Date.UTC(
        fechaObj.getUTCFullYear(),
        fechaObj.getUTCMonth(),
        fechaObj.getUTCDate(),
        12,
        0,
        0,
      ),
    );

    // buscar profesionales (admin y profesional)
    const profesionales = await Usuario.find({
      rol: { $in: ["admin", "profesional"] },
    });

    // turnos ocupados en ese horario
    const ocupados = await Turno.find({
      fecha: fechaGuardar,
      hora: hora,
      estado: { $ne: "cancelado" },
    });

    // ids de profesionales ocupados
    const profesionalesOcupados = ocupados.map((t) =>
      t.profesional?.toString(),
    );

    // buscar profesional libre
    const profesionalDisponible = profesionales.find(
      (p) => !profesionalesOcupados.includes(p._id.toString()),
    );
    console.log("PROFESIONAL ELEGIDO:", profesionalDisponible);
    if (!profesionalDisponible) {
      return res
        .status(409)
        .json({ mensaje: "No hay profesionales disponibles." });
    }

    const nuevoTurno = new Turno({
      fecha: fechaGuardar,
      hora,
      servicio: bloqueado ? null : servicio,
      cliente: cliente,
      profesional: profesionalDisponible._id,
      bloqueado: bloqueado || false,
      nombreClienteManual: nombreClienteManual || null,
    });

    await nuevoTurno.save();

    // si el servicio dura más de 60 minutos, bloqueamos la siguiente hora
    if (duracionServicio > 60 && parseInt(hora, 10) < 19) {
      const horaNumero = parseInt(hora, 10);

      const siguienteHora = String(horaNumero + 1).padStart(2, "0");

      const turnoBloqueo = new Turno({
        fecha: fechaGuardar,
        hora: siguienteHora,
        servicio: null,
        cliente: null,
        profesional: profesionalDisponible._id,
        bloqueado: true,
      });

      await turnoBloqueo.save();
    }
    res.status(201).json(nuevoTurno);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al reservar" });
  }
});

// 3. Mis Turnos (Para la clienta)
router.get("/mis-turnos", autenticarToken, async (req, res) => {
  try {
    const turnos = await Turno.find({
      cliente: req.usuario.id,
      estado: { $ne: "cancelado" },
    })
      .populate("servicio", "name price")
      .populate("profesional", "nombres apellidos")
      .sort({ fecha: -1 });
    res.json(turnos);
  } catch (error) {
    console.error("ERROR CREANDO TURNO:", error);
    res.status(500).json({ mensaje: "Error al reservar" });
  }
});

// 4. Cancelar turno (soft cancel)
router.patch("/cancelar/:id", autenticarToken, async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id);

    if (!turno) {
      return res.status(404).json({ mensaje: "Turno no encontrado" });
    }

    // Solo el cliente dueño del turno o un admin puede cancelarlo
    if (req.usuario.rol === "usuario") {
      if (turno.cliente?.toString() !== req.usuario.id?.toString()) {
        return res
          .status(403)
          .json({ mensaje: "No autorizado para cancelar este turno" });
      }
    }

    turno.estado = "cancelado";
    await turno.save();

    res.json({ mensaje: "Turno cancelado correctamente" });
  } catch (error) {
    console.error("ERROR CANCELANDO TURNO:", error);
    res.status(500).json({ mensaje: "Error al cancelar turno" });
  }
});

// 5. Bloquear horario manualmente (admin)
router.post("/bloquear", autenticarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res
        .status(403)
        .json({ mensaje: "Solo el admin puede bloquear horarios" });
    }

    const { fecha, hora, profesionalId } = req.body;

    if (!fecha || !hora || !profesionalId) {
      return res
        .status(400)
        .json({ mensaje: "Faltan datos para bloquear horario" });
    }

    const fechaObj = new Date(fecha);

    const fechaGuardar = new Date(
      Date.UTC(
        fechaObj.getUTCFullYear(),
        fechaObj.getUTCMonth(),
        fechaObj.getUTCDate(),
        12,
        0,
        0,
      ),
    );

    const turnoExistente = await Turno.findOne({
      fecha: fechaGuardar,
      hora,
      profesional: profesionalId,
      estado: { $ne: "cancelado" },
    });

    if (turnoExistente) {
      return res.status(409).json({ mensaje: "Ese horario ya está ocupado" });
    }

    const bloqueo = new Turno({
      fecha: fechaGuardar,
      hora,
      servicio: null,
      cliente: null,
      profesional: profesionalId,
      bloqueado: true,
    });

    await bloqueo.save();

    res.json({ mensaje: "Horario bloqueado correctamente" });
  } catch (error) {
    console.error("ERROR BLOQUEANDO HORARIO:", error);
    res.status(500).json({ mensaje: "Error al bloquear horario" });
  }
});
// 🔓 DESBLOQUEAR HORARIO (admin)
router.delete("/desbloquear", autenticarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res
        .status(403)
        .json({ mensaje: "Solo el admin puede desbloquear horarios" });
    }

    const { fecha, hora, profesionalId } = req.body;

    if (!fecha || !hora || !profesionalId) {
      return res.status(400).json({ mensaje: "Faltan datos para desbloquear" });
    }

    const fechaObj = new Date(fecha);

    const fechaBuscar = new Date(
      Date.UTC(
        fechaObj.getUTCFullYear(),
        fechaObj.getUTCMonth(),
        fechaObj.getUTCDate(),
        12,
        0,
        0,
      ),
    );

    const turno = await Turno.findOne({
      fecha: fechaBuscar,
      hora,
      profesional: profesionalId,
      bloqueado: true,
    });

    if (!turno) {
      return res.status(404).json({ mensaje: "No hay bloqueo en ese horario" });
    }

    await turno.deleteOne();

    res.json({ mensaje: "Horario desbloqueado correctamente" });
  } catch (error) {
    console.error("ERROR DESBLOQUEANDO:", error);
    res.status(500).json({ mensaje: "Error al desbloquear" });
  }
});
// 🔓 DESBLOQUEAR DÍA COMPLETO (admin)
router.delete("/desbloquear-dia", autenticarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res
        .status(403)
        .json({ mensaje: "Solo el admin puede desbloquear el día" });
    }

    const { fecha } = req.body;

    if (!fecha) {
      return res.status(400).json({ mensaje: "Fecha requerida" });
    }

    const fechaObj = new Date(fecha);

    const fechaBuscar = new Date(
      Date.UTC(
        fechaObj.getUTCFullYear(),
        fechaObj.getUTCMonth(),
        fechaObj.getUTCDate(),
        12,
        0,
        0,
      ),
    );

    // elimina TODOS los bloqueos de ese día
    await Turno.deleteMany({
      fecha: fechaBuscar,
      bloqueado: true,
    });

    res.json({ mensaje: "Día desbloqueado correctamente" });
  } catch (error) {
    console.error("ERROR DESBLOQUEANDO DÍA:", error);
    res.status(500).json({ mensaje: "Error al desbloquear día" });
  }
});
// Agenda completa (admin)
router.get("/agenda-completa", autenticarToken, async (req, res) => {
  try {
    if (!["admin", "profesional"].includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: "No autorizado" });
    }

    const { profesionalId } = req.query;

    let filtro = {};

    if (profesionalId) {
      filtro.profesional = profesionalId;
    }

    const turnos = await Turno.find({
      ...filtro,
      estado: { $ne: "cancelado" },
    })
      .populate("cliente", "nombres apellidos telefono")
      .populate("servicio", "name duration")
      .populate("profesional", "nombres apellidos")
      .sort({ fecha: -1, hora: 1 });

    res.json(turnos);
  } catch (error) {
    console.error("ERROR AGENDA:", error);
    res.status(500).json({ mensaje: "Error" });
  }
});

module.exports = router;
