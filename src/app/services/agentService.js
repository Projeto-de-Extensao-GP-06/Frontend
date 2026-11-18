import axios from "axios";
import { refreshSessionOnce, handleSessionExpiredRedirect } from "@/app/provider/api";

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
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // 401 no Agent Backend: tenta renovar o token no Backend Java (promise compartilhada)
    // e repete a requisição original uma única vez. Só expira a sessão se o refresh falhar.
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshSessionOnce();
      } catch (refreshError) {
        handleSessionExpiredRedirect();
        const customError = new Error("Sessão expirada. Faça login novamente.");
        customError.status = 401;
        customError.originalError = refreshError;
        return Promise.reject(customError);
      }
      return agentApi(originalRequest);
    }

    if (status === 401) {
      handleSessionExpiredRedirect();
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

function isIdKey(key) {
  if (typeof key !== "string") return false;
  return (
    /^(id|ids)$/i.test(key) ||
    /(^|_)(id|ids)(_|$)/i.test(key) ||
    /[a-z0-9](Id|ID|Ids|IDs)(?=[A-Z_]|$)/.test(key) ||
    /^(id|ID)[A-Z]/.test(key)
  );
}

export function removerIdsProcesso(valor) {
  if (Array.isArray(valor)) {
    return valor.map(removerIdsProcesso);
  }
  if (valor !== null && typeof valor === "object" && !(valor instanceof Date)) {
    return Object.entries(valor).reduce((acc, [chave, val]) => {
      if (!isIdKey(chave)) {
        acc[chave] = removerIdsProcesso(val);
      }
      return acc;
    }, {});
  }
  return valor;
}

function obterTimezoneNavegador() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  } catch {
    return "America/Sao_Paulo";
  }
}

export async function enviarMensagemAoAgente({
  message,
  sessionId,
  dadosProcesso,
  dadosDashboard,
}) {
  const payload = {
    message,
    session_id: sessionId || null,
    dados_processo: dadosProcesso ? removerIdsProcesso(dadosProcesso) : null,
    dados_dashboard: dadosDashboard ? removerIdsProcesso(dadosDashboard) : null,
    timezone: obterTimezoneNavegador(),
  };

  const response = await agentApi.post("/api/v1/chat", payload);
  const data = response.data;

  return {
    response: data?.resumo_response?.response || "",
    sessionId: data?.resumo_response?.session_id || sessionId,
    attachments: Array.isArray(data?.resumo_response?.attachments)
      ? data.resumo_response.attachments
      : [],
    charts: Array.isArray(data?.resumo_response?.charts)
      ? data.resumo_response.charts
      : [],
    rawResponse: data?.raw_response || null,
  };
}

export const AGENT_CHAT_SESSION_STORAGE_KEY = "sgpj_maria_chat_session";

/**
 * Remove imediatamente a sessão de chat do agente do sessionStorage local.
 */
export function removerSessaoAgenteLocal() {
  try {
    sessionStorage.removeItem(AGENT_CHAT_SESSION_STORAGE_KEY);
  } catch {
    // ignora falha ao acessar o sessionStorage
  }
}

/**
 * Exclui a sessão de chat do agente guardada no navegador (backend + sessionStorage).
 * Deve ser chamada ANTES de revogar o token do agente, pois a exclusão exige autenticação.
 */
export async function limparSessaoAgenteArmazenada() {
  try {
    const raw = sessionStorage.getItem(AGENT_CHAT_SESSION_STORAGE_KEY);
    const sessionId = raw ? JSON.parse(raw)?.sessionId : null;
    if (sessionId) {
      await limparSessaoAgente(sessionId);
    }
  } catch (err) {
    console.warn("Não foi possível excluir a sessão do agente:", err);
  } finally {
    removerSessaoAgenteLocal();
  }
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
