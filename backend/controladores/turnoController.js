const Turno = require("../modelos/turno");
// Asumimos que crearás este modelo, o puedes borrar la importación si usas IDs fijos
const Servicio = require("../modelos/servicio");

exports.crearTurno = async (req, res) => {
  try {
    const { fecha, hora, servicioId, notas } = req.body;
    const usuarioId = req.usuario?.id; // ID del cliente desde el token

    // 1. Validar que el servicio exista (opcional si mandas IDs fijos desde el front)
    // const servicio = await Servicio.findById(servicioId);
    // if (!servicio) return res.status(404).json({ mensaje: 'Tratamiento no encontrado' });

    // 2. Validación de solapamientos: Evitar que el MISMO CLIENTE tenga 2 turnos el mismo día/hora
    // O que la misma hora esté ocupada (esto ya lo hace el index unique en el Modelo, pero aquí damos un mensaje lindo)
    const fechaObj = new Date(fecha);
    const existeConflicto = await Turno.findOne({
      fecha: fechaObj,
      hora: hora,
      estado: { $ne: "cancelado" },
    });

    if (existeConflicto) {
      return res
        .status(409)
        .json({ mensaje: "Lo sentimos, ese horario ya fue reservado." });
    }

    const nuevo = new Turno({
      fecha: fechaObj,
      hora: hora,
      servicio: servicioId,
      cliente: usuarioId, // Ahora el turno pertenece directamente al cliente
      creadoPor: usuarioId,
      notas,
    });

    await nuevo.save();
    return res.status(201).json(nuevo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: "Error al procesar la reserva" });
  }
};

exports.listarTurnosUsuario = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ mensaje: "No autenticado" });

    // Mucho más simple: Buscamos turnos donde el campo 'cliente' sea el ID del usuario
    const turnos = await Turno.find({ cliente: userId })
      .populate("servicio") // Para ver el nombre del tratamiento
      .sort({ fecha: 1, hora: 1 });

    return res.json(turnos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: "Error al obtener tus turnos" });
  }
};

exports.listarTodos = async (req, res) => {
  try {
    // Para el panel de Sasha (admin)
    const turnos = await Turno.find()
      .populate("servicio")
      .populate("cliente", "nombres apellidos telefono email") // Traemos datos del cliente
      .sort({ fecha: 1 });
    return res.json(turnos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: "Error servidor" });
  }
};

exports.cancelarTurno = async (req, res) => {
  try {
    const turnoId = req.params.id;
    const userId = req.usuario?.id;
    const userRol = req.usuario?.rol;

    const turno = await Turno.findById(turnoId);
    if (!turno) return res.status(404).json({ mensaje: "Turno no encontrado" });

    // Solo el admin o el propio dueño del turno pueden cancelar
    if (
      userRol !== "admin" &&
      String(turno.cliente) !== String(userId)
    ) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permiso para cancelar este turno" });
    }

    turno.estado = "cancelado";
    await turno.save();
    return res.json({ mensaje: "Turno cancelado con éxito", turno });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: "Error al cancelar" });
  }
};
