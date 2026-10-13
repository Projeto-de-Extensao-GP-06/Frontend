import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Building2, User, Plus, X, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { brazilStates } from "../data/mockData";
import { maskCPF, maskCNPJ, maskRG, maskPhone, maskCEP } from "../utils/masks";
import { clienteService, getClienteError } from "../services/clienteService";
import "../../styles/edit-client-page.css";

export default function EditClientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dados");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [client, setClient] = useState(null);

  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [statusClienteId, setStatusClienteId] = useState(1);
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("SP");
  const [contacts, setContacts] = useState([]);
  const [comoConheceu, setComoConheceu] = useState("INDICACAO");

  useEffect(() => {
    const loadClient = async () => {
      try {
        const data = await clienteService.getById(id);
        setClient(data);
        
        const isPF = data.type === "PF";
        setCpf(isPF ? data.cpf || "" : "");
        setRg(data.rg || "");
        setCnpj(!isPF ? data.cnpj || "" : "");
        setName(data.name || "");
        setEmail(data.email || "");
        setProfession(data.profession || "");
        setStatusClienteId(data.status?.id || 1);
        setComoConheceu(typeof data.comoConheceu === 'string' ? data.comoConheceu : data.comoConheceu?.name() || "INDICACAO");
        
        // For PF clients, load email and profession from primary contact if not at top level
        if (isPF && (!data.email || !data.profession) && data.contacts && data.contacts.length > 0) {
          const primaryContact = data.contacts.find(c => c.principal) || data.contacts[0];
          if (!data.email) setEmail(primaryContact.email || "");
          if (!data.profession) setProfession(primaryContact.profession || "");
        }
        
        if (data.address) {
          setCep(data.address.cep || "");
          setLogradouro(data.address.logradouro || "");
          setNumero(data.address.numero || "");
          setComplemento(data.address.complemento || "");
          setBairro(data.address.bairro || "");
          setCidade(data.address.cidade || "");
          setEstado(data.address.estado || "SP");
        }
        
        if (data.contacts && data.contacts.length > 0) {
          setContacts(data.contacts.map(c => ({
            ...c,
            name: c.name ?? "",
            email: c.email ?? "",
            profession: c.profession ?? "",
            phone: c.phone ? maskPhone(c.phone) : ""
          })));
        }
      } catch (e) {
        setError(getClienteError(e));
      } finally {
        setLoading(false);
      }
    };
    
    loadClient();
  }, [id]);

  const handleContactChange = (index, field, value) => {
    setContacts(prev =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleContactPhoneChange = (index, value) => {
    setContacts(prev => prev.map((c, i) => i === index ? { ...c, phone: maskPhone(value) } : c));
  };

  const handleAddContact = () => {
    setContacts(prev => [
      ...prev,
      {
        id: `contact-${Date.now()}`,
        name: "",
        email: "",
        phone: "",
        profession: "",
        isPrimary: prev.length === 0 && client?.type !== "PF"
      }
    ]);
  };

  const handleRemoveContact = (index) => {
    const contact = contacts[index];
    const isPF = client?.type === "PF";
    if (!isPF && contact?.isPrimary) return;
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const isPF = client?.type === "PF";
      
      // For PF clients, update the primary contact with email and profession from dados tab
      let updatedContacts = [...contacts];
      if (isPF && updatedContacts.length > 0) {
        const primaryIndex = updatedContacts.findIndex(c => c.principal) || 0;
        updatedContacts[primaryIndex] = {
          ...updatedContacts[primaryIndex],
          email: email,
          profession: profession
        };
      }
      
      const data = {
        type: isPF ? "PF" : "PJ",
        name,
        document: isPF ? cpf : cnpj,
        rg,
        comoConheceu,
        statusClienteId,
        address: {
          cep,
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          estado
        },
        contacts: updatedContacts.map((c, i) => ({
          name: c.name,
          email: c.email,
          phone: c.phone,
          profession: c.profession
        }))
      };
      
      await clienteService.update(id, data);
      setSaveDialogOpen(false);
      navigate(`/app/clientes/${id}`);
    } catch (e) {
      setError(getClienteError(e));
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-client-page edit-client-page--empty">
        <p className="edit-client-empty-text">Carregando cliente...</p>
      </div>;
  }

  if (!client) {
    return <div className="edit-client-page edit-client-page--empty">
        <p className="edit-client-empty-text">Cliente não encontrado.</p>
        <Button onClick={() => navigate("/app/clientes")} className="edit-client-empty-button">
          Voltar para Clientes
        </Button>
      </div>;
  }

  const isPF = client.type === "PF";
  const tabs = isPF ? [{
    key: "dados",
    label: "Dados"
  }, {
    key: "endereco",
    label: "Endereço"
  }, {
    key: "contatos",
    label: "Contatos"
  }] : [{
    key: "dados",
    label: "Empresa"
  }, {
    key: "endereco",
    label: "Endereço"
  }, {
    key: "contatos",
    label: "Contatos"
  }];

  return <div className="edit-client-page">
      {/* Breadcrumb */}
      <button onClick={() => navigate(`/app/clientes/${id}`)} className="edit-client-breadcrumb">
        <ArrowLeft size={14} />
        {client.name}
      </button>

      {/* Header */}
      <div className="edit-client-header">
        <div className={`edit-client-avatar ${isPF ? "edit-client-avatar--pf" : "edit-client-avatar--pj"}`}>
          {isPF ? <User size={20} className="edit-client-avatar-icon edit-client-avatar-icon--pf" /> : <Building2 size={20} className="edit-client-avatar-icon edit-client-avatar-icon--pj" />}
        </div>
        <div className="edit-client-header-copy">
          <p className="edit-client-kicker">Clientes › {client.name} › Editar</p>
          <h1 className="edit-client-title">
            Editar Cliente {client.type}
          </h1>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="edit-client-tabs">
        {tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`edit-client-tab ${tab === t.key ? "is-active" : ""}`}>
            {t.label}
          </button>)}
      </div>

      {/* Tab Content */}
      {tab === "dados" && <div className="edit-client-section">
          {isPF ? <>
              <Field
                label="CPF"
                value={cpf}
                onChange={(e) => setCpf(maskCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                mono
              />
              <Field
                label="RG"
                value={rg}
                onChange={(e) => setRg(maskRG(e.target.value))}
                placeholder="00.000.000-0"
                maxLength={12}
                mono
              />
              <Field label="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} />
              <Field label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              <Field label="Profissão" value={profession} onChange={(e) => setProfession(e.target.value)} />
              <Field 
                label="Como conheceu" 
                as="select"
                value={comoConheceu}
                onChange={(e) => setComoConheceu(e.target.value)}
              >
                <option value="INSTAGRAM">Instagram</option>
                <option value="SITE">Site Institucional</option>
                <option value="INDICACAO">Indicação</option>
                <option value="OUTROS">Outros</option>
              </Field>
            </> : <>
              <Field
                label="CNPJ"
                value={cnpj}
                onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                mono
              />
              <Field label="Nome / Razão Social" value={name} onChange={(e) => setName(e.target.value)} />
              <Field label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              <Field 
                label="Como conheceu" 
                as="select"
                value={comoConheceu}
                onChange={(e) => setComoConheceu(e.target.value)}
              >
                <option value="INSTAGRAM">Instagram</option>
                <option value="SITE">Site Institucional</option>
                <option value="INDICACAO">Indicação</option>
                <option value="OUTROS">Outros</option>
              </Field>
            </>}
        </div>}

      {tab === "endereco" && <div className="edit-client-section">
          <Field
            label="CEP"
            value={cep}
            onChange={(e) => setCep(maskCEP(e.target.value))}
            placeholder="00000-000"
            maxLength={9}
            mono
          />
          <Field label="Logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
          <div className="edit-client-grid edit-client-grid--2">
            <Field label="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
            <Field label="Complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
          </div>
          <Field label="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
          <div className="edit-client-grid edit-client-grid--state">
            <div className="edit-client-grid-main">
              <Field label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </div>
            <div className="edit-client-state-field">
              <Label className="edit-client-label">Estado</Label>
              <select className="edit-client-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                {brazilStates.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>}

      {tab === "contatos" && <div className="edit-client-section edit-client-section--contacts">
          {contacts.length === 0 ? <div className="edit-client-empty-card">
              <p className="edit-client-empty-text">Nenhum contato cadastrado</p>
            </div> : contacts.map((contact, i) => <div key={contact.id} className="edit-client-contact-card">
                <div className="edit-client-contact-card-header">
                  {!isPF && contact.isPrimary ? (
                    <div className="edit-client-primary-row">
                      <div className="edit-client-primary-dot" />
                      <span className="edit-client-primary-label">Contato Principal</span>
                    </div>
                  ) : (
                    <span className="edit-client-contact-card-label">
                      {!isPF
                        ? `Contato adicional ${contacts.some(c => c.isPrimary) ? i : i + 1}`
                        : contacts.length > 1
                        ? `Contato ${i + 1}`
                        : "Contato adicional"}
                    </span>
                  )}
                  {(isPF || !contact.isPrimary) && (
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(i)}
                      className="edit-client-contact-remove"
                      title="Remover contato"
                      aria-label="Remover contato"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                <Field
                  label="Nome"
                  value={contact.name}
                  onChange={(e) => handleContactChange(i, "name", e.target.value)}
                  placeholder="Nome do contato"
                />
                <Field
                  label="E-mail"
                  value={contact.email}
                  onChange={(e) => handleContactChange(i, "email", e.target.value)}
                  placeholder="email@empresa.com"
                  type="email"
                />
                <Field
                  label="Telefone"
                  value={contact.phone}
                  onChange={(e) => handleContactPhoneChange(i, e.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                <Field
                  label="Profissão / Cargo"
                  value={contact.profession}
                  onChange={(e) => handleContactChange(i, "profession", e.target.value)}
                  placeholder="Ex: Gerente, Diretor..."
                />
              </div>)}
          <button
            type="button"
            onClick={handleAddContact}
            className="edit-client-add-contact-button"
          >
            <Plus size={16} />
            Adicionar outro contato
          </button>
        </div>}

      {error && <div className="edit-client-section">
          <p className="edit-client-empty-text" style={{ color: "#dc2626" }}>{error}</p>
        </div>}

      {/* Actions */}
      <div className="edit-client-actions">
        <Button variant="outline" onClick={() => navigate(`/app/clientes/${id}`)} className="edit-client-button edit-client-button--outline">
          Cancelar
        </Button>
        <Button onClick={() => setSaveDialogOpen(true)} disabled={saving} className="edit-client-button edit-client-button--primary">
          <Save size={15} />
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>

      {/* Modal de confirmação de alteração do cliente */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="edit-client-dialog">
          <DialogHeader>
            <div className="edit-client-dialog__header">
              <div className="edit-client-dialog__icon-wrap edit-client-dialog__icon-wrap--blue">
                <CheckCircle size={24} className="edit-client-dialog__icon" />
              </div>
              <DialogTitle className="edit-client-dialog-title">Confirmar alterações do cliente</DialogTitle>
            </div>
          </DialogHeader>
          <p className="edit-client-dialog-text">
            Deseja salvar as alterações realizadas no cadastro de <strong className="edit-client-dialog__highlight">{client?.name || id}</strong>?
          </p>
          <DialogFooter className="edit-client-dialog-footer">
            <Button variant="outline" className="edit-client-dialog-button edit-client-dialog-button--outline" onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
            <Button className="edit-client-dialog-button edit-client-dialog-button--primary" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  mono = false,
  placeholder,
  maxLength,
  as = "input",
  children,
  ...props
}) {
  const Component = as;
  return <div className="edit-client-field">
      <Label className="edit-client-label">
        {label}
      </Label>
      {as === "select" ? (
        <select
          value={value}
          onChange={onChange}
          className="edit-client-input"
          {...props}
        >
          {children}
        </select>
      ) : (
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`edit-client-input ${mono ? "edit-client-input--mono" : ""}`}
          {...props}
        />
      )}
    </div>;
}
