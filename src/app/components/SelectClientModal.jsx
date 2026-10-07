import { useState, useEffect } from "react";
import { Search, Users, X, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { ClientCard } from "./ClientCard";
import { PaginationBar } from "./PaginationBar";
import { listarClientesParaProcesso } from "../services/processoService";
import { toast } from "sonner";
import "../../styles/select-client-modal.css";
import "../../styles/clients-page.css";

export function SelectClientModal({
  open,
  onOpenChange,
  selectedClientId,
  onSelect,
}) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    listarClientesParaProcesso()
      .then((data) => {
        if (!active) return;
        setClients(data);
        setSelectedClient(data.find((client) => String(client.id) === String(selectedClientId)) || null);
      })
      .catch((error) => {
        console.error("Erro ao carregar clientes para processo:", error);
        if (active) toast.error("Não foi possível carregar os clientes.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [open, selectedClientId]);

  const PAGE_SIZE = 6;

  const filtered = clients.filter((c) => {
    const term = search.toLowerCase();
    const doc = c.type === "PF" ? c.cpf : c.cnpj;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(term) ||
      c.contacts?.some((ct) => ct.email?.toLowerCase().includes(term)) ||
      (doc && doc.includes(term));
    const matchType = typeFilter === "todos" || c.type === typeFilter;
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const hasActiveFilters = search !== "" || typeFilter !== "todos" || statusFilter !== "todos";

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("todos");
    setStatusFilter("todos");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleCardClick = (client) => {
    setSelectedClient(client);
  };

  const handleConfirm = () => {
    if (selectedClient) {
      onSelect(selectedClient);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="select-client-dialog-content">
        <DialogHeader className="select-client-dialog-header">
          <div>
            <p className="select-client-modal-kicker">Seleção de Cliente</p>
            <DialogTitle className="select-client-modal-title">
              Selecionar Cliente
            </DialogTitle>
          </div>
          <DialogDescription className="select-client-modal-subtitle">
            Busque e selecione o cliente que será vinculado a este processo.
          </DialogDescription>
        </DialogHeader>

        <div className="select-client-modal-body">
          {/* ── Search + Filters Panel ── */}
          <div className="clients-panel" style={{ marginBottom: "0.5rem" }}>
            {/* Search row */}
            <div className="clients-search-row">
              <div className="clients-search-wrap">
                <Search size={16} className="clients-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="clients-search-input"
                />
              </div>
              <button type="button" className="clients-search-button">
                Buscar
              </button>
            </div>

            {/* Divider */}
            <div className="clients-divider" />

            {/* Filter controls */}
            <div className="clients-filters-grid">
              {/* Type filter */}
              <div>
                <p className="clients-filter-label">Tipo de pessoa</p>
                <div className="clients-filter-group">
                  {["todos", "PF", "PJ"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTypeFilter(t);
                        setPage(1);
                      }}
                      className={`clients-filter-pill ${typeFilter === t ? "is-active" : ""}`}
                    >
                      {t === "todos" ? "Todos" : t === "PF" ? "Física" : "Jurídica"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div>
                <p className="clients-filter-label">Status</p>
                <div className="clients-filter-group">
                  {["todos", "ativo", "inativo"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStatusFilter(s);
                        setPage(1);
                      }}
                      className={`clients-filter-pill ${statusFilter === s ? "is-active" : ""}`}
                    >
                      {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Results count + clear ── */}
          <div className="clients-results-row" style={{ marginBottom: "0.25rem" }}>
            <p className="clients-results-count">
              {filtered.length === clients.length
                ? `${filtered.length} clientes`
                : `${filtered.length} de ${clients.length} clientes`}
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="clients-clear-filters">
                <X size={11} />
                Limpar filtros
              </button>
            )}
          </div>

          {/* ── Client Grid / Empty State ── */}
          {loading ? (
            <div className="clients-empty-state" style={{ padding: "2.5rem 1rem" }}>
              <Loader2 size={24} className="animate-spin" />
              <p className="clients-empty-title">Carregando clientes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="clients-empty-state" style={{ padding: "2.5rem 1rem" }}>
              <div className="clients-empty-icon-wrap">
                <Users size={24} className="clients-empty-icon" />
              </div>
              <p className="clients-empty-title">Nenhum cliente encontrado</p>
              <p className="clients-empty-text">Tente ajustar os filtros de busca</p>
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="clients-empty-clear">
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="select-client-grid">
              {paginated.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  selected={selectedClient?.id === client.id}
                  onClick={() => handleCardClick(client)}
                  showChevron={false}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <PaginationBar page={safePage} total={totalPages} onPage={setPage} />
          )}
        </div>

        {/* ── Footer / Confirm Action ── */}
        <DialogFooter className="select-client-dialog-footer">
          <div className="select-client-footer-info">
            {selectedClient ? (
              <div className="select-client-footer-selected">
                <span className="select-client-footer-label">Selecionado:</span>
                <span className="select-client-footer-name" title={selectedClient.name}>
                  {selectedClient.name}
                </span>
                <span className={`select-client-footer-type ${selectedClient.type === "PF" ? "is-pf" : "is-pj"}`}>
                  {selectedClient.type}
                </span>
              </div>
            ) : (
              <span className="select-client-footer-placeholder">
                Nenhum cliente selecionado
              </span>
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
              disabled={!selectedClient}
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
