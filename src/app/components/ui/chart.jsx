"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "./utils";
import "../../../styles/chart.css";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
  light: "",
  dark: ".dark"
};
const ChartContext = React.createContext(null);
function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return <ChartContext.Provider value={{
    config
  }}>
      <div data-slot="chart" data-chart={chartId} className={cn("chart-container", className)} {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>;
}
const ChartStyle = ({
  id,
  config
}) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color);
  if (!colorConfig.length) {
    return null;
  }
  return <style dangerouslySetInnerHTML={{
    __html: Object.entries(THEMES).map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
      const color = itemConfig.theme?.[theme] || itemConfig.color;
      return color ? `  --color-${key}: ${color};` : null;
    }).join("\n")}
}
`).join("\n")
  }} />;
};
const ChartTooltip = RechartsPrimitive.Tooltip;
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey
}) {
  const {
    config
  } = useChart();
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }
    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string" ? config[label]?.label || label : itemConfig?.label;
    if (labelFormatter) {
      return <div className={cn("chart-tooltip__label", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>;
    }
    if (!value) {
      return null;
    }
    return <div className={cn("chart-tooltip__label", labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
  if (!active || !payload?.length) {
    return null;
  }
  const nestLabel = payload.length === 1 && indicator !== "dot";
  return <div className={cn("chart-tooltip", className)}>
      {!nestLabel ? tooltipLabel : null}
      <div className="chart-tooltip__items">
        {payload.map((item, index) => {
        const key = `${nameKey || item.name || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const indicatorColor = color || item.payload.fill || item.color;
        return <div key={item.dataKey} className={cn("chart-tooltip__item", indicator === "dot" && "chart-tooltip__item--dot")}>
              {formatter && item?.value !== undefined && item.name ? formatter(item.value, item.name, item, index, item.payload) : <>
                  {itemConfig?.icon ? <itemConfig.icon /> : !hideIndicator && <div className={cn("chart-tooltip__indicator", {
              "chart-tooltip__indicator--dot": indicator === "dot",
              "chart-tooltip__indicator--line": indicator === "line",
              "chart-tooltip__indicator--dashed": indicator === "dashed",
              "chart-tooltip__indicator--nested-dashed": nestLabel && indicator === "dashed"
            })} style={{
              "--color-bg": indicatorColor,
              "--color-border": indicatorColor
            }} />}
                  <div className={cn("chart-tooltip__row", nestLabel ? "chart-tooltip__row--nest" : "chart-tooltip__row--center")}>
                    <div className="chart-tooltip__label-group">
                      {nestLabel ? tooltipLabel : null}
                      <span className="chart-tooltip__name">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && <span className="chart-tooltip__value">
                        {item.value.toLocaleString()}
                      </span>}
                  </div>
                </>}
            </div>;
      })}
      </div>
    </div>;
}
const ChartLegend = RechartsPrimitive.Legend;
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey
}) {
  const {
    config
  } = useChart();
  if (!payload?.length) {
    return null;
  }
  return <div className={cn("chart-legend", verticalAlign === "top" ? "chart-legend--top" : "chart-legend--bottom", className)}>
      {payload.map(item => {
      const key = `${nameKey || item.dataKey || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      return <div key={item.value} className="chart-legend__item">
            {itemConfig?.icon && !hideIcon ? <itemConfig.icon /> : <div className="chart-legend__color" style={{
          backgroundColor: item.color
        }} />}
            {itemConfig?.label}
          </div>;
    })}
    </div>;
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : undefined;
  let configLabelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };