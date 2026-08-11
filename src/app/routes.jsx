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
import RolesPage from "./pages/RolesPage";
import ProfilePage from "./pages/ProfilePage";
export const router = createBrowserRouter([{
  path: "/",
  Component: LoginPage
}, {
  path: "/redefinir-senha",
  Component: PasswordResetPage
}, {
  path: "/site",
  Component: PublicSitePage
}, {
  path: "/app",
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
    Component: NewClientWizardPage
  }, {
    path: "clientes/:id",
    Component: ClientDetailPage
  }, {
    path: "clientes/:id/editar",
    Component: EditClientPage
  }, {
    path: "processos/novo",
    Component: NewProcessPage
  }, {
    path: "processos/:id",
    Component: ProcessDetailPage
  }, {
    path: "processos/:id/editar",
    Component: EditProcessPage
  }, {
    path: "solicitacoes",
    Component: RequestsPage
  }, {
    path: "solicitacoes/:id",
    Component: RequestDetailPage
  }, {
    path: "usuarios",
    Component: UsersPage
  }, {
    path: "cargos",
    Component: RolesPage
  }, {
    path: "perfil",
    Component: ProfilePage
  }]
}]);