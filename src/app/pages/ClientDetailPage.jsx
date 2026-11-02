import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { User, Building2, Mail, Phone, MapPin, Briefcase, ChevronRight, Plus, Pencil, Trash2, ArrowLeft, Calendar, FileText, Scale, Search, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { StatusBadge, PriorityBadge, PhaseBadge } from "../components/StatusBadge";
import { InfoRow } from "../components/InfoRow";
import { PaginationBar } from "../components/PaginationBar";
import { maskPhone } from "../utils/masks";
import { clienteService, getClienteError } from "../services/clienteService";
import { listarProcessosDoCliente } from "../services/processoService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../utils/permissions";
import "../../styles/client-detail-page.css";

export default function ClientDetailPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEditClient = hasPermission(user, "EDITAR CLIENTE");
  const canDeleteClient = hasPermission(user, "EXCLUIR CLIENTE");

  const [client, setClient] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [clientProcesses, setClientProcesses] = useState([]);
  const [processesLoading, setProcessesLoading] = useState(true);
  const [processesError, setProcessesError] = useState("");
  const [processesReload, setProcessesReload] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [addContactDialog, setAddContactDialog] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    profession: ""
  });

  const [contacts, setContacts] = useState([]);
  const [contactSearchInput, setContactSearchInput] = useState("");
  const [appliedContactSearch, setAppliedContactSearch] = useState("");
  const [contactPage, setContactPage] = useState(1);
  const CONTACTS_PAGE_SIZE = 3;

  useEffect(() => {
    let active = true;
    setClient(null);
    setLoadError("");

    clienteService.getById(id)
      .then((loadedClient) => {
        if (!active) return;
        setClient(loadedClient);
        setContacts(loadedClient.contacts || []);
        document.title = `SGPJ | Cliente - ${loadedClient.name}`;
      })
      .catch((requestError) => {
        if (active) setLoadError(getClienteError(requestError));
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    setClientProcesses([]);
    setProcessesLoading(true);
    setProcessesError("");

    listarProcessosDoCliente(id)
      .then((processes) => {
        if (active) setClientProcesses(processes);
      })
      .catch((requestError) => {
        if (active) {
          setProcessesError(requestError.message || "Não foi possível carregar os processos.");
        }
      })
      .finally(() => {
        if (active) setProcessesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, processesReload]);

  if (!client) {
    if (!loadError) return <div className="client-detail-page client-detail-page--empty"><p className="client-detail-empty-text">Carregando cliente...</p></div>;
    return <div className="client-detail-page client-detail-page--empty">
        <p className="client-detail-empty-text">{loadError}</p>
        <Button onClick={() => navigate("/app/clientes")} className="client-detail-empty-button">
          Voltar para Clientes
        </Button>
      </div>;
  }
  const isPF = client.type === "PF";
  const pf = client;
  const pj = client;

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setAppliedContactSearch(contactSearchInput);
    setContactPage(1);
  };

  const handleClearSearch = () => {
    setContactSearchInput("");
    setAppliedContactSearch("");
    setContactPage(1);
  };

  const filteredContacts = contacts.filter(contact => {
    if (!appliedContactSearch.trim()) return true;
    const term = appliedContactSearch.toLowerCase().trim();
    return (
      contact.name?.toLowerCase().includes(term) ||
      contact.email?.toLowerCase().includes(term) ||
      contact.phone?.toLowerCase().includes(term) ||
      contact.profession?.toLowerCase().includes(term)
    );
  });

  const totalContactPages = Math.max(1, Math.ceil(filteredContacts.length / CONTACTS_PAGE_SIZE));
  const safeContactPage = Math.min(contactPage, totalContactPages);
  const paginatedContacts = filteredContacts.slice(
    (safeContactPage - 1) * CONTACTS_PAGE_SIZE,
    safeContactPage * CONTACTS_PAGE_SIZE
  );

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
          <Button
            type="button"
            onClick={() => canEditClient && setAddContactDialog(true)}
            disabled={!canEditClient}
            title={canEditClient ? "Adicionar contato" : "Sem permissão para editar cliente"}
            className="button button--default button--default-size"
          >
            <Plus size={13} />
            Adicionar contato
          </Button>
        </div>

        {/* Contact Search Form */}
        {(contacts.length > 0 || appliedContactSearch || contactSearchInput) && (
          <form onSubmit={handleSearchSubmit} className="client-detail-search-row">
            <div className="client-detail-search-wrap">
              <Search size={14} className="client-detail-search-icon" />
              <input
                type="text"
                placeholder="Buscar contato por nome, e-mail, telefone..."
                value={contactSearchInput}
                onChange={(e) => {
                  setContactSearchInput(e.target.value);
                  if (e.target.value === "") {
                    setAppliedContactSearch("");
                    setContactPage(1);
                  }
                }}
                className="client-detail-search-input"
              />
              {contactSearchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="client-detail-search-clear"
                  title="Limpar busca"
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="client-detail-search-btn">
              Buscar
            </button>
          </form>
        )}

        {contacts.length === 0 ? (
          <p className="client-detail-empty-inline">Nenhum contato adicionado</p>
        ) : filteredContacts.length === 0 ? (
          <p className="client-detail-empty-inline">
            Nenhum contato encontrado para &ldquo;{appliedContactSearch}&rdquo;
          </p>
        ) : (
          <div className="client-detail-contact-list">
            {paginatedContacts.map((contact, i) => (
              <div
                key={contact.id}
                className={`client-detail-contact-item ${i > 0 ? "client-detail-contact-item--separated" : ""}`}
              >
                {!isPF && contact.isPrimary && <span className="client-detail-primary-tag">Principal</span>}
                <div className="client-detail-info-list client-detail-info-list--compact">
                  <InfoRow label="Nome" value={contact.name || "—"} />
                  {contact.email && <InfoRow label="E-mail" value={contact.email} icon={<Mail size={13} />} />}
                  {contact.phone && <InfoRow label="Telefone" value={contact.phone} icon={<Phone size={13} />} />}
                  {contact.profession && <InfoRow label="Profissão" value={contact.profession} icon={<Briefcase size={13} />} />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalContactPages > 1 && (
          <div className="client-detail-pagination-wrap">
            <PaginationBar
              page={safeContactPage}
              total={totalContactPages}
              onPage={setContactPage}
            />
          </div>
        )}
      </div>

      {/* Processes */}
      <div className="client-detail-processes">
        <h2 className="client-detail-processes-title">
          Processos do cliente
        </h2>
        {processesLoading ? <div className="client-detail-empty-card">
            <p className="client-detail-empty-inline">Carregando processos...</p>
          </div> : processesError ? <div className="client-detail-empty-card">
            <Scale size={28} className="client-detail-empty-icon" />
            <p className="client-detail-empty-inline" role="alert">
              Não foi possível carregar os processos: {processesError}
            </p>
            <Button type="button" onClick={() => setProcessesReload((reload) => reload + 1)}>
              Tentar novamente
            </Button>
          </div> : clientProcesses.length === 0 ? <div className="client-detail-empty-card">
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
        <button
          onClick={() => canEditClient && navigate(`/app/clientes/${id}/editar`)}
          className="client-detail-actions__btn client-detail-actions__btn--primary"
          disabled={!canEditClient}
          title={canEditClient ? "Editar Cliente" : "Sem permissão para editar cliente"}
        >
          <Pencil size={15} />Editar Cliente
        </button>
        <button
          onClick={() => canDeleteClient && setDeleteDialog(true)}
          className="client-detail-actions__btn client-detail-actions__btn--danger"
          disabled={!canDeleteClient}
          title={canDeleteClient ? "Excluir" : "Sem permissão para excluir cliente"}
        >
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
            clienteService.remove(id).then(() => navigate("/app/clientes")).catch((requestError) => setLoadError(getClienteError(requestError)));
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
