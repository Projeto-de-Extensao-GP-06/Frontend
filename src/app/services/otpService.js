import { api } from "./api";

export const otpService = {
    async enviarRedefinirSenhaOtp(email) {
        const response = await api.post("/auth/enviar-redefinir-senha-otp", { email });
        return response.data;
    },

    async enviarDefinirSenhaOtp(email) {
        const response = await api.post("/auth/enviar-definir-senha-otp", { email });
        return response.data;
    },

    async validarOtp(email, otp) {
        const response = await api.post("/auth/validar-otp", { email, otp });
        return response.data;
    },

    async definirSenha(senha) {
        const response = await api.post("/auth/definir-senha", { senha });
        return response.data;
    }
}