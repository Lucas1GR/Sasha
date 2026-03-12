import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RutasProtegidas = ({ rol }) => {
  const { usuario } = useAuth();

  // 1. Si no hay usuario logueado, mandarlo al Login
  if (!usuario) return <Navigate to="/login" replace />;

  // 2. Si hay usuario pero no tiene el rol correcto
  if (rol && usuario.rol !== rol) {
    // Redirección inteligente:
    // Sasha (Admin) intentando entrar como clienta
    if (usuario.rol === "admin" && rol === "usuario") {
      return <Navigate to="/admin" replace />;
    }

    // Clienta intentando entrar al panel Admin de Sasha
    if (usuario.rol === "usuario" && rol === "admin") {
      return <Navigate to="/usuario" replace />;
    }

    // Caso de error visual: Acceso Denegado Estético
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fdfdfd",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "3rem",
            borderRadius: "25px",
            border: "1px solid #fce4ec",
            boxShadow: "0 15px 35px rgba(173, 20, 87, 0.08)",
            maxWidth: "500px",
          }}
        >
          <h1
            style={{
              color: "#ad1457",
              fontWeight: "300",
              fontSize: "4rem",
              margin: 0,
            }}
          >
            ✨
          </h1>
          <h2
            style={{
              color: "#ad1457",
              fontWeight: "700",
              textTransform: "uppercase",
              margin: "20px 0",
              letterSpacing: "2px",
            }}
          >
            Área Privada
          </h2>
          <p style={{ color: "#777", fontSize: "1.1rem", lineHeight: "1.6" }}>
            Lo sentimos, no tienes los permisos necesarios para acceder a esta
            sección. Si crees que esto es un error, por favor contacta con
            soporte.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              marginTop: "20px",
              padding: "10px 25px",
              borderRadius: "50px",
              border: "none",
              backgroundColor: "#ad1457",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // 3. Si todo está bien, renderizar las rutas hijas
  return <Outlet />;
};

export default RutasProtegidas;
