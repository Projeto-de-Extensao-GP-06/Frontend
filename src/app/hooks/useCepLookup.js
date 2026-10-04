import { useEffect, useState } from "react";
import { buscarEnderecoPorCEP } from "../services/cepService";

export function useCepLookup(cep, enabled = true) {
  const [lookup, setLookup] = useState({ loading: false, error: "", data: null, requestedCep: "" });
  const cepSanitizado = String(cep ?? "").replace(/\D/g, "");

  useEffect(() => {
    if (!enabled || cepSanitizado.length !== 8) {
      setLookup({ loading: false, error: "", data: null, requestedCep: "" });
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    setLookup({ loading: true, error: "", data: null, requestedCep: cepSanitizado });
    buscarEnderecoPorCEP(cepSanitizado, { signal: controller.signal })
      .then((data) => {
        if (active) setLookup({ loading: false, error: "", data, requestedCep: cepSanitizado });
      })
      .catch((error) => {
        if (!active || error.name === "AbortError") return;
        setLookup({ loading: false, error: error.message, data: null, requestedCep: cepSanitizado });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [cepSanitizado, enabled]);

  return lookup;
}
