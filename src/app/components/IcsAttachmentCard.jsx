import { Calendar, Download } from "lucide-react";
import { toast } from "sonner";

/**
 * Card de anexo .ics exibido abaixo da resposta da MarIA para download client-side.
 */
export function IcsAttachmentCard({ attachment }) {
  if (!attachment?.content || !attachment?.filename) {
    return null;
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([attachment.content], {
        type: attachment.mime_type || "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Arquivo .ics baixado com sucesso!", {
        description: `Importe "${attachment.filename}" no Google Agenda, Outlook ou Apple Calendar.`,
      });
    } catch (error) {
      console.error("Erro ao baixar arquivo .ics:", error);
      toast.error("Não foi possível baixar o arquivo .ics.");
    }
  };

  const displayTitle = attachment.title || attachment.filename.replace(/\.ics$/i, "");

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="ai-ics-card"
      title={`Baixar ${attachment.filename}`}
      aria-label={`Baixar evento ${displayTitle} em formato ICS`}
    >
      <div className="ai-ics-card__left">
        <div className="ai-ics-card__icon-wrap">
          <Calendar size={17} />
        </div>
        <div className="ai-ics-card__info">
          <span className="ai-ics-card__title">{displayTitle}</span>
          <span className="ai-ics-card__type">ICS</span>
        </div>
      </div>

      <span className="ai-ics-card__download" aria-hidden="true">
        <Download size={16} />
      </span>
    </button>
  );
}
