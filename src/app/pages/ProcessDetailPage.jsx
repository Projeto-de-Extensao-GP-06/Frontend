import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Pencil, Trash2, FileText, Clock, Plus, ChevronRight, Calendar, User, Building, Scale, AlertTriangle, Flag } from "lucide-react";
import { mockProcesses } from "../data/mockData";
import { StatusBadge, PriorityBadge, PhaseBadge } from "../components/StatusBadge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import "../../styles/process-detail-page.css";

/* ─ helpers ─ */
const fmt = v => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
}).format(v);
const historyDotClass = {
  abertura: "proc-timeline__dot--abertura",
  fechamento: "proc-timeline__dot--fechamento",
  mudanca_status: "proc-timeline__dot--mudanca_status",
  observacao: "proc-timeline__dot--observacao",
  arquivo: "proc-timeline__dot--arquivo"
};

/* ─ sub-components ─ */
function InfoRow({ label, value, mono = false }) {
  return <div>
      <p className="proc-info-row__label">{label}</p>
      <p className={`proc-info-row__value ${mono ? "proc-info-row__value--mono" : ""}`}>{value}</p>
    </div>;
}
export default function ProcessDetailPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const process = mockProcesses.find(p => p.id === id);
  if (!process) {
    return <div className="proc-detail-empty">
        <Scale size={36} className="proc-detail-empty__icon" />
        <p className="proc-detail-empty__text">Processo não encontrado.</p>
        <button onClick={() => navigate("/app/inicio")} className="proc-detail-empty__btn">Voltar ao Início</button>
      </div>;
  }
  return <div className="proc-detail-page">

      <div className="proc-hero">
        <button onClick={() => navigate("/app/inicio")} className="proc-hero__back">
          <ArrowLeft size={13} />
          Início
        </button>
        <div className="proc-hero__deco" />
        <p className="proc-hero__cnj">{process.cnj}</p>
        <h1 className="proc-hero__name">{process.clientName}</h1>
        <div className="proc-hero__badges">
          <StatusBadge status={process.status} />
          <PriorityBadge priority={process.priority} />
          <PhaseBadge phase={process.phase} />
          <span className="proc-hero__tribunal">{process.tribunal}</span>
        </div>
      </div>

      <div className="proc-content">
        <div className="proc-card">
          <div className="proc-grid">
            <InfoRow label="Fase" value={process.phase} />
            <InfoRow label="Tribunal" value={process.tribunal} />
            <InfoRow label="Data ajuizamento" value={process.filingDate} />
            <InfoRow label="Instância" value={process.instance} />
            <InfoRow label="Nível de Sigilo" value={process.secrecyLevel} />
            <InfoRow label="Classe processual" value={process.processualClass} />
          </div>
          <div className="proc-grid proc-grid--bordered">
            <div className="proc-grid__full"><InfoRow label="Órgão Julgador" value={process.judgingBody} /></div>
            <InfoRow label="Sistema do Tribunal" value={process.tribunalSystem} />
            <InfoRow label="Responsável" value={process.responsible} />
            <InfoRow label="Valor da causa" value={fmt(process.value)} mono />
            <InfoRow label="Data da audiência" value={process.hearingDate && process.hearingDate !== "—" ? `${process.hearingDate}${process.hearingTime ? ` às ${process.hearingTime}` : ""}` : "Não definida"} />
          </div>
        </div>

        <div className="proc-card">
          <h3 className="proc-card__title"><FileText size={14} className="proc-card__title-icon" />Descrição</h3>
          <p className="proc-card__text">{process.description}</p>
        </div>

        {process.observations.length > 0 && <div className="proc-card">
            <div className="proc-card__header">
              <h3 className="proc-card__title"><AlertTriangle size={14} className="proc-card__title-icon" />Observações</h3>
              <button onClick={() => navigate(`/app/processos/${id}/editar`)} className="proc-card__action-btn"><Plus size={12} />Adicionar</button>
            </div>
            <div className="proc-obs-list">
              {process.observations.map(obs => <div key={obs.id} className="proc-obs-item">
                  <p className="proc-obs-item__text">• {obs.text}</p>
                  <p className="proc-obs-item__date">{obs.createdAt}</p>
                </div>)}
            </div>
          </div>}

        <div className="proc-card">
          <h3 className="proc-card__title"><Clock size={14} className="proc-card__title-icon" />Histórico</h3>
          <div className="proc-timeline">
            <div className="proc-timeline__line" />
            <div className="proc-timeline__items">
              {[...process.history].reverse().map(item => {
              const isPhaseChange = item.type === "mudanca_status" && (item.description.toLowerCase().includes("fase") || item.description.toLowerCase().includes("mudança de fase"));
              return <div key={item.id} className="proc-timeline__item">
                    {isPhaseChange
                      ? <div className="proc-timeline__dot proc-timeline__dot--phase"><Flag size={12} className="proc-timeline__dot-flag" fill="white" /></div>
                      : <div className={`proc-timeline__dot ${historyDotClass[item.type] ?? "proc-timeline__dot--default"}`} />}
                    <p className={`proc-timeline__desc ${isPhaseChange ? "proc-timeline__desc--bold" : ""}`}>{item.description}</p>
                    <p className="proc-timeline__date">{item.timestamp}</p>
                  </div>;
              })}
            </div>
          </div>
        </div>

        <div className="proc-card">
          <div className="proc-card__header">
            <h3 className="proc-card__title"><FileText size={14} className="proc-card__title-icon" />Documentos</h3>
            <button onClick={() => navigate(`/app/processos/${id}/editar`)} className="proc-card__action-btn"><Plus size={12} />Add Arquivo</button>
          </div>
          {process.documents.length === 0
            ? <div className="proc-doc-empty">
                <FileText size={22} className="proc-doc-empty__icon" />
                <p className="proc-doc-empty__text">Nenhum documento anexado</p>
              </div>
            : <div className="proc-doc-grid">
                {process.documents.map(doc => {
                  const variant = doc.type === "PDF" ? "pdf" : (doc.type === "JPEG" || doc.type === "PNG") ? "img" : "other";
                  return <div key={doc.id} className="proc-doc-card" onClick={() => navigate(`/app/processos/${id}/editar`)}>
                      <div className={`proc-doc-card__type proc-doc-card__type--${variant}`}><span className="proc-doc-card__type-label">{doc.type}</span></div>
                      <p className="proc-doc-card__name">{doc.name}</p>
                      <p className="proc-doc-card__date">{doc.uploadedAt}</p>
                    </div>;
                })}
                <div className="proc-doc-add" onClick={() => navigate(`/app/processos/${id}/editar`)}>
                  <Plus size={20} className="proc-doc-add__icon" />
                  <p className="proc-doc-add__label">Add Arquivo</p>
                </div>
              </div>}
        </div>

        <div className="proc-actions">
          <button onClick={() => navigate(`/app/processos/${id}/editar`)} className="proc-actions__btn proc-actions__btn--primary">
            <Pencil size={15} />Editar Processo
          </button>
          <button onClick={() => setDeleteDialog(true)} className="proc-actions__btn proc-actions__btn--danger">
            <Trash2 size={15} />Excluir
          </button>
        </div>
      </div>

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="proc-dialog">
          <DialogHeader>
            <DialogTitle className="proc-dialog__title">Excluir processo?</DialogTitle>
          </DialogHeader>
          <p className="proc-dialog__text">Esta ação é irreversível. Todos os dados do processo serão removidos permanentemente.</p>
          <DialogFooter className="proc-dialog__footer">
            <button className="proc-dialog__btn proc-dialog__btn--outline" onClick={() => setDeleteDialog(false)}>Cancelar</button>
            <button className="proc-dialog__btn proc-dialog__btn--danger" onClick={() => { setDeleteDialog(false); navigate("/app/inicio"); }}>Excluir</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}