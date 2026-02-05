import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-sasha pt-5 pb-4">
      <div className="container text-center text-md-start">
        <div className="row text-center text-md-start">
          {/* COLUMNA 1: MARCA */}
          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold title-footer">
              Estética Sasha
            </h5>
            <p>
              Tu momento de relax y cuidado personal en Gregorio de Laferrere a
              metros de ruta N3. Realzamos tu belleza natural con tratamientos
              exclusivos y atención personalizada.
            </p>
          </div>

          {/* COLUMNA 2: CONTACTO */}
          <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-accent">
              Contacto
            </h5>

            {/* WHATSAPP REAL */}
            <p>
              <a
                href="https://wa.me/5491150205950"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link d-flex align-items-center justify-content-center justify-content-md-start gap-2"
              >
                <i className="bi bi-whatsapp"></i> 11 5020-5950
              </a>
            </p>

            {/* EMAIL (Podés dejar el anterior o poner uno de Sasha) */}
            <p>
              <a
                href="email:esteticasasha@gmail.com"
                className="footer-link d-flex align-items-center justify-content-center justify-content-md-start gap-2"
              >
                <i className="bi bi-envelope"></i> esteticasasha@gmail.com
              </a>
            </p>

            {/* UBICACIÓN */}
            <p>
              <a
                href="#"
                className="footer-link d-flex align-items-center justify-content-center justify-content-md-start gap-2"
              >
                <i className="bi bi-geo-alt"></i> Gregorio de Laferrere, Buenos
                Aires
              </a>
            </p>
          </div>

          {/* COLUMNA 3: REDES SOCIALES REALES */}
          <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-accent">
              Síguenos
            </h5>
            <div className="d-flex flex-column gap-2 align-items-center align-items-md-start">
              <a
                href="https://www.instagram.com/estetica.sasha/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-social-sasha"
              >
                Instagram
              </a>
              <a href="#" className="btn-social-sasha">
                Facebook
              </a>
            </div>
          </div>
        </div>

        <hr className="mb-4 hr-sasha" />

        {/* COPYRIGHT Y CRÉDITOS */}
        <div className="row align-items-center">
          <div className="col-md-12 text-center">
            <p className="copyright-text">
              © {new Date().getFullYear()} <strong>Estética Sasha</strong>.
              Todos los derechos reservados.
              <br />
              <span className="dev-credits">
                Página creada por <strong>Lucas Romero</strong> &{" "}
                <strong>Denise Esperon</strong>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
