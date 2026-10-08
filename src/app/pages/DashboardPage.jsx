import { useCallback, useEffect, useState } from "react";
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
  Loader2,
  Globe,
  Instagram,
} from "lucide-react";
import { toast } from "sonner";
import {
  buscarDadosGeraisDashboard,
  buscarDadosFiltradosDashboard,
} from "../services/dashboardService";
import { chartColors } from "../utils/chartColors";
import "../../styles/dashboard-page.css";

// ---------------------------------------------------------------------------
// CONSTANTES & CONFIGURAÇÕES
// ---------------------------------------------------------------------------

const PRESETS = ["Hoje", "Esta semana", "Mês atual", "Ano atual"];

const CHANNEL_ICONS = {
  Instagram: Instagram,
  Site: Globe,
  "Indicação": Users,
};

function ChannelAxisTick({ x, y, payload }) {
  const name = payload?.value;
  const Icon = CHANNEL_ICONS[name];

  return (
    <g transform={`translate(${x},${y + 4})`}>
      <foreignObject x={-45} y={0} width={90} height={26}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            color: "#6b7280",
            fontSize: "11px",
            fontWeight: 500,
            lineHeight: 1,
            height: "100%",
          }}
        >
          {Icon && <Icon size={13} color="#0F2357" strokeWidth={2} style={{ flexShrink: 0 }} />}
          <span>{name}</span>
        </div>
      </foreignObject>
    </g>
  );
}

// ---------------------------------------------------------------------------
// FUNÇÕES AUXILIARES DE DATAS E FORMATAÇÃO
// ---------------------------------------------------------------------------

