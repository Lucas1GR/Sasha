import { useEffect, useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import api from "../api/axios";
import Swal from "sweetalert2";
import "./Perfil.css";

const Perfil = () => {
  const [formData, setFormData] = useState({
    email: "",
    telefono: "",
    direccion: "",
  });

  const [passwords, setPasswords] = useState({
    passwordActual: "",
    passwordNueva: "",
  });

  // 🔥 CARGAR DATOS DEL USUARIO
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const res = await api.get("/clientes/mi-perfil");

        setFormData({
          email: res.data.email || "",
          telefono: res.data.telefono || "",
          direccion: res.data.direccion || "",
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo cargar el perfil", "error");
      }
    };

    cargarPerfil();
  }, []);

  // 🟢 GUARDAR PERFIL
  const guardarPerfil = async () => {
    try {
      await api.put("/usuarios/perfil", formData);

      Swal.fire("Perfil actualizado", "", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  // 🟢 CAMBIAR PASSWORD
  const cambiarPass = async () => {
    try {
      console.log(passwords);
      await api.put("/usuarios/cambiar-password", passwords);

      Swal.fire("Contraseña actualizada", "", "success");

      setPasswords({
        passwordActual: "",
        passwordNueva: "",
      });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Error", "error");
    }
  };

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <h3 className="perfil-title">Mi Perfil</h3>

        <h5 className="perfil-section">Datos personales</h5>

        <div className="mb-3">
          <label>Email</label>
          <input
            className="form-control perfil-input"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label>Teléfono</label>
          <input
            className="form-control perfil-input"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label>Dirección</label>
          <input
            className="form-control perfil-input"
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
          />
        </div>

        <button className="perfil-btn mb-3" onClick={guardarPerfil}>
          Guardar cambios
        </button>

        <div className="perfil-divider"></div>

        <h5 className="perfil-section">Seguridad</h5>

        <div className="mb-3">
          <label>Contraseña actual</label>
          <input
            type="password"
            className="form-control perfil-input"
            value={passwords.passwordActual}
            onChange={(e) =>
              setPasswords({
                ...passwords,
                passwordActual: e.target.value,
              })
            }
          />
        </div>

        <div className="mb-3">
          <label>Nueva contraseña</label>
          <input
            type="password"
            className="form-control perfil-input"
            value={passwords.passwordNueva}
            onChange={(e) =>
              setPasswords({
                ...passwords,
                passwordNueva: e.target.value,
              })
            }
          />
        </div>

        <button className="perfil-btn" onClick={cambiarPass}>
          Cambiar contraseña
        </button>
      </div>
    </div>
  );
};

export default Perfil;
