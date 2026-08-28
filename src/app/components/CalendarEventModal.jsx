import { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  FileText,
  Bell,
  Download,
  CheckCircle2,
  Plus,
  X,
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
import "../../styles/calendar-event-modal.css";

const REMINDER_OPTIONS = [
  { value: "0", label: "Sem lembrete" },
  { value: "-PT15M", label: "15 minutos antes" },
  { value: "-PT30M", label: "30 minutos antes" },
  { value: "-PT1H", label: "1 hora antes" },
  { value: "-PT2H", label: "2 horas antes" },
  { value: "-P1D", label: "1 dia antes" },
  { value: "-P2D", label: "2 dias antes" },
  { value: "-P1W", label: "1 semana antes" },
];

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultStartTime = () => {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:00`;
};

const getDefaultEndTime = () => {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:00`;
};

const escapeIcsText = (str) => {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
};

const formatIcsUtcDate = (date) => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

const formatIcsLocalDate = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split("-");
  const [hour, min] = timeStr.split(":");
  return `${year}${month}${day}T${hour}${min}00`;
};

const formatIcsAllDayDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-");
  return `${year}${month}${day}`;
};

// Next day for all-day exclusive DTEND in RFC 5545
const getAllDayEndDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  const nextYear = d.getFullYear();
  const nextMonth = String(d.getMonth() + 1).padStart(2, "0");
  const nextDay = String(d.getDate()).padStart(2, "0");
  return `${nextYear}${nextMonth}${nextDay}`;
};

const createDefaultEvent = () => ({
  id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  title: "",
  location: "",
  description: "",
  isAllDay: false,
  startDate: getTodayString(),
  startTime: getDefaultStartTime(),
  endDate: getTodayString(),
  endTime: getDefaultEndTime(),
  reminder: "-PT15M",
});

