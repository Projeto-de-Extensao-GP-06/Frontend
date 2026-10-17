import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Mail, Phone, Calendar, FileText, Check, X, User, Building2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { StatusBadge } from "../components/StatusBadge";
import { buscarSolicitacaoPorId, mapearSolicitacao } from "../services/solicitacaoService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { AcceptRequestModal } from "../components/AcceptRequestModal";
import "../../styles/request-detail-page.css";

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryIndex, setRetryIndex] = useState(0);
  const [status, setStatus] = useState("pending");
  const [denyDialog, setDenyDialog] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setLoading(true);
    setError(null);
    setRequest(null);

    buscarSolicitacaoPorId(id, { signal: controller.signal })
      .then((dto) => {
        if (!current) return;
        setRequest(mapearSolicitacao(dto));
        setStatus("pending");
      })
      .catch((requestError) => {
        if (!current || controller.signal.aborted) return;
        if (requestError.status === 404) {
          setError("not-found");
        } else {
          setError(requestError.message || "Não foi possível carregar a solicitação.");
        }
      })
      .finally(() => {
        if (current && !controller.signal.aborted) setLoading(false);
      });

    return () => { current = false; controller.abort(); };
  }, [id, retryIndex]);

  useEffect(() => {
    document.title = request ? `Solicitação - ${request.companyName || request.name}` : "Solicitação";
  }, [request]);

  if (loading) {
    return <div className="req-detail-empty" role="status"><p className="req-detail-empty__text">Carregando solicitação...</p></div>;
  }
  if (error === "not-found") {
    return <div className="req-detail-empty" role="alert">
      <p className="req-detail-empty__text">Solicitação não encontrada.</p>
      <Button onClick={() => navigate("/app/solicitacoes")} className="req-detail-empty__btn">Voltar</Button>
    </div>;
  }
  if (error) {
    return <div className="req-detail-empty" role="alert">
      <p className="req-detail-empty__text">Não foi possível carregar a solicitação: {error}</p>
      <Button onClick={() => setRetryIndex((index) => index + 1)} className="req-detail-empty__btn">Tentar novamente</Button>
      <Button onClick={() => navigate("/app/solicitacoes")} className="req-detail-empty__btn">Voltar</Button>
    </div>;
  }
  if (!request) return null;

  const handled = status !== "pending" || request.status !== "pendente";
  return <div className="req-detail-page">
      <button onClick={() => navigate("/app/solicitacoes")} className="req-detail-breadcrumb">
        <ArrowLeft size={14} />Solicitações
      </button>
      <div className="req-detail-header">
        <div>
          <p className="req-detail-header__kicker">Solicitações › Detalhe</p>
          <h1 className="req-detail-header__title">{request.companyName || request.name}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "0.75rem", fontWeight: "700", padding: "0.25rem 0.6rem", borderRadius: "0.5rem",
            backgroundColor: request.type === "PJ" ? "#eef1f8" : "#f1f5f9",
            color: request.type === "PJ" ? "#0f2357" : "#475569", border: "1px solid #e2e8f0",
          }}>{request.type === "PJ" ? "Pessoa Jurídica (PJ)" : "Pessoa Física (PF)"}</span>
          <StatusBadge status={status === "accepted" ? "aceita" : status === "denied" ? "negada" : request.status} />
        </div>
      </div>

      <div className="req-detail-card">
        <div className="req-detail-requester">
          <div className="req-detail-requester__avatar">
            {request.type === "PJ" ? <Building2 size={20} className="req-detail-requester__avatar-icon" /> : <User size={20} className="req-detail-requester__avatar-icon" />}
          </div>
          <div>
            <p className="req-detail-requester__name">{request.companyName || request.name}</p>
            <p className="req-detail-requester__meta">{request.state} • {request.createdAt}</p>
          </div>
        </div>
        <div className="req-detail-info-list">
          {request.companyName && <div className="req-detail-info-row"><User size={14} className="req-detail-info-row__icon" /><span className="req-detail-info-row__value">Contato principal: <strong>{request.name}</strong></span></div>}
          <div className="req-detail-info-row"><Mail size={14} className="req-detail-info-row__icon" /><span className="req-detail-info-row__value">{request.email}</span></div>
          <div className="req-detail-info-row"><Phone size={14} className="req-detail-info-row__icon" /><span className="req-detail-info-row__value">{request.phone}</span></div>
          <div className="req-detail-info-row"><Calendar size={14} className="req-detail-info-row__icon" /><span className="req-detail-info-row__value">Solicitado em {request.createdAt}</span></div>
          {request.aceitouTermos !== undefined && <div className="req-detail-info-row"><Check size={14} className="req-detail-info-row__icon" /><span className="req-detail-info-row__value">Aceitou os termos: {request.aceitouTermos ? "Sim" : "Não"}</span></div>}
          {request.dataResposta && <div className="req-detail-info-row"><Calendar size={14} className="req-detail-info-row__icon" /><span className="req-detail-info-row__value">Respondida em {request.dataResposta}</span></div>}
        </div>
      </div>

      {request.processNumber && <div className="req-detail-card">
        <div className="req-detail-process-header"><FileText size={16} className="req-detail-process-header__icon" /><h3 className="req-detail-process-header__title">Informações do Processo</h3></div>
        <div className="req-detail-proc-grid">
          <div><p className="req-detail-proc-label">Número CNJ</p><p className="req-detail-proc-value">{request.processNumber}</p></div>
          {request.filingDate && <div><p className="req-detail-proc-label">Data ajuizamento</p><p className="req-detail-proc-value">{request.filingDate}</p></div>}
          {request.instance && <div><p className="req-detail-proc-label">Instância</p><p className="req-detail-proc-value">{request.instance}</p></div>}
          {request.secrecyLevel && <div><p className="req-detail-proc-label">Nível de Sigilo</p><p className="req-detail-proc-value">{request.secrecyLevel}</p></div>}
          {request.tribunalSystem && <div><p className="req-detail-proc-label">Sistema do Tribunal</p><p className="req-detail-proc-value">{request.tribunalSystem}</p></div>}
        </div>
        {request.judgingBody && <div className="req-detail-proc-extra"><p className="req-detail-proc-label">Órgão Julgador</p><p className="req-detail-proc-value">{request.judgingBody}</p></div>}
        {request.processualClass && <div className="req-detail-proc-extra"><p className="req-detail-proc-label">Classe processual</p><p className="req-detail-proc-value">{request.processualClass}</p></div>}
      </div>}

      <div className="req-detail-card req-detail-card--desc">
        <h3 className="req-detail-desc__title">Descrição da situação</h3>
        <p className="req-detail-desc__text">{request.description}</p>
      </div>

      {!handled
        ? <div className="req-detail-actions">
            <p className="req-detail-actions__label">Análise desta solicitação:</p>
            <Button onClick={() => setAcceptModalOpen(true)} className="req-detail-actions__btn req-detail-actions__btn--accept"><Check size={16} />Aceitar Solicitação</Button>
            <Button onClick={() => setDenyDialog(true)} className="req-detail-actions__btn req-detail-actions__btn--deny"><X size={16} />Negar Solicitação</Button>
          </div>
        : <div className={`req-detail-result ${status === "accepted" || request.status === "aceita" ? "req-detail-result--accepted" : "req-detail-result--denied"}`}>
            {status === "accepted" || request.status === "aceita"
              ? <><Check size={18} className="req-detail-result__icon req-detail-result__icon--accepted" /><div><p className="req-detail-result__title req-detail-result__title--accepted">Solicitação aceita</p><p className="req-detail-result__sub req-detail-result__sub--accepted">A solicitação foi processada.</p></div></>
              : <><X size={18} className="req-detail-result__icon req-detail-result__icon--denied" /><div><p className="req-detail-result__title req-detail-result__title--denied">Solicitação negada</p><p className="req-detail-result__sub req-detail-result__sub--denied">A solicitação foi recusada.</p></div></>}
          </div>}

      <AcceptRequestModal open={acceptModalOpen} onOpenChange={setAcceptModalOpen} request={request} onConfirmAccept={() => setStatus("accepted")} />
      <Dialog open={denyDialog} onOpenChange={setDenyDialog}>
        <DialogContent className="req-dialog">
          <DialogHeader><DialogTitle className="req-dialog__title">Negar solicitação?</DialogTitle></DialogHeader>
          <p className="req-dialog__text">Esta ação é irreversível. A solicitação será recusada permanentemente.</p>
          <DialogFooter className="req-dialog__footer">
            <button className="req-dialog__btn req-dialog__btn--outline" onClick={() => setDenyDialog(false)}>Cancelar</button>
            <button className="req-dialog__btn req-dialog__btn--danger" onClick={() => { setDenyDialog(false); setStatus("denied"); }}>Negar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}
