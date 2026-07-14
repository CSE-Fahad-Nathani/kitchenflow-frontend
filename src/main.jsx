import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import "./styles/toast.css";
import App from "./App.jsx";
import Toast from "./components/Toast.jsx";

registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <App />
      <Toast />
    </>
  </StrictMode>
);