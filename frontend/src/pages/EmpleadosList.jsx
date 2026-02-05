import { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import api from "../api/axios";
import Swal from "sweetalert2";

const EmpleadosList = () => {
  const [empleados, setEmpleados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [empleadoEditarId, setEmpleadoEditarId] = useState(null);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    email: "",
    telefono: "",
    puesto: "Masajista",
  });

  const cargarEmpleados = async () => {
    try {
      const res = await api.get("/usuarios");
      setEmpleados(res.data.filter((u) => u.rol === "empleado" || u.puesto));
    } catch (error) {
      console.error("Error al cargar staff", error);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const handleAbrirModal = (emp = null) => {
    if (emp) {
      setEditando(true);
      setEmpleadoEditarId(emp._id);
      setFormData({
        nombres: emp.nombres || "",
        apellidos: emp.apellidos || "",
        dni: emp.dni || "",
        email: emp.email || "",
        telefono: emp.telefono || "",
        puesto: emp.puesto || "Masajista",
      });
    } else {
      setEditando(false);
      setFormData({
        nombres: "",
        apellidos: "",
        dni: "",
        email: "",
        telefono: "",
        puesto: "Masajista",
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async () => {
    try {
      if (editando) {
        await api.put(`/usuarios/${empleadoEditarId}`, formData);
      } else {
        await api.post("/usuarios", { ...formData, rol: "empleado" });
      }
      Swal.fire({
        title: "¡Staff Actualizado!",
        icon: "success",
        confirmButtonColor: "#ad1457",
      });
      setShowModal(false);
      cargarEmpleados();
    } catch (err) {
      console.error("Detalle del error al guardar:", err);
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar la información",
        icon: "error",
        confirmButtonColor: "#ad1457",
      });
    } // <--- ESTA ERA LA LLAVE QUE FALTABA
  };

  return (
    <div className="container mt-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ color: "#ad1457", fontWeight: "bold" }}>
            Staff de Sasha
          </h2>
          <p className="text-muted">Masajistas y Manicuras</p>
        </div>
        <Button
          style={{ backgroundColor: "#ad1457", border: "none" }}
          onClick={() => handleAbrirModal()}
        >
          + Registrar Personal
        </Button>
      </div>

      <div className="table-responsive shadow-sm p-3 mb-5 bg-white rounded">
        <Table hover>
          <thead style={{ backgroundColor: "#fce4ec" }}>
            <tr>
              <th>NOMBRE</th>
              <th>ESPECIALIDAD</th>
              <th>CONTACTO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {empleados.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No hay personal registrado
                </td>
              </tr>
            ) : (
              empleados.map((emp) => (
                <tr key={emp._id}>
                  <td className="fw-bold">
                    {emp.nombres} {emp.apellidos}
                  </td>
                  <td>
                    <span className="badge bg-info text-dark">
                      {emp.puesto}
                    </span>
                  </td>
                  <td>{emp.telefono}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleAbrirModal(emp)}
                    >
                      ✏️
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editando ? "Editar Perfil" : "Nuevo Integrante"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Especialidad</Form.Label>
              <Form.Select
                value={formData.puesto}
                onChange={(e) =>
                  setFormData({ ...formData, puesto: e.target.value })
                }
              >
                <option value="Masajista">Masajista</option>
                <option value="Manicura">Manicura</option>
                <option value="Estilista">Estilista</option>
              </Form.Select>
            </Form.Group>
            <div className="row">
              <div className="col-6 mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  value={formData.nombres}
                  onChange={(e) =>
                    setFormData({ ...formData, nombres: e.target.value })
                  }
                />
              </div>
              <div className="col-6 mb-3">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  value={formData.apellidos}
                  onChange={(e) =>
                    setFormData({ ...formData, apellidos: e.target.value })
                  }
                />
              </div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono de contacto</Form.Label>
              <Form.Control
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button
            style={{ backgroundColor: "#ad1457", border: "none" }}
            onClick={handleGuardar}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmpleadosList;
