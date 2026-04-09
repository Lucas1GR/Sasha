import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="home-container">
      {/* --- HERO --- */}
      <div className="hero-full">
        <div className="hero-overlay-content">
          <span className="welcome-tag">BIENVENIDA A TU MOMENTO</span>

          <h1 className="sasha-title">
            Estética <span className="highlight">Sasha</span>
          </h1>

          <h3 className="sasha-subtitle">BELLEZA & BIENESTAR</h3>

          <button
            className="btn-sasha-cta mt-4"
            onClick={() => navigate("/agendar")}
          >
            RESERVAR MI TURNO
          </button>
        </div>
      </div>

      {/* --- SERVICIOS --- */}
      <div className="container my-5 py-5">
        <h2 className="text-center section-title mb-5">
          NUESTROS TRATAMIENTOS
        </h2>

        <div className="row justify-content-center g-4">
          {/* FACIALES */}
          <div className="col-md-4">
            <div
              className="service-box"
              style={{ backgroundImage: "url('cosmetologia.jpg')" }}
              onClick={() => toggleSection("faciales")}
            >
              <div className="overlay">
                <h3>FACIALES</h3>
              </div>
            </div>

            {openSection === "faciales" && (
              <div className="service-content">
                <p>Limpieza profunda</p>
                <p>Dermaplaning</p>
                <p>Peeling químico</p>
              </div>
            )}
          </div>

          {/* CORPORALES */}
          <div className="col-md-4">
            <div
              className="service-box"
              style={{ backgroundImage: "url('relajante.jpg')" }}
              onClick={() => toggleSection("corporales")}
            >
              <div className="overlay">
                <h3>CORPORALES</h3>
              </div>
            </div>

            {openSection === "corporales" && (
              <div className="service-content">
                <p>Masajes relajantes</p>
                <p>Drenaje linfático</p>
                <p>Masajes Descontracturantes</p>
              </div>
            )}
          </div>

          {/* PESTAÑAS */}
          <div className="col-md-4">
            <div
              className="service-box"
              style={{ backgroundImage: "url('pestañas.jpg')" }}
              onClick={() => toggleSection("pestanias")}
            >
              <div className="overlay">
                <h3>PESTAÑAS</h3>
              </div>
            </div>

            {openSection === "pestanias" && (
              <div className="service-content">
                <p>Lifting de pestañas</p>
                <p>Extensión de pestañas pxp</p>
                <p>Perfilado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
