import { useState } from "react";
import { Search, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ClientCard } from "./ClientCard";
import { mockClients } from "../data/mockData";
import "../../styles/select-client-modal.css";
import "../../styles/clients-page.css";

export function SelectClientModal({
  open,
  onOpenChange,
  selectedClientId,
  onSelect,
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 6;

  const filtered = mockClients.filter((c) => {
    const term = search.toLowerCase();
    const doc = c.type === "PF" ? c.cpf : c.cnpj;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
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

  const handleSelectClient = (client) => {
    onSelect(client);
    onOpenChange(false);
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
              {filtered.length === mockClients.length
                ? `${filtered.length} clientes`
                : `${filtered.length} de ${mockClients.length} clientes`}
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="clients-clear-filters">
                <X size={11} />
                Limpar filtros
              </button>
            )}
          </div>

          {/* ── Client Grid / Empty State ── */}
          {filtered.length === 0 ? (
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
                  selected={selectedClientId === client.id}
                  onClick={() => handleSelectClient(client)}
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
      </DialogContent>
    </Dialog>
  );
}

function PaginationBar({ page, total, onPage }) {
  if (total <= 0) return null;

  const MAX_VISIBLE_PAGES = 5;
  const currentBlock = Math.floor((page - 1) / MAX_VISIBLE_PAGES);
  const startPage = currentBlock * MAX_VISIBLE_PAGES + 1;
  const endPage = Math.min(startPage + MAX_VISIBLE_PAGES - 1, total);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination" style={{ marginTop: "0.75rem" }}>
      <button
        type="button"
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
          type="button"
          className={`pagination__page ${page === p ? "is-active" : ""}`}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
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
