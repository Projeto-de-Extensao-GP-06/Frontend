import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : (import.meta.env.DEV ? "http://localhost:8080" : ""),
    // OBRIGATÓRIO: permite envio e recebimento de cookies HttpOnly entre portas/domínios diferentes
    withCredentials: true,
});

// Garante que uploads multipart/form-data não sejam forçados para application/json
api.interceptors.request.use((config) => {
    if (config.data instanceof FormData && config.headers) {
        delete config.headers["Content-Type"];
    }
    return config;
});


// Endpoints que NÃO devem disparar a tentativa de refresh token quando retornarem 401
const NO_REFRESH_ENDPOINTS = [
    "/auth/login",
    "/auth/refresh-token",
    "/auth/validar-otp",
    "/auth/enviar-redefinir-senha-otp",
    "/auth/enviar-definir-senha-otp",
    "/auth/logout",
];

// Rotas públicas no frontend que não devem sofrer redirect forçado para /login
const PUBLIC_PATHS = [
    "/login",
    "/redefinir-senha",
    "/politica-de-privacidade",
    "/termos-de-uso",
];

const isPublicRoute = () => {
    if (typeof window === "undefined") return false;
    const pathname = window.location.pathname;
    if (pathname === "/") return true;
    return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
};

const handleSessionExpired = () => {
    localStorage.removeItem("@sgpj:user");
    if (!isPublicRoute()) {
        window.location.replace("/login");
    }
};

// Controle de fila de requisições concorrentes durante o refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Interceptor de resposta: renova o token automaticamente via /auth/refresh-token em 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const requestUrl = originalRequest?.url || "";
        const responseData = error.response?.data;
        let serverMessage = responseData?.mensagem || responseData?.message;
        if (!serverMessage && responseData?.errors && typeof responseData.errors === 'object') {
            const errValues = Object.values(responseData.errors);
            if (errValues.length > 0) serverMessage = errValues[0];
        } else if (!serverMessage && typeof responseData === 'string' && responseData.trim()) {
            serverMessage = responseData;
        }

        const isNoRefreshEndpoint = NO_REFRESH_ENDPOINTS.some((endpoint) =>
            requestUrl.includes(endpoint)
        );

        // Se a resposta for 401 em uma rota protegida e a requisição ainda não foi retentada
        if (status === 401 && !originalRequest?._retry && !isNoRefreshEndpoint) {
            if (isRefreshing) {
                // Se já há um refresh em andamento, enfileira a requisição para evitar chamadas simultâneas
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        originalRequest._retry = true;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Chama o endpoint de renovação de token (envia o cookie HttpOnly refreshToken)
                await api.post("/auth/refresh-token");

                // Libera todas as requisições que aguardavam a conclusão do refresh
                processQueue(null);

                // Retenta a requisição original com os novos cookies aplicados pelo navegador
                return api(originalRequest);
            } catch (refreshError) {
                // Se o refresh falhar (token expirado/revogado), cancela a fila e limpa a sessão
                processQueue(refreshError);
                handleSessionExpired();

                const friendlyMessage = "Sessão expirada. Faça login novamente.";
                const customError = new Error(friendlyMessage);
                customError.status = 401;
                customError.originalError = refreshError;
                return Promise.reject(customError);
            } finally {
                isRefreshing = false;
            }
        }

        // Se o próprio refresh token retornou 401 ou uma requisição já retentada continuou em 401
        if (status === 401 && (requestUrl.includes("/auth/refresh-token") || originalRequest?._retry)) {
            handleSessionExpired();
        }

        let friendlyMessage = serverMessage;

        if (!friendlyMessage) {
            if (status === 401) {
                friendlyMessage = requestUrl.includes("/auth/login")
                    ? "E-mail ou senha incorretos."
                    : "Sessão expirada. Faça login novamente.";
            } else if (status === 403) {
                friendlyMessage = "Acesso não autorizado.";
            } else if (status === 429) {
                friendlyMessage = "Muitas tentativas. Aguarde alguns instantes.";
            } else {
                friendlyMessage = "Não foi possível conectar ao servidor. Tente novamente mais tarde.";
            }
        }

        // Criamos um erro padronizado para a interface capturar facilmente
        const customError = new Error(friendlyMessage);
        customError.status = status;
        customError.originalError = error;

        return Promise.reject(customError);
    }
);
