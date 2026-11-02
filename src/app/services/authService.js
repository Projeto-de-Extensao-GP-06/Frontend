import { api } from "@/app/provider/api";
import { agentApi } from "./agentService";

export const authService = {
    /**
     * Realiza login enviando email e senha.
     * O backend grava os cookies HttpOnly e retorna os dados de sessão do usuário.
     */
    async login(email, senha) {
        const response = await api.post("/auth/login", { email, senha });
        return response.data; // Retorna { id, nome, email, cargo, permissoes }
    },

    /**
     * Valida a sessão ativa do usuário junto ao backend.
     * Usa o cookie HttpOnly de sessão (enviado automaticamente via withCredentials).
     * Retorna os dados atualizados do usuário se a sessão for válida.
     * Lança erro (401) se o cookie estiver ausente, inválido ou expirado.
     */
    async me() {
        const response = await api.get("/auth/me");
        return response.data; // Retorna { id, nome, email, cargo, permissoes }
    },

    /**
     * Atualiza os tokens de autenticação via cookie HttpOnly refreshToken.
     * O backend valida o refreshToken atual, rotaciona e emite novos cookies (authToken e refreshToken).
     */
    async refreshToken() {
        const response = await api.post("/auth/refresh-token");
        return response.data;
    },

    /**
     * Encerra a sessão no backend e limpa os cookies HttpOnly.
     */
    async logout() {
        await api.post("/auth/logout");
    },

    /**
     * Envia código OTP para redefinição de senha (usuário existente).
     */
    async enviarRedefinirSenhaOtp(email) {
        const response = await api.post("/auth/enviar-redefinir-senha-otp", { email });
        return response.data;
    },

    /**
     * Envia código OTP para primeiro acesso (definir senha inicial).
     */
    async enviarDefinirSenhaOtp(email) {
        const response = await api.post("/auth/enviar-definir-senha-otp", { email });
        return response.data;
    },

    /**
     * Valida o código OTP de 6 dígitos.
     * O backend grava o cookie temporário HttpOnly (Path=/auth) para autorizar a definição de senha.
     */
    async validarOtp(email, otp) {
        const response = await api.post("/auth/validar-otp", { email, otp });
        return response.data;
    },

    /**
     * Define a nova senha.
     * O cookie HttpOnly gerado no validarOtp é enviado automaticamente pelo Axios com withCredentials.
     */
    async definirNovaSenha(senha) {
        const response = await api.post("/auth/definir-nova-senha", { senha });
        return response.data;
    },

    /**
     * Valida o token JWT com o Agent Backend.
     * Útil para verificar se o token é válido antes de fazer requisições ao agente.
     */
    async validateAgentToken() {
        const response = await agentApi.get("/auth/validate");
        return response.data; // Returns { valid: bool, email: string, scope: string }
    },

    /**
     * Faz logout do Agent Backend.
     * Revoga o token e remove os cookies do Agent Backend.
     */
    async logoutAgent() {
        await agentApi.post("/auth/logout");
    },
};