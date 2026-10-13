import { useState, useEffect, useMemo } from "react";
import { Plus, Shield, ChevronDown, ChevronRight, Check, Lock, Edit2, Trash2, Search, X, Save, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { PaginationBar } from "../components/PaginationBar";
import { useAuth } from "../contexts/AuthContext";
import { listarCargos, criarCargo, atualizarPermissoesCargo, excluirCargo } from "../services/cargoService";
import { listarPermissoes } from "../services/permissaoService";
import { hasPermission, normalizePermission } from "../utils/permissions";
import "../../styles/roles-page.css";

const SPECIAL_PERMISSIONS = new Set(["TODAS AS PERMISSÕES", "SEM PERMISSÕES"]);
const MODULE_ORDER = ["PROCESSO", "SOLICITAÇÃO", "CLIENTE", "CARGO", "USUÁRIO", "CONTATO", "DOCUMENTO"];
const ACTION_ORDER = ["CRIAR", "EDITAR", "EXCLUIR", "ACEITAR", "NEGAR"];

const stripAccents = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const titleCase = (value) => String(value || "").toLocaleLowerCase("pt-BR").replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase("pt-BR"));
const getPermissionAction = (name) => normalizePermission(name).split(" ")[0] || "";
const getPermissionModule = (name) => normalizePermission(name).split(" ").slice(1).join(" ") || "GERAL";
const getRoleId = (role) => role?.cargoId ?? role?.id;
const roleVariant = (index) => ["admin", "advogado", "assistente"][index % 3];

const normalizeRole = (role) => ({
  ...role,
  id: String(getRoleId(role)),
  cargoId: getRoleId(role),
  name: role.nome || role.name || "Cargo",
  permissoes: Array.isArray(role.permissoes) ? role.permissoes : [],
});

