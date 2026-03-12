const express = require("express");
const router = express.Router();
const Usuario = require("../modelos/usuario");
const autenticarToken = require("../middlewares/autorizaciones");
const verificarRol = require("../middlewares/roles");
const { body, validationResult } = require("express-validator");

// Validaciones para Estética Sasha
const validarCliente = [
  body("nombres").notEmpty().withMessage("El nombre es obligatorio"),
  body("telefono")
    .notEmpty()
    .withMessage("El teléfono es necesario para coordinar el turno"),
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty())
      return res.status(400).json({ errores: errores.array() });
    next();
  },
];

// --- ZONA CLIENTE (AUTOGESTIÓN) ---

// 1. Obtener mi perfil (Simple y directo)
router.get("/mi-perfil", autenticarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select("-password");
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener perfil" });
  }
});

// 2. Actualizar mi perfil (Incluyendo datos de estética)
router.put("/mi-perfil", autenticarToken, async (req, res) => {
  try {
    const { telefono, direccion, dni, tipoDePiel, alergias } = req.body;
    const actualizado = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      { telefono, direccion, dni, tipoDePiel, alergias },
      { new: true },
    ).select("-password");

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar" });
  }
});

// --- ZONA ADMIN (Sasha) ---

// Listar todas las clientas
router.get(
  "/",
  autenticarToken,
  verificarRol("admin", "adminSecundario"),
  async (req, res) => {
    try {
      // Traemos todos los que tengan rol 'usuario'
      const clientes = await Usuario.find({ rol: "usuario" })
        .select("-password")
        .sort({ nombres: 1 });
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al obtener clientes" });
    }
  },
);

// Crear cliente manual (Sasha anota a alguien que llamó por tel)
router.post(
  "/",
  autenticarToken,
  verificarRol("admin", "adminSecundario"),
  validarCliente,
  async (req, res) => {
    try {
      const { email, dni } = req.body;
      const existe = await Usuario.findOne({ $or: [{ email }, { dni }] });
      if (existe)
        return res
          .status(400)
          .json({ mensaje: "Ya existe una clienta con ese email o DNI" });

      const nuevo = await Usuario.create({
        ...req.body,
        password: "password_provisorio_123", // Sasha puede setear esto después
        rol: "usuario",
      });
      res
        .status(201)
        .json({ mensaje: "Cliente creado con éxito", cliente: nuevo });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al crear" });
    }
  },
);

// Eliminar cliente
router.delete(
  "/:id",
  autenticarToken,
  verificarRol("admin", "adminSecundario"),
  async (req, res) => {
    try {
      await Usuario.findByIdAndDelete(req.params.id);
      res.json({ mensaje: "Cliente eliminado del sistema" });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al eliminar" });
    }
  },
);

// Editar cliente
router.put(
  "/:id",
  autenticarToken,
  verificarRol("admin", "adminSecundario"),
  async (req, res) => {
    try {
      const actualizado = await Usuario.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).select("-password");

      if (!actualizado) {
        return res.status(404).json({ mensaje: "Cliente no encontrado" });
      }

      res.json(actualizado);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar cliente" });
    }
  }
);

module.exports = router;
