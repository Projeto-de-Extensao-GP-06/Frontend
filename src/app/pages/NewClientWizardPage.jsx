import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react";
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
export default function NewClientWizardPage() {
  const navigate = useNavigate();
  const [clientType, setClientType] = useState(null);
  const [step, setStep] = useState(0);
  const [extraContacts, setExtraContacts] = useState([]);
  const steps = clientType === "PF" ? pfSteps : clientType === "PJ" ? pjSteps : [];
  const isLastStep = step === steps.length - 1;
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
            <FormField label="CPF" placeholder="000.000.000-00" mono />
            <FormField label="RG" placeholder="00.000.000-0" mono />
            <FormField label="Nome Completo" placeholder="Nome do cliente" />
            <FormField label="E-mail" placeholder="email@exemplo.com" type="email" />
            <FormField label="Telefone" placeholder="(00) 00000-0000" />
            <FormField label="Profissão" placeholder="Ex: Engenheiro, Médico..." />
            <button className="edit-client-add-contact-button"><Plus size={15} />Add outro contato</button>
          </>}
        {clientType === "PF" && step === 1 && <>
            <FormField label="CEP" placeholder="00000-000" mono />
            <FormField label="Logradouro" placeholder="Rua, Avenida..." />
            <div className="edit-client-grid edit-client-grid--2"><FormField label="Número" placeholder="00" /><FormField label="Complemento" placeholder="Apto, Sala..." /></div>
            <FormField label="Bairro" placeholder="Bairro" />
            <div className="edit-client-grid edit-client-grid--state">
              <div className="edit-client-grid-main"><FormField label="Cidade" placeholder="Cidade" /></div>
              <div className="edit-client-state-field"><Label className="edit-client-label">Estado</Label><select className="edit-client-select">{brazilStates.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
          </>}
        {clientType === "PJ" && step === 0 && <>
            <FormField label="CNPJ" placeholder="00.000.000/0000-00" mono />
            <FormField label="Nome / Razão Social" placeholder="Nome da empresa" />
          </>}
        {clientType === "PJ" && step === 1 && <>
            <FormField label="CEP" placeholder="00000-000" mono />
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
            <FormField label="Telefone" placeholder="(00) 00000-0000" />
            <FormField label="Profissão / Cargo" placeholder="Ex: Diretor, Gerente..." />
            {extraContacts.map(id => <div key={id} className="wizard-extra-contact">
                <div className="wizard-extra-contact__header">
                  <p className="wizard-extra-contact__label">Contato adicional</p>
                  <button onClick={() => setExtraContacts(prev => prev.filter(i => i !== id))} className="wizard-extra-contact__remove"><X size={15} /></button>
                </div>
                <FormField label="Nome" placeholder="Nome do contato" />
                <FormField label="E-mail" placeholder="email@empresa.com" type="email" />
                <FormField label="Telefone" placeholder="(00) 00000-0000" />
                <FormField label="Profissão / Cargo" placeholder="Ex: Gerente..." />
              </div>)}
            <button onClick={() => setExtraContacts(prev => [...prev, Date.now()])} className="edit-client-add-contact-button"><Plus size={15} />Add outro contato</button>
          </>}
      </div>

      <div className="edit-client-actions">
        <Button variant="outline" onClick={() => navigate("/app/clientes")} className="edit-client-button edit-client-button--outline">Cancelar</Button>
        <Button onClick={handleNext} className="edit-client-button edit-client-button--primary">
          {isLastStep ? <><Check size={16} />Criar cliente</> : <>Próximo<ArrowRight size={16} /></>}
        </Button>
      </div>
    </div>;
}
function FormField({ label, placeholder, type = "text", mono = false }) {
  return <div className="edit-client-field">
      <Label className="edit-client-label">{label}</Label>
      <Input type={type} placeholder={placeholder} className={`edit-client-input ${mono ? "edit-client-input--mono" : ""}`} />
    </div>;
}