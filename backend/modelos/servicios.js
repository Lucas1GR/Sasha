const mongoose = require("mongoose");

const servicioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true }, // Ej: "Limpieza Facial Profunda"
    descripcion: { type: String },
    precio: { type: Number, required: true },
    duracion: { type: Number, required: true }, // En minutos, ej: 60
    categoria: {
      type: String,
      enum: ["Estética", "Facial", "Corporal", "Pestañas/Cejas", "Otros"],
    },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Servicio", servicioSchema);
