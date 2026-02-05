import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./Login.css";

const Registro = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    direccion: "",
    telefono: "",
    email: "",
    password: "",
    rol: "usuario",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Probamos sin el /auth si tu backend tiene la ruta directa
      const res = await api.post("/registro", formData);
      await Swal.fire({
        title: "¡Bienvenida, Bella!",
        text: "Tu cuenta en Estética Sasha ha sido creada. Ya puedes iniciar sesión.",
        icon: "success",
        confirmButtonColor: "#ad1457",
      });
      navigate("/login");
    } catch (err) {
      console.error("Error en registro:", err);
      Swal.fire({
        title: "Ups! Algo salió mal",
        text:
          err.response?.data?.msg ||
          "No se pudo completar el registro. El email ya podría estar en uso.",
        icon: "error",
        confirmButtonColor: "#f06292",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>

      <div className="login-card" style={{ maxWidth: "600px" }}>
        <div className="login-header">
          <span style={{ fontSize: "2rem" }}>✨</span>
          <h2>Unite a Sasha</h2>
          <p>Tu espacio de belleza y cuidado personal te espera.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3 text-start">
              <label className="form-label">Nombre/s</label>
              <input
                type="text"
                name="nombres"
                className="form-control"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Ej: María"
                required
              />
            </div>
            <div className="col-md-6 mb-3 text-start">
              <label className="form-label">Apellido/s</label>
              <input
                type="text"
                name="apellidos"
                className="form-control"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Ej: García"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3 text-start">
              <label className="form-label">DNI (Opcional)</label>
              <input
                type="text"
                name="dni"
                className="form-control"
                value={formData.dni}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3 text-start">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                name="telefono"
                className="form-control"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="11 1234 5678"
                required
              />
            </div>
          </div>

          <div className="mb-3 text-start">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              name="direccion"
              className="form-control"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Calle y número"
              required
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="hola@ejemplo.com"
              required
            />
          </div>

          <div className="mb-4 text-start">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-login-submit w-100 py-3"
            style={{
              backgroundColor: "#ad1457",
              color: "white",
              borderRadius: "30px",
              border: "none",
            }}
          >
            CREAR MI CUENTA ✨
          </button>
        </form>

        <p className="footer-text mt-4">
          ¿Ya eres parte de la comunidad?{" "}
          <Link to="/login" style={{ color: "#ad1457", fontWeight: "bold" }}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;
