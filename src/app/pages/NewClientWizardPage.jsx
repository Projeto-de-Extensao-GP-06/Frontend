import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, User, Plus, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { brazilStates } from "../data/mockData";
import { maskCPF, maskCNPJ, maskRG, maskPhone, maskCEP } from "../utils/masks";
import "../../styles/new-client-wizard-page.css";
import "../../styles/edit-client-page.css";
const pfSteps = [{
  label: "Cliente",
  key: "client"
}, {
  label: "Endereço",
  key: "address"
}];
const pjSteps = [{
  label: "Empresa",
  key: "company"
}, {
  label: "Endereço",
  key: "address"
}, {
  label: "Contatos",
  key: "contacts"
}];
function StepIndicator({ steps, current }) {
  return <div className="wizard-steps">
      {steps.map((step, i) => <div key={step.key} className="wizard-steps__item">
          <div className="wizard-steps__node">
            <div className={`wizard-steps__circle ${i < current ? "wizard-steps__circle--done" : i === current ? "wizard-steps__circle--active" : "wizard-steps__circle--pending"}`}>
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className={`wizard-steps__label ${i === current ? "wizard-steps__label--active" : ""}`}>{step.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`wizard-steps__connector ${i < current ? "wizard-steps__connector--done" : ""}`} />}
        </div>)}
    </div>;
}

