import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext({});

const STORAGE_USER_KEY = "@sgpj:user";

/**
 * Seleciona apenas os campos mínimos necessários para UX antes de salvar no localStorage.
 * Permissões e dados sensíveis não devem ser persistidos localmente — a autorização
 * real deve sempre ser validada pelo backend.
 */
function pickStorageData(data) {
    if (!data) return {};
    const { id, nome, email, cargo, cargoNome } = data;
    return { id, nome, email, cargo, cargoNome };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Efeito executado apenas uma vez quando a aplicação inicializa
    useEffect(() => {
        async function validarSessao() {
            const storedUser = localStorage.getItem(STORAGE_USER_KEY);

            // Se não há dados locais, não há sessão para validar
            if (!storedUser) {
                setLoading(false);
                return;
            }

            try {
                // Carrega dados prévios para manter a interface consistente durante a checagem
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    // ignora falha de parse
                }

                // Valida com o backend se o cookie de sessão ainda é válido
                // (se o access token estiver expirado, o interceptor renovará automaticamente via refresh-token)
                const userData = await authService.me();
                setUser(userData);
                localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(pickStorageData(userData)));
            } catch (err) {
                // Sessão expirada ou inválida no backend (refresh token também expirou/revogado) — limpa dados locais
                console.warn("Sessão inválida ou expirada:", err.message);
                setUser(null);
                localStorage.removeItem(STORAGE_USER_KEY);
            } finally {
                setLoading(false);
            }
        }

        validarSessao();
    }, []);

    // Função de Login
    const login = async (email, senha) => {
        const userData = await authService.login(email, senha);

        // Atualiza estado e persiste apenas dados mínimos de UX no localStorage
        setUser(userData);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(pickStorageData(userData)));

        return userData;
    };

    // Função de Logout
    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.warn("Erro ao deslogar no backend:", err);
        } finally {
            // Sempre limpa os dados locais, mesmo se o backend falhar
            setUser(null);
            localStorage.removeItem(STORAGE_USER_KEY);
        }
    };

    // Atualiza dados locais do usuário (ex: após salvar perfil)
    const updateUser = (updatedUser) => {
        setUser((currentUser) => {
            const nextUser = { ...currentUser, ...updatedUser };
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(pickStorageData(nextUser)));
            return nextUser;
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                logout,
                updateUser,
                refreshToken: authService.refreshToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook customizado para facilitar o uso nos componentes
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
    }

    return context;
}
