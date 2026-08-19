import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Building2, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { mockClients, brazilStates } from "../data/mockData";
import "../../styles/edit-client-page.css";

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

export default function EditClientPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dados");
  const client = mockClients.find(c => c.id === id);

  const [cpf, setCpf] = useState(() => (client?.cpf ? maskCPF(client.cpf) : ""));
  const [rg, setRg] = useState(() => (client?.rg ? maskRG(client.rg) : ""));
  const [cnpj, setCnpj] = useState(() => (client?.cnpj ? maskCNPJ(client.cnpj) : ""));
  const [phone, setPhone] = useState(() => (client?.phone ? maskPhone(client.phone) : ""));
  const [contacts, setContacts] = useState(() =>
    client?.contacts?.map(c => ({
      ...c,
      phone: c.phone ? maskPhone(c.phone) : ""
    })) ?? []
  );

  const handleContactPhoneChange = (index, value) => {
    setContacts(prev => prev.map((c, i) => i === index ? { ...c, phone: maskPhone(value) } : c));
  };

  if (!client) {
    return <div className="edit-client-page edit-client-page--empty">
        <p className="edit-client-empty-text">Cliente não encontrado.</p>
        <Button onClick={() => navigate("/app/clientes")} className="edit-client-empty-button">
          Voltar para Clientes
        </Button>
      </div>;
  }
  const isPF = client.type === "PF";
  const pf = client;
  const pj = client;
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
              <Field label="Nome Completo" defaultValue={pf.name} />
              <Field label="E-mail" defaultValue={pf.email} type="email" />
              <Field
                label="Telefone"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              <Field label="Profissão" defaultValue={pf.profession} />
            </> : <>
              <Field
                label="CNPJ"
                value={cnpj}
                onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                mono
              />
              <Field label="Nome / Razão Social" defaultValue={pj.name} />
              <Field label="E-mail" defaultValue={pj.email} type="email" />
            </>}
        </div>}

      {tab === "endereco" && <div className="edit-client-section">
          <Field label="CEP" defaultValue={client.address.cep} mono />
          <Field label="Logradouro" defaultValue={client.address.logradouro} />
          <div className="edit-client-grid edit-client-grid--2">
            <Field label="Número" defaultValue={client.address.numero} />
            <Field label="Complemento" defaultValue={client.address.complemento ?? ""} />
          </div>
          <Field label="Bairro" defaultValue={client.address.bairro} />
          <div className="edit-client-grid edit-client-grid--state">
            <div className="edit-client-grid-main">
              <Field label="Cidade" defaultValue={client.address.cidade} />
            </div>
            <div className="edit-client-state-field">
              <Label className="edit-client-label">Estado</Label>
              <select className="edit-client-select" defaultValue={client.address.estado}>
                {brazilStates.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>}

      {tab === "contatos" && <div className="edit-client-section edit-client-section--contacts">
          {contacts.length === 0 ? <div className="edit-client-empty-card">
              <p className="edit-client-empty-text">Nenhum contato cadastrado</p>
            </div> : contacts.map((contact, i) => <div key={contact.id} className="edit-client-contact-card">
                {!isPF && contact.isPrimary && <div className="edit-client-primary-row">
                    <div className="edit-client-primary-dot" />
                    <span className="edit-client-primary-label">Contato Principal</span>
                  </div>}
                <Field label="Nome" defaultValue={contact.name} />
                <Field label="E-mail" defaultValue={contact.email} type="email" />
                <Field
                  label="Telefone"
                  value={contact.phone}
                  onChange={(e) => handleContactPhoneChange(i, e.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                <Field label="Profissão" defaultValue={contact.profession} />
              </div>)}
          <button className="edit-client-add-contact-button">
            + Add outro contato
          </button>
        </div>}

      {/* Actions */}
      <div className="edit-client-actions">
        <Button variant="outline" onClick={() => navigate(`/app/clientes/${id}`)} className="edit-client-button edit-client-button--outline">
          Cancelar
        </Button>
        <Button onClick={() => navigate(`/app/clientes/${id}`)} className="edit-client-button edit-client-button--primary">
          <Check size={16} />
          Salvar alterações
        </Button>
      </div>
    </div>;
}
function Field({
  label,
  value,
  defaultValue,
  onChange,
  type = "text",
  mono = false,
  placeholder,
  maxLength,
  ...props
}) {
  return <div className="edit-client-field">
      <Label className="edit-client-label">
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`edit-client-input ${mono ? "edit-client-input--mono" : ""}`}
        {...props}
      />
    </div>;
}