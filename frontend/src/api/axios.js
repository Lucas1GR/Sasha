import axios from "axios";

const api = axios.create({
  // Eliminamos la URL de render vieja y el punto final
  baseURL: "http://localhost:3000/api",
});

// Interceptor para enviar el token en cada petición
api.interceptors.request.use(
  (config) => {
    // IMPORTANTE: Cambiamos sessionStorage por localStorage
    // para que coincida con lo que pusimos en el Login
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("🔑 Token enviado"); // Opcional para debug
    } else {
      // console.log("❌ No se encontró token."); // Opcional
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
