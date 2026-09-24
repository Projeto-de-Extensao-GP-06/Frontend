import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    // OBRIGATÓRIO: permite envio e recebimento de cookies HttpOnly entre portas/domínios diferentes                                                                                                       
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor de resposta: extrai mensagens de erro amigáveis do backend                                                                                                                                
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const serverMessage = error.response?.data?.mensagem || error.response?.data?.message;

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