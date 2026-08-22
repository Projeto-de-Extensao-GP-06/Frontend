import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

const VLIBRAS_SCRIPT_URL = "https://vlibras.gov.br/app/vlibras-plugin.js";
const VLIBRAS_WIDGET_URL = "https://vlibras.gov.br/app";

export default function App() {
  useEffect(() => {
    const renderWidget = () => {
      if (!window.VLibras || window.__vlibrasWidget) return;
      window.__vlibrasWidget = new window.VLibras.Widget(VLIBRAS_WIDGET_URL);
      window.dispatchEvent(new Event("load"));
    };

    if (window.VLibras) {
      renderWidget();
      return;
    }

    const script = document.createElement("script");
    script.id = "vlibras-script";
    script.src = VLIBRAS_SCRIPT_URL;
    script.async = true;
    script.onload = renderWidget;
    script.onerror = () => {
      console.error("Não foi possível carregar o widget do VLibras.");
    };
    document.body.appendChild(script);
  }, []);

  return <>
    {/* Estrutura oficial exigida pelo script do VLibras */}
    <div vw="" className="enabled">
      <div vw-access-button="" className="active" />
      <div vw-plugin-wrapper="">
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
    <RouterProvider router={router} />
  </>;
}