import { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  CalendarRange,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { toast } from "sonner";

const PRESETS = ["Hoje", "Esta semana", "Mês atual", "Ano atual"];

export function formatDateIso(date) {
  const d = new Date(date);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function getPresetDates(presetName) {
  const today = new Date();
  const dateTo = formatDateIso(today);

  switch (presetName) {
    case "Hoje": {
      return { dateFrom: dateTo, dateTo };
    }
    case "Esta semana": {
      const day = today.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diff);
      return { dateFrom: formatDateIso(monday), dateTo };
    }
    case "Mês atual": {
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

export function formatDateBr(isoDate) {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function SelectDashboardModal({
  open,
  onOpenChange,
  currentSelection,
  onSelect,
}) {
  const [periodMode, setPeriodMode] = useState("preset");
  const [preset, setPreset] = useState("Mês atual");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!open) return;
    if (currentSelection) {
      setPeriodMode(currentSelection.periodMode || "preset");
      setPreset(currentSelection.preset || "Mês atual");
      if (currentSelection.periodMode === "custom") {
        setDateFrom(currentSelection.dateFrom || "");
        setDateTo(currentSelection.dateTo || "");
      } else {
        setDateFrom("");
        setDateTo("");
      }
    } else {
      setPeriodMode("preset");
      setPreset("Mês atual");
      setDateFrom("");
      setDateTo("");
    }
  }, [open, currentSelection]);

  const activeRange =
    periodMode === "preset"
      ? getPresetDates(preset)
      : { dateFrom, dateTo };

  const activeLabel =
    periodMode === "preset"
      ? preset
      : dateFrom && dateTo
      ? `${formatDateBr(dateFrom)} - ${formatDateBr(dateTo)}`
      : "Personalizado";

  const isConfirmDisabled =
    periodMode === "custom" && (!dateFrom || !dateTo);

  const handleConfirm = () => {
    if (periodMode === "custom") {
      if (!dateFrom || !dateTo) {
        toast.error("Selecione a data inicial e a data final.");
        return;
      }
      if (dateTo < dateFrom) {
        toast.error("A data final deve ser maior ou igual à data inicial.");
        return;
      }
      const todayIso = formatDateIso(new Date());
      if (dateFrom > todayIso || dateTo > todayIso) {
        toast.error("As datas não podem ser futuras.");
        return;
      }
      const formattedFrom = formatDateBr(dateFrom);
      const formattedTo = formatDateBr(dateTo);
      onSelect({
        periodMode: "custom",
        preset: "",
        appliedPeriod: `${formattedFrom} - ${formattedTo}`,
        dateFrom,
        dateTo,
      });
      onOpenChange(false);
      return;
    }

    const range = getPresetDates(preset);
    onSelect({
      periodMode: "preset",
      preset,
      appliedPeriod: preset,
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="select-process-dialog-content select-dashboard-dialog-content">
        <DialogHeader className="select-process-dialog-header">
          <div>
            <p className="select-process-modal-kicker">Análise de Performance</p>
            <DialogTitle className="select-process-modal-title">
              Vincular Dados da Dashboard
            </DialogTitle>
          </div>
          <DialogDescription className="select-process-modal-subtitle">
            Selecione o período de referência para análise dos indicadores.
          </DialogDescription>
        </DialogHeader>

        <div className="select-process-modal-body">
          <div className="ai-dashboard-filter-panel">
            <div className="ai-dashboard-modal-header-row">
              <span className="select-modal-filter-label">Filtro por período</span>
              <span className="ai-dashboard-period-pill">
                <CalendarRange size={12} />
                {activeLabel}
              </span>
            </div>

            <div className="ai-dashboard-presets-grid">
              {PRESETS.map((value) => {
                const isActive = periodMode === "preset" && preset === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setPeriodMode("preset");
                      setPreset(value);
                    }}
                    className={`ai-dashboard-preset-btn ${
                      isActive ? "ai-dashboard-preset-btn--active" : ""
                    }`}
                  >
                    <span>{value}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPeriodMode("custom")}
                className={`ai-dashboard-preset-btn ai-dashboard-preset-btn--full ${
                  periodMode === "custom" ? "ai-dashboard-preset-btn--active" : ""
                }`}
              >
                <Calendar size={13} />
                <span>Período personalizado</span>
              </button>
            </div>

            {periodMode === "custom" && (
              <div className="ai-dashboard-custom-dates">
                <div className="ai-dashboard-date-field">
                  <label className="select-modal-filter-label">Data inicial</label>
                  <input
                    type="date"
                    max={formatDateIso(new Date())}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="ai-dashboard-date-input"
                  />
                </div>
                <div className="ai-dashboard-date-field">
                  <label className="select-modal-filter-label">Data final</label>
                  <input
                    type="date"
                    min={dateFrom}
                    max={formatDateIso(new Date())}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="ai-dashboard-date-input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="ai-dashboard-unified-note">
            <div className="ai-dashboard-unified-note__icon">
              <BarChart3 size={16} />
            </div>
            <p className="ai-dashboard-unified-note__text">
              A MarIA terá acesso aos <strong>indicadores gerais da carteira</strong> e às{" "}
              <strong>métricas do período selecionado</strong> para responder dúvidas, comparar resultados e gerar gráficos no chat.
            </p>
          </div>
        </div>

        <DialogFooter className="select-process-dialog-footer">
          <div className="select-process-footer-info">
            {activeRange.dateFrom && activeRange.dateTo ? (
              <div className="select-process-footer-selected">
                <span className="select-process-footer-label">Período:</span>
                <span className="select-process-footer-name">
                  {periodMode === "custom" ? "Personalizado" : preset}
                </span>
                <span className="select-process-footer-cnj">
                  {formatDateBr(activeRange.dateFrom)} até {formatDateBr(activeRange.dateTo)}
                </span>
              </div>
            ) : (
              <span className="select-process-footer-placeholder">
                Defina o intervalo de datas
              </span>
            )}
          </div>

          <div className="select-process-footer-actions">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="select-process-btn select-process-btn--cancel"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
              className="select-process-btn select-process-btn--confirm"
            >
              <Check size={15} />
              Confirmar Período
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
