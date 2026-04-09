import { useEffect, useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import api from "../api/axios";
import Swal from "sweetalert2";

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
      await api.put("/usuarios/cambiar-password", passwords);

      Swal.fire("Contraseña actualizada", "", "success");

      setPasswords({
        passwordActual: "",
        passwordNueva: "",
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Error",
        "error"
      );
    }
  };

    return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
        <div className="card shadow-sm p-4">

        <h3 className="mb-4 text-center" style={{ color: "#ad1457" }}>
            Mi Perfil
        </h3>

        {/* 🔹 DATOS PERSONALES */}
        <h5 className="mb-3">Datos personales</h5>

        <div className="mb-3">
            <label>Email</label>
            <input
            className="form-control"
            value={formData.email}
            onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
            }
            />
        </div>

        <div className="mb-3">
            <label>Teléfono</label>
            <input
            className="form-control"
            value={formData.telefono}
            onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
            }
            />
        </div>

        <div className="mb-3">
            <label>Dirección</label>
            <input
            className="form-control"
            value={formData.direccion}
            onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
            }
            />
        </div>

        <button
            className="btn w-100 mb-4"
            style={{ backgroundColor: "#ad1457", color: "white" }}
            onClick={guardarPerfil}
        >
            Guardar cambios
        </button>

        <hr />

        {/* 🔹 CAMBIAR PASSWORD */}
        <h5 className="mb-3 mt-3">Seguridad</h5>

        <div className="mb-3">
            <label>Contraseña actual</label>
            <input
            type="password"
            className="form-control"
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
            className="form-control"
            value={passwords.nuevaPassword}
            onChange={(e) =>
                setPasswords({
                ...passwords,
                nuevaPassword: e.target.value,
                })
            }
            />
        </div>

        <button
            className="btn w-100"
            style={{ backgroundColor: "#ad1457", color: "white" }}
            onClick={cambiarPass}
        >
            Cambiar contraseña
        </button>
        </div>
    </div>
    );
};

export default Perfil;