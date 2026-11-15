import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { chartColors } from "../utils/chartColors";

const PALETTE_LISTS = {
  brand: [
    chartColors.brand.primary,
    chartColors.brand.accent,
    chartColors.brand.royal,
    chartColors.brand.secondary,
    "#3B82F6",
  ],
  semantic: [
    chartColors.semantic.active,
    chartColors.semantic.closed,
    chartColors.semantic.suspended,
    chartColors.semantic.new,
  ],
  closed: [
    chartColors.closedFamily.acordo,
    chartColors.closedFamily.semResolucao,
    chartColors.closedFamily.penhoraTotal,
    chartColors.closedFamily.pagamentoVoluntario,
    chartColors.closedFamily.outros,
  ],
  suspended: [
    chartColors.suspendedFamily.acordoParcelado,
    chartColors.suspendedFamily.tratativas,
    chartColors.suspendedFamily.ausenciaBens,
    chartColors.suspendedFamily.determinacaoJudicial,
    chartColors.suspendedFamily.outros,
  ],
  duration: chartColors.duration,
  phase: [chartColors.phase.default, chartColors.phase.highlight],
  channels: [
    chartColors.channels.instagram,
    chartColors.channels.site,
    chartColors.channels.indicacao,
  ],
};

const SEMANTIC_SERIES_COLORS = {
  ativos: chartColors.semantic.active,
  active: chartColors.semantic.active,
  encerrados: chartColors.semantic.closed,
  closed: chartColors.semantic.closed,
  suspensos: chartColors.semantic.suspended,
  suspended: chartColors.semantic.suspended,
  novos: chartColors.semantic.new,
  new: chartColors.semantic.new,
  primary: chartColors.brand.primary,
  accent: chartColors.brand.accent,
};

function resolveSeriesColor(serie, index, paletteName) {
  if (serie?.color) {
    const lower = String(serie.color).toLowerCase();
    if (SEMANTIC_SERIES_COLORS[lower]) return SEMANTIC_SERIES_COLORS[lower];
    if (String(serie.color).startsWith("#")) return serie.color;
  }
  const dkLower = String(serie?.data_key || "").toLowerCase();
  if (SEMANTIC_SERIES_COLORS[dkLower]) {
    return SEMANTIC_SERIES_COLORS[dkLower];
  }
  const list = PALETTE_LISTS[paletteName] || PALETTE_LISTS.brand;
  return list[index % list.length];
}

function resolveCategoryColor(entry, index, paletteName, maxVal, primaryKey) {
  if (entry?.fill && String(entry.fill).startsWith("#")) return entry.fill;
  if (entry?.color && String(entry.color).startsWith("#")) return entry.color;

  if (paletteName === "phase") {
    const val = Number(entry?.[primaryKey] || 0);
    return val === maxVal && maxVal > 0
      ? chartColors.phase.highlight
      : chartColors.phase.default;
  }

  const list = PALETTE_LISTS[paletteName] || PALETTE_LISTS.brand;
  return list[index % list.length];
}

function ChatChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const headerLabel = label || payload[0]?.name || "";
  return (
    <div className="ai-chart-tooltip">
      {headerLabel && <p className="ai-chart-tooltip__title">{headerLabel}</p>}
      {payload.map((item, idx) => (
        <p
          key={idx}
          className="ai-chart-tooltip__item"
          style={{ color: item.color || item.payload?.fill || chartColors.brand.primary }}
        >
          <span>{item.name}:</span> <strong>{item.value}</strong>
        </p>
      ))}
    </div>
  );
}

