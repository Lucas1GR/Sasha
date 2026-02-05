import { createContext, useContext } from "react";

export const AuthDataContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthDataContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
