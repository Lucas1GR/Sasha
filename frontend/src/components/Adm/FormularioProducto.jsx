import React, { useState, useEffect } from "react";
import { createProduct, updateProduct } from "../../services/products";
import Swal from "sweetalert2";

const FormularioProducto = ({
  actualizarLista,
  cerrarForm,
  servicioEditando,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    duracion: "",
    descripcion: "",
    categoria: "Estética",
    imagen: "",
  });

  // Si estamos editando, cargamos los datos del servicio en el formulario
  useEffect(() => {
    if (servicioEditando) {
      setFormData(servicioEditando);
    }
  }, [servicioEditando]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (servicioEditando) {
        await updateProduct(servicioEditando._id, formData);
        Swal.fire(
          "¡Actualizado!",
          "El servicio se modificó correctamente",
          "success",
        );
      } else {
        await createProduct(formData);
        Swal.fire("¡Creado!", "Nuevo servicio agregado a la lista", "success");
      }
      actualizarLista();
      cerrarForm();
    } catch (err) {
      Swal.fire("Error", "No se pudo guardar el servicio", "error");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sasha-form-container">
      <h3>{servicioEditando ? "Editar Servicio" : "Nuevo Servicio"}</h3>

      <div className="mb-3">
        <label htmlFor="nombre">Nombre del Servicio</label>
        <input
          id="nombre"
          type="text"
          name="nombre"
          className="form-control"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="precio">Precio ($)</label>
        <input
          id="precio"
          type="number"
          name="precio"
          className="form-control"
          value={formData.precio}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="imagen">URL de la Imagen</label>
        <input
          id="imagen"
          type="text"
          name="imagen"
          className="form-control"
          value={formData.imagen}
          onChange={handleChange}
          placeholder="https://res.cloudinary.com/..."
        />
      </div>

      <div className="mb-3">
        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          className="form-control"
          value={formData.descripcion}
          onChange={handleChange}
        ></textarea>
      </div>

      <div className="mb-3">
        <label htmlFor="duracion">Duración (minutos)</label>
        <input
          id="duracion"
          type="number"
          name="duracion"
          className="form-control"
          value={formData.duracion}
          onChange={handleChange}
          required
        />
      </div>  

      <div className="d-flex gap-2">
        <button type="submit" className="btn-save-sasha">
          {servicioEditando ? "Guardar Cambios" : "Crear Servicio"}
        </button>
        <button type="button" className="btn-cancel" onClick={cerrarForm}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default FormularioProducto;