export function CalendarEventModal({ open, onOpenChange }) {
  const [events, setEvents] = useState(() => [createDefaultEvent()]);
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    if (open) {
      setIsGenerated(false);
      setEvents([createDefaultEvent()]);
    }
  }, [open]);

  const handleEventChange = (index, field, value) => {
    setEvents((prev) =>
      prev.map((event, i) => {
        if (i !== index) return event;
        const updated = { ...event, [field]: value };
        if (field === "startDate" && value > updated.endDate) {
          updated.endDate = value;
        }
        return updated;
      })
    );
  };

  const handleAddEvent = () => {
    setEvents((prev) => [...prev, createDefaultEvent()]);
  };

  const handleRemoveEvent = (index) => {
    if (events.length <= 1) return;
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const generateIcsContent = (event) => {
    const now = new Date();
    const dtstamp = formatIcsUtcDate(now);
    const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@sgpj.adv.br`;

    let dtStartLine = "";
    let dtEndLine = "";

    if (event.isAllDay) {
      dtStartLine = `DTSTART;VALUE=DATE:${formatIcsAllDayDate(event.startDate)}`;
      dtEndLine = `DTEND;VALUE=DATE:${getAllDayEndDate(event.endDate || event.startDate)}`;
    } else {
      dtStartLine = `DTSTART:${formatIcsLocalDate(event.startDate, event.startTime)}`;
      dtEndLine = `DTEND:${formatIcsLocalDate(event.endDate || event.startDate, event.endTime || event.startTime)}`;
    }

    const alarmBlock =
      event.reminder && event.reminder !== "0"
        ? [
            "BEGIN:VALARM",
            "ACTION:DISPLAY",
            `DESCRIPTION:Lembrete: ${escapeIcsText(event.title)}`,
            `TRIGGER:${event.reminder}`,
            "END:VALARM",
          ].join("\r\n")
        : "";

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SGPJ//Sistema Gerenciador de Processos Judiciais//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      dtStartLine,
      dtEndLine,
      `SUMMARY:${escapeIcsText(event.title || "Compromisso Jurídico")}`,
      `DESCRIPTION:${escapeIcsText(event.description)}`,
      `LOCATION:${escapeIcsText(event.location)}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
    ];

    if (alarmBlock) {
      lines.push(alarmBlock);
    }

    lines.push("END:VEVENT");
    lines.push("END:VCALENDAR");

    return lines.join("\r\n");
  };

  const handleDownload = (e) => {
    e.preventDefault();

    // Validate each event
    for (let idx = 0; idx < events.length; idx++) {
      const ev = events[idx];
      const eventLabel = events.length > 1 ? `Evento ${idx + 1}` : "evento";
      if (!ev.title.trim()) {
        toast.error(`Por favor, preencha o título do ${eventLabel}.`);
        return;
      }

      if (!ev.startDate) {
        toast.error(`Por favor, informe a data do ${eventLabel}.`);
        return;
      }
    }

    try {
      events.forEach((ev, idx) => {
        const icsString = generateIcsContent(ev);
        const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const safeTitle = (ev.title || `evento-${idx + 1}`)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const filename = `${safeTitle || `evento-${idx + 1}`}-${ev.startDate}.ics`;

        setTimeout(() => {
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, idx * 150);
      });

      setIsGenerated(true);

      if (events.length > 1) {
        toast.success(`${events.length} arquivos .ics gerados com sucesso!`, {
          description: `Download de ${events.length} compromissos concluído. Abra no Google Agenda, Outlook ou Apple Calendar.`,
        });
      } else {
        const safeTitle = (events[0].title || "evento")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const filename = `${safeTitle || "evento"}-${events[0].startDate}.ics`;
        toast.success("Arquivo .ics gerado com sucesso!", {
          description: `Download de "${filename}" concluído. Abra no Google Agenda, Outlook ou Apple Calendar.`,
        });
      }

      setTimeout(() => {
        onOpenChange(false);
      }, 1200 + (events.length > 1 ? events.length * 150 : 0));
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar o arquivo de calendário.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="calendar-event-dialog-content">
        <DialogHeader className="calendar-event-dialog-header">
          <div>
            <p className="calendar-event-modal-kicker">SGPJ • Calendário</p>
            <DialogTitle className="calendar-event-modal-title">
              {events.length > 1 ? "Gerar Eventos de Calendário" : "Gerar Evento de Calendário"}
            </DialogTitle>
          </div>
          <DialogDescription className="calendar-event-modal-subtitle">
            Preencha os dados do{events.length > 1 ? "s" : ""} compromisso{events.length > 1 ? "s" : ""} ou audiência{events.length > 1 ? "s" : ""} para exportar o{events.length > 1 ? "s" : ""} arquivo{events.length > 1 ? "s" : ""} padrão compatíve{events.length > 1 ? "is" : "l"} com Google Agenda, Outlook, Apple Calendar e outros.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDownload} className="calendar-event-modal-body">
          {events.map((event, i) => (
            <div key={event.id} className="calendar-event-card">
              <div className="calendar-event-card-header">
                <span className="calendar-event-card-label">
                  {`Evento ${i + 1}`}
                </span>
                {events.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEvent(i)}
                    className="calendar-event-remove"
                    title="Remover evento"
                    aria-label="Remover evento"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* ── Title ── */}
              <div className="calendar-form-section">
                <label className="calendar-form-label" htmlFor={`calendar-title-input-${event.id}`}>
                  <FileText size={13} />
                  <span>Título do evento *</span>
                </label>
                <input
                  id={`calendar-title-input-${event.id}`}
                  type="text"
                  required
                  value={event.title}
                  onChange={(e) => handleEventChange(i, "title", e.target.value)}
                  placeholder="Ex: Audiência de Instrução - Maria Silva"
                  className="calendar-form-input"
                />
              </div>

              {/* ── Description / Notes ── */}
              <div className="calendar-form-section">
                <label className="calendar-form-label" htmlFor={`calendar-description-input-${event.id}`}>
                  <FileText size={13} />
                  <span>Pauta / Observações do compromisso</span>
                </label>
                <textarea
                  id={`calendar-description-input-${event.id}`}
                  rows={3}
                  value={event.description}
                  onChange={(e) => handleEventChange(i, "description", e.target.value)}
                  placeholder="Documentos necessários, link da videoconferência, pauta do advogado, orientações ao cliente..."
                  className="calendar-form-textarea"
                />
              </div>

              {/* ── Date & Time Row ── */}
              <div className="calendar-form-section">
                <div className="calendar-datetime-header">
                  <label className="calendar-form-label">
                    <Clock size={13} />
                    <span>Data e Horário *</span>
                  </label>
                  <label className="calendar-allday-toggle">
                    <input
                      type="checkbox"
                      checked={event.isAllDay}
                      onChange={(e) => handleEventChange(i, "isAllDay", e.target.checked)}
                    />
                    <span>Dia inteiro</span>
                  </label>
                </div>

                <div className="calendar-datetime-grid">
                  {/* Start Date / Time */}
                  <div className="calendar-datetime-field">
                    <span className="calendar-datetime-label">Início:</span>
                    <div className="calendar-datetime-inputs">
                      <input
                        type="date"
                        required
                        value={event.startDate}
                        onChange={(e) => handleEventChange(i, "startDate", e.target.value)}
                        className="calendar-form-input calendar-input-date"
                      />
                      {!event.isAllDay && (
                        <input
                          type="time"
                          required
                          value={event.startTime}
                          onChange={(e) => handleEventChange(i, "startTime", e.target.value)}
                          className="calendar-form-input calendar-input-time"
                        />
                      )}
                    </div>
                  </div>

                  {/* End Date / Time */}
                  <div className="calendar-datetime-field">
                    <span className="calendar-datetime-label">Término:</span>
                    <div className="calendar-datetime-inputs">
                      <input
                        type="date"
                        required
                        value={event.endDate}
                        min={event.startDate}
                        onChange={(e) => handleEventChange(i, "endDate", e.target.value)}
                        className="calendar-form-input calendar-input-date"
                      />
                      {!event.isAllDay && (
                        <input
                          type="time"
                          required
                          value={event.endTime}
                          onChange={(e) => handleEventChange(i, "endTime", e.target.value)}
                          className="calendar-form-input calendar-input-time"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Reminder / Alarm ── */}
              <div className="calendar-form-section">
                <label className="calendar-form-label" htmlFor={`calendar-reminder-select-${event.id}`}>
                  <Bell size={13} />
                  <span>Lembrete automático</span>
                </label>
                <select
                  id={`calendar-reminder-select-${event.id}`}
                  value={event.reminder}
                  onChange={(e) => handleEventChange(i, "reminder", e.target.value)}
                  className="calendar-form-select"
                >
                  {REMINDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── Location ── */}
              <div className="calendar-form-section">
                <label className="calendar-form-label" htmlFor={`calendar-location-input-${event.id}`}>
                  <MapPin size={13} />
                  <span>Local ou Link da Sala Virtual</span>
                </label>
                <input
                  id={`calendar-location-input-${event.id}`}
                  type="text"
                  value={event.location}
                  onChange={(e) => handleEventChange(i, "location", e.target.value)}
                  placeholder="Ex: Fórum Central - Sala 402 ou https://meet.google.com/..."
                  className="calendar-form-input"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddEvent}
            className="calendar-add-event-button"
          >
            <Plus size={16} />
            Adicionar outro evento
          </button>

          {/* ── Dialog Footer / Submit ── */}
          <DialogFooter className="calendar-event-dialog-footer">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="calendar-btn calendar-btn--cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`calendar-btn calendar-btn--confirm ${isGenerated ? "is-success" : ""}`}
            >
              {isGenerated ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>{events.length > 1 ? "Arquivos Baixados!" : "Arquivo Baixado!"}</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>{events.length > 1 ? `Exportar ${events.length} Arquivos .ics` : "Exportar Arquivo .ics"}</span>
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
