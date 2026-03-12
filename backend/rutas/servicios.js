const express = require("express");
const router = express.Router();
const Servicio = require("../modelos/servicios");
const autenticarToken = require("../middlewares/autorizaciones");
const verificarRol = require("../middlewares/roles");

// 1. Obtener todos los servicios (Público)
// Lo usan las clientas para ver qué elegir y el Admin para gestionar
router.get("/", async (req, res) => {
  try {
    const { admin } = req.query;

    let servicios;

    if (admin === "true") {
      // El admin ve todos
      servicios = await Servicio.find().sort({ name: 1 });
    } else {
      // Clientes solo ven activos
      servicios = await Servicio.find({ active: true }).sort({ name: 1 });
    }

    res.json(servicios);
  } catch (error) {
    console.error("Error obteniendo servicios:", error);
    res.status(500).json({ mensaje: "Error al obtener el catálogo" });
  }
});

// 2. Crear Servicio (Solo Admin Principal)
router.post(
  "/",
  autenticarToken,
  verificarRol("admin"),
  async (req, res) => {
    try {
      const { name, price, duration, category, description, image } = req.body;

      const nuevoServicio = new Servicio({
        name,
        price,
        duration,
        category,
        description,
        image,
      });

      await nuevoServicio.save();
      res.status(201).json(nuevoServicio);
    } catch (error) {
      console.error("Error creando servicio:", error);
      res.status(500).json({ mensaje: "Error al guardar el servicio" });
    }
  },
);

// 3. Actualizar Servicio (Solo Admin)
router.put(
  "/:id",
  autenticarToken,
  verificarRol("admin"),
  async (req, res) => {
    try {
      const servicioActualizado = await Servicio.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      res.json({
        mensaje: "Servicio actualizado correctamente",
        servicio: servicioActualizado,
      });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar el servicio" });
    }
  },
);

// 4. Eliminar Servicio (O desactivarlo)
router.delete(
  "/:id",
  autenticarToken,
  verificarRol("admin"),
  async (req, res) => {
    try {
      // En lugar de borrarlo, podrías poner activo: false para no romper turnos viejos
      await Servicio.findByIdAndDelete(req.params.id);
      res.json({ mensaje: "Servicio eliminado del catálogo" });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al eliminar" });
    }
  },
);

module.exports = router;
