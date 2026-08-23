import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { User, Building2, Mail, Phone, MapPin, Briefcase, ChevronRight, Plus, Pencil, Trash2, ArrowLeft, Calendar, FileText, Scale } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { StatusBadge, PriorityBadge, PhaseBadge } from "../components/StatusBadge";
import { mockClients, mockProcesses } from "../data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import "../../styles/client-detail-page.css";

const maskPhone = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export default function ClientDetailPage() {
  useEffect(() => {
    document.title = `Cliente - ${client.name}`;
  }, []);

  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [addContactDialog, setAddContactDialog] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    profession: ""
  });

  const client = mockClients.find(c => c.id === id);
  const [contacts, setContacts] = useState(() => (client?.contacts ? [...client.contacts] : []));

  useEffect(() => {
    if (client) {
      document.title = `Cliente - ${client.name}`;
    }
  }, [client]);

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

  const isFormValid =
    Boolean(newContact.name.trim()) &&
    Boolean(newContact.email.trim()) &&
    Boolean(newContact.phone.trim()) &&
    Boolean(newContact.profession.trim());

  const handleAddContact = (e) => {
    e?.preventDefault();
    if (!isFormValid) return;
    setContacts(prev => [
      ...prev,
      {
        id: `ct-${Date.now()}`,
        name: newContact.name.trim(),
        email: newContact.email.trim(),
        phone: newContact.phone.trim(),
        profession: newContact.profession.trim(),
        isPrimary: prev.length === 0 && !isPF
      }
    ]);
    setNewContact({ name: "", email: "", phone: "", profession: "" });
    setAddContactDialog(false);
  };
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
          {isPF && <InfoRow label="E-mail" value={pf.email || contacts.find(c => c.isPrimary)?.email} icon={<Mail size={13} />} />}
          {isPF && <InfoRow label="Telefone" value={pf.phone || contacts.find(c => c.isPrimary)?.phone} icon={<Phone size={13} />} />}
          {isPF && <InfoRow label="Profissão" value={pf.profession || contacts.find(c => c.isPrimary)?.profession} icon={<Briefcase size={13} />} />}
        </div>
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
            <h2 className="client-detail-section-title">{isPF ? "Contatos adicionais" : "Contatos"}</h2>
          </div>
          <button
            type="button"
            onClick={() => setAddContactDialog(true)}
            className="client-detail-add-contact-button"
          >
            <Plus size={13} />
            Adicionar contato
          </button>
        </div>

        {contacts.length === 0 ? <p className="client-detail-empty-inline">Nenhum contato adicionado</p> : <div className="client-detail-contact-list">
            {contacts.map((contact, i) => <div key={contact.id} className={`client-detail-contact-item ${i > 0 ? "client-detail-contact-item--separated" : ""}`}>
                {!isPF && contact.isPrimary && <span className="client-detail-primary-tag">Principal</span>}
                <div className="client-detail-info-list client-detail-info-list--compact">
                  <InfoRow label="Nome" value={contact.name || "—"} />
                  {contact.email && <InfoRow label="E-mail" value={contact.email} icon={<Mail size={13} />} />}
                  {contact.phone && <InfoRow label="Telefone" value={contact.phone} icon={<Phone size={13} />} />}
                  {contact.profession && <InfoRow label="Profissão" value={contact.profession} icon={<Briefcase size={13} />} />}
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

      {/* Actions */}
      <div className="client-detail-actions">
        <button onClick={() => navigate(`/app/clientes/${id}/editar`)} className="client-detail-actions__btn client-detail-actions__btn--primary">
          <Pencil size={15} />Editar Cliente
        </button>
        <button onClick={() => setDeleteDialog(true)} className="client-detail-actions__btn client-detail-actions__btn--danger">
          <Trash2 size={15} />Excluir
        </button>
      </div>

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

      {/* Add Contact Dialog */}
      <Dialog open={addContactDialog} onOpenChange={setAddContactDialog}>
        <DialogContent className="client-detail-add-dialog">
          <DialogHeader>
            <DialogTitle className="client-detail-dialog-title">Adicionar Novo Contato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddContact} className="client-detail-dialog-form">
            <div className="client-detail-form-field">
              <Label className="client-detail-form-label">Nome Completo</Label>
              <Input
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do contato"
                className="client-detail-form-input"
                autoFocus
              />
            </div>
            <div className="client-detail-form-field">
              <Label className="client-detail-form-label">E-mail</Label>
              <Input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
                className="client-detail-form-input"
              />
            </div>
            <div className="client-detail-form-field">
              <Label className="client-detail-form-label">Telefone</Label>
              <Input
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: maskPhone(e.target.value) }))}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="client-detail-form-input"
              />
            </div>
            <div className="client-detail-form-field">
              <Label className="client-detail-form-label">Profissão / Cargo</Label>
              <Input
                value={newContact.profession}
                onChange={(e) => setNewContact(prev => ({ ...prev, profession: e.target.value }))}
                placeholder="Ex: Gerente, Diretor..."
                className="client-detail-form-input"
              />
            </div>
            <DialogFooter className="client-detail-dialog-footer" style={{ marginTop: "0.5rem" }}>
              <Button
                type="button"
                variant="outline"
                className="client-detail-dialog-button client-detail-dialog-button--outline"
                onClick={() => setAddContactDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid}
                className="client-detail-dialog-button client-detail-dialog-button--primary"
              >
                <Plus size={15} />
                Salvar contato
              </Button>
            </DialogFooter>
          </form>
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