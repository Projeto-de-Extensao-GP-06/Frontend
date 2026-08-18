import { useState, useEffect } from "react";
import { Plus, Shield, ChevronDown, ChevronRight, Check, Lock, Edit2, Trash2, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import "../../styles/roles-page.css";
const roles = [{
  id: "admin",
  name: "Administrador",
  variant: "admin"
}, {
  id: "advogado",
  name: "Advogado",
  variant: "advogado"
}, {
  id: "assistente",
  name: "Assistente",
  variant: "assistente"
}];
const permissionModules = [{
  key: "processo",
  label: "Processo",
  icon: "⚖️",
  permissions: ["Criar", "Editar", "Excluir", "Visualizar"]
}, {
  key: "solicitacao",
  label: "Solicitações",
  icon: "📬",
  permissions: ["Visualizar", "Aceitar", "Negar"]
}, {
  key: "cliente",
  label: "Cliente",
  icon: "👤",
  permissions: ["Criar", "Editar", "Excluir", "Visualizar"]
}, {
  key: "cargo",
  label: "Cargo",
  icon: "🎖️",
  permissions: ["Criar", "Editar", "Excluir"]
}, {
  key: "usuario",
  label: "Usuário",
  icon: "🔑",
  permissions: ["Criar", "Editar", "Excluir", "Visualizar"]
}, {
  key: "contato",
  label: "Contato",
  icon: "📞",
  permissions: ["Criar", "Editar", "Excluir"]
}, {
  key: "documento",
  label: "Documento",
  icon: "📄",
  permissions: ["Criar", "Editar", "Excluir", "Download"]
}];
const defaultPerms = {};
permissionModules.forEach(m => m.permissions.forEach(p => {
  defaultPerms[`${m.key}-${p}`] = true;
}));
export default function RolesPage() {
  useEffect(() => {
    document.title = "Cargos e Permissões";
  }, []);

  const [expandedModules, setExpandedModules] = useState(["processo"]);
  const [allExpanded, setAllExpanded] = useState(false);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [checkedPerms, setCheckedPerms] = useState(defaultPerms);
  const [saved, setSaved] = useState(false);
  const [addRoleOpen, setAddRoleOpen]           = useState(false);
  const [addRoleName, setAddRoleName]           = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName]           = useState("");
  const [deleteRoleDialog, setDeleteRoleDialog] = useState(false);
  const [roleToDelete, setRoleToDelete]         = useState(null);
  const toggleModule = key => setExpandedModules(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
  const toggleAll = () => {
    if (allExpanded) setExpandedModules([]);else setExpandedModules(permissionModules.map(m => m.key));
    setAllExpanded(!allExpanded);
  };
  const togglePerm = key => setCheckedPerms(p => ({
    ...p,
    [key]: !p[key]
  }));
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  const handleRenameRole = () => {
    // Implementar lógica de renomear
    setRenameDialogOpen(false);
    setNewRoleName("");
  };
  const handleAddRole = () => {
    if (!addRoleName.trim()) return;
    setAddRoleOpen(false);
    setAddRoleName("");
  };
  const handleDeleteRole = role => {
    setRoleToDelete(role);
    setDeleteRoleDialog(true);
  };
  const confirmDeleteRole = () => {
    if (roleToDelete) {
      console.log("Excluir cargo:", roleToDelete.id);
    }
    setDeleteRoleDialog(false);
    setRoleToDelete(null);
  };
  const handleClearAllPermissions = () => {
    const clearedPerms = {};
    Object.keys(checkedPerms).forEach(key => {
      clearedPerms[key] = false;
    });
    setCheckedPerms(clearedPerms);
  };
  const totalChecked = Object.values(checkedPerms).filter(Boolean).length;
  const totalPerms = Object.keys(defaultPerms).length;

  const [roleSearch, setRoleSearch] = useState("");
  const [rolePage, setRolePage] = useState(1);
  const ROLES_PER_PAGE = 3;
  const filteredRoles = roleSearch.trim() === ""
    ? roles
    : roles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()));
  const roleTotalPages = Math.max(1, Math.ceil(filteredRoles.length / ROLES_PER_PAGE));
  const roleSafePage = Math.min(rolePage, roleTotalPages);
  const paginatedRoles = filteredRoles.slice((roleSafePage - 1) * ROLES_PER_PAGE, roleSafePage * ROLES_PER_PAGE);
  return <div className="roles-page">

      <div className="roles-header">
        <p className="roles-header__kicker">SGPJ</p>
        <h1 className="roles-header__title">Cargos e Permissões</h1>
      </div>

      <div className="roles-card">
        <div className="roles-card__header">
          <h2 className="roles-card__title">
            <Shield size={15} className="roles-card__title-icon" />
            Cargos
          </h2>
          <button
            onClick={() => { setAddRoleName(""); setAddRoleOpen(true); }}
            className="roles-add-button">
            <Plus size={13} />
            Adicionar cargo
          </button>
        </div>

        {/* Busca de cargos */}
        <div className="roles-search-wrap">
          <Search size={14} className="roles-search-icon" />
          <input
            type="text"
            placeholder="Buscar cargo..."
            value={roleSearch}
            onChange={e => { setRoleSearch(e.target.value); setRolePage(1); }}
            className="roles-search-input"
          />
          {roleSearch && <button onClick={() => { setRoleSearch(""); setRolePage(1); }} className="roles-search-clear"><X size={12} /></button>}
        </div>

        <div className="roles-list">
          {paginatedRoles.length === 0
            ? <p className="roles-empty-text">Nenhum cargo encontrado</p>
            : paginatedRoles.map(role => <div key={role.id} className={`roles-row ${selectedRole === role.id ? "roles-row--selected" : ""}`}>
              <button onClick={() => setSelectedRole(role.id)} className="roles-row__select">
                <div className={`roles-avatar roles-avatar--${role.variant}`}>
                  {role.name.slice(0, 2).toUpperCase()}
                </div>
                <p className="roles-row__name">{role.name}</p>
                {selectedRole === role.id && <Check size={14} className="roles-row__check" />}
              </button>
              <div className="roles-row__actions">
                <button onClick={e => { e.stopPropagation(); setSelectedRole(role.id); setNewRoleName(role.name); setRenameDialogOpen(true); }} className="roles-icon-btn" title="Renomear cargo">
                  <Edit2 size={13} className="roles-icon-btn__icon" />
                </button>
                <button onClick={e => { e.stopPropagation(); handleDeleteRole(role); }} className="roles-icon-btn roles-icon-btn--danger" title="Excluir cargo">
                  <Trash2 size={13} className="roles-icon-btn__icon--danger" />
                </button>
              </div>
            </div>)}
        </div>
        <PaginationBar page={roleSafePage} total={roleTotalPages} onPage={setRolePage} />
      </div>

      <div className="perms-toolbar">
        <p className="perms-toolbar__label">
          <Lock size={13} className="perms-toolbar__lock-icon" />
          Permissões ativas
        </p>
        <div className="perms-toolbar__right">
          <button onClick={handleClearAllPermissions} className="perms-clear-btn">Remover todas</button>
          <span className="perms-counter">{totalChecked}/{totalPerms}</span>
        </div>
      </div>

      <div className="perms-accordion">
        <button onClick={toggleAll} className="perms-accordion__toggle-all">
          <div className="perms-accordion__toggle-all-left">
            <Shield size={15} className="perms-accordion__shield" />
            <span className="perms-accordion__toggle-all-label">Todas as permissões</span>
            <span className="perms-accordion__role-chip">
              {selectedRole === "admin" ? "Admin" : selectedRole === "advogado" ? "Advogado" : "Assistente"}
            </span>
          </div>
          {allExpanded ? <ChevronDown size={15} className="perms-accordion__chevron" /> : <ChevronRight size={15} className="perms-accordion__chevron" />}
        </button>

        {permissionModules.map((module, i) => {
          const isExpanded = expandedModules.includes(module.key);
          const isLast = i === permissionModules.length - 1;
          const checkedCount = module.permissions.filter(p => checkedPerms[`${module.key}-${p}`]).length;
          const countState = checkedCount === module.permissions.length ? "full" : checkedCount === 0 ? "none" : "partial";
          return <div key={module.key} className={`perms-module ${!isLast ? "perms-module--bordered" : ""}`}>
              <button onClick={() => toggleModule(module.key)} className="perms-module__trigger">
                <span className="perms-module__label">{module.label}</span>
                <div className="perms-module__meta">
                  <span className={`perms-module__count perms-module__count--${countState}`}>{checkedCount}/{module.permissions.length}</span>
                  {isExpanded ? <ChevronDown size={14} className="perms-accordion__chevron" /> : <ChevronRight size={14} className="perms-accordion__chevron" />}
                </div>
              </button>
              {isExpanded && <div className="perms-module__body">
                  <div className="perms-grid">
                    {module.permissions.map(perm => {
                      const permKey = `${module.key}-${perm}`;
                      const isChecked = !!checkedPerms[permKey];
                      return <button key={perm} onClick={() => togglePerm(permKey)} className={`perm-btn ${isChecked ? "perm-btn--on" : "perm-btn--off"}`}>
                          <div className={`perm-btn__box ${isChecked ? "perm-btn__box--checked" : ""}`}>
                            {isChecked && <Check size={10} className="perm-btn__check" strokeWidth={3} />}
                          </div>
                          <span className="perm-btn__label">{perm}</span>
                        </button>;
                    })}
                  </div>
                </div>}
            </div>;
        })}
      </div>

      <button onClick={handleSave} className={`roles-save-btn ${saved ? "roles-save-btn--saved" : ""}`}>
        {saved ? "✓ Permissões salvas!" : "Salvar permissões"}
      </button>

      {addRoleOpen && (
        <div className="roles-add-modal-overlay">
          <div className="roles-add-modal">
            <h3 className="roles-add-modal__title">
              Novo Cargo
            </h3>
            <p className="roles-add-modal__subtitle">Informe o nome do cargo a ser criado.</p>

            <label className="roles-add-modal__label">
              Nome do cargo
            </label>
            <input
              type="text"
              autoFocus
              value={addRoleName}
              onChange={e => setAddRoleName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAddRole(); }}
              className="roles-add-modal__input"
              placeholder="Ex.: Estagiário, Sócio..."
            />

            <div className="roles-add-modal__actions">
              <button
                onClick={() => { setAddRoleOpen(false); setAddRoleName(""); }}
                className="roles-add-modal__btn roles-add-modal__btn--cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddRole}
                disabled={!addRoleName.trim()}
                className="roles-add-modal__btn roles-add-modal__btn--confirm"
              >
                Criar cargo
              </button>
            </div>
          </div>
        </div>
      )}  

      {renameDialogOpen && <div className="roles-dialog-overlay">
          <div className="roles-dialog">
            <h3 className="roles-dialog__title">Renomear cargo</h3>
            <input type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="roles-dialog__input" placeholder="Novo nome do cargo" />
            <div className="roles-dialog__actions">
              <button onClick={() => { setRenameDialogOpen(false); setNewRoleName(""); }} className="roles-dialog__btn roles-dialog__btn--cancel">Cancelar</button>
              <button onClick={handleRenameRole} className="roles-dialog__btn roles-dialog__btn--confirm">Renomear</button>
            </div>
          </div>
        </div>}

      <Dialog open={deleteRoleDialog} onOpenChange={setDeleteRoleDialog}>
        <DialogContent className="roles-delete-dialog">
          <DialogHeader>
            <DialogTitle className="roles-delete-dialog__title">Excluir cargo?</DialogTitle>
          </DialogHeader>
          <p className="roles-delete-dialog__text">
            {roleToDelete ? `Tem certeza que deseja excluir o cargo "${roleToDelete.name}"? Esta ação é irreversível.` : "Esta ação é irreversível. Todas as permissões vinculadas a este cargo serão removidas permanentemente."}
          </p>
          <DialogFooter className="roles-delete-dialog__footer">
            <button className="roles-delete-dialog__btn roles-delete-dialog__btn--outline" onClick={() => setDeleteRoleDialog(false)}>Cancelar</button>
            <button className="roles-delete-dialog__btn roles-delete-dialog__btn--danger" onClick={confirmDeleteRole}>Excluir</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}

function PaginationBar({ page, total, onPage }) {
  if (total <= 1) return null;

  const MAX_VISIBLE_PAGES = 10;
  const currentBlock = Math.floor((page - 1) / MAX_VISIBLE_PAGES);
  const startPage = currentBlock * MAX_VISIBLE_PAGES + 1;
  const endPage = Math.min(startPage + MAX_VISIBLE_PAGES - 1, total);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`pagination__page ${page === p ? "is-active" : ""}`}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="pagination__btn"
        onClick={() => onPage(page + 1)}
        disabled={page === total}
        aria-label="Próxima página"
      >
        ›
      </button>
    </div>
  );
}