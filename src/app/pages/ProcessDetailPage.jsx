import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Pencil, Trash2, FileText, Clock, Plus, ChevronRight, Calendar, User, Building, Scale, AlertTriangle, Flag, RotateCcw, Check, X, CloudUpload, RefreshCw } from "lucide-react";
import { mockProcesses } from "../data/mockData";
import { StatusBadge, PriorityBadge, PhaseBadge } from "../components/StatusBadge";
import { InfoRow } from "../components/InfoRow";
import { getDocVariant } from "../utils/document";
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
export default function ProcessDetailPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [reactivateDialog, setReactivateDialog] = useState(false);
  const [confirmUploadDialog, setConfirmUploadDialog] = useState(false);
  const process = mockProcesses.find(p => p.id === id);

  const [status, setStatus] = useState(process?.status || "ativo");
  const [observations, setObservations] = useState(process?.observations || []);
  const [documents, setDocuments] = useState(process?.documents || []);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (process) {
      document.title = `Processo - ${process.clientName}`;
      setStatus(process.status || "ativo");
      setObservations(process.observations || []);
      setDocuments(process.documents || []);
      setPendingDocs([]);
    }
  }, [id, process]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    const newDocs = files.map((file, index) => {
      const parts = file.name.split(".");
      const ext = parts.length > 1 ? parts.pop().toUpperCase() : "DOC";
      return {
        id: `pending_${Date.now()}_${index}`,
        name: file.name,
        type: ext.length > 5 ? ext.slice(0, 4) : ext,
        uploadedAt: formattedDate,
      };
    });

    setPendingDocs((prev) => [...prev, ...newDocs]);
    e.target.value = "";
  };

  const removePendingDoc = (docId) => {
    setPendingDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleCancelPending = () => {
    setPendingDocs([]);
  };

  const handleConfirmPending = () => {
    if (pendingDocs.length === 0) return;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const formattedDateTime = `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    const confirmedDocs = pendingDocs.map((doc, i) => ({
      ...doc,
      id: `d_${Date.now()}_${i}`,
    }));

    const updated = [...documents, ...confirmedDocs];
    setDocuments(updated);

    if (process) {
      if (!process.documents) {
        process.documents = [];
      }
      process.documents.push(...confirmedDocs);

      if (!process.history) {
        process.history = [];
      }
      confirmedDocs.forEach((doc) => {
        process.history.push({
          id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: "arquivo",
          description: `Documento adicionado: ${doc.name}`,
          timestamp: formattedDateTime,
        });
      });
    }

    setPendingDocs([]);
  };

  const handleReactivate = () => {
    if (process) {
      process.status = "ativo";
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const formattedDate = `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
      if (!process.history) {
        process.history = [];
      }
      process.history.push({
        id: `h_${Date.now()}`,
        type: "mudanca_status",
        description: "Reativação do processo: Processo reativado",
        timestamp: formattedDate
      });
      setStatus("ativo");
    }
    setReactivateDialog(false);
  };

  const handleAddComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newObs = {
      id: `o_${Date.now()}`,
      text: trimmed,
      createdAt: formattedDate,
    };

    const updatedObservations = [...observations, newObs];
    setObservations(updatedObservations);
    if (process) {
      if (!process.observations) {
        process.observations = [];
      }
      process.observations.push(newObs);
    }
    setNewComment("");
    setIsAddingComment(false);
  };

  const handleCancelComment = () => {
    setNewComment("");
    setIsAddingComment(false);
  };

  if (!process) {
    return <div className="proc-detail-empty">
        <Scale size={36} className="proc-detail-empty__icon" />
        <p className="proc-detail-empty__text">Processo não encontrado.</p>
        <button onClick={() => navigate("/app/inicio")} className="proc-detail-empty__btn">Voltar ao Início</button>
      </div>;
  }
  const isClosed = status === "encerrado";
  const closedAt = process.closedAt || process.encerradoEm || process.history?.find(h => h.type === "fechamento")?.timestamp || "—";
  const closedBy = process.closedBy || process.encerradoPor || process.responsible || "Thauany Bezerra";

  return (
    <div className="proc-detail-page">

      <div className="proc-hero">
        <button onClick={() => navigate("/app/inicio")} className="proc-hero__back">
          <ArrowLeft size={15} />
          Início
        </button>
        <div className="proc-hero__deco" />
        <p className="proc-hero__cnj">{process.cnj}</p>
        <h1 className="proc-hero__name">{process.clientName}</h1>
        <div className="proc-hero__badges">
          <StatusBadge status={status} />
          <PriorityBadge priority={process.priority} />
          <PhaseBadge phase={process.phase} />
          <span className="proc-hero__tribunal">{process.tribunal}</span>
        </div>
      </div>

      <div className="proc-content">
        <div className="proc-card">
          <div className="proc-sync-bar">
            <div className="proc-sync-bar__info">
              <span className="proc-sync-bar__label">Última busca de dados:</span>
              <span className="proc-sync-bar__value">{process.lastSyncDate || process.lastSync || "28/08/2026 às 14:30"}</span>
            </div>
            <button
              type="button"
              className="proc-sync-bar__btn"
              title="Buscar e atualizar dados do processo"
            >
              <RefreshCw size={14} />
              <span>Atualizar dados</span>
            </button>
          </div>

          <div className="proc-grid">
            <InfoRow label="Fase" value={process.phase} variant="proc" />
            <InfoRow label="Tribunal" value={process.tribunal} variant="proc" />
            <InfoRow label="Data ajuizamento" value={process.filingDate} variant="proc" />
            <InfoRow label="Instância" value={process.instance} variant="proc" />
            <InfoRow label="Nível de Sigilo" value={process.secrecyLevel} variant="proc" />
            <InfoRow label="Classe processual" value={process.processualClass} variant="proc" />
          </div>
          <div className="proc-grid proc-grid--bordered">
            <div className="proc-grid__full"><InfoRow label="Órgão Julgador" value={process.judgingBody} variant="proc" /></div>
            <InfoRow label="Sistema do Tribunal" value={process.tribunalSystem} variant="proc" />
            <InfoRow label="Responsável" value={process.responsible} variant="proc" />
            <InfoRow label="Valor da causa" value={fmt(process.value)} mono variant="proc" />
            <InfoRow label="Data da audiência" value={process.hearingDate && process.hearingDate !== "—" ? `${process.hearingDate}${process.hearingTime ? ` às ${process.hearingTime}` : ""}` : "Não definida"} variant="proc" />
            {isClosed && (
              <>
                <InfoRow label="Encerrado em" value={closedAt} variant="proc" />
                <InfoRow label="Encerrado por" value={closedBy} variant="proc" />
              </>
            )}
          </div>
        </div>

        <div className="proc-card">
          <h3 className="proc-card__title"><FileText size={14} className="proc-card__title-icon" />Descrição</h3>
          <p className="proc-card__text">{process.description}</p>
        </div>

        <div className="proc-card">
          <div className="proc-card__header">
            <h3 className="proc-card__title"><AlertTriangle size={14} className="proc-card__title-icon" />Observações</h3>
            {!isClosed && !isAddingComment && (
              <button onClick={() => setIsAddingComment(true)} className="proc-card__action-btn">
                <Plus size={12} />Adicionar comentário
              </button>
            )}
          </div>

          {observations.length > 0 ? (
            <div className="proc-obs-list">
              {observations.map(obs => <div key={obs.id} className="proc-obs-item">
                  <p className="proc-obs-item__text">• {obs.text}</p>
                  <p className="proc-obs-item__date">{obs.createdAt}</p>
                </div>)}
            </div>
          ) : !isAddingComment ? (
            <p className="proc-obs-empty">Nenhuma observação cadastrada.</p>
          ) : null}

          {isAddingComment && (
            <div className="proc-obs-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Digite o comentário..."
                className="proc-obs-textarea"
                rows={3}
                autoFocus
              />
              <div className="proc-obs-form__actions">
                <button
                  type="button"
                  onClick={handleCancelComment}
                  className="proc-obs-btn proc-obs-btn--cancel"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="proc-obs-btn proc-obs-btn--submit"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

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
          </div>
          {documents.length === 0 && pendingDocs.length === 0
            ? (!isClosed ? (
                <label htmlFor="proc-file-upload-empty" className="proc-doc-empty">
                  <input
                    id="proc-file-upload-empty"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="proc-file-input-hidden"
                  />
                  <Plus size={20} className="proc-doc-empty__icon" />
                  <p className="proc-doc-empty__text">Adicionar arquivo</p>
                </label>
              ) : (
                <p className="proc-obs-empty">Nenhum documento cadastrado.</p>
              ))
            : <>
                <div className="proc-doc-grid">
                  {documents.map(doc => {
                    const variant = getDocVariant(doc.type);
                    return (
                      <div key={doc.id} className="proc-doc-card">
                        <div className={`proc-doc-card__type proc-doc-card__type--${variant}`}>
                          <span className="proc-doc-card__type-label">{doc.type}</span>
                        </div>
                        <p className="proc-doc-card__name" title={doc.name}>{doc.name}</p>
                        <p className="proc-doc-card__date">{doc.uploadedAt}</p>
                      </div>
                    );
                  })}
                  {pendingDocs.map(doc => {
                    const variant = getDocVariant(doc.type);
                    return (
                      <div key={doc.id} className="proc-doc-card proc-doc-card--pending">
                        <button
                          type="button"
                          onClick={() => removePendingDoc(doc.id)}
                          className="proc-doc-card__remove"
                          title="Remover arquivo pendente"
                        >
                          <X size={13} />
                        </button>
                        <div className={`proc-doc-card__type proc-doc-card__type--${variant}`}>
                          <span className="proc-doc-card__type-label">{doc.type}</span>
                        </div>
                        <p className="proc-doc-card__name" title={doc.name}>{doc.name}</p>
                        <span className="proc-doc-card__tag">Pendente</span>
                      </div>
                    );
                  })}
                  {!isClosed && (
                    <label htmlFor="proc-file-upload-grid" className="proc-doc-add">
                      <input
                        id="proc-file-upload-grid"
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="proc-file-input-hidden"
                      />
                      <Plus size={20} className="proc-doc-add__icon" />
                      <p className="proc-doc-add__label">Adicionar arquivo</p>
                    </label>
                  )}
                </div>

                {pendingDocs.length > 0 && (
                  <div className="proc-doc-confirm-bar">
                    <div className="proc-doc-confirm-info">
                      <span className="proc-doc-confirm-badge">{pendingDocs.length}</span>
                      <p className="proc-doc-confirm-text">
                        {pendingDocs.length === 1
                          ? "1 arquivo pronto para ser adicionado"
                          : `${pendingDocs.length} arquivos prontos para serem adicionados`}
                      </p>
                    </div>
                    <div className="proc-doc-confirm-actions">
                      <button
                        type="button"
                        onClick={handleCancelPending}
                        className="proc-doc-confirm-btn proc-doc-confirm-btn--cancel"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmUploadDialog(true)}
                        className="proc-doc-confirm-btn proc-doc-confirm-btn--submit"
                      >
                        <Check size={14} />
                        Confirmar Adição
                      </button>
                    </div>
                  </div>
                )}
              </>}
        </div>

        <div className="proc-actions">
          {isClosed && (
            <button onClick={() => setReactivateDialog(true)} className="proc-actions__btn proc-actions__btn--reactivate">
              <RotateCcw size={15} />Reativar Processo
            </button>
          )}
          {!isClosed && (
            <button onClick={() => navigate(`/app/processos/${id}/editar`)} className="proc-actions__btn proc-actions__btn--primary">
              <Pencil size={15} />Editar Processo
            </button>
          )}
          <button onClick={() => setDeleteDialog(true)} className="proc-actions__btn proc-actions__btn--danger">
            <Trash2 size={15} />Excluir
          </button>
        </div>
      </div>

      {/* Modal de confirmação de envio para o OneDrive */}
      <Dialog open={confirmUploadDialog} onOpenChange={setConfirmUploadDialog}>
        <DialogContent className="proc-dialog">
          <DialogHeader>
            <div className="proc-dialog__header">
              <div className="proc-dialog__icon-wrap">
                <CloudUpload size={24} className="proc-dialog__icon" />
              </div>
              <DialogTitle className="proc-dialog__title">Salvar arquivos no OneDrive?</DialogTitle>
            </div>
          </DialogHeader>
          <p className="proc-dialog__text">
            Ao confirmar, {pendingDocs.length === 1 ? "o arquivo selecionado será salvo" : `os ${pendingDocs.length} arquivos selecionados serão salvos`} e sincronizados diretamente no <strong className="proc-dialog__highlight">OneDrive</strong> vinculado a este processo.
          </p>
          <DialogFooter className="proc-dialog__footer">
            <button
              className="proc-dialog__btn proc-dialog__btn--outline"
              onClick={() => setConfirmUploadDialog(false)}
            >
              Cancelar
            </button>
            <button
              className="proc-dialog__btn proc-dialog__btn--primary"
              onClick={() => {
                handleConfirmPending();
                setConfirmUploadDialog(false);
              }}
            >
              Confirmar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog open={reactivateDialog} onOpenChange={setReactivateDialog}>
        <DialogContent className="proc-dialog">
          <DialogHeader>
            <DialogTitle className="proc-dialog__title">Reativar processo?</DialogTitle>
          </DialogHeader>
          <p className="proc-dialog__text">O processo será marcado novamente como ativo no sistema. Deseja continuar?</p>
          <DialogFooter className="proc-dialog__footer">
            <button className="proc-dialog__btn proc-dialog__btn--outline" onClick={() => setReactivateDialog(false)}>Cancelar</button>
            <button className="proc-dialog__btn proc-dialog__btn--reactivate" onClick={handleReactivate}>Reativar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}