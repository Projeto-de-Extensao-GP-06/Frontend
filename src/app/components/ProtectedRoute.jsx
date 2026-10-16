import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Enquanto lê o estado inicial do localStorage, evita redirecionar indevidamente                                                                                                                      
    if (loading) {
        return null; // ou um spinner/skeleton                                                                                                                                                               
    }

    // Se não estiver logado, redireciona para o login guardando a página que tentou acessar                                                                                                               
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Usuário autenticado: renderiza o layout e as páginas filhas                                                                                                                                         
    return <Outlet />;
}