function buildPermissionModules(permissoes) {
  const normalPermissions = permissoes.filter((permission) => !SPECIAL_PERMISSIONS.has(normalizePermission(permission.nome)));
  const grouped = normalPermissions.reduce((acc, permission) => {
    const module = getPermissionModule(permission.nome);
    if (!acc[module]) acc[module] = [];
    acc[module].push(permission);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([module, permissions]) => ({
      key: stripAccents(module).toLocaleLowerCase("pt-BR").replace(/\s+/g, "-"),
      label: titleCase(module),
      permissions: permissions.sort((a, b) => {
        const actionA = ACTION_ORDER.indexOf(getPermissionAction(a.nome));
        const actionB = ACTION_ORDER.indexOf(getPermissionAction(b.nome));
        return (actionA === -1 ? 99 : actionA) - (actionB === -1 ? 99 : actionB) || a.nome.localeCompare(b.nome, "pt-BR");
      }),
    }))
    .sort((a, b) => {
      const moduleA = MODULE_ORDER.indexOf(normalizePermission(a.label));
      const moduleB = MODULE_ORDER.indexOf(normalizePermission(b.label));
      return (moduleA === -1 ? 99 : moduleA) - (moduleB === -1 ? 99 : moduleB) || a.label.localeCompare(b.label, "pt-BR");
    });
}

function rolePermissionsToIds(role, allPermissions) {
  const rolePermissionNames = new Set(role.permissoes.map((permission) => normalizePermission(permission.nome)));

  if (rolePermissionNames.has("SEM PERMISSÕES")) return [];

  if (rolePermissionNames.has("TODAS AS PERMISSÕES")) {
    return allPermissions
      .filter((permission) => !SPECIAL_PERMISSIONS.has(normalizePermission(permission.nome)))
      .map((permission) => permission.id);
  }

  return role.permissoes
    .filter((permission) => !SPECIAL_PERMISSIONS.has(normalizePermission(permission.nome)))
    .map((permission) => permission.id);
}

export default function RolesPage() {
  useEffect(() => {
    document.title = "Cargos e Permissões";
  }, []);

  const { user } = useAuth();
  const canCreateRole = hasPermission(user, "CRIAR CARGO");
  const canEditRole = hasPermission(user, "EDITAR CARGO");
  const canDeleteRole = hasPermission(user, "EXCLUIR CARGO");

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expandedModules, setExpandedModules] = useState([]);
  const [allExpanded, setAllExpanded] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [initialPerms, setInitialPerms] = useState({});
  const [checkedPerms, setCheckedPerms] = useState({});
  const [saved, setSaved] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [addRoleName, setAddRoleName] = useState("");
  const [deleteRoleDialog, setDeleteRoleDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [roleSearch, setRoleSearch] = useState("");
  const [rolePage, setRolePage] = useState(1);

  const permissionModules = useMemo(() => buildPermissionModules(permissions), [permissions]);
  const totalPerms = permissions.filter((permission) => !SPECIAL_PERMISSIONS.has(normalizePermission(permission.nome))).length;
  const selectedRoleData = roles.find((role) => role.id === selectedRole);

  const buildCheckedMap = (permissionIds) => {
    const ids = new Set(permissionIds.map(String));
    return permissions.reduce((acc, permission) => {
      if (!SPECIAL_PERMISSIONS.has(normalizePermission(permission.nome))) {
        acc[permission.id] = ids.has(String(permission.id));
      }
      return acc;
    }, {});
  };

  const loadPageData = async () => {
    setLoading(true);
    try {
      const [permissionsData, cargosData] = await Promise.all([
        listarPermissoes(),
        listarCargos({ size: 100 }),
      ]);
      const normalizedRoles = (cargosData.content || cargosData || []).map(normalizeRole);

      setPermissions(permissionsData);
      setRoles(normalizedRoles);
      setSelectedRole((current) => current && normalizedRoles.some((role) => role.id === current)
        ? current
        : normalizedRoles[0]?.id || "");
    } catch (error) {
      toast.error(error.message || "Não foi possível carregar cargos e permissões.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    if (!selectedRoleData || permissions.length === 0) {
      setInitialPerms({});
      setCheckedPerms({});
      return;
    }

    const permissionIds = rolePermissionsToIds(selectedRoleData, permissions);
    const checkedMap = buildCheckedMap(permissionIds);
    setInitialPerms(checkedMap);
    setCheckedPerms(checkedMap);
  }, [selectedRoleData, permissions]);

  useEffect(() => {
    if (permissionModules.length > 0 && expandedModules.length === 0) {
      setExpandedModules([permissionModules[0].key]);
    }
  }, [permissionModules, expandedModules.length]);

  const toggleModule = key => setExpandedModules(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
  const toggleAll = () => {
    if (allExpanded) setExpandedModules([]); else setExpandedModules(permissionModules.map(m => m.key));
    setAllExpanded(!allExpanded);
  };
  const togglePerm = key => {
    if (!canEditRole || saving) return;
    setCheckedPerms(p => ({
      ...p,
      [key]: !p[key],
    }));
  };
  const selectedPermissionIds = () => Object.entries(checkedPerms).filter(([, isChecked]) => isChecked).map(([permissionId]) => Number(permissionId));

  const handleSave = async () => {
    if (!selectedRoleData || !canEditRole) return;
    setSaving(true);
    try {
      const updatedRole = await atualizarPermissoesCargo(selectedRoleData.cargoId, selectedPermissionIds());
      const normalizedRole = normalizeRole(updatedRole);
      setRoles((current) => current.map((role) => role.id === normalizedRole.id ? normalizedRole : role));
      const checkedMap = buildCheckedMap(rolePermissionsToIds(normalizedRole, permissions));
      setInitialPerms(checkedMap);
      setCheckedPerms(checkedMap);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success("Permissões salvas com sucesso.");
    } catch (error) {
      toast.error(error.message || "Não foi possível salvar as permissões.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = async () => {
    const name = addRoleName.trim();
    if (!name || !canCreateRole) return;

    setCreating(true);
    try {
      const newRole = normalizeRole(await criarCargo(name));
      setRoles((current) => [...current, newRole].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
      setSelectedRole(newRole.id);
      setRoleSearch("");
      setRolePage(1);
      setAddRoleOpen(false);
      setAddRoleName("");
      toast.success("Cargo criado com sucesso.");
    } catch (error) {
      toast.error(error.message || "Não foi possível criar o cargo.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = role => {
    if (!canDeleteRole) return;
    setRoleToDelete(role);
    setDeleteRoleDialog(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete || !canDeleteRole) return;
    setDeleting(true);
    try {
      await excluirCargo(roleToDelete.cargoId);
      const remainingRoles = roles.filter((role) => role.id !== roleToDelete.id);
      setRoles(remainingRoles);
      setSelectedRole((current) => current === roleToDelete.id ? remainingRoles[0]?.id || "" : current);
      setDeleteRoleDialog(false);
      setRoleToDelete(null);
      toast.success("Cargo excluído com sucesso.");
    } catch (error) {
      toast.error(error.message || "Não foi possível excluir o cargo.");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearAllPermissions = () => {
    if (!canEditRole || saving) return;
    setCheckedPerms((current) => Object.keys(current).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {}));
  };
  const isPermsChanged = Object.keys(initialPerms).some(key => Boolean(checkedPerms[key]) !== Boolean(initialPerms[key]))
    || Object.keys(checkedPerms).some(key => Boolean(checkedPerms[key]) !== Boolean(initialPerms[key]));
  const handleRestorePermissions = () => {
    if (!canEditRole || saving) return;
    setCheckedPerms({ ...initialPerms });
  };
  const totalChecked = Object.values(checkedPerms).filter(Boolean).length;

  const ROLES_PER_PAGE = 3;
  const filteredRoles = roleSearch.trim() === "" ? roles : roles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()));
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
          <button onClick={() => { setAddRoleName(""); setAddRoleOpen(true); }} className="roles-add-button" disabled={!canCreateRole || loading} title={canCreateRole ? "Adicionar cargo" : "Sem permissão para criar cargo"}>
            <Plus size={13} />
            Adicionar cargo
          </button>
        </div>

        <div className="roles-search-row">
          <div className="roles-search-wrap">
            <Search size={14} className="roles-search-icon" />
            <input type="text" placeholder="Buscar cargo..." value={roleSearch} onChange={e => { setRoleSearch(e.target.value); setRolePage(1); }} className="roles-search-input" />
            {roleSearch && <button type="button" onClick={() => { setRoleSearch(""); setRolePage(1); }} className="roles-search-clear"><X size={12} /></button>}
          </div>
          <button type="button" onClick={() => setRolePage(1)} className="roles-search-btn">Buscar</button>
        </div>

        <div className="roles-list">
          {loading
            ? <p className="roles-empty-text">Carregando cargos...</p>
            : paginatedRoles.length === 0
              ? <p className="roles-empty-text">Nenhum cargo encontrado</p>
              : paginatedRoles.map((role, index) => <div key={role.id} className={`roles-row ${selectedRole === role.id ? "roles-row--selected" : ""}`}>
                <button onClick={() => setSelectedRole(role.id)} className="roles-row__select">
                  <div className={`roles-avatar roles-avatar--${roleVariant(index)}`}>{role.name.slice(0, 2).toUpperCase()}</div>
                  <p className="roles-row__name">{role.name}</p>
                  {selectedRole === role.id && <Check size={14} className="roles-row__check" />}
                </button>
                <div className="roles-row__actions">
                  <button disabled className="roles-icon-btn" title="Renomear cargo ainda não está disponível no backend">
                    <Edit2 size={13} className="roles-icon-btn__icon" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDeleteRole(role); }} disabled={!canDeleteRole || deleting} className="roles-icon-btn roles-icon-btn--danger" title={canDeleteRole ? "Excluir cargo" : "Sem permissão para excluir cargo"}>
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
          {isPermsChanged && (
            <button onClick={handleRestorePermissions} className="perms-restore-btn" disabled={!canEditRole || saving} title="Restaurar estado inicial das permissões">
              <RotateCcw size={12} />
              Restaurar permissões
            </button>
          )}
          <button onClick={handleClearAllPermissions} disabled={!canEditRole || saving || !selectedRoleData} className="perms-clear-btn">Remover todas</button>
          <span className="perms-counter">{totalChecked}/{totalPerms}</span>
        </div>
      </div>

      <div className="perms-accordion">
        <button onClick={toggleAll} className="perms-accordion__toggle-all" disabled={permissionModules.length === 0}>
          <div className="perms-accordion__toggle-all-left">
            <Shield size={15} className="perms-accordion__shield" />
            <span className="perms-accordion__toggle-all-label">Todas as permissões</span>
            <span className="perms-accordion__role-chip">{selectedRoleData?.name || "Nenhum cargo"}</span>
          </div>
          {allExpanded ? <ChevronDown size={15} className="perms-accordion__chevron" /> : <ChevronRight size={15} className="perms-accordion__chevron" />}
        </button>

        {permissionModules.length === 0 && <p className="roles-empty-text">Nenhuma permissão disponível</p>}

        {permissionModules.map((module, i) => {
          const isExpanded = expandedModules.includes(module.key);
          const isLast = i === permissionModules.length - 1;
          const checkedCount = module.permissions.filter(p => checkedPerms[p.id]).length;
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
                    const isChecked = !!checkedPerms[perm.id];
                    const label = titleCase(getPermissionAction(perm.nome));
                    return <button key={perm.id} onClick={() => togglePerm(perm.id)} disabled={!canEditRole || saving || !selectedRoleData} title={canEditRole ? perm.nome : "Sem permissão para editar cargo"} className={`perm-btn ${isChecked ? "perm-btn--on" : "perm-btn--off"}`}>
                      <div className={`perm-btn__box ${isChecked ? "perm-btn__box--checked" : ""}`}>
                        {isChecked && <Check size={10} className="perm-btn__check" strokeWidth={3} />}
                      </div>
                      <span className="perm-btn__label">{label}</span>
                    </button>;
                  })}
                </div>
              </div>}
            </div>;
        })}
      </div>

      <button onClick={() => setSaveDialogOpen(true)} disabled={!canEditRole || !selectedRoleData || !isPermsChanged || saving} className={`roles-save-btn ${saved ? "roles-save-btn--saved" : ""}`} title={canEditRole ? "Salvar permissões" : "Sem permissão para editar cargo"}>
        {saved ? "✓ Permissões salvas!" : <><Save size={15} />{saving ? "Salvando..." : "Salvar permissões"}</>}
      </button>

      {addRoleOpen && (
        <div className="roles-add-modal-overlay">
          <div className="roles-add-modal">
            <h3 className="roles-add-modal__title">Novo Cargo</h3>
            <p className="roles-add-modal__subtitle">Informe o nome do cargo a ser criado.</p>
            <label className="roles-add-modal__label">Nome do cargo</label>
            <input type="text" autoFocus value={addRoleName} onChange={e => setAddRoleName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddRole(); }} className="roles-add-modal__input" placeholder="Ex.: Estagiário, Sócio..." disabled={creating} />
            <div className="roles-add-modal__actions">
              <button onClick={() => { setAddRoleOpen(false); setAddRoleName(""); }} className="roles-add-modal__btn roles-add-modal__btn--cancel" disabled={creating}>Cancelar</button>
              <button onClick={handleAddRole} disabled={!addRoleName.trim() || creating} className="roles-add-modal__btn roles-add-modal__btn--confirm">{creating ? "Criando..." : "Criar cargo"}</button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="roles-delete-dialog">
          <DialogHeader>
            <div className="roles-delete-dialog__header">
              <div className="roles-delete-dialog__icon-wrap roles-delete-dialog__icon-wrap--blue">
                <CheckCircle size={24} className="roles-delete-dialog__icon" />
              </div>
              <DialogTitle className="roles-delete-dialog__title">Confirmar alterações de permissões</DialogTitle>
            </div>
          </DialogHeader>
          <p className="roles-delete-dialog__text">
            Deseja salvar as alterações de permissões para o cargo <strong className="roles-delete-dialog__highlight">{selectedRoleData?.name || selectedRole}</strong>?
          </p>
          <DialogFooter className="roles-delete-dialog__footer">
            <button className="roles-delete-dialog__btn roles-delete-dialog__btn--outline" onClick={() => setSaveDialogOpen(false)} disabled={saving}>Cancelar</button>
            <button className="roles-delete-dialog__btn roles-delete-dialog__btn--primary" disabled={saving} onClick={() => { setSaveDialogOpen(false); handleSave(); }}>Confirmar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteRoleDialog} onOpenChange={setDeleteRoleDialog}>
        <DialogContent className="roles-delete-dialog">
          <DialogHeader>
            <div className="roles-delete-dialog__header">
              <div className="roles-delete-dialog__icon-wrap roles-delete-dialog__icon-wrap--red">
                <Trash2 size={24} className="roles-delete-dialog__icon" />
              </div>
              <DialogTitle className="roles-delete-dialog__title">Excluir cargo?</DialogTitle>
            </div>
          </DialogHeader>
          <p className="roles-delete-dialog__text">
            {roleToDelete ? <>Tem certeza que deseja excluir o cargo <strong className="roles-delete-dialog__highlight">"{roleToDelete.name}"</strong>? Esta ação é irreversível.</> : "Esta ação é irreversível. Todas as permissões vinculadas a este cargo serão removidas permanentemente."}
          </p>
          <DialogFooter className="roles-delete-dialog__footer">
            <button className="roles-delete-dialog__btn roles-delete-dialog__btn--outline" onClick={() => setDeleteRoleDialog(false)} disabled={deleting}>Cancelar</button>
            <button className="roles-delete-dialog__btn roles-delete-dialog__btn--danger" onClick={confirmDeleteRole} disabled={deleting}>{deleting ? "Excluindo..." : "Excluir"}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}
