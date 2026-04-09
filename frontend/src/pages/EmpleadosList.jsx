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
    direccion: "",
  });

  const cargarEmpleados = async () => {
    try {
      const res = await api.get("/usuarios");
      setEmpleados(res.data.filter((u) => u.rol === "profesional"));
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
        direccion: emp.direccion || "",
      });
    } else {
      setEditando(false);
      setFormData({
        nombres: "",
        apellidos: "",
        dni: "",
        email: "",
        telefono: "",
        direccion: "",

      });
    }
    setShowModal(true);
  };

  const handleGuardar = async () => {
    if (
      !formData.nombres ||
      !formData.apellidos ||
      !formData.email ||
      !formData.telefono ||
      !formData.direccion
    ) {
      return Swal.fire({
        title: "Faltan datos",
        text: "Completa nombre, apellido, email, teléfono y dirección",
        icon: "warning",
      });
    }
    try {
      if (editando) {
        await api.put(`/profesionales/${empleadoEditarId}`, formData);
      } else {
        const res = await api.post("/profesionales", formData);

      Swal.fire({
        title: "Profesional creado",
        html: `Contraseña: <b>${res.data.passwordGenerada}</b>`,
        icon: "success",
        confirmButtonColor: "#ad1457",
      });
    }
      setShowModal(false);

      setFormData({
        nombres: "",
        apellidos: "",
        dni: "",
        email: "",
        telefono: "",
        direccion: "",
      });

      cargarEmpleados();

    } catch (err) {
      console.error("ERROR COMPLETO:", err.response?.data || err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Error al guardar",
        icon: "error",
        confirmButtonColor: "#ad1457",
      });
    } 
  };

  return (
    <div className="container mt-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ color: "#ad1457", fontWeight: "bold" }}>
            Staff de Sasha
          </h2>
          <p className="text-muted">Profesionales del centro</p>
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
              <th>DNI</th>
              <th>CONTACTO</th>
              <th>DIRECCIÓN</th>
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
                  <td>{emp.dni || "-"}</td>
                  <td>{emp.telefono || "-"}</td>
                  <td>{emp.direccion || "-"}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleAbrirModal(emp)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={async () => {
                        const confirm = await Swal.fire({
                          title: "¿Eliminar profesional?",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Sí",
                        });

                        if (confirm.isConfirmed) {
                          await api.delete(`/profesionales/${emp._id}`);
                          cargarEmpleados();
                        }
                      }}
                    >
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
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>DNI</Form.Label>
              <Form.Control
                value={formData.dni}
                onChange={(e) =>
                  setFormData({ ...formData, dni: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
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
