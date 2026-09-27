import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Calendar,
  CalendarRange,
  Eye,
  EyeOff,
  Info,
  MessageSquare,
  Scale,
  TrendingUp,
  Users,
  Zap,
  X,
  ArrowLeft,
} from "lucide-react";
import "../../styles/dashboard-page.css";

// ---------------------------------------------------------------------------
// CONSTANTES & CONFIGURAÇÕES DE CORES
// ---------------------------------------------------------------------------

const PRESETS = ["Hoje", "Esta semana", "Mês atual", "Ano atual"];
const COLORS = ["#1D4ED8", "#3B82F6", "#0F766E", "#C9A96E", "#B45309"];

const ENTRY_COLORS = ["#1D4ED8", "#0F766E", "#C9A96E"];
const DURATION_COLORS = ["#1D4ED8", "#3B82F6", "#0F766E", "#C9A96E", "#B45309"];

// ---------------------------------------------------------------------------
// ESTRUTURA INICIAL VAZIA (Pronta para integração com Backend API)
// ---------------------------------------------------------------------------

const INITIAL_DASHBOARD_DATA = {
  kpis: {
    processosAtivos: { value: "0", sub: "" },
    solicitacoes: { value: "0", sub: "" },
    clientes: { value: "0", sub: "" },
    comAudiencia: { value: "0", sub: "" },
  },
  phaseData: [],
  encerradosData: [
    { categoria: "Acordo", total: 0, fill: "#c96e6e" },
    { categoria: "Sem resolução", total: 0, fill: "#b35353" },
    { categoria: "Penhora Total", total: 0, fill: "#8b3a3a" },
    { categoria: "Pagamento voluntário", total: 0, fill: "#df8f8f" },
  ],
  suspensasData: [
    { categoria: "Acordo Parcelado", total: 0, fill: "#d8c21d" },
    { categoria: "Tratativas", total: 0, fill: "#bfa915" },
    { categoria: "Ausência de Bens", total: 0, fill: "#94830c" },
    { categoria: "Determinação Judicial", total: 0, fill: "#e8d752" },
  ],
  formaEntradaData: [
    { origem: "Instagram", clientes: 0 },
    { origem: "Site", clientes: 0 },
    { origem: "Indicação", clientes: 0 },
  ],
  tempoDuracaoData: [
    { faixa: "0–6 meses", processos: 0 },
    { faixa: "6–12 meses", processos: 0 },
    { faixa: "1–2 anos", processos: 0 },
    { faixa: "2–5 anos", processos: 0 },
    { faixa: "+5 anos", processos: 0 },
  ],
  monthlyData: [],
  requestFunnel: [
    { etapa: "Recebidas", total: 0 },
    { etapa: "Aceitas", total: 0 },
    { etapa: "Novos clientes", total: 0 },
  ],
  upcomingHearings: [],
};





const toHomePhase = (phase) => phase;

