import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, LayoutDashboard, FileText, Users, UserCog, Shield, User, LogOut, X, Menu, ChevronRight, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { SyncProcessProvider } from "../contexts/SyncProcessContext";
import "../../styles/app-layout.css";
const navItems = [{
  path: "/app/inicio",
  label: "Início",
  icon: Home
}, {
  path: "/app/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard
}, {
  path: "/app/solicitacoes",
  label: "Solicitações",
  icon: FileText
}, {
  path: "/app/clientes",
  label: "Clientes",
  icon: Users
}, {
  path: "/app/usuarios",
  label: "Usuários",
  icon: UserCog
}, {
  path: "/app/cargos",
  label: "Cargos e Permissões",
  icon: Shield
}, {
  path: "/app/perfil",
  label: "Perfil",
  icon: User
}];

const isActiveNavItem = (pathname, itemPath) => {
  if (itemPath === "/app/inicio") {
    return pathname === "/app" || pathname.startsWith(itemPath);
  }

  return pathname.startsWith(itemPath);
};

const getInitials = (name) => {                                                                                                                                                                        
  if (!name) return "US";                                                                                                                                                                              
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();                                                                                                                            
};

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* lock body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);
  const go = path => {
    navigate(path);
    setDrawerOpen(false);
  };
  const isAssistant = location.pathname.startsWith("/app/assistente");

  return (
    <SyncProcessProvider>
      <div className="app-shell">

    {/* ── Fixed Top Header ── */}
    <header className="app-header">
      <div className="app-header-inner">

        {/* Logo SGPJ */}
        <div className="app-brand-wrap" onClick={() => go("/app/inicio")} role="button" tabIndex={0} title="Ir para o início">
          <span className="app-brand">
            SGPJ
          </span>
        </div>

        {/* ── Desktop Navigation (visível apenas em telas maiores) ── */}
        <nav className="app-desktop-nav" aria-label="Navegação principal">
          {navItems.filter(item => item.path !== "/app/perfil").map(item => {
            const Icon = item.icon;
            const active = isActiveNavItem(location.pathname, item.path);
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`app-desktop-nav-link ${active ? "is-active" : ""}`}
              >
                <Icon size={16} className="app-desktop-nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Assistente IA - MarIA */}
          <button
            onClick={() => go("/app/assistente")}
            className={`app-desktop-nav-link app-desktop-nav-link--assistant ${location.pathname === "/app/assistente" ? "is-active" : ""
              }`}
          >
            <MessageSquare size={16} className="app-desktop-nav-icon" />
            <span>MarIA</span>
          </button>
        </nav>

        {/* ── Desktop User Profile & Logout (visível apenas em telas maiores) ── */}
        <div className="app-desktop-user-actions">
          <button
            onClick={() => go("/app/perfil")}
            className={`app-desktop-profile-btn ${location.pathname.startsWith("/app/perfil") ? "is-active" : ""
              }`}
            title="Meu Perfil"
          >
            <div className="app-desktop-avatar">
              <span>{getInitials(user?.nome)}</span>
            </div>
            <div className="app-desktop-user-info">
              <span className="app-desktop-user-name">{user?.nome || "Usuário"}</span>
              <span className="app-desktop-user-role">{user?.cargo?.nome || "Acesso"}</span>
            </div>
          </button>

          <div className="app-desktop-divider" />

          <button
            onClick={() => setLogoutOpen(true)}
            className="app-desktop-logout-btn"
            title="Sair do sistema"
            aria-label="Sair"
          >
            <LogOut size={16} />
            <span className="app-desktop-logout-label">Sair</span>
          </button>
        </div>

        {/* Menu hamburguer à direita (visível apenas em mobile/telas menores) */}
        <button onClick={() => setDrawerOpen(true)} className="app-menu-button" aria-label="Abrir menu">
          <Menu size={22} />
        </button>
      </div>
    </header>

    {/* ── Scrollable Content ── */}
    <main className={`app-main ${isAssistant ? "app-main--assistant" : ""}`}>
      <Outlet />
    </main>

    {/* ── Custom Side Drawer (Mobile) ── */}
    <div className={`app-drawer-layer ${drawerOpen ? "is-open" : ""}`}>
      {/* Overlay */}
      <div className={`app-drawer-overlay ${drawerOpen ? "is-open" : ""}`} onClick={() => setDrawerOpen(false)} />

      {/* Panel */}
      <div className={`app-drawer ${drawerOpen ? "is-open" : ""}`}>
        {/* Drawer Header — navy */}
        <div className="app-drawer-header">
          {/* Close */}
          <button onClick={() => setDrawerOpen(false)} className="app-drawer-close" aria-label="Fechar menu">
            <X size={18} />
          </button>

          {/* User avatar */}
          <div className="app-drawer-profile">
            <div className="app-drawer-avatar">
              <span className="app-drawer-initials">{getInitials(user?.nome)}</span>
            </div>
            <div className="app-drawer-profile-text">
              <p className="app-drawer-name">{user?.nome || "Usuário"}</p>
              <p className="app-drawer-role">{user?.cargo?.nome || "Acesso"}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="app-drawer-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActiveNavItem(location.pathname, item.path);
            return <button key={item.path} onClick={() => go(item.path)} className={`app-drawer-link ${active ? "is-active" : ""}`}>
              <Icon size={18} className={`app-drawer-link-icon ${active ? "is-active" : ""}`} />
              <span className="app-drawer-link-label">{item.label}</span>
              {active && <ChevronRight size={13} className="app-drawer-link-chevron" />}
            </button>;
          })}

          {/* MarIA — quick link */}
          <button onClick={() => go("/app/assistente")} className={`app-drawer-link app-drawer-link--assistant ${location.pathname === "/app/assistente" ? "is-active" : ""}`}>
            <MessageSquare size={18} className={`app-drawer-link-icon ${location.pathname === "/app/assistente" ? "is-active" : ""}`} />
            <span className="app-drawer-link-label">MarIA</span>
          </button>

          <div className="app-drawer-divider" />

          <button onClick={() => {
            setDrawerOpen(false);
            setLogoutOpen(true);
          }} className="app-drawer-logout">
            <LogOut size={18} className="app-drawer-logout-icon" />
            <span className="app-drawer-logout-label">Sair</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="app-drawer-footer">
          <p className="app-drawer-footer-title">
            Thauany Bezerra Advocacia
          </p>
          <p className="app-drawer-footer-version">SGPJ v1.0</p>
        </div>
      </div>
    </div>

    {/* ── Logout Confirm Dialog ── */}
    <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
      <DialogContent className="app-logout-dialog">
        <DialogHeader>
          <DialogTitle className="app-logout-title">
            Sair do sistema?
          </DialogTitle>
        </DialogHeader>
        <p className="app-logout-text">
          Você será desconectado(a) e redirecionado para a tela de login. Tem certeza?
        </p>
        <DialogFooter className="app-logout-actions">
          <Button variant="outline" className="app-logout-secondary" onClick={() => setLogoutOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="app-logout-primary"
            onClick={async () => {
              setLogoutOpen(false);
              await logout();
              navigate("/login");
            }}
          >
            Sim, sair
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
  </SyncProcessProvider>
  );
}
