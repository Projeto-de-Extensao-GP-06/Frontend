import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, User, Plus, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { brazilStates } from "../data/mockData";
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

const maskCPF = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const maskCNPJ = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const maskRG = (value) => {
  if (!value) return "";
  const cleaned = value.replace(/[^0-9a-zA-Z]/g, "").slice(0, 9).toUpperCase();
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
};

const maskPhone = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const maskCEP = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export default function NewClientWizardPage() {
  useEffect(() => {
    document.title = "Novo Cliente";
  }, []);

  const navigate = useNavigate();
  const [clientType, setClientType] = useState(null);
  const [step, setStep] = useState(0);
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [pfPhone, setPfPhone] = useState("");
  const [pjPrimaryPhone, setPjPrimaryPhone] = useState("");
  const [cep, setCep] = useState("");
  const [extraContacts, setExtraContacts] = useState([]);
  const [extraPhones, setExtraPhones] = useState({});
  const steps = clientType === "PF" ? pfSteps : clientType === "PJ" ? pjSteps : [];
  const isLastStep = step === steps.length - 1;

  const handleExtraPhoneChange = (id, value) => {
    setExtraPhones(prev => ({ ...prev, [id]: maskPhone(value) }));
  };

  const handleRemoveExtraContact = (id) => {
    setExtraContacts(prev => prev.filter(i => i !== id));
    setExtraPhones(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
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
          <button onClick={() => setClientType("PF")} className="wizard-type-btn wizard-type-btn--pf">
            <div className="wizard-type-btn__badge wizard-type-btn__badge--pf">
              <span className="wizard-type-btn__badge-text">CPF</span>
            </div>
            <div>
              <p className="wizard-type-btn__title">Pessoa Física</p>
              <p className="wizard-type-btn__sub">Documento CPF</p>
            </div>
          </button>
          <button onClick={() => setClientType("PJ")} className="wizard-type-btn wizard-type-btn--pj">
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
      setCpf("");
      setRg("");
      setCnpj("");
      setPfPhone("");
      setPjPrimaryPhone("");
      setCep("");
      setExtraContacts([]);
      setExtraPhones({});
    } else {
      setStep(s => s - 1);
    }
  };
  return <div className="wizard-page">
      <button onClick={handleBack} className="edit-client-breadcrumb">
        <ArrowLeft size={14} />
        {step === 0 ? "Clientes" : steps[step - 1]?.label}
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
      <StepIndicator steps={steps} current={step} />

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
            <FormField label="Nome Completo" placeholder="Nome do cliente" />
            <FormField label="E-mail" placeholder="email@exemplo.com" type="email" />
            <FormField
              label="Telefone"
              value={pfPhone}
              onChange={(e) => setPfPhone(maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
            <FormField label="Profissão" placeholder="Ex: Engenheiro, Médico..." />
            {extraContacts.map(id => <div key={id} className="wizard-extra-contact">
                <div className="wizard-extra-contact__header">
                  <p className="wizard-extra-contact__label">Contato adicional</p>
                  <button onClick={() => handleRemoveExtraContact(id)} className="wizard-extra-contact__remove"><X size={15} /></button>
                </div>
                <FormField label="Nome" placeholder="Nome do contato" />
                <FormField label="E-mail" placeholder="email@empresa.com" type="email" />
                <FormField
                  label="Telefone"
                  value={extraPhones[id] || ""}
                  onChange={(e) => handleExtraPhoneChange(id, e.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                <FormField label="Profissão / Cargo" placeholder="Ex: Gerente..." />
              </div>)}
            <button onClick={() => setExtraContacts(prev => [...prev, Date.now()])} className="edit-client-add-contact-button">+ Adicionar outro contato</button>
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
            <FormField label="Logradouro" placeholder="Rua, Avenida..." />
            <div className="edit-client-grid edit-client-grid--2"><FormField label="Número" placeholder="00" /><FormField label="Complemento" placeholder="Apto, Sala..." /></div>
            <FormField label="Bairro" placeholder="Bairro" />
            <div className="edit-client-grid edit-client-grid--state">
              <div className="edit-client-grid-main"><FormField label="Cidade" placeholder="Cidade" /></div>
              <div className="edit-client-state-field"><Label className="edit-client-label">Estado</Label><select className="edit-client-select">{brazilStates.map(s => <option key={s}>{s}</option>)}</select></div>
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
            <FormField label="Nome / Razão Social" placeholder="Nome da empresa" />
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
            <FormField label="Logradouro" placeholder="Rua, Avenida..." />
            <div className="edit-client-grid edit-client-grid--2"><FormField label="Número" placeholder="00" /><FormField label="Complemento" placeholder="Sala, Andar..." /></div>
            <FormField label="Bairro" placeholder="Bairro" />
            <div className="edit-client-grid edit-client-grid--state">
              <div className="edit-client-grid-main"><FormField label="Cidade" placeholder="Cidade" /></div>
              <div className="edit-client-state-field"><Label className="edit-client-label">Estado</Label><select className="edit-client-select">{brazilStates.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
          </>}
        {clientType === "PJ" && step === 2 && <>
            <div className="wizard-contact-primary"><p className="wizard-contact-primary__label">Contato Principal</p></div>
            <FormField label="Nome" placeholder="Nome do contato" />
            <FormField label="E-mail" placeholder="email@empresa.com" type="email" />
            <FormField
              label="Telefone"
              value={pjPrimaryPhone}
              onChange={(e) => setPjPrimaryPhone(maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
            <FormField label="Profissão / Cargo" placeholder="Ex: Diretor, Gerente..." />
            {extraContacts.map(id => <div key={id} className="wizard-extra-contact">
                <div className="wizard-extra-contact__header">
                  <p className="wizard-extra-contact__label">Contato adicional</p>
                  <button onClick={() => handleRemoveExtraContact(id)} className="wizard-extra-contact__remove"><X size={15} /></button>
                </div>
                <FormField label="Nome" placeholder="Nome do contato" />
                <FormField label="E-mail" placeholder="email@empresa.com" type="email" />
                <FormField
                  label="Telefone"
                  value={extraPhones[id] || ""}
                  onChange={(e) => handleExtraPhoneChange(id, e.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                <FormField label="Profissão / Cargo" placeholder="Ex: Gerente..." />
              </div>)}
            <button onClick={() => setExtraContacts(prev => [...prev, Date.now()])} className="edit-client-add-contact-button">+ Adicionar outro contato</button>
          </>}
      </div>

      <div className="edit-client-actions">
        <Button variant="outline" onClick={() => navigate("/app/clientes")} className="edit-client-button edit-client-button--outline">Cancelar</Button>
        <Button onClick={handleNext} className="edit-client-button edit-client-button--primary">
          {isLastStep ? <><User size={16} />Criar cliente</> : <>Próximo<ArrowRight size={16} /></>}
        </Button>
      </div>
    </div>;
}
function FormField({ label, placeholder, type = "text", mono = false, value, onChange, maxLength, ...props }) {
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