import { createBrowserRouter } from "react-router";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import PasswordResetPage from "./pages/PasswordResetPage";
import PublicSitePage from "./pages/PublicSitePage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import NewClientWizardPage from "./pages/NewClientWizardPage";
import EditClientPage from "./pages/EditClientPage";
import ProcessDetailPage from "./pages/ProcessDetailPage";
import NewProcessPage from "./pages/NewProcessPage";
import EditProcessPage from "./pages/EditProcessPage";
import RequestsPage from "./pages/RequestsPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import UsersPage from "./pages/UsersPage";
import NewUserPage from "./pages/NewUserPage";
import UserDetailPage from "./pages/UserDetailPage";
import RolesPage from "./pages/RolesPage";
import ProfilePage from "./pages/ProfilePage";
import LegalPage from "./pages/LegalPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";
import {
  PERMISSIONS,
  USER_MODULE_PERMISSIONS,
  ROLE_MODULE_PERMISSIONS,
} from "./utils/permissions";

export const router = createBrowserRouter([{
  path: "/login",
  Component: LoginPage
}, {
  path: "/redefinir-senha",
  Component: PasswordResetPage
}, {
  path: "/",
  Component: PublicSitePage
}, {
  path: "/politica-de-privacidade",
  Component: LegalPage
}, {
  path: "/termos-de-uso",
  Component: LegalPage
}, {
  path: "/app",
  Component: ProtectedRoute,
  children: [{
    Component: AppLayout,
    children: [{
      index: true,
      Component: HomePage
    }, {
      path: "inicio",
      Component: HomePage
    }, {
      path: "dashboard",
      Component: DashboardPage
    }, {
      path: "assistente",
      Component: AIAssistantPage
    }, {
      path: "clientes",
      Component: ClientsPage
    }, {
      path: "clientes/novo",
      element: (
        <PermissionRoute
          permissions={[PERMISSIONS.CRIAR_CLIENTE]}
          resourceName="a página de Novo Cliente"
        >
          <NewClientWizardPage />
        </PermissionRoute>
      ),
    }, {
      path: "clientes/:id",
      Component: ClientDetailPage
    }, {
      path: "clientes/:id/editar",
      element: (
        <PermissionRoute
          permissions={[PERMISSIONS.EDITAR_CLIENTE]}
          resourceName="a página de Edição de Cliente"
        >
          <EditClientPage />
        </PermissionRoute>
      ),
    }, {
      path: "processos/novo",
      element: (
        <PermissionRoute
          permissions={[PERMISSIONS.CRIAR_PROCESSO]}
          resourceName="a página de Novo Processo"
        >
          <NewProcessPage />
        </PermissionRoute>
      ),
    }, {
      path: "processos/:id",
      Component: ProcessDetailPage
    }, {
      path: "processos/:id/editar",
      element: (
        <PermissionRoute
          permissions={[PERMISSIONS.EDITAR_PROCESSO]}
          resourceName="a página de Edição de Processo"
        >
          <EditProcessPage />
        </PermissionRoute>
      ),
    }, {
      path: "solicitacoes",
      Component: RequestsPage
    }, {
      path: "solicitacoes/:id",
      Component: RequestDetailPage
    }, {
      path: "usuarios",
      element: (
        <PermissionRoute
          permissions={USER_MODULE_PERMISSIONS}
          resourceName="a página de Usuários"
        >
          <UsersPage />
        </PermissionRoute>
      ),
    }, {
      path: "usuarios/novo",
      element: (
        <PermissionRoute
          permissions={[PERMISSIONS.CRIAR_USUARIO]}
          resourceName="a página de Novo Usuário"
        >
          <NewUserPage />
        </PermissionRoute>
      ),
    }, {
      path: "usuarios/:id",
      element: (
        <PermissionRoute
          permissions={USER_MODULE_PERMISSIONS}
          resourceName="os detalhes do Usuário"
        >
          <UserDetailPage />
        </PermissionRoute>
      ),
    }, {
      path: "cargos",
      element: (
        <PermissionRoute
          permissions={ROLE_MODULE_PERMISSIONS}
          resourceName="a página de Cargos e Permissões"
        >
          <RolesPage />
        </PermissionRoute>
      ),
    }, {
      path: "perfil",
      Component: ProfilePage
    }]
  }]
}]);
