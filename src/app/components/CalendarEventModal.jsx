import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Bell,
  Download,
  CheckCircle2,
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

export function CalendarEventModal({ open, onOpenChange }) {
  const [title, setTitle] = useState("Audiência de Conciliação");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [endDate, setEndDate] = useState(getTodayString());
  const [endTime, setEndTime] = useState(getDefaultEndTime());
  const [reminder, setReminder] = useState("-PT15M");
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    if (open) {
      setIsGenerated(false);
      setTitle("");
      setStartDate(getTodayString());
      setEndDate(getTodayString());
      setStartTime(getDefaultStartTime());
      setEndTime(getDefaultEndTime());
      setIsAllDay(false);
      setLocation("");
      setDescription("");
      setReminder("-PT15M");
    }
  }, [open]);

  const generateIcsContent = () => {
    const now = new Date();
    const dtstamp = formatIcsUtcDate(now);
    const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@sgpj.adv.br`;

    let dtStartLine = "";
    let dtEndLine = "";

    if (isAllDay) {
      dtStartLine = `DTSTART;VALUE=DATE:${formatIcsAllDayDate(startDate)}`;
      dtEndLine = `DTEND;VALUE=DATE:${getAllDayEndDate(endDate || startDate)}`;
    } else {
      dtStartLine = `DTSTART:${formatIcsLocalDate(startDate, startTime)}`;
      dtEndLine = `DTEND:${formatIcsLocalDate(endDate || startDate, endTime || startTime)}`;
    }

    const alarmBlock =
      reminder && reminder !== "0"
        ? [
            "BEGIN:VALARM",
            "ACTION:DISPLAY",
            `DESCRIPTION:Lembrete: ${escapeIcsText(title)}`,
            `TRIGGER:${reminder}`,
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
      `SUMMARY:${escapeIcsText(title || "Compromisso Jurídico")}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(location)}`,
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

    if (!title.trim()) {
      toast.error("Por favor, preencha o título do evento.");
      return;
    }

    if (!startDate) {
      toast.error("Por favor, informe a data do evento.");
      return;
    }

    try {
      const icsString = generateIcsContent();
      const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const safeTitle = (title || "evento")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const filename = `${safeTitle || "evento"}-${startDate}.ics`;

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsGenerated(true);
      toast.success("Arquivo .ics gerado com sucesso!", {
        description: `Download de "${filename}" concluído. Abra no Google Agenda, Outlook ou Apple Calendar.`,
      });

      setTimeout(() => {
        onOpenChange(false);
      }, 1200);
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
              Gerar Evento de Calendário
            </DialogTitle>
          </div>
          <DialogDescription className="calendar-event-modal-subtitle">
            Preencha os dados do compromisso ou audiência para exportar o arquivo padrão compatível com Google Agenda, Outlook, Apple Calendar e outros.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDownload} className="calendar-event-modal-body">
          {/* ── Title ── */}
          <div className="calendar-form-section">
            <label className="calendar-form-label" htmlFor="calendar-title-input">
              <FileText size={13} />
              <span>Título do evento *</span>
            </label>
            <input
              id="calendar-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Audiência de Instrução - Maria Silva"
              className="calendar-form-input"
            />
          </div>

          {/* ── Description / Notes ── */}
          <div className="calendar-form-section">
            <label className="calendar-form-label" htmlFor="calendar-description-input">
              <FileText size={13} />
              <span>Pauta / Observações do compromisso</span>
            </label>
            <textarea
              id="calendar-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
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
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value > endDate) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="calendar-form-input calendar-input-date"
                  />
                  {!isAllDay && (
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
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
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="calendar-form-input calendar-input-date"
                  />
                  {!isAllDay && (
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="calendar-form-input calendar-input-time"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Reminder / Alarm ── */}
          <div className="calendar-form-section">
            <label className="calendar-form-label" htmlFor="calendar-reminder-select">
              <Bell size={13} />
              <span>Lembrete automático</span>
            </label>
            <select
              id="calendar-reminder-select"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
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
            <label className="calendar-form-label" htmlFor="calendar-location-input">
              <MapPin size={13} />
              <span>Local ou Link da Sala Virtual</span>
            </label>
            <input
              id="calendar-location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Fórum Central - Sala 402 ou https://meet.google.com/..."
              className="calendar-form-input"
            />
          </div>

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
                  <span>Arquivo Baixado!</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Exportar Arquivo .ics</span>
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
