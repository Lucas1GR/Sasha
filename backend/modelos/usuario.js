const mongoose = require("mongoose");
const { Schema } = mongoose;

const usuarioSchema = new Schema(
  {
    // Datos de acceso
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Datos personales (Lo que antes estaba repartido)
    nombres: { type: String, required: true },
    apellidos: { type: String, default: "" },
    dni: { type: String, default: "" },
    telefono: { type: String, default: "" },
    direccion: { type: String, default: "" },

    // --- FICHA DE ESTÉTICA (Nuevos campos) ---
    tipoDePiel: {
      type: String,
      enum: ["Seca", "Grasa", "Mixta", "Sensible", "Normal", "No especificado"],
      default: "No especificado",
    },
    alergias: { type: String, default: "Ninguna" },
    observaciones: { type: String, default: "" }, // Para notas de Sasha sobre el cliente

    // Gestión de permisos
    rol: {
      type: String,
      enum: ["usuario", "profesional", "admin"],
      default: "usuario",
    },
    fotoPerfil: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Usuario", usuarioSchema, "usuarios");
