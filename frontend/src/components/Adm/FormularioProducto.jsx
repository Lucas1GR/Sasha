import React, { useState, useEffect } from "react";
import { createProduct, updateProduct } from "../../services/products";
import Swal from "sweetalert2";

const FormularioProducto = ({
  actualizarLista,
  cerrarForm,
  servicioEditando,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "Estética",
    image: "",
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
        <label>Nombre del Servicio</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label>Precio ($)</label>
        <input
          type="number"
          name="price"
          className="form-control"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label>URL de la Imagen (o link de Cloudinary)</label>
        <input
          type="text"
          name="image"
          className="form-control"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://res.cloudinary.com/..."
        />
      </div>

      <div className="mb-3">
        <label>Descripción</label>
        <textarea
          name="description"
          className="form-control"
          value={formData.description}
          onChange={handleChange}
        ></textarea>
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
