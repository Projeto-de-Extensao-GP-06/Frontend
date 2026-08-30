import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, Search, Scale, Calendar, ChevronRight, FileText, Zap, TrendingUp, Clock, X, BarChart3 } from "lucide-react";
import { StatusBadge, PriorityBadge, PhaseBadge } from "../components/StatusBadge";
import { CalendarEventModal } from "../components/CalendarEventModal";
import { FilterSelect } from "../components/FilterSelect";
import { PaginationBar } from "../components/PaginationBar";
import { mockProcesses, mockRequests } from "../data/mockData";
import "../../styles/home-page.css";
const STATUS_OPTS = [{
  value: "Todos",
  label: "Todos"
}, {
  value: "ativo",
  label: "Ativo"
}, {
  value: "encerrado",
  label: "Encerrado"
}, {
  value: "inativo",
  label: "Inativo"
}];
const PHASE_OPTS = ["Todas", "Inicial", "Citação", "Saneamento", "Sentença", "Cumprimento de sentença", "Penhora"];
const PRIORITY_OPTS = [{
  value: "Todas",
  label: "Todas"
}, {
  value: "alta",
  label: "Alta"
}, {
  value: "média",
  label: "Média"
}, {
  value: "baixa",
  label: "Baixa"
}];

const PRIORITY_WEIGHT = {
  alta: 3,
  media: 2,
  média: 2,
  baixa: 1
};

const HEARING_OPTS = [{
  value: "Todos",
  label: "Todos"
}, {
  value: "com",
  label: "Com audiência"
}, {
  value: "sem",
  label: "Sem audiência"
}];

