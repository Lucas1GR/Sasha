const mongoose = require("mongoose");

const servicioSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Ej: "Limpieza Facial Profunda"
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // En minutos, ej: 60
    image: { type: String },
    category: {
      type: String,
      enum: ["Estética", "Facial", "Corporal", "Pestañas/Cejas", "Otros"],
      required: true
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Servicio", servicioSchema);
