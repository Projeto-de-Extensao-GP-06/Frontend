import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { User, Building2, Mail, Phone, MapPin, Briefcase, ChevronRight, Plus, Pencil, Trash2, ArrowLeft, Calendar, FileText, Scale } from "lucide-react";
import { Button } from "../components/ui/button";
import { StatusBadge, PriorityBadge, PhaseBadge } from "../components/StatusBadge";
import { mockClients, mockProcesses } from "../data/mockData";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import "../../styles/client-detail-page.css";
export default function ClientDetailPage() {
  useEffect(() => {
    document.title = `Cliente - ${client.name}`;
  }, []);

  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const client = mockClients.find(c => c.id === id);
  if (!client) {
    return <div className="client-detail-page client-detail-page--empty">
        <p className="client-detail-empty-text">Cliente não encontrado.</p>
        <Button onClick={() => navigate("/app/clientes")} className="client-detail-empty-button">
          Voltar para Clientes
        </Button>
      </div>;
  }
  const isPF = client.type === "PF";
  const pf = client;
  const pj = client;
  const clientProcesses = mockProcesses.filter(p => p.clientId === id);
  return <div className="client-detail-page">
      {/* Breadcrumb */}
      <button onClick={() => navigate("/app/clientes")} className="client-detail-breadcrumb">
        <ArrowLeft size={14} />
        Clientes
      </button>

      {/* Client Header */}
      <div className="client-detail-card client-detail-card--header">
        <div className="client-detail-header-row">
          <div className={`client-detail-avatar ${isPF ? "client-detail-avatar--pf" : "client-detail-avatar--pj"}`}>
            {isPF ? <User size={24} className="client-detail-avatar-icon client-detail-avatar-icon--pf" /> : <Building2 size={24} className="client-detail-avatar-icon client-detail-avatar-icon--pj" />}
          </div>
          <div className="client-detail-header-body">
            <div className="client-detail-header-title-row">
              <h1 className="client-detail-title">
                {client.name}
              </h1>
            </div>
            <div className="client-detail-header-meta">
              <span className={`client-detail-type-badge ${isPF ? "client-detail-type-badge--pf" : "client-detail-type-badge--pj"}`}>
                {client.type}
              </span>
              <StatusBadge status={client.status} />
            </div>
          </div>
        </div>

        {/* Info fields */}
        <div className="client-detail-info-list">
          <InfoRow label={isPF ? "CPF" : "CNPJ"} value={isPF ? pf.cpf : pj.cnpj} mono />
          {isPF && <InfoRow label="RG" value={pf.rg} mono />}
          <InfoRow label="E-mail" value={client.email} icon={<Mail size={13} />} />
          {isPF && <InfoRow label="Telefone" value={pf.phone} icon={<Phone size={13} />} />}
          {isPF && <InfoRow label="Profissão" value={pf.profession} icon={<Briefcase size={13} />} />}
        </div>

        {/* Edit button */}
        <Button onClick={() => navigate(`/app/clientes/${id}/editar`)} variant="outline" className="client-detail-outline-button">
          <Pencil size={14} />
          Editar dados
        </Button>
      </div>

      {/* Address */}
      <div className="client-detail-card">
        <div className="client-detail-section-header">
          <div className="client-detail-section-icon">
            <MapPin size={15} className="client-detail-section-icon-symbol" />
          </div>
          <h2 className="client-detail-section-title">Endereço</h2>
        </div>
        <div className="client-detail-info-list">
          <InfoRow label="CEP" value={client.address.cep} mono />
          <InfoRow label="Logradouro" value={`${client.address.logradouro}, ${client.address.numero}`} />
          <InfoRow label="Bairro" value={client.address.bairro} />
          <InfoRow label="Cidade" value={`${client.address.cidade} — ${client.address.estado}`} />
          {client.address.complemento && <InfoRow label="Complemento" value={client.address.complemento} />}
        </div>
      </div>

      {/* Contacts */}
      <div className="client-detail-card">
        <div className="client-detail-section-toolbar">
          <div className="client-detail-section-header">
            <div className="client-detail-section-icon">
              <Phone size={15} className="client-detail-section-icon-symbol" />
            </div>
            <h2 className="client-detail-section-title">Contatos</h2>
          </div>
          <button className="client-detail-add-contact-button">
            <Plus size={13} />
            Add contato
          </button>
        </div>

        {client.contacts.length === 0 ? <p className="client-detail-empty-inline">Nenhum contato adicionado</p> : <div className="client-detail-contact-list">
            {client.contacts.map((contact, i) => <div key={contact.id} className={`client-detail-contact-item ${i > 0 ? "client-detail-contact-item--separated" : ""}`}>
                {contact.isPrimary && <span className="client-detail-primary-tag">Principal</span>}
                <div className="client-detail-info-list client-detail-info-list--compact">
                  <InfoRow label="Nome" value={contact.name} />
                  <InfoRow label="E-mail" value={contact.email} icon={<Mail size={13} />} />
                  <InfoRow label="Telefone" value={contact.phone} icon={<Phone size={13} />} />
                  <InfoRow label="Profissão" value={contact.profession} icon={<Briefcase size={13} />} />
                </div>
              </div>)}
          </div>}
      </div>

      {/* Processes */}
      <div className="client-detail-processes">
        <h2 className="client-detail-processes-title">
          Processos do cliente
        </h2>
        {clientProcesses.length === 0 ? <div className="client-detail-empty-card">
            <Scale size={28} className="client-detail-empty-icon" />
            <p className="client-detail-empty-inline">Nenhum processo vinculado</p>
          </div> : <div className="client-detail-process-list">
            {clientProcesses.map(process => <div key={process.id} className="client-detail-process-card" onClick={() => navigate(`/app/processos/${process.id}`)}>
                <div className="client-detail-process-card-head">
                  <p className="client-detail-process-cnj">
                    {process.cnj}
                  </p>
                  <ChevronRight size={15} className="client-detail-process-chevron" />
                </div>
                {process.hearingDate !== "—" && <div className="client-detail-hearing-row">
                    <Calendar size={11} />
                    <span>Audiência: {process.hearingDate}</span>
                  </div>}
                <div className="client-detail-process-badges">
                  <StatusBadge status={process.status} />
                  <PriorityBadge priority={process.priority} />
                  <PhaseBadge phase={process.phase} />
                </div>
              </div>)}
          </div>}
      </div>

      {/* Delete */}
      <Button onClick={() => setDeleteDialog(true)} className="client-detail-delete-button">
        <Trash2 size={15} />
        Excluir Cliente
      </Button>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="client-detail-dialog">
          <DialogHeader>
            <DialogTitle className="client-detail-dialog-title">Excluir cliente?</DialogTitle>
          </DialogHeader>
          <p className="client-detail-dialog-text">
            Esta ação é irreversível. Todos os dados do cliente serão removidos permanentemente.
          </p>
          <DialogFooter className="client-detail-dialog-footer">
            <Button variant="outline" className="client-detail-dialog-button client-detail-dialog-button--outline" onClick={() => setDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button className="client-detail-dialog-button client-detail-dialog-button--danger" onClick={() => {
            setDeleteDialog(false);
            navigate("/app/clientes");
          }}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}
function InfoRow({
  label,
  value,
  mono = false,
  icon
}) {
  return <div className="client-detail-info-row">
      {icon && <span className="client-detail-info-icon">{icon}</span>}
      <div className="client-detail-info-body">
        <p className="client-detail-info-label">{label}</p>
        <p className={`client-detail-info-value ${mono ? "client-detail-info-value--mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>;
}