import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./Galeria.css";

const Galeria = () => {
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Tus fotos locales como respaldo
  const fotosLocales = [
    { _id: "1", url: "/lobby.jpg", titulo: "Nuestra Recepción" },
    { _id: "2", url: "/unas.jpg", titulo: "Manicuría Premium" },
    { _id: "3", url: "/depilacion.jpg", titulo: "Depilación Láser" },
    { _id: "4", url: "/masajes.jpg", titulo: "Sala de Relax" },
  ];

  useEffect(() => {
    const fetchFotos = async () => {
      try {
        const res = await api.get("/fotos");
        // Si el backend responde con fotos, las usamos.
        // Si viene vacío [], usamos las locales para que no se vea feo.
        if (res.data.length > 0) {
          setFotos(res.data);
        } else {
          setFotos(fotosLocales);
        }
      } catch (error) {
        console.error("Error cargando galería, usando locales:", error);
        setFotos(fotosLocales);
      } finally {
        setCargando(false);
      }
    };
    fetchFotos();
  }, []);

  return (
    <div className="galeria-container">
      <div className="spotlight-sasha"></div>

      <div className="galeria-header fade-in-down">
        <h2 className="galeria-title">Portfolio de Arte</h2>
        <p className="galeria-subtitle">Inspiración en cada detalle</p>
        <div className="title-underline-sasha"></div>
      </div>

      <div className="galeria-grid fade-in-up">
        {cargando ? (
          <div className="text-center w-100">
            <p className="text-pink">Preparando la muestra...</p>
          </div>
        ) : (
          fotos.map((foto) => (
            <div key={foto._id} className="foto-card-sasha">
              <div className="foto-frame-sasha">
                <img
                  src={foto.url}
                  alt={foto.titulo}
                  className="foto-img-sasha"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x500?text=Sasha+Estética";
                  }}
                />
              </div>
              <div className="foto-info-sasha">
                <h4 className="foto-titulo-sasha">{foto.titulo}</h4>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Galeria;
