// src/App.jsx
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Nav/Nav";
import Footer from "./components/Footer/Footer";
// Importamos el nuevo panel de gestión de servicios
import AdminPanel from "./components/Adm/AdminPanel";

// Páginas Base
import Home from "./pages/Home";
import HomeUsuario from "./pages/HomeUsuario";
import HomeAdmin from "./pages/HomeAdmin";
import Login from "./pages/Login";
import Registro from "./pages/Registro";

// Páginas de Gestión
import GestionClientes from "./pages/GestionClientes";
import EmpleadosList from "./pages/EmpleadosList";
import TurnosAdmin from "./pages/TurnosAdmin";
import RutasProtegidas from "./routes/RutasProtegidas";

// Galería y Turnos (Componentes que terminamos recién)
import Galeria from "./pages/Galeria";
import GaleriaAdmin from "./pages/GaleriaAdmin";
import Turnos from "./pages/Turnos";

function App() {
  const { usuario } = useAuth();

  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/" element={<Home />} />
          <Route path="/galeria" element={<Galeria />} />

          <Route
            path="/login"
            element={
              !usuario ? (
                <Login />
              ) : (
                <Navigate
                  to={usuario.rol === "admin" ? "/admin" : "/usuario"}
                />
              )
            }
          />
          <Route
            path="/registro"
            element={
              !usuario ? (
                <Registro />
              ) : (
                <Navigate
                  to={usuario.rol === "admin" ? "/admin" : "/usuario"}
                />
              )
            }
          />

          {/* --- PANEL USUARIO (CLIENTES) --- */}
          <Route path="/usuario" element={<RutasProtegidas rol="usuario" />}>
            <Route index element={<HomeUsuario />} />
            <Route path="mis-turnos" element={<Turnos />} />
          </Route>
          {/* --- PANEL ADMIN (ESTÉTICA SASHA) --- */}
          <Route
            path="/admin"
            element={<RutasProtegidas rol="admin" />}
          >
            <Route index element={<HomeAdmin />} />
            <Route path="clientes" element={<GestionClientes />} />
            <Route path="staff" element={<EmpleadosList />} />
            <Route path="turnos" element={<TurnosAdmin />} />
            <Route path="galeria" element={<GaleriaAdmin />} />

            {/* AGREGÁ ESTA LÍNEA AQUÍ ABAJO */}
            <Route path="servicios" element={<AdminPanel />} />
          </Route>
          {/* --- RUTA DE ACCESO RÁPIDO A TURNOS --- */}
          <Route
            path="/agendar"
            element={
              usuario ? (
                usuario.rol === "admin" ? (
                  <Navigate to="/admin/turnos" />
                ) : (
                  <Navigate to="/usuario/mis-turnos" />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
