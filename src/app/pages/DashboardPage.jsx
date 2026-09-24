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
// MOCK DATA
// Tudo abaixo simula o formato que a API deve devolver pronto para renderizar.
// O front não filtra, ordena, soma nem calcula nada: apenas exibe.
// Quando o backend estiver pronto, troque estes objetos por chamadas de API
// (ex.: useEffect + fetch, react-query, etc.), mantendo o mesmo formato.
// ---------------------------------------------------------------------------

const PRESETS = ["Hoje", "Esta semana", "Último mês", "Últimos 3 meses", "Último ano"];
const COLORS = ["#1D4ED8", "#3B82F6", "#0F766E", "#C9A96E", "#B45309"];

const MOCK_KPIS = {
  processosAtivos: { value: "3", sub: "+2 este mês" },
  solicitacoes: { value: "3", sub: "Pendentes hoje" },
  clientes: { value: "4", sub: "Cadastrados" },
  comAudiencia: { value: "3", sub: "Agendadas" },
};

// Já vem filtrada/agrupada por fase da carteira ativa, na ordem que deve ser exibida.
const MOCK_PHASE_DATA = [
  { fase: "Inicial", processos: 4 },
  { fase: "Emenda a inicial", processos: 3 },
  { fase: "Citação", processos: 2 },
  { fase: "Defesa", processos: 1 },
  { fase: "Saneamento", processos: 0 },
  { fase: "Julgamento", processos: 2 },
  { fase: "Sentença", processos: 3 },
  { fase: "Cumprimento de sentença", processos: 0 },
  { fase: "Penhora", processos: 0 },
  { fase: "Acordo", processos: 0 },
  { fase: "Suspenso", processos: 0 },
];

// Aberturas/encerramentos já agregados por mês para o período selecionado.
const MOCK_MONTHLY_DATA = [
  { mes: "mai", ativos: 1, encerrados: 0, suspensos: 4, novos: 1 },
  { mes: "jun", ativos: 2, encerrados: 1, suspensos: 3, novos: 3 },
  { mes: "jul", ativos: 2, encerrados: 1, suspensos: 2, novos: 2 },
  { mes: "ago", ativos: 2, encerrados: 1, suspensos: 1, novos: 3 },
];

const MOCK_ENCERRADOS_DATA = [
  { mes: "mai", acordo: 1, sem_resolucao: 0, penhora: 4, pagamento: 1 },
  { mes: "jun", acordo: 2, sem_resolucao: 1, penhora: 3, pagamento: 3 },
  { mes: "jul", acordo: 2, sem_resolucao: 1, penhora: 2, pagamento: 2 },
  { mes: "ago", acordo: 2, sem_resolucao: 1, penhora: 1, pagamento: 3 },
];


const MOCK_SUSPENSAS_DATA = [
  { mes: "mai", acordo_parcelado: 1, tratativas: 0, audencia_bens: 4, determinacao_judicial: 1 },
  { mes: "jun", acordo_parcelado: 2, tratativas: 1, audencia_bens: 3, determinacao_judicial: 3 },
  { mes: "jul", acordo_parcelado: 2, tratativas: 1, audencia_bens: 2, determinacao_judicial: 2 },
  { mes: "ago", acordo_parcelado: 2, tratativas: 1, audencia_bens: 1, determinacao_judicial: 3 },
];
// Funil de atendimento já calculado para o período selecionado.
const MOCK_REQUEST_FUNNEL = [
  { etapa: "Recebidas", total: 42 },
  { etapa: "Aceitas", total: 19 },
  { etapa: "Novos clientes", total: 14 },
  { etapa: "Processos", total: 11 },
];

// Já vem filtrada (apenas futuras), ordenada por data e limitada ao topo N.
const MOCK_UPCOMING_HEARINGS = [
  { id: 2, hearing: "27 ago", phase: "Citação", responsible: "Rafael Monteiro", priority: "Alta" },
  { id: 12, hearing: "29 ago", phase: "Citação", responsible: "Thauany Bezerra", priority: "Alta" },
  {
    id: 7,
    hearing: "31 ago",
    phase: "Julgamento",
    responsible: "Carolina Almeida",
    priority: "Alta",
  },
  {
    id: 4,
    hearing: "11 set",
    phase: "Saneamento",
    responsible: "Carolina Almeida",
    priority: "Média",
  },
  {
    id: 10,
    hearing: "18 set",
    phase: "Inicial",
    responsible: "Carolina Almeida",
    priority: "Alta",
  },
];

