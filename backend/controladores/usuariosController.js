const Usuario = require("../modelos/usuario");

const actualizarMiPerfil = async (req, res) => {
  try {
    const userId = req.usuario.id; // viene del token

    const { email, telefono, direccion } = req.body;

    const actualizado = await Usuario.findByIdAndUpdate(
      userId,
      { email, telefono, direccion },
      { new: true }
    );

    res.json({
      message: "Perfil actualizado",
      usuario: actualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
};
const bcrypt = require("bcryptjs");

const cambiarPassword = async (req, res) => {
  try {
    const userId = req.usuario.id;

    const { passwordActual, passwordNueva } = req.body;

    const usuario = await Usuario.findById(userId);

    const coincide = await bcrypt.compare(
      passwordActual,
      usuario.password
    );

    if (!coincide) {
      return res.status(400).json({
        message: "Contraseña actual incorrecta",
      });
    }

    const hash = await bcrypt.hash(passwordNueva, 10);

    usuario.password = hash;
    await usuario.save();

    res.json({ message: "Contraseña actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cambiar contraseña" });
  }
};
module.exports = {
  actualizarMiPerfil,
  cambiarPassword,
};