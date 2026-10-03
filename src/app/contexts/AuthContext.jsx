import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext({});

const STORAGE_USER_KEY = "@sgpj:user";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Efeito executado apenas uma vez quando a aplicação inicializa                                                                                                                                       
    useEffect(() => {
        // Recupera dados do usuário do localStorage se já existirem                                                                                                                                         
        const storedUser = localStorage.getItem(STORAGE_USER_KEY);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Erro ao carregar dados do usuário do storage:", err);
                localStorage.removeItem(STORAGE_USER_KEY);
            }
        }
        setLoading(false);
    }, []);

    // Função de Login                                                                                                                                                                                     
    const login = async (email, senha) => {
        const userData = await authService.login(email, senha);

        // Atualiza estado e persiste dados do usuário para UX                                                                                                                                               
        setUser(userData);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));

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

    const updateUser = (updatedUser) => {
        setUser((currentUser) => {
            const nextUser = { ...currentUser, ...updatedUser };
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
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
