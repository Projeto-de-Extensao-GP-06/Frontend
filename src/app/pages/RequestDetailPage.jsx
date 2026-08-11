import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Mail, Phone, Calendar, FileText, Check, X, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { StatusBadge } from "../components/StatusBadge";
import { mockRequests } from "../data/mockData";
import { useState } from "react";
import "../../styles/request-detail-page.css";
export default function RequestDetailPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const request = mockRequests.find(r => r.id === id);
  if (!request) {
    return <div className="req-detail-empty">
        <p className="req-detail-empty__text">Solicitação não encontrada.</p>
        <Button onClick={() => navigate("/app/solicitacoes")} className="req-detail-empty__btn">Voltar</Button>
      </div>;
  }
  const handled = status !== "pending" || request.status !== "pendente";
  return <div className="req-detail-page">
      <button onClick={() => navigate("/app/solicitacoes")} className="req-detail-breadcrumb">
        <ArrowLeft size={14} />Solicitações
      </button>
      <div className="req-detail-header">
        <div>
          <p className="req-detail-header__kicker">Solicitações › Detalhe</p>
          <h1 className="req-detail-header__title">{request.name}</h1>
        </div>
        <StatusBadge status={status === "accepted" ? "aceita" : status === "denied" ? "negada" : request.status} />
      </div>

      <div className="req-detail-card">
        <div className="req-detail-requester">
          <div className="req-detail-requester__avatar">
            <User size={20} className="req-detail-requester__avatar-icon" />
          </div>
          <div>
            <p className="req-detail-requester__name">{request.name}</p>
            <p className="req-detail-requester__meta">{request.state} • {request.createdAt}</p>
          </div>
        </div>
        <div className="req-detail-info-list">
          <div className="req-detail-info-row">
            <Mail size={14} className="req-detail-info-row__icon" />
            <span className="req-detail-info-row__value">{request.email}</span>
          </div>
          <div className="req-detail-info-row">
            <Phone size={14} className="req-detail-info-row__icon" />
            <span className="req-detail-info-row__value">{request.phone}</span>
          </div>
          <div className="req-detail-info-row">
            <Calendar size={14} className="req-detail-info-row__icon" />
            <span className="req-detail-info-row__value">Solicitado em {request.createdAt}</span>
          </div>
          {request.processNumber && <div className="req-detail-info-row">
              <FileText size={14} className="req-detail-info-row__icon" />
              <span className="req-detail-info-row__value req-detail-info-row__value--mono">{request.processNumber}</span>
            </div>}
        </div>
      </div>

      {request.processNumber && <div className="req-detail-card">
          <div className="req-detail-process-header">
            <FileText size={16} className="req-detail-process-header__icon" />
            <h3 className="req-detail-process-header__title">Informações do Processo</h3>
          </div>
          <div className="req-detail-proc-grid">
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

      {status === "pending" && request.status === "pendente"
        ? <div className="req-detail-actions">
            <p className="req-detail-actions__label">Análise desta solicitação:</p>
            <Button onClick={() => setStatus("accepted")} className="req-detail-actions__btn req-detail-actions__btn--accept"><Check size={16} />Aceitar Solicitação</Button>
            <Button onClick={() => setStatus("denied")} className="req-detail-actions__btn req-detail-actions__btn--deny"><X size={16} />Negar Solicitação</Button>
          </div>
        : <div className={`req-detail-result ${status === "accepted" || request.status === "aceita" ? "req-detail-result--accepted" : "req-detail-result--denied"}`}>
            {status === "accepted" || request.status === "aceita"
              ? <><Check size={18} className="req-detail-result__icon req-detail-result__icon--accepted" /><div><p className="req-detail-result__title req-detail-result__title--accepted">Solicitação aceita</p><p className="req-detail-result__sub req-detail-result__sub--accepted">O cliente será contatado em breve.</p></div></>
              : <><X size={18} className="req-detail-result__icon req-detail-result__icon--denied" /><div><p className="req-detail-result__title req-detail-result__title--denied">Solicitação negada</p><p className="req-detail-result__sub req-detail-result__sub--denied">A solicitação foi recusada.</p></div></>}
          </div>}
    </div>;
}