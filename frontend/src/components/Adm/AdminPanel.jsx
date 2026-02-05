import React, { useState, useEffect } from "react";
// 1. Corregimos la ruta: subimos dos niveles (../../) para encontrar services
import { getProducts, deleteProduct } from "../../services/products";
import FormularioProducto from "./FormularioProducto";
import Swal from "sweetalert2";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [servicios, setServicios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState(null);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const data = await getProducts();
      setServicios(data);
    } catch (err) {
      // 2. Cambiamos error por err para evitar conflictos
      console.error("Error al cargar servicios:", err);
    }
  };

  const handleEliminar = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás segura?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ad1457",
      cancelButtonColor: "#777",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {
      try {
        await deleteProduct(id);
        Swal.fire("Eliminado", "El servicio ha sido quitado.", "success");
        cargarServicios();
      } catch (err) {
        // 3. Cambiamos error por err aquí también
        console.error("Error al eliminar:", err);
        Swal.fire("Error", "No se pudo eliminar el servicio.", "error");
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Gestión de Servicios</h1>
        <button
          className="btn-nuevo"
          onClick={() => {
            setServicioAEditar(null);
            setMostrarForm(true);
          }}
        >
          + NUEVO SERVICIO
        </button>
      </div>

      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal-sasha">
            <button
              className="btn-cerrar"
              onClick={() => setMostrarForm(false)}
            >
              X
            </button>
            <FormularioProducto
              actualizarLista={cargarServicios}
              cerrarForm={() => setMostrarForm(false)}
              servicioEditando={servicioAEditar}
            />
          </div>
        </div>
      )}

      <div className="tabla-servicios">
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No hay servicios cargados
                </td>
              </tr>
            ) : (
              servicios.map((s) => (
                <tr key={s._id}>
                  <td>
                    <img
                      src={s.image}
                      alt={s.name}
                      className="img-miniatura"
                      style={{ width: "50px" }}
                    />
                  </td>
                  <td>{s.name}</td>
                  <td>${s.price}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setServicioAEditar(s);
                        setMostrarForm(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleEliminar(s._id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
