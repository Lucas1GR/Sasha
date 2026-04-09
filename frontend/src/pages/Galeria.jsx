import React from "react";
import "./Galeria.css";

const Galeria = () => {
  return (
    <div className="historia-container">
      {/* 🌸 HISTORIA */}
      <div className="historia-header fade-in-down">
        <h2 className="historia-title">Nuestra Historia</h2>
        <p className="historia-subtitle">
          Un espacio pensado para tu bienestar
        </p>
        <div className="title-underline-sasha"></div>
      </div>

      <div className="historia-texto fade-in-up">
        <p>
          En Sasha Estética creamos un ambiente donde cada detalle está pensado
          para que te sientas cómoda, relajada y cuidada.
        </p>

        <p>
          Nuestro objetivo es brindarte una experiencia única, combinando
          profesionalismo, calidez y los mejores tratamientos.
        </p>

        <p>Cada momento de autocuidado es una inversión en vos </p>
      </div>

      {/* 📸 FOTOS */}
      <div className="historia-galeria fade-in-up">
        <div className="foto-box">
          <img src="recepcion.jpg" alt="Recepción" />
        </div>

        <div className="foto-box">
         <img src="/gabinete.jpg" alt="gabinete" />
        </div>
      </div>

      {/* 💖 BOTÓN */}
      <div className="historia-btn-container">
        <button
          className="btn-sasha-primary"
          onClick={() =>
            window.open(
              "https://www.google.com/maps/place/Rodney+4891,+B1757DCY+Gregorio+de+Laferrere,+Provincia+de+Buenos+Aires/@-34.7434522,-58.604947,19z",
              "_blank",
            )
          }
        >
          Quiero conocer el estudio
        </button>
      </div>
    </div>
  );
};

export default Galeria;
