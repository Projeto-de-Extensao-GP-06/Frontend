import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Users, LoaderCircle, AlertCircle, X } from "lucide-react";
import { ClientCard } from "../components/ClientCard";
import { FilterSelect } from "../components/FilterSelect";
import { PaginationBar } from "../components/PaginationBar";
import { clienteService, getClienteError } from "../services/clienteService";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../utils/permissions";
import "../../styles/clients-page.css";

const TYPE_OPTS = [
  { value: "todos", label: "Todos" },
  { value: "PF", label: "Pessoa Física" },
  { value: "PJ", label: "Pessoa Jurídica" },
];

const STATUS_OPTS = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "lead", label: "Lead" },
];

export default function ClientsPage() {
  useEffect(() => {
    document.title = "SGPJ | Clientes";
  }, []);

  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreateClient = hasPermission(user, "CRIAR CLIENTE");

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("nome_asc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClients = async () => {
    setLoading(true);
    setError("");
    try {
      setClients(await clienteService.list());
    } catch (requestError) {
      setError(getClienteError(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filtered = clients.filter((client) => {
    const term = search.trim().toLowerCase();
    const matchSearch = !term || [client.name, client.email, client.cpf, client.cnpj]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));
    const matchType = typeFilter === "todos" || client.type === typeFilter;
    const matchStatus = statusFilter === "todos" || client.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "nome_asc") {
      return a.name.localeCompare(b.name, "pt-BR");
    }
    if (sortBy === "nome_desc") {
      return b.name.localeCompare(a.name, "pt-BR");
    }
    return 0;
  });

  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasActiveFilters = search !== "" || typeFilter !== "todos" || statusFilter !== "todos";

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("todos");
    setStatusFilter("todos");
    setPage(1);
  };

  return <div className="clients-page">
      {/* ── Header ── */}
      <div className="clients-header">
        <div>
          <p className="clients-kicker">
            SGPJ
          </p>
          <h1 className="clients-title">
            Clientes
          </h1>
        </div>
        <button
          onClick={() => navigate("/app/clientes/novo")}
          className="clients-new-button"
          disabled={!canCreateClient}
          title={canCreateClient ? "Novo Cliente" : "Sem permissão para criar cliente"}
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {/* ── Search panel ── */}
      <div className="clients-panel">
        {/* Search row */}
        <div className="clients-search-row">
          <div className="clients-search-wrap">
            <Search size={16} className="clients-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="clients-search-input"
            />
          </div>
          <button className="clients-search-button" onClick={() => setPage(1)}>
            Buscar
          </button>
        </div>

        {/* Divider */}
        <div className="clients-divider" />

        {/* Filters row */}
        <div className="clients-filter-row">
          <div className="clients-filter-group-left">
            <span className="clients-filter-label">
              Filtros
            </span>

            <FilterSelect
              prefix="clients"
              label="Tipo"
              value={typeFilter}
              onChange={val => {
                setTypeFilter(val);
                setPage(1);
              }}
            >
              {TYPE_OPTS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              prefix="clients"
              label="Status"
              value={statusFilter}
              onChange={val => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              {STATUS_OPTS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </FilterSelect>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="clients-clear-button">
                <X size={11} />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="clients-sort-wrap">
            <span className="clients-sort-label">Ordenar:</span>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="clients-sort-select"
            >
              <option value="nome_asc">Nome (A → Z)</option>
              <option value="nome_desc">Nome (Z → A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="clients-results-row">
        <p className="clients-results-count">
          {sorted.length === clients.length
            ? `${sorted.length} cliente${sorted.length === 1 ? "" : "s"}`
            : `${sorted.length} de ${clients.length} cliente${clients.length === 1 ? "" : "s"}`}
        </p>
        {sorted.length > 0 && (
          <p className="clients-results-tip">
            Clique em um cliente para ver detalhes
          </p>
        )}
      </div>

      {/* ── Client grid / empty state ── */}
      {loading ? (
        <div className="clients-empty-state">
          <div className="clients-empty-icon-wrap">
            <LoaderCircle size={24} className="clients-empty-icon" />
          </div>
          <p className="clients-empty-title">
            Carregando clientes...
          </p>
        </div>
      ) : error ? (
        <div className="clients-empty-state">
          <div className="clients-empty-icon-wrap">
            <AlertCircle size={24} className="clients-empty-icon" />
          </div>
          <p className="clients-empty-title">
            Não foi possível carregar os clientes
          </p>
          <p className="clients-empty-text">
            {error}
          </p>
          <button onClick={loadClients} className="clients-empty-clear">
            Tentar novamente
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="clients-empty-state">
          <div className="clients-empty-icon-wrap">
            <Users size={24} className="clients-empty-icon" />
          </div>
          <p className="clients-empty-title">
            Nenhum cliente encontrado
          </p>
          <p className="clients-empty-text">
            Tente ajustar os filtros de busca
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="clients-empty-clear">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="clients-grid">
          {visible.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => navigate(`/app/clientes/${client.id}`)}
            />
          ))}
        </div>
      )}
      {!loading && visible.length > 0 && (
        <PaginationBar page={safePage} total={totalPages} onPage={setPage} />
      )}
    </div>;
}
