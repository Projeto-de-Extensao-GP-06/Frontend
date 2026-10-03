import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true, // Instrui o navegador a enviar cookies (incluindo HttpOnly) automaticamente
});
