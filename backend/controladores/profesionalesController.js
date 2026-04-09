const bcrypt = require("bcryptjs");
const Usuario = require("../modelos/usuario");

const crearProfesional = async (req, res) => {
  try {
    console.log("BODY RECIBIDO:", req.body);
    const {
      nombres,
      apellidos,
      dni,
      telefono,
      direccion,
      email,
      puesto,
    } = req.body;

    // Validar duplicados
    const existingUser = await Usuario.findOne({
      $or: [{ email }, { dni: dni || "no-dni" }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Ya existe un usuario con ese email o DNI" });
    }

    // Password automática
    const ultimos4Dni = dni ? dni.slice(-4) : "0000";
    const passwordGenerada = "estetica" + ultimos4Dni;
    const hashedPassword = await bcrypt.hash(passwordGenerada, 10);

    const nuevoProfesional = new Usuario({
      nombres,
      apellidos,
      dni,
      telefono,
      direccion,
      email,
      puesto: "Profesional",
      password: hashedPassword,
      rol: "profesional",
    });

    await nuevoProfesional.save();

    res.status(201).json({
      message: "Profesional creado correctamente",
      profesional: nuevoProfesional,
      passwordGenerada: passwordGenerada,
    });
  } catch (error) {
    console.error("Error al crear profesional:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarProfesional = async (req, res) => {
  try {
    const { id } = req.params;

    const actualizado = await Usuario.findByIdAndUpdate(
        id,
        {
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            dni: req.body.dni,
            telefono: req.body.telefono,
            direccion: req.body.direccion,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
        );

    if (!actualizado) {
      return res.status(404).json({ message: "Profesional no encontrado" });
    }

    res.json({
      message: "Profesional actualizado",
      profesional: actualizado,
    });
  } catch (error) {
    console.error("Error al actualizar profesional:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const eliminarProfesional = async (req, res) => {
  try {
    const { id } = req.params;

    const eliminado = await Usuario.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ message: "Profesional no encontrado" });
    }

    res.json({ message: "Profesional eliminado" });
  } catch (error) {
    console.error("Error al eliminar profesional:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = { crearProfesional, actualizarProfesional, eliminarProfesional };