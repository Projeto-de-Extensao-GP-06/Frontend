import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

const VLIBRAS_SCRIPT_URL = "https://vlibras.gov.br/app/vlibras-plugin.js";
const VLIBRAS_WIDGET_URL = "https://vlibras.gov.br/app";

export default function App() {
  useEffect(() => {
    // O botão real do VLibras (v7.8.0+) vive dentro de uma shadow DOM própria
    // (#vlibras-access-wrapper), isolada de CSS externo, e se posiciona sozinho
    // centralizado na vertical (top: calc(50vh - 20px)), sobrepondo formulários.
    // Só dá pra corrigir entrando na shadow root via JS.
    const pinAccessButton = () => {
      const wrapper = document.getElementById("vlibras-access-wrapper");
      const button = wrapper?.shadowRoot?.getElementById("vlibras-access");
      if (!button) return false;
      button.style.setProperty("top", "auto", "important");
      button.style.setProperty("bottom", "20px", "important");
      button.style.setProperty("right", "16px", "important");
      return true;
    };

    const renderWidget = () => {
      if (!window.VLibras || window.__vlibrasWidget) return;
      window.__vlibrasWidget = new window.VLibras.Widget(VLIBRAS_WIDGET_URL);
      window.dispatchEvent(new Event("load"));
      if (!pinAccessButton() && !window.__vlibrasPinObserver) {
        window.__vlibrasPinObserver = new MutationObserver(() => {
          if (pinAccessButton()) window.__vlibrasPinObserver.disconnect();
        });
        window.__vlibrasPinObserver.observe(document.body, { childList: true });
      }
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