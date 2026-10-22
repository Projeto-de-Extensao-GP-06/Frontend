import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, Search, Scale, Calendar, ChevronRight, FileText, Zap, TrendingUp, Clock, X, BarChart3, Loader2 } from "lucide-react";
import { StatusBadge, PriorityBadge, PhaseBadge } from "../components/StatusBadge";
import { CalendarEventModal } from "../components/CalendarEventModal";
import { FilterSelect } from "../components/FilterSelect";
import { PaginationBar } from "../components/PaginationBar";
import { listarProcessos } from "../services/processoService";
import { buscarDadosGeraisDashboard } from "../services/dashboardService";
import { api } from "../provider/api";
import { maskCNJ } from "../utils/masks";
import { toast } from "sonner";
import "../../styles/home-page.css";

// ── Opções de filtro ────────────────────────────────────────────────────────
const STATUS_OPTS = [
  { value: "Todos", label: "Todos" },
  { value: "ATIVO", label: "Ativo" },
  { value: "ENCERRADO", label: "Encerrado" },
  { value: "SUSPENSO", label: "Suspenso" },
];

const HEARING_OPTS = [
  { value: "Todos", label: "Todos" },
  { value: "com", label: "Com audiência" },
  { value: "sem", label: "Sem audiência" },
];

// Mapeamento de sortBy (front) → parâmetro Spring Sort
const SORT_MAP = {
  cliente_asc:      "cliente.nomeRazaoSocial,asc",
  cliente_desc:     "cliente.nomeRazaoSocial,desc",
  audiencia_asc:    "dataAudiencia,asc",
  audiencia_desc:   "dataAudiencia,desc",
  prioridade_desc:  "prioridade.id,desc",
  prioridade_asc:   "prioridade.id,asc",
};

const PAGE_SIZE = 6;

