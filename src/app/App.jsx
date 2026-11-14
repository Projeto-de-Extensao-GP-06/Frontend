import { useEffect, useRef, useState } from "react";
import { RouterProvider } from "react-router";
import { LoaderCircle } from "lucide-react";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

const VLIBRAS_SCRIPT_URL = "https://vlibras.gov.br/app/vlibras-plugin.js";
const VLIBRAS_WIDGET_URL = "https://vlibras.gov.br/app";
const VLIBRAS_MOBILE_STYLES = `
  @media (max-width: 640px) {
    :host {
      --widget-width: min(240px, calc(100vw - 24px));
      --player-height: clamp(180px, 36dvh, 240px);
    }

    :host #vlibras-app > .widget-radius {
      --player-height: clamp(180px, 36dvh, 240px) !important;
      max-height: 70dvh;
      overflow-y: auto;
    }

    :host([data-expanded="true"]) #vlibras-app {
      inset: auto 12px calc(12px + env(safe-area-inset-bottom)) auto !important;
      width: min(280px, calc(100vw - 24px)) !important;
      max-width: calc(100vw - 24px) !important;
      transform: none !important;
    }

    :host([data-expanded="true"]) #vlibras-app > .widget-radius {
      width: 100% !important;
      max-height: 70dvh;
      overflow-y: auto;
      border-radius: 12px !important;
    }
  }
`;

export default function App() {
  const [isNavigating, setIsNavigating] = useState(
    () => router.state.navigation.state !== "idle",
  );
  const currentLocationKey = useRef(router.state.location.key);

  useEffect(() => {
    let hideIndicatorTimeout;
    const unsubscribe = router.subscribe((state) => {
      if (state.navigation.state !== "idle") {
        window.clearTimeout(hideIndicatorTimeout);
        setIsNavigating(true);
        return;
      }

      const locationChanged = state.location.key !== currentLocationKey.current;
      currentLocationKey.current = state.location.key;
      if (locationChanged) {
        window.clearTimeout(hideIndicatorTimeout);
        setIsNavigating(true);
        hideIndicatorTimeout = window.setTimeout(
          () => setIsNavigating(false),
          250,
        );
      } else {
        window.clearTimeout(hideIndicatorTimeout);
        setIsNavigating(false);
      }
    });

    return () => {
      unsubscribe();
      window.clearTimeout(hideIndicatorTimeout);
    };
  }, []);

  useEffect(() => {
    // O botão real do VLibras (v7.8.0+) vive dentro de uma shadow DOM própria
    // (#vlibras-access-wrapper), isolada de CSS externo, e se posiciona sozinho
    // centralizado na vertical. Só dá pra corrigir entrando na shadow root via JS.
    const pinAccessButton = () => {
      const wrapper = document.getElementById("vlibras-access-wrapper");
      const button = wrapper?.shadowRoot?.getElementById("vlibras-access");
      if (!button) return false;
      button.style.setProperty("top", "auto", "important");
      button.style.setProperty("right", "auto", "important");
      button.style.setProperty("left", "16px", "important");
      button.style.setProperty(
        "bottom",
        window.matchMedia("(max-width: 640px)").matches
          ? "calc(16px + env(safe-area-inset-bottom))"
          : "65%",
        "important",
      );
      return true;
    };

    const applyMobileWidgetStyles = () => {
      const widgetRoot = document.getElementById("vlibras-app-root");
      const shadowRoot = widgetRoot?.shadowRoot;
      if (!shadowRoot || shadowRoot.getElementById("vlibras-mobile-styles")) {
        return Boolean(shadowRoot);
      }

      const styles = document.createElement("style");
      styles.id = "vlibras-mobile-styles";
      styles.textContent = VLIBRAS_MOBILE_STYLES;
      shadowRoot.appendChild(styles);
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
      if (!applyMobileWidgetStyles() && !window.__vlibrasLayoutObserver) {
        window.__vlibrasLayoutObserver = new MutationObserver(() => {
          if (applyMobileWidgetStyles()) {
            window.__vlibrasLayoutObserver.disconnect();
          }
        });
        window.__vlibrasLayoutObserver.observe(document.body, {
          childList: true,
        });
      }
    };

    const updateAccessButtonPosition = () => pinAccessButton();
    window.addEventListener("resize", updateAccessButtonPosition);

    if (window.VLibras) {
      renderWidget();
      return () =>
        window.removeEventListener("resize", updateAccessButtonPosition);
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
    return () =>
      window.removeEventListener("resize", updateAccessButtonPosition);
  }, []);

  return (
    <>
      {/* Estrutura oficial exigida pelo script do VLibras */}
      <div vw="" className="enabled">
        <div vw-access-button="" className="active" />
        <div vw-plugin-wrapper="">
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>

      <AuthProvider>
        <RouterProvider router={router} />
        {isNavigating && (
          <div
            className="app-navigation-loading"
            role="status"
            aria-live="polite"
            aria-label="Carregando tela..."
          >
            <LoaderCircle size={32} className="animate-spin" aria-hidden="true" />
          </div>
        )}
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </>
  );
}