const FUNNEL_ROUTES = {
  "Recebidas": "/app/solicitacoes?tab=todas",
  "Aceitas": "/app/solicitacoes?tab=aceita",
  "Novos clientes": "/app/clientes",
};

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dashboard-tooltip">
      <p className="dashboard-tooltip-title">{label}</p>
      {payload.map((item, index) => (
        <p key={index} style={{ color: item.color ?? "#C9A96E" }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  useEffect(() => {
    document.title = "Dashboard";
  }, []);
  const navigate = useNavigate();

  // Estados de filtro de UI
  const [periodMode, setPeriodMode] = useState("preset");
  const [preset, setPreset] = useState("Mês atual");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedPeriod, setAppliedPeriod] = useState("Mês atual");
  const [showEmptyPhases, setShowEmptyPhases] = useState(false);

  // Estado principal dos dados do Dashboard (Popule via useEffect / fetch API)
  const [dashboardData] = useState(INITIAL_DASHBOARD_DATA);

  // TODO: Conectar com o Backend API ao mudar filtro ou carregar pág:
  // useEffect(() => {
  //   async function fetchDashboard() {
  //     const data = await api.get('/dashboard', { params: { periodMode, preset, dateFrom, dateTo } });
  //     setDashboardData(data);
  //   }
  //   fetchDashboard();
  // }, [periodMode, preset, dateFrom, dateTo]);

  const currentEncerradosData = dashboardData.encerradosData;
  const currentSuspensasData = dashboardData.suspensasData;
  const currentFormaEntradaData = dashboardData.formaEntradaData;
  const currentTempoDuracaoData = dashboardData.tempoDuracaoData;
  const currentMonthlyData = dashboardData.monthlyData;
  const currentRequestFunnel = dashboardData.requestFunnel;

  // Processos por fase
  const phaseData = dashboardData.phaseData;
  const hasPhaseData = phaseData.length > 0;
  const maxPhaseCount = hasPhaseData ? Math.max(0, ...phaseData.map((item) => item.processos)) : 0;
  const displayedPhaseData = showEmptyPhases
    ? phaseData
    : phaseData.filter((item) => item.processos > 0);
  const phaseChartHeight = Math.max(180, displayedPhaseData.length * 34 + 44);

  const applyCustom = () => {
    if (dateFrom && dateTo) {
      const formattedFrom = dateFrom.split("-").reverse().join("/");
      const formattedTo = dateTo.split("-").reverse().join("/");
      setAppliedPeriod(`${formattedFrom} - ${formattedTo}`);
      setPeriodMode("custom");
    }
  };

  const selectPreset = (value) => {
    setPeriodMode("preset");
    setPreset(value);
    setAppliedPeriod(value);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <p className="page-kicker">SGPJ</p>
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* KPI GRID */}
      <div className="dashboard-kpi-grid">
        <KpiCard
          label="Processos ativos"
          value={dashboardData.kpis.processosAtivos.value}
          icon={<Scale size={15} className="kpi-card-icon kpi-card-icon--blue" />}
          iconVariant="kpi-card-badge--blue"
          sub={dashboardData.kpis.processosAtivos.sub}
          subIcon={<TrendingUp size={10} />}
          subVariant="kpi-card-sub--success"
          onClick={() => navigate("/app?status=ativo")}
        />
        <KpiCard
          label="Solicitações"
          value={dashboardData.kpis.solicitacoes.value}
          icon={<Zap size={15} className="kpi-card-icon kpi-card-icon--amber" />}
          iconVariant="kpi-card-badge--amber"
          sub={dashboardData.kpis.solicitacoes.sub}
          subIcon={<ArrowUpRight size={10} />}
          subVariant="kpi-card-sub--amber"
          onClick={() => navigate("/app/solicitacoes?tab=pendente")}
        />
        <KpiCard
          label="Clientes"
          value={dashboardData.kpis.clientes.value}
          icon={<Users size={15} className="kpi-card-icon kpi-card-icon--green" />}
          iconVariant="kpi-card-badge--green"
          sub={dashboardData.kpis.clientes.sub}
          subIcon={<Users size={10} />}
          subVariant="kpi-card-sub--muted"
          onClick={() => navigate("/app/clientes")}
        />
        <KpiCard
          label="Com audiência"
          value={dashboardData.kpis.comAudiencia.value}
          icon={<Calendar size={15} className="kpi-card-icon kpi-card-icon--gold" />}
          iconVariant="kpi-card-badge--gold"
          sub={dashboardData.kpis.comAudiencia.sub}
          subIcon={<Calendar size={10} />}
          subVariant="kpi-card-sub--muted"
          onClick={() => navigate("/app?audiencia=com")}
        />
      </div>

      {/* PAINEL DE FILTRO DE PERÍODO (No topo) */}
      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <p className="dashboard-panel-title">Filtro por período</p>
          <span className="dashboard-period-badge">
            <CalendarRange size={11} />
            {appliedPeriod}
          </span>
        </div>
        <div className="dashboard-divider" />
        <div className="dashboard-preset-row">
          {PRESETS.map((value) => (
            <button
              key={value}
              onClick={() => selectPreset(value)}
              className={`dashboard-preset-btn ${periodMode === "preset" && preset === value ? "dashboard-preset-btn--active" : ""}`}
            >
              {value}
            </button>
          ))}
          <button
            onClick={() => setPeriodMode("custom")}
            className={`dashboard-preset-btn ${periodMode === "custom" ? "dashboard-preset-btn--active" : ""}`}
          >
            <Calendar size={11} />
            Personalizado
          </button>
        </div>
        {periodMode === "custom" && (
          <div className="dashboard-custom-period">
            <div className="dashboard-custom-divider" />
            <div className="dashboard-custom-grid">
              <div className="dashboard-field">
                <label className="dashboard-label">Data inicial</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="dashboard-input"
                />
              </div>
              <div className="dashboard-field">
                <label className="dashboard-label">Data final</label>
                <input
                  type="date"
                  min={dateFrom}
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="dashboard-input"
                />
              </div>
              <div className="dashboard-actions">
                <button
                  onClick={applyCustom}
                  disabled={!dateFrom || !dateTo}
                  className="dashboard-primary-button"
                >
                  Aplicar
                </button>
                <button
                  onClick={() => {
                    setPeriodMode("preset");
                    setDateFrom("");
                    setDateTo("");
                    setAppliedPeriod(preset);
                  }}
                  className="dashboard-icon-button"
                  title="Limpar"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PROCESSOS POR FASE (Total do sistema) */}
      <ChartCard
        title="Processos por fase"
        sub="Distribuição atual da carteira ativa (Total do sistema)"
        info="Distribui os processos ativos entre as etapas processuais. É uma fotografia do momento atual do sistema."
      >
        {hasPhaseData ? (
          <>
            <div className="dashboard-phase-toggle">
              <button
                type="button"
                aria-pressed={showEmptyPhases}
                onClick={() => setShowEmptyPhases((value) => !value)}
              >
                {showEmptyPhases ? <EyeOff size={13} /> : <Eye size={13} />}
                {showEmptyPhases ? "Ocultar fases sem processos" : "Mostrar fases sem processos"}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={phaseChartHeight}>
              <BarChart
                data={displayedPhaseData}
                layout="vertical"
                margin={{ top: 8, right: 28, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" horizontal={false} />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="fase"
                  type="category"
                  width={150}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Bar
                  dataKey="processos"
                  name="Processos"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(data) =>
                    navigate(`/app?fase=${encodeURIComponent(toHomePhase(data.fase))}`)
                  }
                >
                  <LabelList
                    dataKey="processos"
                    position="right"
                    style={{ fill: "#0f2357", fontSize: 11, fontWeight: 700 }}
                  />
                  {displayedPhaseData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.processos === maxPhaseCount ? "#C9A96E" : "#0F2357"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="dashboard-empty">Nenhum processo ativo no momento.</p>
        )}
      </ChartCard>

      {/* PROCESSOS ENCERRADOS & SUSPENSOS */}
      <div className="dashboard-charts-grid dashboard-charts-grid--split">
        <ChartCard
          title="Processos encerrados"
          sub={`Total por categoria - ${appliedPeriod}`}
          info="Exibe o total de processos encerrados por motivo/ocasião específica no período selecionado."
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={currentEncerradosData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
              <XAxis dataKey="categoria" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="total" name="Processos" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="total" position="top" style={{ fill: "#0f2357", fontSize: 11, fontWeight: 700 }} />
                {currentEncerradosData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Processos suspensos"
          sub={`Total por categoria - ${appliedPeriod}`}
          info="Exibe o total de processos suspensos por motivo/ocasião específica no período selecionado."
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={currentSuspensasData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
              <XAxis dataKey="categoria" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 9 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="total" name="Processos" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="total" position="top" style={{ fill: "#0f2357", fontSize: 11, fontWeight: 700 }} />
                {currentSuspensasData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* FORMA DE ENTRADA & TEMPO DE DURAÇÃO */}
      <div className="dashboard-charts-grid dashboard-charts-grid--split">
        <ChartCard
          title="Forma de entrada"
          sub={`Total de clientes por canal - ${appliedPeriod}`}
          info="Mede o total de clientes que entraram no escritório por cada canal específico (Instagram, Site ou Indicação) no período selecionado."
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={currentFormaEntradaData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
              <XAxis dataKey="origem" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="clientes" name="Clientes" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="clientes" position="top" style={{ fill: "#0f2357", fontSize: 11, fontWeight: 700 }} />
                {currentFormaEntradaData.map((entry, index) => (
                  <Cell key={index} fill={ENTRY_COLORS[index % ENTRY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Tempo de duração"
          sub={`Processos por tempo de tramitação - ${appliedPeriod}`}
          info="Distribui os processos ativos de acordo com a sua duração total em tramitação para o período selecionado."
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={currentTempoDuracaoData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
              <XAxis dataKey="faixa" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="processos" name="Processos" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="processos" position="top" style={{ fill: "#0f2357", fontSize: 11, fontWeight: 700 }} />
                {currentTempoDuracaoData.map((entry, index) => (
                  <Cell key={index} fill={DURATION_COLORS[index % DURATION_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* EVOLUÇÃO DA CARTEIRA & FUNIL DE ATENDIMENTO */}
      <div className="dashboard-charts-grid dashboard-charts-grid--split">
        <ChartCard
          title="Evolução da carteira"
          sub={`Aberturas e encerramentos - ${appliedPeriod}`}
          info="Compara os processos abertos com os processos encerrados e suspensos no período selecionado."
        >
          {currentMonthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={currentMonthlyData} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTip />} />
                <Legend iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="ativos"
                  name="Ativos"
                  stroke="#1D4ED8"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="encerrados"
                  name="Encerrados"
                  stroke="#c96e6e"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="suspensos"
                  name="Suspensos"
                  stroke="#d8c21d"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="novos"
                  name="Novos"
                  stroke="#88c96e"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="dashboard-empty">Nenhum dado de evolução no momento.</p>
          )}
        </ChartCard>

        <ChartCard
          title="Funil de atendimento"
          sub={`Solicitações até a abertura do processo - ${appliedPeriod}`}
          info="Mostra a passagem das solicitações recebidas, aceitas, transformadas em novos clientes e processos no período selecionado."
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={currentRequestFunnel}
              layout="vertical"
              margin={{ top: 0, right: 12, left: 22, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="etapa" type="category" width={84} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTip />} />
              <Bar
                dataKey="total"
                name="Quantidade"
                radius={[0, 5, 5, 0]}
                cursor="pointer"
                onClick={(data) => {
                  const route = FUNNEL_ROUTES[data.etapa];
                  if (route) navigate(route);
                }}
              >
                {currentRequestFunnel.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* AGENDA DE RISCO */}
      <div className="dashboard-charts-grid">
        <ListCard
          title="Agenda de risco"
          sub="Audiências futuras ordenadas por data"
          empty="Não há audiências futuras."
          info="Lista as próximas audiências dos processos ativos em ordem de data."
        >
          {dashboardData.upcomingHearings.map((process) => (
            <div
              // key={process.id}
              className="dashboard-list-item dashboard-list-item--clickable"
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(
                  `/app?fase=${encodeURIComponent(toHomePhase(process.phase))}&prioridade=${encodeURIComponent(process.priority.toLowerCase())}`,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter")
                  navigate(
                    `/app?fase=${encodeURIComponent(toHomePhase(process.phase))}&prioridade=${encodeURIComponent(process.priority.toLowerCase())}`,
                  );
              }}
            >
              <div>
                <strong>{process.hearing}</strong>
                <span>
                  {process.phase} · {process.responsible}
                </span>
              </div>
              <span
                className={`dashboard-priority dashboard-priority--${process.priority.toLowerCase()}`}
              >
                {process.priority}
              </span>
            </div>
          ))}
        </ListCard>
      </div>

      <button onClick={() => navigate("/app/assistente")} className="dashboard-fab">
        <div className="dashboard-fab-icon-wrap">
          <MessageSquare size={14} className="dashboard-fab-icon" />
        </div>
        <span className="dashboard-fab-label">Assistente Jurídico</span>
      </button>
    </div>
  );
}

function KpiCard({ label, value, icon, iconVariant, sub, subIcon, subVariant, onClick }) {
  return (
    <div
      className={`kpi-card${onClick ? " kpi-card--clickable" : ""}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
            if (event.key === "Enter") onClick();
          }
          : undefined
      }
    >
      <div className={`kpi-card-badge ${iconVariant}`}>{icon}</div>
      <p className="kpi-card-value">{value}</p>
      <p className="kpi-card-label">{label}</p>
      <div className={`kpi-card-sub ${subVariant}`}>
        {subIcon}
        <span className="kpi-card-sub-text">{sub}</span>
      </div>
    </div>
  );
}

function ChartCard({ title, sub, children, info }) {
  return (
    <FlipCard title={title} sub={sub} info={info}>
      {children}
    </FlipCard>
  );
}

function ListCard({ title, sub, children, empty, info }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <FlipCard title={title} sub={sub} info={info}>
      <div className="dashboard-list">
        {items.filter(Boolean).length ? items : <p className="dashboard-empty">{empty}</p>}
      </div>
    </FlipCard>
  );
}

function FlipCard({ title, sub, info, children }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`dashboard-flip-card ${flipped ? "dashboard-flip-card--flipped" : ""}`}>
      <div className="dashboard-flip-card-inner">
        <div className="chart-card dashboard-flip-card-face dashboard-flip-card-front">
          <div className="chart-card-header">
            <div>
              <p className="chart-card-title">{title}</p>
              <p className="chart-card-subtitle">{sub}</p>
            </div>
            <InfoButton title={title} onClick={() => setFlipped(true)} />
          </div>
          {children}
        </div>
        <div className="chart-card dashboard-flip-card-face dashboard-flip-card-back">
          <p className="chart-card-title">Sobre este indicador</p>
          <h2 className="dashboard-flip-title">{title}</h2>
          <p className="dashboard-flip-description">{info}</p>
          <button type="button" className="dashboard-flip-return" onClick={() => setFlipped(false)}>
            <ArrowLeft size={14} />
            Voltar ao gráfico
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoButton({ title, onClick }) {
  return (
    <button
      type="button"
      className="dashboard-info-button"
      onClick={onClick}
      aria-label={`Entender ${title}`}
      title={`Entender ${title}`}
    >
      <Info size={14} />
    </button>
  );
}