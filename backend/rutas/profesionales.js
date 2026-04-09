const express = require("express");
const router = express.Router();
const { crearProfesional, actualizarProfesional, eliminarProfesional } = require("../controladores/profesionalesController");

router.post("/", crearProfesional);
router.put("/:id", actualizarProfesional);
router.delete("/:id", eliminarProfesional);

module.exports = router;