import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import api from "../api/axios";
import Swal from "sweetalert2";
import "./GestionClientes.css"; // Usamos el mismo estilo base

const GestionFichas = () => {
  const [fichas, setFichas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "", // Lo usamos para el "Tipo de tratamiento" o "Subperfil"
    raza: "", // Lo transformamos en "Tipo de Piel/Uñas"
    edad: "", // Edad de la clienta
    enfermedades: "", // Alergias o condiciones
    observaciones: "",
    dueno: "",
    duenoModel: "Dueno",
  });

  const cargarDatos = async () => {
    try {
      const [resF, resD, resU] = await Promise.all([
        api.get("/mascotas"), // Mantenemos el endpoint de la base de datos
        api.get("/clientes"),
        api.get("/usuarios"),
      ]);

      setFichas(Array.isArray(resF.data) ? resF.data : []);

      const allClientes = [
        ...resD.data.map((d) => ({ ...d, duenoModel: "Dueno" })),
        ...resU.data.map((u) => ({ ...u, duenoModel: "Usuario" })),
      ];
      setClientes(allClientes);
    } catch (error) {
      console.error("Error cargando fichas");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async () => {
    try {
      if (!formData.nombre || !formData.dueno) {
        return Swal.fire({
          title: "Faltan datos",
          text: "El tipo de tratamiento y el cliente son obligatorios",
          icon: "warning",
        });
      }

      const payload = {
        ...formData,
        dueno: formData.dueno,
        tipoDueno: formData.duenoModel,
      };

      if (editando) {
        await api.put(`/mascotas/${editando._id}`, payload);
        Swal.fire({
          title: "¡Actualizado!",
          icon: "success",
          confirmButtonColor: "#ad1457",
        });
      } else {
        await api.post("/mascotas", payload);
        Swal.fire({
          title: "¡Ficha Creada!",
          icon: "success",
          confirmButtonColor: "#ad1457",
        });
      }

      setShowModal(false);
      cargarDatos();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar la ficha",
        icon: "error",
      });
    }
  };

  const handleEliminar = async (id) => {
    const r = await Swal.fire({
      title: "¿Eliminar ficha?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ad1457",
      confirmButtonText: "Sí, eliminar",
    });

    if (r.isConfirmed) {
      try {
        await api.delete(`/mascotas/${id}`);
        cargarDatos();
        Swal.fire({ title: "Eliminado", icon: "success" });
      } catch (error) {
        Swal.fire({ title: "Error", icon: "error" });
      }
    }
  };

  const handleAbrir = (f = null) => {
    if (f) {
      setEditando(f);
      setFormData({
        nombre: f.nombre,
        edad: f.edad,
        raza: f.raza,
        enfermedades: f.enfermedades,
        observaciones: f.observaciones,
        dueno: f.dueno?._id || f.dueno,
        duenoModel: f.tipoDueno || "Dueno",
      });
    } else {
      setEditando(null);
      setFormData({
        nombre: "Tratamiento General",
        edad: "",
        raza: "",
        enfermedades: "",
        observaciones: "",
        dueno: "",
        duenoModel: "Dueno",
      });
    }
    setShowModal(true);
  };

  const filtradas = fichas.filter(
    (f) =>
      f.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.dueno?.nombres || "").toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="admin-container fade-in">
      <div className="admin-header-flex">
        <div>
          <h2 className="admin-title-sasha">Fichas de Belleza</h2>
          <p className="admin-subtitle-sasha">
            Diagnósticos y preferencias de clientes
          </p>
        </div>
        <Button className="btn-sasha-pink" onClick={() => handleAbrir()}>
          + Nueva Ficha
        </Button>
      </div>

      <div className="search-bar-container mb-4">
        <InputGroup className="sasha-input-group">
          <InputGroup.Text className="search-icon">🔍</InputGroup.Text>
          <Form.Control
            placeholder="Buscar por cliente o tratamiento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="table-responsive sasha-table-card">
        <Table hover className="sasha-table">
          <thead>
            <tr>
              <th>CLIENTE</th>
              <th>TRATAMIENTO</th>
              <th>DETALLES TÉCNICOS</th>
              <th>ALERGIAS/NOTAS</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((f) => (
              <tr key={f._id}>
                <td>
                  <div className="fw-bold name-cell">
                    {f.dueno?.nombres} {f.dueno?.apellidos}
                  </div>
                  <span className="badge-manual">{f.tipoDueno}</span>
                </td>
                <td>
                  <div className="text-pink fw-bold">{f.nombre}</div>
                </td>
                <td>
                  <div className="small">
                    <strong>Tipo:</strong> {f.raza || "No especificado"}
                  </div>
                  <div className="small text-muted">
                    <strong>Edad:</strong> {f.edad || "-"} años
                  </div>
                </td>
                <td>
                  <div className="small text-danger">
                    {f.enfermedades || "Ninguna"}
                  </div>
                </td>
                <td>
                  <div className="action-btns-wrap">
                    <button
                      className="btn-action edit"
                      onClick={() => handleAbrir(f)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={() => handleEliminar(f._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="sasha-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editando ? "Editar Ficha" : "Nueva Ficha Técnica"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="sasha-form">
            <Form.Group className="mb-3">
              <Form.Label>Seleccionar Cliente *</Form.Label>
              <Form.Select
                value={formData.dueno + "|" + formData.duenoModel}
                onChange={(e) => {
                  const [id, tipo] = e.target.value.split("|");
                  setFormData({ ...formData, dueno: id, duenoModel: tipo });
                }}
              >
                <option value="">-- Buscar Cliente --</option>
                {clientes.map((c) => (
                  <option
                    key={c._id + c.duenoModel}
                    value={c._id + "|" + c.duenoModel}
                  >
                    {c.nombres} {c.apellidos}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="row">
              <div className="col-6 mb-3">
                <Form.Label>Tratamiento Principal</Form.Label>
                <Form.Control
                  placeholder="Ej: Manicuría, Masajes"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
              <div className="col-6 mb-3">
                <Form.Label>Tipo de Piel / Uñas</Form.Label>
                <Form.Control
                  placeholder="Ej: Seca, Frágil"
                  value={formData.raza}
                  onChange={(e) =>
                    setFormData({ ...formData, raza: e.target.value })
                  }
                />
              </div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Alergias o Contraindicaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.enfermedades}
                onChange={(e) =>
                  setFormData({ ...formData, enfermedades: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observaciones Particulares</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button className="btn-save-sasha" onClick={handleGuardar}>
            Guardar Ficha
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionFichas;