export function ChatChartCard({ chart }) {
  if (!chart || !Array.isArray(chart.data) || chart.data.length === 0) {
    return null;
  }

  const title = chart.title || "Indicadores da Dashboard";
  const subtitle = chart.subtitle || "";
  const chartType = chart.chart_type || "bar";
  const xKey = chart.x_key || "label";
  const palette = chart.palette || "brand";
  const data = chart.data;

  const series =
    Array.isArray(chart.series) && chart.series.length > 0
      ? chart.series
      : Object.keys(data[0] || {})
          .filter((k) => k !== xKey && typeof data[0][k] === "number")
          .map((k) => ({ data_key: k, name: k, color: null }));

  if (series.length === 0) {
    return null;
  }

  const primarySeries = series[0];
  const primaryKey = primarySeries.data_key;
  const maxVal = Math.max(
    0,
    ...data.map((d) => Number(d?.[primaryKey] || 0))
  );

  const horizontalHeight = Math.max(190, data.length * 34 + 44);

  return (
    <div className="ai-chart-card">
      <div className="ai-chart-card__header">
        <div className="ai-chart-card__title-wrap">
          <div className="ai-chart-card__icon">
            <BarChart3 size={15} />
          </div>
          <div>
            <p className="ai-chart-card__title">{title}</p>
            {subtitle && <p className="ai-chart-card__subtitle">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="ai-chart-card__body">
        {chartType === "horizontal_bar" && (
          <ResponsiveContainer width="100%" height={horizontalHeight} minWidth={0}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 32, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.ui.grid}
                horizontal={false}
              />
              <XAxis
                type="number"
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: chartColors.ui.axis }}
              />
              <YAxis
                dataKey={xKey}
                type="category"
                width={130}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: chartColors.ui.label }}
              />
              <Tooltip content={<ChatChartTooltip />} />
              <Bar
                dataKey={primaryKey}
                name={primarySeries.name}
                radius={[0, 4, 4, 0]}
              >
                <LabelList
                  dataKey={primaryKey}
                  position="right"
                  style={{
                    fill: chartColors.ui.label,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                {data.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={resolveCategoryColor(
                      entry,
                      idx,
                      palette === "brand" ? "phase" : palette,
                      maxVal,
                      primaryKey
                    )}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === "bar" && (
          <ResponsiveContainer width="100%" height={230} minWidth={0}>
            <BarChart
              data={data}
              margin={{ top: 18, right: 16, left: -18, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.ui.grid}
                vertical={false}
              />
              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fontSize: 10, fill: chartColors.ui.axis }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: chartColors.ui.axis }}
              />
              <Tooltip content={<ChatChartTooltip />} />
              {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />}
              {series.map((s, sIdx) => (
                <Bar
                  key={s.data_key}
                  dataKey={s.data_key}
                  name={s.name}
                  fill={resolveSeriesColor(s, sIdx, palette)}
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList
                    dataKey={s.data_key}
                    position="top"
                    style={{
                      fill: chartColors.ui.label,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                  {series.length === 1 &&
                    data.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={resolveCategoryColor(
                          entry,
                          idx,
                          palette,
                          maxVal,
                          primaryKey
                        )}
                      />
                    ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === "line" && (
          <ResponsiveContainer width="100%" height={230} minWidth={0}>
            <LineChart
              data={data}
              margin={{ top: 16, right: 18, left: -18, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.ui.grid}
                vertical={false}
              />
              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fontSize: 10, fill: chartColors.ui.axis }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: chartColors.ui.axis }}
              />
              <Tooltip content={<ChatChartTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              {series.map((s, sIdx) => (
                <Line
                  key={s.data_key}
                  type="monotone"
                  dataKey={s.data_key}
                  name={s.name}
                  stroke={resolveSeriesColor(s, sIdx, palette)}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === "pie" && (
          <ResponsiveContainer width="100%" height={235} minWidth={0}>
            <PieChart>
              <Tooltip content={<ChatChartTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Pie
                data={data}
                dataKey={primaryKey}
                nameKey={xKey}
                cx="50%"
                cy="48%"
                innerRadius={45}
                outerRadius={76}
                paddingAngle={2}
                label={({ value }) => (value > 0 ? value : "")}
              >
                {data.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={resolveCategoryColor(
                      entry,
                      idx,
                      palette === "brand" ? "semantic" : palette,
                      maxVal,
                      primaryKey
                    )}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
