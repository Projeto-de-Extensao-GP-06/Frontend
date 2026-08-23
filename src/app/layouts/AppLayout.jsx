import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, LayoutDashboard, FileText, Users, UserCog, Shield, User, LogOut, X, Menu, ChevronRight, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Toaster } from "../components/ui/sonner";
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
export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
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
  const currentLabel = navItems.find(i => location.pathname.startsWith(i.path))?.label ?? "SGPJ";
  return <div className="app-shell">

      {/* ── Fixed Top Header ── */}
      <header className="app-header">
        <div className="app-header-inner">

          {/* Logo SGPJ */}
          <div className="app-brand-wrap">
            <span className="app-brand">
              SGPJ
            </span>
          </div>

          {/* Menu hamburguer à direita */}
          <button onClick={() => setDrawerOpen(true)} className="app-menu-button" aria-label="Abrir menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* ── Scrollable Content ── */}
      <main className="app-main">
        <Outlet />
      </main>

      <Toaster position="top-right" richColors />

      {/* ── Custom Side Drawer ── */}
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
                <span className="app-drawer-initials">TB</span>
              </div>
              <div className="app-drawer-profile-text">
                <p className="app-drawer-name">Thauany</p>
                <p className="app-drawer-role">Administrador</p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="app-drawer-nav">
            {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return <button key={item.path} onClick={() => go(item.path)} className={`app-drawer-link ${active ? "is-active" : ""}`}>
                  <Icon size={18} className={`app-drawer-link-icon ${active ? "is-active" : ""}`} />
                  <span className="app-drawer-link-label">{item.label}</span>
                  {active && <ChevronRight size={13} className="app-drawer-link-chevron" />}
                </button>;
          })}

            {/* Assistente IA — quick link */}
            <button onClick={() => go("/app/assistente")} className={`app-drawer-link app-drawer-link--assistant ${location.pathname === "/app/assistente" ? "is-active" : ""}`}>
              <MessageSquare size={18} className={`app-drawer-link-icon ${location.pathname === "/app/assistente" ? "is-active" : ""}`} />
              <span className="app-drawer-link-label">Assistente IA</span>
              <span className="app-drawer-pill">NOVO</span>
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
            <Button className="app-logout-primary" onClick={() => {
            setLogoutOpen(false);
            navigate("/");
          }}>
              Sim, sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}