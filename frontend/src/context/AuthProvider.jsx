import { useState, useEffect } from "react";
import { AuthDataContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        setUsuario(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        localStorage.clear();
      }
    }
    setCargando(false);
  }, []);

  const login = (userData, tokenData) => {
    setUsuario(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthDataContext.Provider value={{ usuario, token, login, logout }}>
      {!cargando && children}
    </AuthDataContext.Provider>
  );
};
