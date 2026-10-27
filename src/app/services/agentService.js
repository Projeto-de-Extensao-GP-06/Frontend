import axios from "axios";

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || "http://localhost:8000";

export const agentApi = axios.create({
  baseURL: AGENT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