// ── Helpers locais ──────────────────────────────────────────────────────────
function formatarData(dataIso) {
  if (!dataIso) return "—";
  const [data] = dataIso.split("T");
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function normalizarTexto(valor) {
  if (!valor) return "-";
  const texto = String(valor).trim().toLocaleLowerCase("pt-BR");
  return texto.replace(/(^|[\s-])\S/g, (letra) => letra.toLocaleUpperCase("pt-BR"));
}

function mapearProcesso(p) {
  return {
    id: p.id,
    cnj: p.numeroProcesso || p.processoApi?.numeroCnj || "-",
    clientName: p.clientNomeRazaoSocial || "Sem nome",
    tribunal: (p.siglaTribunal?.siglaTribunal || p.siglaTribunal?.nome)?.toUpperCase() || "-",
    hearingDate: formatarData(p.dataAudiencia),
    status: p.status ? p.status.trim().toLowerCase() : "ativo",
    priority: p.prioridade?.nome ? p.prioridade.nome.trim().toLowerCase() : "baixa",
    phase: normalizarTexto(p.faseProcesso?.nome),
    faseId: p.faseProcesso?.id ?? null,
    tribunalId: p.siglaTribunal?.id ?? null,
    prioridadeId: p.prioridade?.id ?? null,
    raw: p,
  };
}

// ── Componente principal ────────────────────────────────────────────────────
export default function HomePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Dados do servidor
  const [processes, setProcesses] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [kpiSolicitacoesPendentes, setKpiSolicitacoesPendentes] = useState(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(() => {
    const v = searchParams.get("status");
    return STATUS_OPTS.some(o => o.value === v) ? v : "Todos";
  });
  const [filterPhase, setFilterPhase] = useState("Todas");
  const [filterPriority, setFilterPriority] = useState("Todas");
  const [filterHearing, setFilterHearing] = useState(() => {
    const v = searchParams.get("audiencia");
    return HEARING_OPTS.some(o => o.value === v) ? v : "Todos";
  });
  const [sortBy, setSortBy] = useState("cliente_asc");
  const [page, setPage] = useState(1);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  // Opções dinâmicas de fases/tribunais/prioridades (carregadas uma vez)
  const [faseOpts, setFaseOpts] = useState([{ value: "Todas", label: "Todas" }]);
  const [tribunalOpts, setTribunalOpts] = useState([{ value: "Todos", label: "Todos" }]);
  const [prioridadeOpts, setPrioridadeOpts] = useState([{ value: "Todas", label: "Todas" }]);
  const [faseId, setFaseId] = useState(null);
  const [tribunalId, setTribunalId] = useState(null);
  const [prioridadeId, setPrioridadeId] = useState(null);

  // KPI counters (carregados separadamente, não afetados por filtros)
  const [kpiAtivos, setKpiAtivos] = useState(0);
  const [kpiEncerrados, setKpiEncerrados] = useState(0);
  const [kpiAudiencia, setKpiAudiencia] = useState(0);

  // Debounce do campo de busca
  const debounceTimer = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  // ── Carregar opções de filtro e KPIs (uma vez) ──────────────────────────
  useEffect(() => {
    document.title = "SGPJ | Início";

    async function carregarOpcoes() {
      try {
        const [fasesRes, tribunaisRes, prioridadesRes] = await Promise.all([
          api.get("/fasesProcesso").catch(() => ({ data: [] })),
          api.get("/siglaTribunais").catch(() => ({ data: [] })),
          api.get("/prioridades").catch(() => ({ data: [] })),
        ]);

        const fases = Array.isArray(fasesRes.data) ? fasesRes.data : [];
        const tribunais = Array.isArray(tribunaisRes.data) ? tribunaisRes.data : [];
        const prioridades = Array.isArray(prioridadesRes.data) ? prioridadesRes.data : [];

        setFaseOpts([
          { value: "Todas", label: "Todas" },
          ...fases.map(f => ({ value: String(f.id), label: f.nome })),
        ]);
        setTribunalOpts([
          { value: "Todos", label: "Todos" },
          ...tribunais.map(t => {
            const label = t.siglaTribunal || t.nome || "";
            return { value: String(t.id), label: label.toUpperCase() || label };
          }),
        ]);
        setPrioridadeOpts([
          { value: "Todas", label: "Todas" },
          ...prioridades.map(p => ({ value: String(p.id), label: p.nome })),
        ]);
      } catch (e) {
        console.error("Erro ao carregar opções de filtro:", e);
      }
    }

    async function carregarKpis() {
      try {
        const [ativosRes, encerradosRes, audienciaRes, dashboardRes] = await Promise.all([
          api.get("/processos", { params: { status: "ATIVO", size: 1 } }).catch(() => null),
          api.get("/processos", { params: { status: "ENCERRADO", size: 1 } }).catch(() => null),
          api.get("/processos", { params: { audiencia: "com", size: 1 } }).catch(() => null),
          buscarDadosGeraisDashboard().catch(() => null),
        ]);
        if (ativosRes) setKpiAtivos(ativosRes.data.totalElements ?? 0);
        if (encerradosRes) setKpiEncerrados(encerradosRes.data.totalElements ?? 0);
        if (audienciaRes) setKpiAudiencia(audienciaRes.data.totalElements ?? 0);
        if (dashboardRes?.solicitacoesPendentes != null) {
          setKpiSolicitacoesPendentes(dashboardRes.solicitacoesPendentes);
        } else {
          setKpiSolicitacoesPendentes(0);
        }
      } catch (e) {
        console.error("Erro ao carregar KPIs:", e);
        setKpiSolicitacoesPendentes(0);
      }
    }

    carregarOpcoes();
    carregarKpis();
  }, []);

  // ── Carregar processos ao mudar filtros / página / ordenação ────────────
  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      try {
        setLoading(true);
        const dados = await listarProcessos({
          query: debouncedSearch || undefined,
          status: filterStatus !== "Todos" ? filterStatus : undefined,
          faseId: faseId ?? undefined,
          tribunalId: tribunalId ?? undefined,
          prioridadeId: prioridadeId ?? undefined,
          audiencia: filterHearing !== "Todos" ? filterHearing : undefined,
          page: page - 1,  // Spring é 0-based
          size: PAGE_SIZE,
          sort: SORT_MAP[sortBy] || "cliente.nomeRazaoSocial,asc",
        });

        if (cancelled) return;
        const content = dados.content || [];
        setProcesses(content.map(mapearProcesso));
        setTotalElements(dados.totalElements ?? 0);
        setTotalPages(Math.max(1, dados.totalPages ?? 1));
      } catch (err) {
        if (cancelled) return;
        console.error("Erro ao carregar processos:", err);
        if (err.response?.status === 401) {
          toast.warning("Sessão inválida ou expirada.");
        } else {
          toast.error("Não foi possível carregar os processos do servidor.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    carregar();
    return () => { cancelled = true; };
  }, [debouncedSearch, filterStatus, faseId, tribunalId, prioridadeId, filterHearing, sortBy, page]);

  const hasActiveFilters =
    debouncedSearch !== "" ||
    filterStatus !== "Todos" ||
    faseId != null ||
    tribunalId != null ||
    prioridadeId != null ||
    filterHearing !== "Todos";

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setFilterStatus("Todos");
    setFaseId(null);
    setTribunalId(null);
    setPrioridadeId(null);
    setFilterHearing("Todos");
    setPage(1);
  };

  return (
    <div className="home-page">
      {/* ── Page header ── */}
      <div className="home-header">
        <div>
          <p className="page-kicker">SGPJ</p>
          <h1 className="page-title">Processos</h1>
        </div>
        <div className="home-header-actions">
          <button
            type="button"
            onClick={() => setCalendarModalOpen(true)}
            className="home-calendar-button"
          >
            <Calendar size={16} />
            <span>Gerar evento de calendário</span>
          </button>
          <button onClick={() => navigate("/app/processos/novo")} className="home-new-button">
            <Plus size={16} />
            <span className="home-new-button-label home-new-button-label--wide">Novo Processo</span>
            <span className="home-new-button-label home-new-button-label--compact">Novo</span>
          </button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="home-metrics-grid">
        <MetricCard
          icon={<Scale size={15} className="metric-card-icon metric-card-icon--blue" />}
          iconVariant="metric-card-badge--blue"
          value={kpiAtivos}
          label="Processos ativos"
          trendVariant="metric-trend--success"
        />
        <MetricCard
          icon={<Zap size={15} className="metric-card-icon metric-card-icon--amber" />}
          iconVariant="metric-card-badge--amber"
          value={kpiSolicitacoesPendentes ?? "—"}
          label="Solicitações pendentes"
          trendVariant="metric-trend--amber"
          onClick={() => navigate("/app/solicitacoes?tab=pendente")}
        />
        <MetricCard
          icon={<BarChart3 size={15} className="metric-card-icon metric-card-icon--green" />}
          iconVariant="metric-card-badge--green"
          value={kpiEncerrados}
          label="Processos encerrados"
          trendVariant="metric-trend--muted"
        />
        <MetricCard
          icon={<Calendar size={15} className="metric-card-icon metric-card-icon--gold" />}
          iconVariant="metric-card-badge--gold"
          value={kpiAudiencia}
          label="Processos com audiência"
          trendVariant="metric-trend--muted"
        />
      </div>

      {/* ── Search + Filters panel ── */}
      <div className="home-panel">
        <div className="home-search-row">
          <div className="home-search-wrap">
            <Search size={16} className="home-search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por cliente ou número CNJ..."
              value={search}
              onChange={handleSearchChange}
              className="home-search-input"
            />
          </div>
          <button className="home-search-button" onClick={() => { setDebouncedSearch(search); setPage(1); }}>Buscar</button>
        </div>

        <div className="home-divider" />

        <div className="home-filter-row">
          <div className="home-filter-group-left">
            <span className="home-filter-label">Filtros</span>

            <FilterSelect
              prefix="home"
              className={`home-filter-select${filterStatus !== "Todos" ? " home-filter-select--active" : ""}`}
              label="Status"
              value={filterStatus}
              onChange={v => { setFilterStatus(v); setPage(1); }}
            >
              {STATUS_OPTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </FilterSelect>

            <FilterSelect
              prefix="home"
              className={`home-filter-select${faseId != null ? " home-filter-select--active" : ""}`}
              label="Fase"
              value={faseId != null ? String(faseId) : "Todas"}
              onChange={v => { setFaseId(v === "Todas" ? null : Number(v)); setPage(1); }}
            >
              {faseOpts.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </FilterSelect>

            <FilterSelect
              prefix="home"
              className={`home-filter-select${prioridadeId != null ? " home-filter-select--active" : ""}`}
              label="Prioridade"
              value={prioridadeId != null ? String(prioridadeId) : "Todas"}
              onChange={v => { setPrioridadeId(v === "Todas" ? null : Number(v)); setPage(1); }}
            >
              {prioridadeOpts.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </FilterSelect>

            <FilterSelect
              prefix="home"
              className={`home-filter-select${filterHearing !== "Todos" ? " home-filter-select--active" : ""}`}
              label="Audiência"
              value={filterHearing}
              onChange={v => { setFilterHearing(v); setPage(1); }}
            >
              {HEARING_OPTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </FilterSelect>

            <FilterSelect
              prefix="home"
              className={`home-filter-select${tribunalId != null ? " home-filter-select--active" : ""}`}
              label="Tribunal"
              value={tribunalId != null ? String(tribunalId) : "Todos"}
              onChange={v => { setTribunalId(v === "Todos" ? null : Number(v)); setPage(1); }}
            >
              {tribunalOpts.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </FilterSelect>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="home-clear-button">
                <X size={11} />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="home-sort-wrap">
            <span className="home-sort-label">Ordenar:</span>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="home-sort-select"
            >
              <option value="cliente_asc">Nome do cliente (A → Z)</option>
              <option value="cliente_desc">Nome do cliente (Z → A)</option>
              <option value="audiencia_asc">Audiência (Mais próxima)</option>
              <option value="audiencia_desc">Audiência (Mais distante)</option>
              <option value="prioridade_desc">Prioridade (Alta → Baixa)</option>
              <option value="prioridade_asc">Prioridade (Baixa → Alta)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="home-results-row">
        <p className="home-results-count">
          {totalElements === 0
            ? "Nenhum processo"
            : `${totalElements} processo${totalElements !== 1 ? "s" : ""}`}
        </p>
        {processes.length > 0 && (
          <p className="home-results-tip">Clique em um processo para ver detalhes</p>
        )}
      </div>

      {/* ── Process grid ── */}
      {loading ? (
        <div className="home-empty-state">
          <Loader2 size={28} className="animate-spin text-blue-600" />
          <p className="home-empty-title">Carregando processos...</p>
        </div>
      ) : processes.length === 0 ? (
        <div className="home-empty-state">
          <div className="home-empty-icon-wrap">
            <FileText size={24} className="home-empty-icon" />
          </div>
          <p className="home-empty-title">Nenhum processo encontrado</p>
          <p className="home-empty-text">Tente ajustar os filtros de busca</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="home-empty-clear">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="home-grid">
          {processes.map(p => (
            <ProcessCard key={p.id} process={p} onClick={() => navigate(`/app/processos/${p.id}`)} />
          ))}
        </div>
      )}

      {!loading && <PaginationBar page={page} total={totalPages} onPage={setPage} />}

      <CalendarEventModal
        open={calendarModalOpen}
        onOpenChange={setCalendarModalOpen}
      />
    </div>
  );
}

/* ────────────────────────────────────────── */
/* Sub-components                             */
/* ────────────────────────────────────────── */

function MetricCard({
  icon,
  iconVariant,
  value,
  label,
  onClick,
}) {
  return (
    <div
      className={`metric-card ${onClick ? "metric-card--clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <div className={`metric-card-badge ${iconVariant}`}>
        {icon}
      </div>
      <div className="metric-card-content">
        <p className="metric-card-value">{value}</p>
        <p className="metric-card-label">{label}</p>
      </div>
    </div>
  );
}

function ProcessCard({ process, onClick }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}
      className="process-card"
    >
      <div className="process-card-body">
        <div className="process-card-topline">
          <p className="process-card-cnj">{maskCNJ(process.cnj) || "-"}</p>
          <span className="process-card-tribunal">{process.tribunal}</span>
        </div>

        <p className="process-card-name">{process.clientName}</p>

        {process.hearingDate !== "—" ? (
          <div className="process-card-hearing">
            <Calendar size={12} className="process-card-hearing-icon" />
            <span className="process-card-hearing-text">
              Audiência:{" "}
              <strong className="process-card-hearing-date">
                {process.hearingDate}
              </strong>
            </span>
          </div>
        ) : (
          <div className="process-card-hearing-spacer" />
        )}

        <div className="process-card-badges">
          <StatusBadge status={process.status} />
          <PriorityBadge priority={process.priority} />
          <PhaseBadge phase={process.phase} />
        </div>
      </div>

      <div className="process-card-footer">
        <ChevronRight size={15} className="process-card-chevron" />
      </div>
    </div>
  );
}
