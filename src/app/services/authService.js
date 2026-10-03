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
};