// Já vem filtrada (>= 15 dias parados), ordenada por dias parados e limitada ao topo N.
const MOCK_STALE_PROCESSES = [
  {
    id: 10,
    phase: "Inicial",
    value: "R$ 95.000",
    responsible: "Carolina Almeida",
    daysStopped: 30,
  },
  {
    id: 4,
    phase: "Saneamento",
    value: "R$ 320.000",
    responsible: "Carolina Almeida",
    daysStopped: 22,
  },
  {
    id: 7,
    phase: "Julgamento",
    value: "R$ 260.000",
    responsible: "Carolina Almeida",
    daysStopped: 20,
  },
  { id: 8, phase: "Citação", value: "R$ 75.000", responsible: "Rafael Monteiro", daysStopped: 16 },
];

const toHomePhase = (phase) => phase;
// Rotas de destino do drill-down: cada etapa do funil aponta para a tela que concentra aquele dado.
const FUNNEL_ROUTES = {
  Recebidas: "/app/solicitacoes?tab=todas",
  Aceitas: "/app/solicitacoes?tab=aceita",
  "Novos clientes": "/app/clientes",
  Processos: "/app?status=ativo",
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

  // Estado só de UI: qual período está selecionado. A troca de período deve
  // disparar uma nova busca no backend (não implementada aqui) — os dados
  // mockados acima não mudam com essa seleção.
  const [periodMode, setPeriodMode] = useState("preset");
  const [preset, setPreset] = useState("Últimos 3 meses");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedPeriod, setAppliedPeriod] = useState("Últimos 3 meses");
  const [showEmptyPhases, setShowEmptyPhases] = useState(false);

  const hasPhaseData = MOCK_PHASE_DATA.length > 0;
  const maxPhaseCount = Math.max(0, ...MOCK_PHASE_DATA.map((item) => item.processos));
  const displayedPhaseData = showEmptyPhases
    ? MOCK_PHASE_DATA
    : MOCK_PHASE_DATA.filter((item) => item.processos > 0);
  const phaseChartHeight = Math.max(180, displayedPhaseData.length * 34 + 44);

  const applyCustom = () => {
    if (dateFrom && dateTo)
      setAppliedPeriod(
        `${dateFrom.split("-").reverse().join("/")} - ${dateTo.split("-").reverse().join("/")}`,
      );
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
      <div className="dashboard-kpi-grid">
        <KpiCard
          label="Processos ativos"
          value={MOCK_KPIS.processosAtivos.value}
          icon={<Scale size={15} className="kpi-card-icon kpi-card-icon--blue" />}
          iconVariant="kpi-card-badge--blue"
          sub={MOCK_KPIS.processosAtivos.sub}
          subIcon={<TrendingUp size={10} />}
          subVariant="kpi-card-sub--success"
          onClick={() => navigate("/app?status=ativo")}
        />
        <KpiCard
          label="Solicitações"
          value={MOCK_KPIS.solicitacoes.value}
          icon={<Zap size={15} className="kpi-card-icon kpi-card-icon--amber" />}
          iconVariant="kpi-card-badge--amber"
          sub={MOCK_KPIS.solicitacoes.sub}
          subIcon={<ArrowUpRight size={10} />}
          subVariant="kpi-card-sub--amber"
          onClick={() => navigate("/app/solicitacoes?tab=pendente")}
        />
        <KpiCard
          label="Clientes"
          value={MOCK_KPIS.clientes.value}
          icon={<Users size={15} className="kpi-card-icon kpi-card-icon--green" />}
          iconVariant="kpi-card-badge--green"
          sub={MOCK_KPIS.clientes.sub}
          subIcon={<Users size={10} />}
          subVariant="kpi-card-sub--muted"
          onClick={() => navigate("/app/clientes")}
        />
        <KpiCard
          label="Com audiência"
          value={MOCK_KPIS.comAudiencia.value}
          icon={<Calendar size={15} className="kpi-card-icon kpi-card-icon--gold" />}
          iconVariant="kpi-card-badge--gold"
          sub={MOCK_KPIS.comAudiencia.sub}
          subIcon={<Calendar size={10} />}
          subVariant="kpi-card-sub--muted"
          onClick={() => navigate("/app?audiencia=com")}
        />
      </div>
     
      <ChartCard
        title="Processos por fase"
        sub="Distribuição atual da carteira ativa"
        info="Distribui os processos ativos entre as etapas processuais. É uma fotografia do momento atual, por isso não muda com o período selecionado acima. Uma concentração alta em uma fase pode indicar um gargalo que merece acompanhamento — a barra em destaque é a que tem mais processos parados. Clique em uma fase para ver a lista correspondente."
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
    <div className="dashboard-charts-grid dashboard-charts-grid--split">
  <ChartCard
    title="Processos encerrados"
    sub="Distribuição atual de carteira de processos encerrados"
    info="Faz a listagem de quantos processos foram encerrados em que ocasião específica."
  >
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={MOCK_ENCERRADOS_DATA} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
        <XAxis dataKey="mes" axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTip />} />
        <Legend iconType="circle" />
        <Bar dataKey="acordo" name="Acordo" fill="#e12a2a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="sem_resolucao" name="Sem resolução" fill="#b31f1f" radius={[4, 4, 0, 0]} />
        <Bar dataKey="penhora" name="Penhora Total" fill="#771515" radius={[4, 4, 0, 0]} />
        <Bar dataKey="pagamento" name="Pagamento voluntário" fill="#480f0f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>

  <ChartCard
    title="Processos suspensos"
    sub="Distribuição atual de carteira de processos suspensos"
    info="Faz a listagem de quantos processos foram suspensos em que ocasião específica."
  >
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={MOCK_SUSPENSAS_DATA} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
        <XAxis dataKey="mes" axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTip />} />
        <Legend iconType="circle" />
        <Bar dataKey="acordo_parcelado" name="Acordo Parcelado" fill="#d7d429" radius={[4, 4, 0, 0]} />
        <Bar dataKey="tratativas" name="Tratativas" fill="#aeb31f" radius={[4, 4, 0, 0]} />
        <Bar dataKey="audencia_bens" name="Ausência de Bens" fill="#776d15" radius={[4, 4, 0, 0]} />
        <Bar dataKey="determinacao_judicial" name="Determinação Judicial" fill="#48420f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
