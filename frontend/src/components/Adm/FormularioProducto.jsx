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
    duration: "",
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
        <label htmlFor="name">Nombre del Servicio</label>
        <input
          id="name"
          type="text"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="price">Precio ($)</label>
        <input
          id="price"
          type="number"
          name="price"
          className="form-control"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="image">URL de la Imagen</label>
        <input
          id="image"
          type="text"
          name="image"
          className="form-control"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://res.cloudinary.com/..."
        />
      </div>

      <div className="mb-3">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          value={formData.description}
          onChange={handleChange}
        ></textarea>
      </div>

      <div className="mb-3">
        <label htmlFor="duration">Duración (minutos)</label>
        <input
          id="duration"
          type="number"
          name="duration"
          className="form-control"
          value={formData.duration}
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
