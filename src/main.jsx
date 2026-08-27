import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import "./styles/index.css";
import initTracing from "./app/utils/tracing";

// Initialize OpenTelemetry tracing
initTracing();

createRoot(document.getElementById("root")).render(<App />);