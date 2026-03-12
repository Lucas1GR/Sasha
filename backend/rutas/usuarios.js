const express = require("express");
const router = express.Router();
const Usuario = require("../modelos/usuario");
const autenticarToken = require("../middlewares/autorizaciones");
const verificarRol = require("../middlewares/roles");

// GET /api/usuarios -> Solo para que el Admin vea a TODO el staff (Admin Principal y Secundarios)
router.get(
  "/",
  autenticarToken,
  verificarRol("admin"),
  async (req, res) => {
    try {
      // Filtramos para que NO traiga a los clientes comunes, solo a los que tienen roles de admin o staff
      const staff = await Usuario.find(
        { rol: { $ne: "usuario" } },
        "nombres apellidos email rol",
      );
      res.json(staff);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error al obtener el equipo de trabajo" });
    }
  },
);

module.exports = router;
