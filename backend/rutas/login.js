const express = require("express");
const router = express.Router();
const Usuario = require("../modelos/usuario");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// 1. LOGIN NORMAL
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "4h" },
    );

    res.json({
      token,
      usuario: {
        _id: usuario._id,
        email: usuario.email,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error interno" });
  }
});

// 2. LOGIN CON GOOGLE (Actualizado)
router.post("/google", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name, picture } = ticket.getPayload();

    let usuario = await Usuario.findOne({ email });

    if (!usuario) {
      // Registro automático de nueva clienta
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      usuario = new Usuario({
        nombres: given_name,
        apellidos: family_name || "",
        email,
        password: hashedPassword,
        rol: "usuario",
        fotoPerfil: picture, 
      });
      await usuario.save();
    }

    const nuestroToken = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "4h" },
    );

    res.json({
      mensaje: "Bienvenida a Estética Sasha",
      token: nuestroToken,
      usuario: {
        _id: usuario._id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error Google Backend:", error);
    res.status(400).json({ mensaje: "Error al autenticar con Google" });
  }
});

module.exports = router;

module.exports = router;
