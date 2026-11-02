import { useState, useEffect } from "react";
import { Search, Users, X, Check, Loader2, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { PaginationBar } from "./PaginationBar";
import { listarUsuarios } from "../services/usuarioService";
import { toast } from "sonner";
import "../../styles/select-client-modal.css";
import "../../styles/clients-page.css";

const PAGE_SIZE = 6;

function normalizeUser(u) {
  return {
    id: u.id,
    name: u.nome,
    email: u.email,
    role: u.cargoNome,
    status: u.ativo ? "ativo" : "inativo",
  };
}

export function SelectUserModal({ open, onOpenChange, selectedUserId, onSelect }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    listarUsuarios()
      .then((data) => {
        if (!active) return;
        const list = (Array.isArray(data) ? data : (data?.content || []))
          .map(normalizeUser)
          .filter((u) => u.status === "ativo");
        setUsers(list);
        setSelectedUser(list.find((u) => String(u.id) === String(selectedUserId)) || null);
      })
      .catch((error) => {
        console.error("Erro ao carregar usuários:", error);
        if (active) toast.error("Não foi possível carregar os usuários.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [open, selectedUserId]);

  const term = search.toLowerCase();
  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleConfirm = () => {
    if (selectedUser) {
      onSelect(selectedUser);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="select-client-dialog-content">
        <DialogHeader className="select-client-dialog-header">
          <div>
            <p className="select-client-modal-kicker">Seleção de Usuário</p>
            <DialogTitle className="select-client-modal-title">Selecionar Responsável</DialogTitle>
          </div>
          <DialogDescription className="select-client-modal-subtitle">
            Busque e selecione o usuário responsável por este processo.
          </DialogDescription>
        </DialogHeader>

        <div className="select-client-modal-body">
          <div className="clients-panel" style={{ marginBottom: "0.5rem" }}>
            <div className="clients-search-row">
              <div className="clients-search-wrap">
                <Search size={16} className="clients-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail ou cargo..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="clients-search-input"
                />
              </div>
              <button type="button" className="clients-search-button">Buscar</button>
            </div>
          </div>

          <div className="clients-results-row" style={{ marginBottom: "0.25rem" }}>
            <p className="clients-results-count">
              {filtered.length === users.length
                ? `${filtered.length} usuários`
                : `${filtered.length} de ${users.length} usuários`}
            </p>
            {search !== "" && (
              <button
                type="button"
                onClick={() => { setSearch(""); setPage(1); }}
                className="clients-clear-filters"
              >
                <X size={11} />
                Limpar busca
              </button>
            )}
          </div>

          {loading ? (
            <div className="clients-empty-state" style={{ padding: "2.5rem 1rem" }}>
              <Loader2 size={24} className="animate-spin" />
              <p className="clients-empty-title">Carregando usuários...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="clients-empty-state" style={{ padding: "2.5rem 1rem" }}>
              <div className="clients-empty-icon-wrap">
                <Users size={24} className="clients-empty-icon" />
              </div>
              <p className="clients-empty-title">Nenhum usuário encontrado</p>
              <p className="clients-empty-text">Tente ajustar a busca</p>
            </div>
          ) : (
            <div className="select-client-grid">
              {paginated.map((u) => {
                const isSelected = String(selectedUser?.id) === String(u.id);
                return (
                  <div
                    key={u.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedUser(u)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedUser(u)}
                    className={`client-card ${isSelected ? "is-selected" : ""}`}
                  >
                    <div className="client-card-body">
                      <div className="client-card-avatar is-pf">
                        <User size={18} className="client-card-avatar-icon is-pf" />
                      </div>
                      <div className="client-card-info">
                        <div className="client-card-title-row">
                          <p className="client-card-name" title={u.name}>{u.name}</p>
                          {u.role && <span className="client-card-type is-pf">{u.role}</span>}
                        </div>
                        <p className="client-card-doc">{u.email}</p>
                      </div>
                      {isSelected && (
                        <div className="client-card-selected-badge" title="Selecionado">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && <PaginationBar page={safePage} total={totalPages} onPage={setPage} />}
        </div>

        <DialogFooter className="select-client-dialog-footer">
          <div className="select-client-footer-info">
            {selectedUser ? (
              <div className="select-client-footer-selected">
                <span className="select-client-footer-label">Selecionado:</span>
                <span className="select-client-footer-name" title={selectedUser.name}>
                  {selectedUser.name}
                </span>
              </div>
            ) : (
              <span className="select-client-footer-placeholder">Nenhum usuário selecionado</span>
            )}
          </div>
          <div className="select-client-footer-actions">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="select-client-btn select-client-btn--cancel"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedUser}
              onClick={handleConfirm}
              className="select-client-btn select-client-btn--confirm"
            >
              <Check size={15} />
              Confirmar Escolha
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