function formatDateIso(date) {
  const d = new Date(date);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function getPresetDates(presetName) {
  const today = new Date();
  const dateTo = formatDateIso(today);

  switch (presetName) {
    case "Hoje": {
      return { dateFrom: dateTo, dateTo };
    }
    case "Esta semana": {
      const day = today.getDay();
      const diff = day === 0 ? 6 : day - 1; // Segunda-feira da semana atual
      const monday = new Date(today);
      monday.setDate(today.getDate() - diff);
      return { dateFrom: formatDateIso(monday), dateTo };
    }
    case "Mês atual": {
      // Padrão: início deste mês até o dia de hoje
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { dateFrom: formatDateIso(firstDay), dateTo };
    }
    case "Ano atual": {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      return { dateFrom: formatDateIso(firstDay), dateTo };
    }
    default: {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { dateFrom: formatDateIso(firstDay), dateTo };
    }
  }
}

function formatarDataHoraAudiencia(isoString) {
  if (!isoString) return "—";
  try {
    const [dataParte, horaParte] = isoString.split("T");
    if (!dataParte) return isoString;
    const [ano, mes, dia] = dataParte.split("-");
    const hora = horaParte ? horaParte.slice(0, 5) : "";
    return hora ? `${dia}/${mes}/${ano} às ${hora}` : `${dia}/${mes}/${ano}`;
  } catch {
    return isoString;
  }
}

function getPriorityClass(priority) {
  if (!priority) return "dashboard-priority--baixa";
  const p = priority.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (p.includes("alt")) return "dashboard-priority--alta";
  if (p.includes("med")) return "dashboard-priority--média";
  return "dashboard-priority--baixa";
}

const toHomePhase = (phase) => phase;

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const ChannelIcon = CHANNEL_ICONS[label];
  return (
    <div className="dashboard-tooltip">
      <p className="dashboard-tooltip-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {ChannelIcon && <ChannelIcon size={13} color="#0F2357" strokeWidth={2} style={{ flexShrink: 0 }} />}
        <span>{label}</span>
      </p>
      {payload.map((item, index) => (
        <p key={index} style={{ color: item.color ?? chartColors.brand.accent }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  // Estados de filtro de período (padrão: Mês atual)
  const [periodMode, setPeriodMode] = useState("preset");
  const [preset, setPreset] = useState("Mês atual");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedPeriod, setAppliedPeriod] = useState("Mês atual");
  const [activeDateRange, setActiveDateRange] = useState(() => getPresetDates("Mês atual"));
  const [showEmptyPhases, setShowEmptyPhases] = useState(false);

  // Estados de dados da API
  const [generalData, setGeneralData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [loadingFiltered, setLoadingFiltered] = useState(true);

  // Função para carregar apenas os dados filtrados (chamada ao trocar filtros)
  const carregarApenasFiltrados = useCallback(async (range) => {
    if (!range?.dateFrom || !range?.dateTo) return;

    try {
      setLoadingFiltered(true);
      const data = await buscarDadosFiltradosDashboard(range.dateFrom, range.dateTo);
      setFilteredData(data);
    } catch (error) {
      console.error("Erro ao carregar dados filtrados do dashboard:", error);
    } finally {
      setLoadingFiltered(false);
    }
  }, []);

  // Função para carregar toda a dashboard em sequência ordenada para evitar concorrência no backend
  const carregarDashboardInicial = useCallback(async (range) => {
    // 1. Carrega dados gerais (/dashboard)
    try {
      setLoadingGeneral(true);
      const dataGeral = await buscarDadosGeraisDashboard();
      setGeneralData(dataGeral);
    } catch (error) {
      console.error("Erro ao carregar dados gerais do dashboard:", error);
    } finally {
      setLoadingGeneral(false);
    }

    // 2. Carrega dados filtrados (/dashboard/filter) em sequência
    if (range?.dateFrom && range?.dateTo) {
      try {
        setLoadingFiltered(true);
        const dataFiltrada = await buscarDadosFiltradosDashboard(range.dateFrom, range.dateTo);
        setFilteredData(dataFiltrada);
      } catch (error) {
        console.error("Erro ao carregar dados filtrados do dashboard:", error);
      } finally {
        setLoadingFiltered(false);
      }
    }
  }, []);

  // Carga inicial na montagem do componente
  useEffect(() => {
    carregarDashboardInicial(activeDateRange);
  }, [carregarDashboardInicial]);

  // Ações de filtro pré-setado
  const selectPreset = (value) => {
    setPeriodMode("preset");
    setPreset(value);
    setAppliedPeriod(value);
    const range = getPresetDates(value);
    setActiveDateRange(range);
    carregarApenasFiltrados(range);
  };

  // Ação de filtro personalizado
  const applyCustom = () => {
    if (dateFrom && dateTo) {
      if (dateTo < dateFrom) {
        toast.error("A data final deve ser maior ou igual à data inicial.");
        return;
      }
      const todayIso = formatDateIso(new Date());
      if (dateFrom > todayIso || dateTo > todayIso) {
        toast.error("As datas não podem ser futuras.");
        return;
      }
      const formattedFrom = dateFrom.split("-").reverse().join("/");
      const formattedTo = dateTo.split("-").reverse().join("/");
      setAppliedPeriod(`${formattedFrom} - ${formattedTo}`);
      const range = { dateFrom, dateTo };
      setActiveDateRange(range);
      carregarApenasFiltrados(range);
    }
  };

  const clearCustom = () => {
    setPeriodMode("preset");
    setPreset("Mês atual");
    setDateFrom("");
    setDateTo("");
    setAppliedPeriod("Mês atual");
    const range = getPresetDates("Mês atual");
    setActiveDateRange(range);
    carregarApenasFiltrados(range);
  };

  // ---------------------------------------------------------------------------
  // MAPEAMENTO DOS CAMPOS ESPECÍFICOS PARA CADA GRÁFICO / KPI
  // ---------------------------------------------------------------------------

  // KPIs (GET /dashboard)
  const kpis = {
    processosAtivos: {
      value: generalData?.processoAtivos != null ? String(generalData.processoAtivos) : "0",
      sub: "carteira ativa",
    },
    solicitacoes: {
      value: generalData?.solicitacoesPendentes != null ? String(generalData.solicitacoesPendentes) : "0",
      sub: "pendentes",
    },
    clientes: {
      value: generalData?.clientesExistentes != null ? String(generalData.clientesExistentes) : "0",
      sub: "cadastrados",
    },
    comAudiencia: {
      value: generalData?.processosComAudiencia != null ? String(generalData.processosComAudiencia) : "0",
      sub: "agendadas",
    },
  };

  // 1. Processos por fase (GET /dashboard -> processosPorFase: [{ nomeFase, qtdProcessos }])
  const phaseData = (generalData?.processosPorFase || []).map((item) => ({
    fase: item.nomeFase || "Não informada",
    processos: item.qtdProcessos ?? 0,
  }));
  const hasPhaseData = phaseData.length > 0 && phaseData.some((item) => item.processos > 0);
  const maxPhaseCount = hasPhaseData ? Math.max(0, ...phaseData.map((item) => item.processos)) : 0;
  const displayedPhaseData = showEmptyPhases
    ? phaseData
    : phaseData.filter((item) => item.processos > 0);
  const phaseChartHeight = Math.max(180, displayedPhaseData.length * 34 + 44);

  // 2. Processos encerrados (GET /dashboard/filter -> processosEncerrados: { encerradosPorAcordo, ... })
  const encerrados = filteredData?.processosEncerrados;
  const currentEncerradosData = [
    { categoria: "Acordo", total: encerrados?.encerradosPorAcordo ?? 0, fill: chartColors.closedFamily.acordo },
    { categoria: "Sem resolução", total: encerrados?.encerradosPorSemResolucao ?? 0, fill: chartColors.closedFamily.semResolucao },
    { categoria: "Penhora Total", total: encerrados?.encerradosPorPenhoraTotal ?? 0, fill: chartColors.closedFamily.penhoraTotal },
    { categoria: "Pagamento voluntário", total: encerrados?.encerradosPorPagamentoVoluntario ?? 0, fill: chartColors.closedFamily.pagamentoVoluntario },
    { categoria: "Outros", total: encerrados?.encerradosPorOutros ?? 0, fill: chartColors.closedFamily.outros },
  ];
  const hasEncerradosData = currentEncerradosData.some((item) => item.total > 0);

  // 3. Processos suspensos (GET /dashboard/filter -> processosSuspensos: { suspensosPorAcordoParcelado, ... })
  const suspensos = filteredData?.processosSuspensos;
  const currentSuspensasData = [
    { categoria: "Acordo Parcelado", total: suspensos?.suspensosPorAcordoParcelado ?? 0, fill: chartColors.suspendedFamily.acordoParcelado },
    { categoria: "Tratativas", total: suspensos?.suspensosPorTratativas ?? 0, fill: chartColors.suspendedFamily.tratativas },
    { categoria: "Ausência de Bens", total: suspensos?.suspensosPorAusenciaDeBens ?? 0, fill: chartColors.suspendedFamily.ausenciaBens },
    { categoria: "Determinação Judicial", total: suspensos?.suspensosPorDeterminacaoJudicial ?? 0, fill: chartColors.suspendedFamily.determinacaoJudicial },
    { categoria: "Outros", total: suspensos?.suspensosPorOutros ?? 0, fill: chartColors.suspendedFamily.outros },
  ];
  const hasSuspensasData = currentSuspensasData.some((item) => item.total > 0);

  // 4. Forma de entrada (GET /dashboard/filter -> formasDeEntrada: { instagram, site, indicacao } ou /dashboard)
  const formas = filteredData?.formasDeEntrada ?? generalData?.formasDeEntrada;
  const currentFormaEntradaData = [
    { origem: "Instagram", clientes: formas?.instagram ?? 0, fill: chartColors.channels.instagram },
    { origem: "Site", clientes: formas?.site ?? 0, fill: chartColors.channels.site },
    { origem: "Indicação", clientes: formas?.indicacao ?? 0, fill: chartColors.channels.indicacao },
  ];
  const hasFormaEntradaData = currentFormaEntradaData.some((item) => item.clientes > 0);

  // 5. Tempo de duração (GET /dashboard -> tempoDuracaoProcessos: { ate6Meses, de6a12Meses, ... })
  const duracao = generalData?.tempoDuracaoProcessos;
  const currentTempoDuracaoData = [
    { faixa: "0–6 meses", processos: duracao?.ate6Meses ?? 0, fill: chartColors.duration[0] },
    { faixa: "6–12 meses", processos: duracao?.de6a12Meses ?? 0, fill: chartColors.duration[1] },
    { faixa: "1–2 anos", processos: duracao?.de1a2Anos ?? 0, fill: chartColors.duration[2] },
    { faixa: "2–5 anos", processos: duracao?.de2a5Anos ?? 0, fill: chartColors.duration[3] },
    { faixa: "+5 anos", processos: duracao?.mais5Anos ?? 0, fill: chartColors.duration[4] },
  ];
  const hasTempoDuracaoData = currentTempoDuracaoData.some((item) => item.processos > 0);

  // 6. Evolução da carteira (GET /dashboard/filter -> evolucaoCarteira: { ativos, encerrados, suspensos, novos })
  const evolucao = filteredData?.evolucaoCarteira;
  const currentMonthlyData = evolucao
    ? [
      {
        mes: appliedPeriod,
        ativos: evolucao.ativos ?? 0,
        encerrados: evolucao.encerrados ?? 0,
        suspensos: evolucao.suspensos ?? 0,
        novos: evolucao.novos ?? 0,
      },
    ]
    : [];
  const hasMonthlyData =
    currentMonthlyData.length > 0 &&
    currentMonthlyData.some(
      (item) => item.ativos > 0 || item.encerrados > 0 || item.suspensos > 0 || item.novos > 0
    );

  // 7. Funil de atendimento (GET /dashboard/filter -> funilAtendimento: { recebidas, aceitas })
  const funil = filteredData?.funilAtendimento;
  const funilRecebidas = funil?.recebidas ?? 0;
  const funilAceitas = funil?.aceitas ?? 0;
  const hasRequestFunnelData = funilRecebidas > 0 || funilAceitas > 0;

  // 8. Agenda de risco (GET /dashboard -> audiencias: [{ idProcesso, dataAudiencia, nomeFaseProcesso, ... }])
  const upcomingHearings = (generalData?.audiencias || []).map((item) => ({
    id: item.idProcesso,
    hearing: item.dataAudiencia,
    hearingFormatted: formatarDataHoraAudiencia(item.dataAudiencia),
    phase: item.nomeFaseProcesso || "—",
    responsible: item.nomeUsuarioResponsavel || item.emailUsuarioResponsavel || "—",
    client: item.nomeCliente || "",
    priority: item.nomePrioridade || "Média",
  }));

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
          value={kpis.processosAtivos.value}
          icon={<Scale size={15} className="kpi-card-icon kpi-card-icon--blue" />}
          iconVariant="kpi-card-badge--blue"
          sub={kpis.processosAtivos.sub}
          subIcon={<TrendingUp size={10} />}
          subVariant="kpi-card-sub--success"
          onClick={() => navigate("/app?status=ativo")}
        />
        <KpiCard
          label="Solicitações"
          value={kpis.solicitacoes.value}
          icon={<Zap size={15} className="kpi-card-icon kpi-card-icon--amber" />}
          iconVariant="kpi-card-badge--amber"
          sub={kpis.solicitacoes.sub}
          subIcon={<ArrowUpRight size={10} />}
          subVariant="kpi-card-sub--amber"
          onClick={() => navigate("/app/solicitacoes?tab=pendente")}
        />
        <KpiCard
          label="Clientes"
          value={kpis.clientes.value}
          icon={<Users size={15} className="kpi-card-icon kpi-card-icon--green" />}
          iconVariant="kpi-card-badge--green"
          sub={kpis.clientes.sub}
          subIcon={<Users size={10} />}
          subVariant="kpi-card-sub--muted"
          onClick={() => navigate("/app/clientes")}
        />
        <KpiCard
          label="Com audiência"
          value={kpis.comAudiencia.value}
          icon={<Calendar size={15} className="kpi-card-icon kpi-card-icon--gold" />}
          iconVariant="kpi-card-badge--gold"
          sub={kpis.comAudiencia.sub}
          subIcon={<Calendar size={10} />}
          subVariant="kpi-card-sub--muted"
          onClick={() => navigate("/app?audiencia=com")}
        />
      </div>

      {/* PROCESSOS POR FASE (Total do sistema) */}
      <ChartCard
        title="Processos por fase"
        sub="Distribuição atual da carteira ativa (Total do sistema)"
        info="Distribui os processos ativos entre as etapas processuais. É uma fotografia do momento atual do sistema."
      >
        {phaseData.length > 0 && (
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
        )}
        {displayedPhaseData.length > 0 ? (
          <ResponsiveContainer width="100%" height={phaseChartHeight} minWidth={0} minHeight={180}>
            <BarChart
              data={displayedPhaseData}
              layout="vertical"
              margin={{ top: 8, right: 28, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.ui.grid} horizontal={false} />
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
                  style={{ fill: chartColors.ui.label, fontSize: 11, fontWeight: 700 }}
                />
                {displayedPhaseData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.processos === maxPhaseCount && maxPhaseCount > 0 ? chartColors.phase.highlight : chartColors.phase.default}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="dashboard-chart-empty-state">
            <p className="dashboard-empty">
              {loadingGeneral
                ? "Carregando dados..."
                : showEmptyPhases
                  ? "Não existem registros destes dados no momento."
                  : "Nenhum processo ativo no momento. Clique em 'Mostrar fases sem processos' para visualizar as etapas."}
            </p>
          </div>
        )}
      </ChartCard>

      {/* AGENDA DE RISCO */}
      <div className="dashboard-charts-grid dashboard-charts-grid--split">
        <ListCard
          title="Agenda de risco"
          sub="Audiências futuras ordenadas por data"
          empty={loadingGeneral ? "Carregando audiências..." : "Não existem registros destes dados no momento."}
          info="Lista as próximas audiências dos processos ativos em ordem de data."
        >
          {upcomingHearings.map((process, index) => (
            <div
              key={process.id ?? index}
              className="dashboard-list-item dashboard-list-item--clickable"
              role="button"
              tabIndex={0}
              onClick={() => {
                if (process.id) {
                  navigate(`/app/processos/${process.id}`);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && process.id) {
                  navigate(`/app/processos/${process.id}`);
                }
              }}
              title={process.id ? `Abrir processo #${process.id}` : "Abrir processo"}
            >
              <div>
                <strong>{process.hearingFormatted || process.hearing}</strong>
                <span>
                  {process.phase} · {process.responsible}
                  {process.client ? ` · ${process.client}` : ""}
                </span>
              </div>
              <span
                className={`dashboard-priority ${getPriorityClass(process.priority)}`}
              >
                {process.priority}
              </span>
            </div>
          ))}
        </ListCard>
        <ChartCard
          title="Tempo de duração"
          sub="Processos ativos por tempo de tramitação"
          info="Distribui os processos ativos de acordo com a sua duração total em tramitação."
        >
          {hasTempoDuracaoData ? (
            <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={220}>
              <BarChart data={currentTempoDuracaoData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.ui.grid} vertical={false} />
                <XAxis dataKey="faixa" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="processos" name="Processos" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="processos" position="top" style={{ fill: chartColors.ui.label, fontSize: 11, fontWeight: 700 }} />
                  {currentTempoDuracaoData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill ?? chartColors.duration[index % chartColors.duration.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-chart-empty-state">
              <p className="dashboard-empty">
                {loadingGeneral
                  ? "Carregando dados..."
                  : "Não existem registros destes dados no momento."}
              </p>
            </div>
          )}
        </ChartCard>

      </div>

      {/* PAINEL DE FILTRO DE PERÍODO (No topo) */}
      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <p className="dashboard-panel-title">Filtro por período</p>
          <span className="dashboard-period-badge">
            {loadingFiltered ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <CalendarRange size={11} />
            )}
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
                  max={formatDateIso(new Date())}
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
                  max={formatDateIso(new Date())}
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
                  onClick={clearCustom}
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
      {/* PROCESSOS ENCERRADOS & SUSPENSOS */}
      <div className="dashboard-charts-grid dashboard-charts-grid--split">
        <ChartCard
          title="Processos encerrados"
          sub={`Total por categoria - ${appliedPeriod}`}
          info="Exibe o total de processos encerrados por motivo/ocasião específica no período selecionado."
        >
          {hasEncerradosData ? (
            <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={220}>
              <BarChart data={currentEncerradosData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.ui.grid} vertical={false} />
                <XAxis dataKey="categoria" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="total" name="Processos" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="total" position="top" style={{ fill: chartColors.ui.label, fontSize: 11, fontWeight: 700 }} />
                  {currentEncerradosData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-chart-empty-state">
              <p className="dashboard-empty">
                {loadingFiltered
                  ? "Carregando dados..."
                  : "Não existem registros destes dados no período selecionado."}
              </p>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Processos suspensos"
          sub={`Total por categoria - ${appliedPeriod}`}
          info="Exibe o total de processos suspensos por motivo/ocasião específica no período selecionado."
        >
          {hasSuspensasData ? (
            <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={220}>
              <BarChart data={currentSuspensasData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.ui.grid} vertical={false} />
                <XAxis dataKey="categoria" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 9 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="total" name="Processos" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="total" position="top" style={{ fill: chartColors.ui.label, fontSize: 11, fontWeight: 700 }} />
                  {currentSuspensasData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-chart-empty-state">
              <p className="dashboard-empty">
                {loadingFiltered
                  ? "Carregando dados..."
                  : "Não existem registros destes dados no período selecionado."}
              </p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* FORMA DE ENTRADA & FUNIL DE ATENDIMENTO*/}
      <div className="dashboard-charts-grid dashboard-charts-grid--split">
        <ChartCard
          title="Forma de entrada"
          sub={`Total de clientes por canal - ${appliedPeriod}`}
          info="Mede o total de clientes que entraram no escritório por cada canal específico (Instagram, Site ou Indicação) no período selecionado."
        >
          {hasFormaEntradaData ? (
            <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={220}>
              <BarChart data={currentFormaEntradaData} margin={{ top: 16, right: 16, left: -20, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.ui.grid} vertical={false} />
                <XAxis
                  dataKey="origem"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={<ChannelAxisTick />}
                />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="clientes" name="Clientes" fill={chartColors.brand.accent} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="clientes" position="top" style={{ fill: chartColors.ui.label, fontSize: 11, fontWeight: 700 }} />
                  {currentFormaEntradaData.map((entry, index) => (
                    <Cell key={index} fill={chartColors.brand.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-chart-empty-state">
              <p className="dashboard-empty">
                {loadingFiltered || loadingGeneral
                  ? "Carregando dados..."
                  : "Não existem registros destes dados no período selecionado."}
              </p>
            </div>
          )}
        </ChartCard>

        {/* FUNIL DE ATENDIMENTO */}
        <ChartCard
          title="Funil de atendimento"
          sub={`Solicitações até a abertura do processo - ${appliedPeriod}`}
          info="Mostra a passagem das solicitações recebidas até serem aceitas no período selecionado."
        >
          {hasRequestFunnelData ? (
            <div className="dashboard-funnel-metric-box">
              <div
                className="dashboard-funnel-ratio dashboard-funnel-ratio--clickable"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/app/solicitacoes?tab=aceita")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate("/app/solicitacoes?tab=aceita");
                }}
                title="Clique para ver solicitações aceitas"
              >
                <span className="dashboard-funnel-accepted">{funilAceitas}</span>
                <span className="dashboard-funnel-divider">/</span>
                <span className="dashboard-funnel-total">{funilRecebidas}</span>
              </div>
              <p className="dashboard-funnel-description">
                <button
                  type="button"
                  className="dashboard-funnel-link"
                  onClick={() => navigate("/app/solicitacoes?tab=aceita")}
                >
                  {funilAceitas} {funilAceitas === 1 ? "aceita" : "aceitas"}
                </button>
                {" de "}
                <button
                  type="button"
                  className="dashboard-funnel-link"
                  onClick={() => navigate("/app/solicitacoes?tab=todas")}
                >
                  {funilRecebidas} {funilRecebidas === 1 ? "recebida" : "recebidas"}
                </button>
              </p>
              <div className="dashboard-funnel-progress-track">
                <div
                  className="dashboard-funnel-progress-bar"
                  style={{
                    width: `${funilRecebidas > 0 ? Math.min(100, Math.round((funilAceitas / funilRecebidas) * 100)) : 0}%`,
                  }}
                />
              </div>
              <span className="dashboard-funnel-percent">
                {funilRecebidas > 0 ? Math.round((funilAceitas / funilRecebidas) * 100) : 0}% de conversão
              </span>
            </div>
          ) : (
            <div className="dashboard-chart-empty-state">
              <p className="dashboard-empty">
                {loadingFiltered
                  ? "Carregando dados..."
                  : "Não existem registros destes dados no período selecionado."}
              </p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* EVOLUÇÃO DA CARTEIRA */}
      <div className="dashboard-charts-grid">
        <ChartCard
          title="Evolução da carteira"
          sub={`Aberturas e encerramentos - ${appliedPeriod}`}
          info="Compara os processos abertos com os processos encerrados e suspensos no período selecionado."
        >
          {hasMonthlyData ? (
            <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={220}>
              {currentMonthlyData.length > 1 ? (
                <LineChart data={currentMonthlyData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.ui.grid} vertical={false} />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTip />} />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="ativos" name="Ativos" stroke={chartColors.semantic.active} strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="encerrados" name="Encerrados" stroke={chartColors.semantic.closed} strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="suspensos" name="Suspensos" stroke={chartColors.semantic.suspended} strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="novos" name="Novos" stroke={chartColors.semantic.new} strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={currentMonthlyData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.ui.grid} vertical={false} />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTip />} />
                  <Legend iconType="circle" />
                  <Bar dataKey="ativos" name="Ativos" fill={chartColors.semantic.active} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="ativos" position="top" style={{ fill: chartColors.ui.label, fontSize: 11, fontWeight: 700 }} />
                  </Bar>
                  <Bar dataKey="encerrados" name="Encerrados" fill={chartColors.semantic.closed} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="encerrados" position="top" style={{ fill: chartColors.ui.label, fontSize: 11, fontWeight: 700 }} />
                  </Bar>
                  <Bar dataKey="suspensos" name="Suspensos" fill={chartColors.semantic.suspended} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="suspensos" position="top" style={{ fill: chartColors.ui.label, fontSize: 11, fontWeight: 700 }} />
                  </Bar>
                  <Bar dataKey="novos" name="Novos" fill={chartColors.semantic.new} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="novos" position="top" style={{ fill: chartColors.ui.label, fontSize: 11, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-chart-empty-state">
              <p className="dashboard-empty">
                {loadingFiltered
                  ? "Carregando dados..."
                  : "Não existem registros destes dados no período selecionado."}
              </p>
            </div>
          )}
        </ChartCard>
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