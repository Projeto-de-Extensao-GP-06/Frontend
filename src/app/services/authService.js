import { api } from "./api";

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
};