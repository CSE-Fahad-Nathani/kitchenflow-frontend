import axios from "axios";

const isProd =
  String(import.meta.env.VITE_PROD).toLowerCase() === "true";

const baseURL = isProd
  ? import.meta.env.VITE_API_URL_PROD ||
    "https://kitchenflow-backend-w2cu.onrender.com/api"
  : import.meta.env.VITE_API_URL_LOCAL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