export default function NewClientWizardPage() {
  useEffect(() => {
    document.title = "Novo Cliente";
  }, []);

  const navigate = useNavigate();
  const [clientType, setClientType] = useState(null);
  const [step, setStep] = useState(0);

  // PF states
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [pfName, setPfName] = useState("");
  const [pfEmail, setPfEmail] = useState("");
  const [pfPhone, setPfPhone] = useState("");
  const [pfProfession, setPfProfession] = useState("");
  const [pfExtraContacts, setPfExtraContacts] = useState([]);

  // PJ states
  const [cnpj, setCnpj] = useState("");
  const [pjCompanyName, setPjCompanyName] = useState("");
  const [pjPrimaryName, setPjPrimaryName] = useState("");
  const [pjPrimaryEmail, setPjPrimaryEmail] = useState("");
  const [pjPrimaryPhone, setPjPrimaryPhone] = useState("");
  const [pjPrimaryProfession, setPjPrimaryProfession] = useState("");
  const [pjExtraContacts, setPjExtraContacts] = useState([]);

  // Shared address states
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState(brazilStates[0] || "SP");

  const steps = clientType === "PF" ? pfSteps : clientType === "PJ" ? pjSteps : [];
  const isLastStep = step === steps.length - 1;

  // PF extra contact helpers
  const handleAddPfExtraContact = () => {
    setPfExtraContacts(prev => [
      ...prev,
      { id: Date.now(), name: "", email: "", phone: "", profession: "" }
    ]);
  };

  const handleUpdatePfExtraContact = (id, field, value) => {
    setPfExtraContacts(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemovePfExtraContact = (id) => {
    setPfExtraContacts(prev => prev.filter(c => c.id !== id));
  };

  // PJ extra contact helpers
  const handleAddPjExtraContact = () => {
    setPjExtraContacts(prev => [
      ...prev,
      { id: Date.now(), name: "", email: "", phone: "", profession: "" }
    ]);
  };

  const handleUpdatePjExtraContact = (id, field, value) => {
    setPjExtraContacts(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemovePjExtraContact = (id) => {
    setPjExtraContacts(prev => prev.filter(c => c.id !== id));
  };

  if (!clientType) {
    return <div className="wizard-page">
        <button onClick={() => navigate("/app/clientes")} className="edit-client-breadcrumb">
          <ArrowLeft size={14} />
          Clientes
        </button>
        <h1 className="edit-client-title" style={{marginBottom:'0.5rem'}}>Novo Cliente</h1>
        <p className="edit-client-kicker" style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:'2rem'}}>Selecione o tipo de documento do cliente:</p>
        <div className="wizard-type-grid">
          <button onClick={() => { setClientType("PF"); setStep(0); }} className="wizard-type-btn wizard-type-btn--pf">
            <div className="wizard-type-btn__badge wizard-type-btn__badge--pf">
              <span className="wizard-type-btn__badge-text">CPF</span>
            </div>
            <div>
              <p className="wizard-type-btn__title">Pessoa Física</p>
              <p className="wizard-type-btn__sub">Documento CPF</p>
            </div>
          </button>
          <button onClick={() => { setClientType("PJ"); setStep(0); }} className="wizard-type-btn wizard-type-btn--pj">
            <div className="wizard-type-btn__badge wizard-type-btn__badge--pj">
              <span className="wizard-type-btn__badge-text wizard-type-btn__badge-text--pj">CNPJ</span>
            </div>
            <div>
              <p className="wizard-type-btn__title">Pessoa Jurídica</p>
              <p className="wizard-type-btn__sub">Documento CNPJ</p>
            </div>
          </button>
        </div>
      </div>;
  }

  const handleNext = () => {
    if (isLastStep) {
      navigate("/app/clientes");
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      setClientType(null);
    } else {
      setStep(s => s - 1);
    }
  };

  return <div className="wizard-page">
      <button onClick={handleBack} className="edit-client-breadcrumb">
        <ArrowLeft size={14} />
        {step === 0 ? "Tipo de Cliente" : steps[step - 1]?.label}
      </button>
      <div className="edit-client-header" style={{marginBottom:'0.5rem'}}>
        <div className="edit-client-header-copy">
          <p className="edit-client-kicker">Clientes › Novo Cliente</p>
          <h1 className="edit-client-title">{clientType === "PF" ? "Novo Cliente PF" : "Novo Cliente PJ"}</h1>
          <p className="edit-client-kicker" style={{color:'#6b7280'}}>
            {step === 0 ? "Preencha os dados do cliente:" : step === 1 && steps.length > 2 ? "Informe o endereço da empresa:" : step === 1 ? "Informe o endereço do cliente:" : "Adicione os contatos da empresa:"}
          </p>
        </div>
      </div>
      <StepIndicator steps={steps} current={step} onStepClick={(i) => setStep(i)} />

      <div className="edit-client-section">
        {clientType === "PF" && step === 0 && <>
            <FormField
              label="CPF"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              mono
            />
            <FormField
              label="RG"
              value={rg}
              onChange={(e) => setRg(maskRG(e.target.value))}
              placeholder="00.000.000-0"
              maxLength={12}
              mono
            />
            <FormField
              label="Nome Completo"
              value={pfName}
              onChange={(e) => setPfName(e.target.value)}
              placeholder="Nome do cliente"
            />
            <FormField
              label="E-mail"
              value={pfEmail}
              onChange={(e) => setPfEmail(e.target.value)}
              placeholder="email@exemplo.com"
              type="email"
            />
            <FormField
              label="Telefone"
              value={pfPhone}
              onChange={(e) => setPfPhone(maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
            <FormField
              label="Profissão"
              value={pfProfession}
              onChange={(e) => setPfProfession(e.target.value)}
              placeholder="Ex: Engenheiro, Médico..."
            />
            {pfExtraContacts.map(contact => <div key={contact.id} className="wizard-extra-contact">
                <div className="wizard-extra-contact__header">
                  <p className="wizard-extra-contact__label">Contato adicional</p>
                  <button onClick={() => handleRemovePfExtraContact(contact.id)} className="wizard-extra-contact__remove"><X size={15} /></button>
                </div>
                <FormField
                  label="Nome"
                  value={contact.name}
                  onChange={(e) => handleUpdatePfExtraContact(contact.id, "name", e.target.value)}
                  placeholder="Nome do contato"
                />
                <FormField
                  label="E-mail"
                  value={contact.email}
                  onChange={(e) => handleUpdatePfExtraContact(contact.id, "email", e.target.value)}
                  placeholder="email@empresa.com"
                  type="email"
                />
                <FormField
                  label="Telefone"
                  value={contact.phone}
                  onChange={(e) => handleUpdatePfExtraContact(contact.id, "phone", maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                <FormField
                  label="Profissão / Cargo"
                  value={contact.profession}
                  onChange={(e) => handleUpdatePfExtraContact(contact.id, "profession", e.target.value)}
                  placeholder="Ex: Gerente..."
                />
              </div>)}
            <button onClick={handleAddPfExtraContact} className="edit-client-add-contact-button">+ Adicionar outro contato</button>
          </>}

        {clientType === "PF" && step === 1 && <>
            <FormField
              label="CEP"
              value={cep}
              onChange={(e) => setCep(maskCEP(e.target.value))}
              placeholder="00000-000"
              maxLength={9}
              mono
            />
            <FormField
              label="Logradouro"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Rua, Avenida..."
            />
            <div className="edit-client-grid edit-client-grid--2">
              <FormField
                label="Número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="00"
                type="number"
                min="0"
              />
              <FormField
                label="Complemento"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Apto, Sala..."
              />
            </div>
            <FormField
              label="Bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Bairro"
            />
            <div className="edit-client-grid edit-client-grid--state">
              <div className="edit-client-grid-main">
                <FormField
                  label="Cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div className="edit-client-state-field">
                <Label className="edit-client-label">Estado</Label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="edit-client-select"
                >
                  {brazilStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </>}

        {clientType === "PJ" && step === 0 && <>
            <FormField
              label="CNPJ"
              value={cnpj}
              onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              mono
            />
            <FormField
              label="Nome / Razão Social"
              value={pjCompanyName}
              onChange={(e) => setPjCompanyName(e.target.value)}
              placeholder="Nome da empresa"
            />
          </>}

        {clientType === "PJ" && step === 1 && <>
            <FormField
              label="CEP"
              value={cep}
              onChange={(e) => setCep(maskCEP(e.target.value))}
              placeholder="00000-000"
              maxLength={9}
              mono
            />
            <FormField
              label="Logradouro"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Rua, Avenida..."
            />
            <div className="edit-client-grid edit-client-grid--2">
              <FormField
                label="Número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="00"
                type="number"
                min="0"
              />
              <FormField
                label="Complemento"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Sala, Andar..."
              />
            </div>
            <FormField
              label="Bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Bairro"
            />
            <div className="edit-client-grid edit-client-grid--state">
              <div className="edit-client-grid-main">
                <FormField
                  label="Cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div className="edit-client-state-field">
                <Label className="edit-client-label">Estado</Label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="edit-client-select"
                >
                  {brazilStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </>}

        {clientType === "PJ" && step === 2 && <>
            <div className="wizard-contact-primary"><p className="wizard-contact-primary__label">Contato Principal</p></div>
            <FormField
              label="Nome"
              value={pjPrimaryName}
              onChange={(e) => setPjPrimaryName(e.target.value)}
              placeholder="Nome do contato"
            />
            <FormField
              label="E-mail"
              value={pjPrimaryEmail}
              onChange={(e) => setPjPrimaryEmail(e.target.value)}
              placeholder="email@empresa.com"
              type="email"
            />
            <FormField
              label="Telefone"
              value={pjPrimaryPhone}
              onChange={(e) => setPjPrimaryPhone(maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
            <FormField
              label="Profissão / Cargo"
              value={pjPrimaryProfession}
              onChange={(e) => setPjPrimaryProfession(e.target.value)}
              placeholder="Ex: Diretor, Gerente..."
            />
            {pjExtraContacts.map(contact => <div key={contact.id} className="wizard-extra-contact">
                <div className="wizard-extra-contact__header">
                  <p className="wizard-extra-contact__label">Contato adicional</p>
                  <button onClick={() => handleRemovePjExtraContact(contact.id)} className="wizard-extra-contact__remove"><X size={15} /></button>
                </div>
                <FormField
                  label="Nome"
                  value={contact.name}
                  onChange={(e) => handleUpdatePjExtraContact(contact.id, "name", e.target.value)}
                  placeholder="Nome do contato"
                />
                <FormField
                  label="E-mail"
                  value={contact.email}
                  onChange={(e) => handleUpdatePjExtraContact(contact.id, "email", e.target.value)}
                  placeholder="email@empresa.com"
                  type="email"
                />
                <FormField
                  label="Telefone"
                  value={contact.phone}
                  onChange={(e) => handleUpdatePjExtraContact(contact.id, "phone", maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                <FormField
                  label="Profissão / Cargo"
                  value={contact.profession}
                  onChange={(e) => handleUpdatePjExtraContact(contact.id, "profession", e.target.value)}
                  placeholder="Ex: Gerente..."
                />
              </div>)}
            <button onClick={handleAddPjExtraContact} className="edit-client-add-contact-button">+ Adicionar outro contato</button>
          </>}
      </div>

      <div className="edit-client-actions">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="edit-client-button edit-client-button--outline"
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/app/clientes")}
            className="edit-client-button edit-client-button--outline"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="button"
          onClick={handleNext}
          className="edit-client-button edit-client-button--primary"
        >
          {isLastStep ? <><User size={16} />Criar cliente</> : <>Próximo<ArrowRight size={16} /></>}
        </Button>
      </div>
    </div>;
}
function FormField({ label, placeholder, type = "text", mono = false, value = "", onChange, maxLength, ...props }) {
  return <div className="edit-client-field">
      <Label className="edit-client-label">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={`edit-client-input ${mono ? "edit-client-input--mono" : ""}`}
        {...props}
      />
    </div>;
}