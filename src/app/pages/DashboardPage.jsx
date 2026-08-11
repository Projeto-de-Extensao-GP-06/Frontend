import { useState } from "react";
import { useNavigate } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Scale, MessageSquare, TrendingUp, ArrowUpRight, Zap, Users, Calendar, CalendarRange, X } from "lucide-react";
import { mockProcesses, mockRequests, mockClients } from "../data/mockData";
import "../../styles/dashboard-page.css";

/* ── Static chart data ── */
const phaseData = [{
  fase: "Inicial",
  total: 2
}, {
  fase: "Citação",
  total: 5
}, {
  fase: "Saneamento",
  total: 3
}, {
  fase: "Sentença",
  total: 7
}, {
  fase: "Cumpr.",
  total: 3
}, {
  fase: "Penhora",
  total: 1
}];
const closureData = [{
  tipo: "Penhora",
  total: 3
}, {
  tipo: "Acordo",
  total: 8
}, {
  tipo: "Extinção",
  total: 2
}];
const accordData = [{
  tipo: "Trabalhista",
  taxa: 65
}, {
  tipo: "Civil",
  taxa: 80
}, {
  tipo: "Imobiliário",
  taxa: 45
}, {
  tipo: "Empresarial",
  taxa: 70
}];
const PRESETS = ["Hoje", "Esta semana", "Último mês", "Últimos 3 meses", "Último ano"];
const fmt = d => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