</div>
       <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <p className="dashboard-panel-title">Análise de desempenho</p>
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
      <div className="dashboard-charts-grid dashboard-charts-grid--split">
        <ChartCard
          title="Evolução da carteira"
          sub={`Aberturas e encerramentos por mês - ${appliedPeriod}`}
          info="Compara, mês a mês, os processos abertos com os processos encerrados. Quando as aberturas superam os encerramentos, a carteira tende a crescer; o inverso indica redução do estoque."
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_MONTHLY_DATA} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} />
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
        </ChartCard>
        <ChartCard
          title="Funil de atendimento"
          sub={`Solicitações até a abertura do processo - ${appliedPeriod}`}
          info="Mostra a passagem das solicitações recebidas, aceitas, transformadas em novos clientes e, por fim, em processos, estimada para o período selecionado. A diferença entre etapas revela onde há maior perda ou demora no atendimento. Clique em uma etapa para ver a lista correspondente."
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={MOCK_REQUEST_FUNNEL}
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
                {MOCK_REQUEST_FUNNEL.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="dashboard-charts-grid dashboard-charts-grid--split">
        <ListCard
          title="Agenda de risco"
          sub="Audiências futuras ordenadas por data"
          empty="Não há audiências futuras."
          info="Lista as próximas audiências dos processos ativos em ordem de data. A prioridade ajuda a destacar os casos que exigem preparação imediata. Clique em um item para ver a fase e a prioridade filtradas em Processos."
        >
          {MOCK_UPCOMING_HEARINGS.map((process) => (
            <div
              key={process.id}
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
        <ListCard
          title="Processos sem atualização"
          sub="Priorize os casos que ficaram parados"
          empty="Nenhum processo parado no momento."
          info="Exibe processos ativos sem atualização há pelo menos 15 dias. O número de dias indica há quanto tempo o caso não recebeu movimentação interna registrada. Clique em um item para ver a fase filtrada em Processos."
        >
          {MOCK_STALE_PROCESSES.map((process) => (
            <div
              key={process.id}
              className="dashboard-list-item dashboard-list-item--clickable"
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(`/app?fase=${encodeURIComponent(toHomePhase(process.phase))}`)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter")
                  navigate(`/app?fase=${encodeURIComponent(toHomePhase(process.phase))}`);
              }}
            >
              <div>
                <strong>
                  {process.phase} · {process.value}
                </strong>
                <span>{process.responsible}</span>
              </div>
              <span className="dashboard-stale-days">{process.daysStopped} dias</span>
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