const parseDateToTimestamp = (dateStr) => {
  if (!dateStr || dateStr === "—") return null;
  const [day, month, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}`).getTime();
};

export default function HomePage() {
  useEffect(() => {
    document.title = "Início - Processos";
  }, []);

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(() => {
    const value = searchParams.get("status");
    return STATUS_OPTS.some(o => o.value === value) ? value : "Todos";
  });
  const [filterTribunal, setFilterTribunal] = useState("Todos");
  const [filterPhase, setFilterPhase] = useState(() => {
    const value = searchParams.get("fase");
    return PHASE_OPTS.includes(value) ? value : "Todas";
  });
  const [filterPriority, setFilterPriority] = useState(() => {
    const value = searchParams.get("prioridade");
    return PRIORITY_OPTS.some(o => o.value === value) ? value : "Todas";
  });
  // Vindo do drill-down do Dashboard (KPI "Com audiência") ou selecionado direto no filtro abaixo.
  const [filterHearing, setFilterHearing] = useState(() => {
    const value = searchParams.get("audiencia");
    return HEARING_OPTS.some(o => o.value === value) ? value : "Todos";
  });
  const [sortBy, setSortBy] = useState("cliente_asc");
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const navigate = useNavigate();
  const activeProcesses = mockProcesses.filter(p => p.status === "ativo");
  const encerrados = mockProcesses.filter(p => p.status === "encerrado");
  const comAudiencia = mockProcesses.filter(p => p.hearingDate !== "—");
  const pendingRequests = mockRequests.filter(r => r.status === "pendente");
  const tribunalOptions = ["Todos", ...Array.from(new Set(mockProcesses.map(p => p.tribunal)))];
  const filtered = mockProcesses.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !search || p.clientName.toLowerCase().includes(q) || p.cnj.includes(q);
    const matchS = filterStatus === "Todos" || p.status === filterStatus;
    const matchT = filterTribunal === "Todos" || p.tribunal === filterTribunal;
    const matchP = filterPhase === "Todas" || p.phase === filterPhase;
    const matchPriority = filterPriority === "Todas" || p.priority === filterPriority;
    const matchHearing = filterHearing === "Todos" || (filterHearing === "com" ? p.hearingDate !== "—" : p.hearingDate === "—");
    return matchQ && matchS && matchT && matchP && matchPriority && matchHearing;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "cliente_asc") {
      return a.clientName.localeCompare(b.clientName, "pt");
    }
    if (sortBy === "cliente_desc") {
      return b.clientName.localeCompare(a.clientName, "pt");
    }
    if (sortBy === "audiencia_asc") {
      const timeA = parseDateToTimestamp(a.hearingDate);
      const timeB = parseDateToTimestamp(b.hearingDate);
      if (timeA && !timeB) return -1;
      if (!timeA && timeB) return 1;
      if (timeA && timeB) return timeA - timeB;
      return 0;
    }
    if (sortBy === "audiencia_desc") {
      const timeA = parseDateToTimestamp(a.hearingDate);
      const timeB = parseDateToTimestamp(b.hearingDate);
      if (timeA && !timeB) return -1;
      if (!timeA && timeB) return 1;
      if (timeA && timeB) return timeB - timeA;
      return 0;
    }
    if (sortBy === "prioridade_desc") {
      const weightA = PRIORITY_WEIGHT[a.priority] || 0;
      const weightB = PRIORITY_WEIGHT[b.priority] || 0;
      return weightB - weightA;
    }
    if (sortBy === "prioridade_asc") {
      const weightA = PRIORITY_WEIGHT[a.priority] || 0;
      const weightB = PRIORITY_WEIGHT[b.priority] || 0;
      return weightA - weightB;
    }
    return 0;
  });

  const hasActiveFilters = search !== "" || filterStatus !== "Todos" || filterTribunal !== "Todos" || filterPhase !== "Todas" || filterPriority !== "Todas" || filterHearing !== "Todos";
  const clearFilters = () => {
    setSearch("");
    setFilterStatus("Todos");
    setFilterTribunal("Todos");
    setFilterPhase("Todas");
    setFilterPriority("Todas");
    setFilterHearing("Todos");
    setPage(1);
  };
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  return <div className="home-page">
      {/* ── Page header ── */}
      <div className="home-header">
        <div>
          <p className="page-kicker">
            SGPJ
          </p>
          <h1 className="page-title">
            Processos
          </h1>
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
        <MetricCard icon={<Scale size={15} className="metric-card-icon metric-card-icon--blue" />} iconVariant="metric-card-badge--blue" value={activeProcesses.length} label="Processos ativos" trend="+1 esta semana" trendVariant="metric-trend--success" trendIcon={<TrendingUp size={10} />} />
        <MetricCard icon={<Zap size={15} className="metric-card-icon metric-card-icon--amber" />} iconVariant="metric-card-badge--amber" value={pendingRequests.length} label="Solicitações" trend="Aguardando análise" trendVariant="metric-trend--amber" trendIcon={<Clock size={10} />} />
        <MetricCard icon={<BarChart3 size={15} className="metric-card-icon metric-card-icon--green" />} iconVariant="metric-card-badge--green" value={encerrados.length} label="Encerrados" trend="Total histórico" trendVariant="metric-trend--muted" trendIcon={<FileText size={10} />} />
        <MetricCard icon={<Calendar size={15} className="metric-card-icon metric-card-icon--gold" />} iconVariant="metric-card-badge--gold" value={comAudiencia.length} label="Com audiência" trend="Agendadas" trendVariant="metric-trend--muted" trendIcon={<Calendar size={10} />} />
      </div>

      {/* ── Search + Filters panel ── */}
      <div className="home-panel">
        {/* Search row */}
        <div className="home-search-row">
          <div className="home-search-wrap">
            <Search size={16} className="home-search-icon" />
            <input type="text" placeholder="Pesquisar por cliente ou número CNJ..." value={search} onChange={e => setSearch(e.target.value)} className="home-search-input" />
          </div>
          <button className="home-search-button">
            Buscar
          </button>
        </div>

        {/* Divider */}
        <div className="home-divider" />

        {/* Filters row */}
        <div className="home-filter-row">
          <div className="home-filter-group-left">
            <span className="home-filter-label">
              Filtros
            </span>

            <FilterSelect prefix="home" label="Status" value={filterStatus} onChange={setFilterStatus}>
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>
                  {o.label}
                </option>)}
            </FilterSelect>

            <FilterSelect prefix="home" label="Fase" value={filterPhase} onChange={setFilterPhase}>
              {PHASE_OPTS.map(p => <option key={p} value={p}>
                  {p === "Todas" ? "Todas" : p}
                </option>)}
            </FilterSelect>

            <FilterSelect prefix="home" label="Prioridade" value={filterPriority} onChange={setFilterPriority}>
              {PRIORITY_OPTS.map(o => <option key={o.value} value={o.value}>
                  {o.label}
                </option>)}
            </FilterSelect>

            <FilterSelect prefix="home" label="Audiência" value={filterHearing} onChange={setFilterHearing}>
              {HEARING_OPTS.map(o => <option key={o.value} value={o.value}>
                  {o.label}
                </option>)}
            </FilterSelect>

            <FilterSelect prefix="home" label="Tribunal" value={filterTribunal} onChange={setFilterTribunal}>
              {tribunalOptions.map(t => <option key={t} value={t}>
                  {t}
                </option>)}
            </FilterSelect>

            {hasActiveFilters && <button onClick={clearFilters} className="home-clear-button">
                <X size={11} />
                Limpar filtros
              </button>}
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
          {filtered.length === mockProcesses.length ? `${filtered.length} processos` : `${filtered.length} de ${mockProcesses.length} processos`}
        </p>
        {filtered.length > 0 && <p className="home-results-tip">
            Clique em um processo para ver detalhes
          </p>}
      </div>

      {/* ── Process grid ── */}
      {filtered.length === 0 ? <div className="home-empty-state">
          <div className="home-empty-icon-wrap">
            <FileText size={24} className="home-empty-icon" />
          </div>
          <p className="home-empty-title">
            Nenhum processo encontrado
          </p>
          <p className="home-empty-text">
            Tente ajustar os filtros de busca
          </p>
          {hasActiveFilters && <button onClick={clearFilters} className="home-empty-clear">
              Limpar filtros
            </button>}
        </div> : <div className="home-grid">
          {paginated.map(p => <ProcessCard key={p.id} process={p} onClick={() => navigate(`/app/processos/${p.id}`)} />)}
        </div>}
      <PaginationBar page={safePage} total={totalPages} onPage={setPage} />

      <CalendarEventModal
        open={calendarModalOpen}
        onOpenChange={setCalendarModalOpen}
      />
    </div>;
}

/* ────────────────────────────────────────── */
/* Sub-components                             */
/* ────────────────────────────────────────── */

function MetricCard({
  icon,
  iconVariant,
  value,
  label,
  trend,
  trendVariant,
  trendIcon
}) {
  return <div className="metric-card">
      <div className={`metric-card-badge ${iconVariant}`}>
        {icon}
      </div>
      <p className="metric-card-value">
        {value}
      </p>
      <p className="metric-card-label">{label}</p>
      <div className={`metric-card-trend ${trendVariant}`}>
        {trendIcon}
        <span className="metric-card-trend-text">{trend}</span>
      </div>
    </div>;
}

function ProcessCard({
  process,
  onClick
}) {
  return <div onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && onClick()} className="process-card">
      {/* Card body */}
      <div className="process-card-body">
        {/* CNJ + Tribunal */}
        <div className="process-card-topline">
          <p className="process-card-cnj">
            {process.cnj}
          </p>
          <span className="process-card-tribunal">
            {process.tribunal}
          </span>
        </div>

        {/* Client name — primary hierarchy */}
        <p className="process-card-name">
          {process.clientName}
        </p>

        {/* Hearing date — secondary hierarchy */}
        {process.hearingDate !== "—" ? <div className="process-card-hearing">
            <Calendar size={12} className="process-card-hearing-icon" />
            <span className="process-card-hearing-text">
              Audiência:{" "}
              <strong className="process-card-hearing-date">
                {process.hearingDate}
              </strong>
            </span>
          </div> : <div className="process-card-hearing-spacer" />}

        {/* Badges */}
        <div className="process-card-badges">
          <StatusBadge status={process.status} />
          <PriorityBadge priority={process.priority} />
          <PhaseBadge phase={process.phase} />
        </div>
      </div>

      {/* Card footer */}
      <div className="process-card-footer">
        <ChevronRight size={15} className="process-card-chevron" />
      </div>
    </div>;
}