/* ── Custom tooltip ── */
function CustomTip({
  active,
  payload,
  label
}) {
  if (!active || !payload?.length) return null;
  return <div className="dashboard-tooltip">
      <p className="dashboard-tooltip-title">{label}</p>
      {payload.map((p, i) => <p key={i} style={{
      color: p.color ?? "#C9A96E"
    }}>
          {p.name}: {p.value}{p.unit ?? ""}
        </p>)}
    </div>;
}
export default function DashboardPage() {
  const [periodMode, setPeriodMode] = useState("preset");
  const [preset, setPreset] = useState("Último mês");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedPeriod, setAppliedPeriod] = useState("Último mês");
  const navigate = useNavigate();
  const selectPreset = p => {
    setPeriodMode("preset");
    setPreset(p);
    setAppliedPeriod(p);
  };
  const applyCustom = () => {
    if (!dateFrom || !dateTo) return;
    setAppliedPeriod(`${fmt(dateFrom)} – ${fmt(dateTo)}`);
  };
  const activeCount = mockProcesses.filter(p => p.status === "ativo").length;
  const pendingCount = mockRequests.filter(r => r.status === "pendente").length;
  const clientCount = mockClients.length;
  const hearingCount = mockProcesses.filter(p => p.hearingDate !== "—").length;
  return <div className="dashboard-page">
      {/* ── Header ── */}
      <div className="page-header">
        <p className="page-kicker">
          SGPJ
        </p>
        <h1 className="page-title">
          Dashboard
        </h1>
      </div>

      {/* ── KPI cards ── */}
      <div className="dashboard-kpi-grid">
        <KpiCard label="Processos ativos" value={activeCount} icon={<Scale size={15} className="kpi-card-icon kpi-card-icon--blue" />} iconVariant="kpi-card-badge--blue" sub="+2 este mês" subIcon={<TrendingUp size={10} />} subVariant="kpi-card-sub--success" />
        <KpiCard label="Solicitações" value={pendingCount} icon={<Zap size={15} className="kpi-card-icon kpi-card-icon--amber" />} iconVariant="kpi-card-badge--amber" sub="Pendentes hoje" subIcon={<ArrowUpRight size={10} />} subVariant="kpi-card-sub--amber" />
        <KpiCard label="Clientes" value={clientCount} icon={<Users size={15} className="kpi-card-icon kpi-card-icon--green" />} iconVariant="kpi-card-badge--green" sub="Cadastrados" subIcon={<Users size={10} />} subVariant="kpi-card-sub--muted" />
        <KpiCard label="Com audiência" value={hearingCount} icon={<Calendar size={15} className="kpi-card-icon kpi-card-icon--gold" />} iconVariant="kpi-card-badge--gold" sub="Agendadas" subIcon={<Calendar size={10} />} subVariant="kpi-card-sub--muted" />
      </div>

      {/* ── Period filter panel ── */}
      <div className="dashboard-panel">
        {/* Header row */}
        <div className="dashboard-panel-header">
          <p className="dashboard-panel-title">Análise de desempenho</p>
          <span className="dashboard-period-badge">
            <CalendarRange size={11} />
            {appliedPeriod}
          </span>
        </div>

        <div className="dashboard-divider" />

        {/* Preset chips */}
        <div className="dashboard-preset-row">
          {PRESETS.map(p => <button key={p} onClick={() => selectPreset(p)} className={`dashboard-preset-btn ${periodMode === "preset" && preset === p ? "dashboard-preset-btn--active" : ""}`}>
              {p}
            </button>)}
          <button onClick={() => setPeriodMode("custom")} className={`dashboard-preset-btn dashboard-preset-btn--custom ${periodMode === "custom" ? "dashboard-preset-btn--active" : ""}`}>
            <Calendar size={11} />
            Personalizado
          </button>
        </div>

        {/* Custom date inputs — shown when "Personalizado" is active */}
        {periodMode === "custom" && <div className="dashboard-custom-period">
            <div className="dashboard-custom-divider" />
            <div className="dashboard-custom-grid">
              <div className="dashboard-field">
                <label className="dashboard-label">
                  Data inicial
                </label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="dashboard-input" />
              </div>
              <div className="dashboard-field">
                <label className="dashboard-label">
                  Data final
                </label>
                <input type="date" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)} className="dashboard-input" />
              </div>
              <div className="dashboard-actions">
                <button onClick={applyCustom} disabled={!dateFrom || !dateTo} className="dashboard-primary-button">
                  Aplicar
                </button>
                <button onClick={() => {
              setPeriodMode("preset");
              setDateFrom("");
              setDateTo("");
            }} className="dashboard-icon-button" title="Limpar">
                  <X size={13} />
                </button>
              </div>
            </div>
          </div>}
      </div>

      {/* ── Charts: two side-by-side on desktop ── */}
      <div className="dashboard-charts-grid dashboard-charts-grid--split">
        <ChartCard title="Processos por fase" sub={`Distribuição — ${appliedPeriod}`}>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={phaseData} margin={{
            top: 0,
            right: 0,
            left: -28,
            bottom: 0
          }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
              <XAxis dataKey="fase" tick={{
              fontSize: 10,
              fill: "#6B7280",
              fontFamily: "'DM Sans', sans-serif"
            }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{
              fontSize: 10,
              fill: "#9CA3AF"
            }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTip />} cursor={{
              fill: "#F4F6FA",
              radius: 6
            }} />
              <Bar dataKey="total" name="Processos" radius={[5, 5, 0, 0]} maxBarSize={32}>
                {phaseData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? "#1D4ED8" : "#3B82F6"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Encerramentos por tipo" sub={`Processos encerrados — ${appliedPeriod}`}>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={closureData} margin={{
            top: 0,
            right: 0,
            left: -28,
            bottom: 0
          }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
              <XAxis dataKey="tipo" tick={{
              fontSize: 10,
              fill: "#6B7280",
              fontFamily: "'DM Sans', sans-serif"
            }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{
              fontSize: 10,
              fill: "#9CA3AF"
            }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTip />} cursor={{
              fill: "#F4F6FA",
              radius: 6
            }} />
              <Bar dataKey="total" name="Encerramentos" fill="#C9A96E" radius={[5, 5, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Chart 3: Taxa de acordos ── */}
      <ChartCard title="Taxa de acordos por tipo de processo" sub={`Comparativo entre tipologias (%) — ${appliedPeriod}`}>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={accordData} margin={{
          top: 0,
          right: 0,
          left: -28,
          bottom: 0
        }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
            <XAxis dataKey="tipo" tick={{
            fontSize: 10,
            fill: "#6B7280",
            fontFamily: "'DM Sans', sans-serif"
          }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} unit="%" tick={{
            fontSize: 10,
            fill: "#9CA3AF"
          }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTip />} cursor={{
            fill: "#F4F6FA",
            radius: 6
          }} />
            <Bar dataKey="taxa" name="Taxa" fill="#0F2357" radius={[5, 5, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Floating AI button ── */}
      <button onClick={() => navigate("/app/assistente")} className="dashboard-fab">
        <div className="dashboard-fab-icon-wrap">
          <MessageSquare size={14} className="dashboard-fab-icon" />
        </div>
        <span className="dashboard-fab-label">Assistente Jurídico</span>
      </button>
    </div>;
}

/* ── Sub-components ── */

function KpiCard({
  label,
  value,
  icon,
  iconVariant,
  sub,
  subIcon,
  subVariant
}) {
  return <div className="kpi-card">
      <div className={`kpi-card-badge ${iconVariant}`}>
        {icon}
      </div>
      <p className="kpi-card-value">
        {value}
      </p>
      <p className="kpi-card-label">{label}</p>
      <div className={`kpi-card-sub ${subVariant}`}>
        {subIcon}
        <span className="kpi-card-sub-text">{sub}</span>
      </div>
    </div>;
}
function ChartCard({
  title,
  sub,
  children
}) {
  return <div className="chart-card">
      <div className="chart-card-header">
        <p className="chart-card-title">{title}</p>
        <p className="chart-card-subtitle">{sub}</p>
      </div>
      {children}
    </div>;
}