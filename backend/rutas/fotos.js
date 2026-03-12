const express = require('express');
const router = express.Router();
const Foto = require('../modelos/foto');
const autenticarToken = require('../middlewares/autorizaciones');
const verificarRol = require('../middlewares/roles');

// 🟢 OBTENER TODAS (Público - Cualquiera puede ver la galería)
router.get('/', async (req, res) => {
  try {
    const fotos = await Foto.find().sort({ createdAt: -1 }); // Las más nuevas primero
    res.json(fotos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cargar fotos' });
  }
});

// 🔴 AGREGAR FOTO (Solo Admin)
router.post('/', autenticarToken, verificarRol('admin', 'adminSecundario'), async (req, res) => {
  try {
    const { titulo, url } = req.body;
    if (!titulo || !url) return res.status(400).json({ mensaje: 'Faltan datos' });

    const nuevaFoto = new Foto({ titulo, url });
    await nuevaFoto.save();
    res.status(201).json(nuevaFoto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar foto' });
  }
});

// 🔴 ELIMINAR FOTO (Solo Admin)
router.delete('/:id', autenticarToken, verificarRol('admin', 'adminSecundario'), async (req, res) => {
  try {
    await Foto.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Foto eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar' });
  }
});

module.exports = router;