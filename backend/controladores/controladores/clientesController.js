const bcrypt = require("bcryptjs");
const Usuario = require("../modelos/usuario");

// 📌 CREAR CLIENTA (Manual por el Admin)
const crearClienteManual = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      dni,
      telefono,
      direccion,
      email,
      tipoDePiel,
      alergias,
    } = req.body;

    // 1. Evitar duplicados por email o DNI
    const existingUser = await Usuario.findOne({
      $or: [{ email }, { dni: dni || "no-dni" }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Ya existe una clienta con ese email o DNI" });
    }

    // Generar password automática basada en DNI
    const ultimos4Dni = dni ? dni.slice(-4) : "0000";
    const passwordGenerada = "estetica" + ultimos4Dni;
    const hashedPassword = await bcrypt.hash(passwordGenerada, 10);
    // 2. Crear nueva clienta
    // Nota: Como es manual, le asignamos un password genérico o nulo si no se va a loguear
    const nuevoCliente = new Usuario({
      nombres,
      apellidos,
      dni,
      telefono,
      direccion,
      email,
      tipoDePiel: tipoDePiel || "No especificado",
      alergias: alergias || "Ninguna",
      password: hashedPassword, // Luego ella puede resetearlo
      rol: "usuario",
    });

    await nuevoCliente.save();

    res.status(201).json({
      message: "Clienta registrada correctamente en el sistema",
      cliente: nuevoCliente,
    });
  } catch (error) {
    console.error("Error al crear clienta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// 📌 OBTENER TODAS LAS CLIENTAS (Para el panel de Sasha)
const listarClientes = async (req, res) => {
  try {
    const clientes = await Usuario.find({ rol: "usuario" }).sort({
      nombres: 1,
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la lista" });
  }
};

module.exports = { crearClienteManual, listarClientes };
