import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    // OBRIGATÓRIO: permite envio e recebimento de cookies HttpOnly entre portas/domínios diferentes
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Endpoints de autenticação que não devem disparar o redirect automático em 401
const AUTH_ENDPOINTS = ["/auth/login", "/auth/validar-otp", "/auth/me"];

// Interceptor de resposta: extrai mensagens de erro amigáveis e redireciona em caso de sessão expirada
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || "";
        const serverMessage = error.response?.data?.mensagem || error.response?.data?.message;

        // Se a sessão expirou em uma rota protegida, redireciona para o login
        const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => requestUrl.includes(endpoint));
        if (status === 401 && !isAuthEndpoint) {
            localStorage.removeItem("@sgpj:user");
            window.location.replace("/login");
            return Promise.reject(new Error("Sessão expirada."));
        }

        let friendlyMessage = serverMessage;

        if (!friendlyMessage) {
            if (status === 401) {
                friendlyMessage = "E-mail ou senha incorretos.";
            } else if (status === 403) {
                friendlyMessage = "Acesso não autorizado.";
            } else if (status === 429) {
                friendlyMessage = "Muitas tentativas. Aguarde alguns instantes.";
            } else {
                friendlyMessage = "Não foi possível conectar ao servidor. Tente novamente mais tarde.";
            }
        }

        // Criamos um erro limpo para a UI capturar facilmente
        const customError = new Error(friendlyMessage);
        customError.status = status;
        customError.originalError = error;

        return Promise.reject(customError);
    });
