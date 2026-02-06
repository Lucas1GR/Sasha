const express = require("express");
const router = express.Router();
const Turno = require("../modelos/turno");
const autenticarToken = require("../middlewares/autorizaciones");

// Feriados actualizados a 2026
const diasFeriados = [
  "01-01-2026",
  "24-03-2026",
  "02-04-2026",
  "01-05-2026",
  "25-05-2026",
  "09-07-2026",
  "25-12-2026",
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
    fechaString: `${String(fechaArg.getDate()).padStart(2, "0")}-${String(fechaArg.getMonth() + 1).padStart(2, "0")}-${fechaArg.getFullYear()}`,
    hora: fechaArg.getHours(),
  };
};

router.get("/feriados", (req, res) => res.json({ feriados: diasFeriados }));

// 1. Disponibles (Sigue igual, solo cambiamos el nombre de la lógica interna)
router.get("/disponibles", async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ mensaje: "Fecha requerida" });
    if (diasFeriados.includes(fecha)) return res.json([]);

    const [dd, mm, yyyy] = fecha.split("-");
    const fechaBusqueda = new Date(Date.UTC(yyyy, mm - 1, dd, 12, 0, 0));
    if (fechaBusqueda.getUTCDay() === 0) return res.json([]);

    const ocupados = await Turno.find({
      fecha: fechaBusqueda,
      estado: { $ne: "cancelado" },
    });
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
    ]; // Ajustado a horario de estética
    const horasOcupadas = ocupados.map((t) => t.hora);

    let disponibles = horarios.filter((h) => !horasOcupadas.includes(h));

    const tiempoArg = getTiempoArgentina();
    if (fecha === tiempoArg.fechaString) {
      disponibles = disponibles.filter(
        (h) => parseInt(h, 10) >= tiempoArg.hora + 3,
      );
    }
    res.json(disponibles);
  } catch (error) {
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

    const [dd, mm, yyyy] = fecha.split("-");
    const fechaObj = new Date(Date.UTC(yyyy, mm - 1, dd));

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

    const ocupado = await Turno.findOne({
      fecha: fechaGuardar,
      hora: hora,
      estado: { $ne: "cancelado" },
    });
    if (ocupado) return res.status(409).json({ mensaje: "Horario ocupado." });

    const nuevoTurno = new Turno({
      fecha: fechaGuardar,
      hora,
      servicio: bloqueado ? null : servicio,
      cliente: cliente,
      bloqueado: bloqueado || false,
      nombreCliente: nombreClienteManual || null,
    });

    await nuevoTurno.save();
    res.status(201).json(nuevoTurno);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al reservar" });
  }
});

// 3. Mis Turnos (Para la clienta)
router.get("/mis-turnos", autenticarToken, async (req, res) => {
  try {
    const turnos = await Turno.find({ cliente: req.usuario.id })
      .populate("servicio", "nombre precio")
      .sort({ fecha: -1 });
    res.json(turnos);
  } catch (error) {
    console.error("ERROR CREANDO TURNO:", error);
    res.status(500).json({ mensaje: "Error al reservar" });
  }
});

// 4. Admin Agenda (Para Sasha)
router.get("/agenda-completa", autenticarToken, async (req, res) => {
  try {
    if (!req.usuario.rol.includes("admin"))
      return res.status(403).json({ mensaje: "No autorizado" });
    const turnos = await Turno.find()
      .populate("cliente", "nombres apellidos telefono")
      .populate("servicio", "nombre")
      .sort({ fecha: -1 });
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

module.exports = router;
