import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";
import Swal from "sweetalert2";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate();

  // ESTA es la función que te faltaba definir
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });

      // Guardamos el token y los datos del usuario
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      Swal.fire({
        title: "¡Bienvenida!",
        text: "Inicio de sesión exitoso",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Redirigir al panel o al inicio
      navigate("/admin");
    } catch (err) {
      console.error("Error en login:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.msg || "Credenciales incorrectas",
        icon: "error",
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/admin");
    } catch (err) {
      console.error("Error Google Login:", err);
      Swal.fire("Error", "No se pudo iniciar sesión con Google", "error");
    }
  };

  return (
    <div className="login-page">
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>

      <div className="login-card">
        <div className="login-header">
          <img src="/SB-logo.png" alt="Logo Sasha" className="login-logo-img" />
          <h2>Bienvenida</h2>
          <p>Ingresa a tu cuenta de Estética Sasha</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Tu Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Tu Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              style={{ cursor: "pointer" }}
              onClick={() => setMostrarPassword(!mostrarPassword)}
            >
              {mostrarPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" className="btn-login-submit">
            INGRESAR
          </button>
        </form>

        <div className="separator">
          <div></div>
          <span>O continúa con</span>
          <div></div>
        </div>

        <div className="google-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Login Failed")}
            theme="outline"
            shape="pill"
            width="100%"
          />
        </div>

        <p className="footer-text">
          ¿Aún no te cuidas con nosotros?{" "}
          <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
