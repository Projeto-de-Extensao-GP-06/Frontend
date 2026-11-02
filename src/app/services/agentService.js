import axios from "axios";

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || "http://localhost:8000";

export const agentApi = axios.create({
  baseURL: AGENT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Required for HttpOnly cookie authentication
});

// Interceptor to handle authentication errors from Agent Backend
agentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // If we get a 401 from Agent Backend, the session is invalid
    // The user needs to re-authenticate with the Backend Java
    if (status === 401) {
      // Create a custom error with clear message
      const customError = new Error("Sessão expirada. Faça login novamente.");
      customError.status = 401;
      customError.originalError = error;
      return Promise.reject(customError);
    }

    // Handle rate limiting
    if (status === 429) {
      const customError = new Error("Muitas tentativas. Aguarde alguns instantes.");
      customError.status = 429;
      customError.originalError = error;
      return Promise.reject(customError);
    }

    // Handle other errors
    const serverMessage = error.response?.data?.detail || error.response?.data?.message;
    const friendlyMessage = serverMessage || "Não foi possível conectar ao assistente. Tente novamente mais tarde.";

    const customError = new Error(friendlyMessage);
    customError.status = status;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);

export async function enviarMensagemAoAgente({ message, sessionId, dadosProcesso }) {
  const payload = {
    message,
    session_id: sessionId || null,
    dados_processo: dadosProcesso || null,
  };

  const response = await agentApi.post("/api/v1/chat", payload);
  const data = response.data;

  return {
    response: data?.resumo_response?.response || "",
    sessionId: data?.resumo_response?.session_id || sessionId,
    rawResponse: data?.raw_response || null,
  };
}

export async function limparSessaoAgente(sessionId) {
  if (!sessionId) return { success: true };

  try {
    const response = await agentApi.delete(`/api/v1/chat/${encodeURIComponent(sessionId)}`);
    return { success: true, data: response.data };
  } catch (error) {
    // Se a thread não foi encontrada ou já foi limpa, consideramos limpo com sucesso
    if (error.response?.status === 404) {
      return { success: true };
    }
    throw error;
  }
}
