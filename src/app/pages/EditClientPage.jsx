import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Building2, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { mockClients, brazilStates } from "../data/mockData";
import "../../styles/edit-client-page.css";
export default function EditClientPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dados");
  const client = mockClients.find(c => c.id === id);
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
              <Field label="CPF" defaultValue={pf.cpf} mono />
              <Field label="RG" defaultValue={pf.rg} mono />
              <Field label="Nome Completo" defaultValue={pf.name} />
              <Field label="E-mail" defaultValue={pf.email} type="email" />
              <Field label="Telefone" defaultValue={pf.phone} />
              <Field label="Profissão" defaultValue={pf.profession} />
            </> : <>
              <Field label="CNPJ" defaultValue={pj.cnpj} mono />
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
          {client.contacts.length === 0 ? <div className="edit-client-empty-card">
              <p className="edit-client-empty-text">Nenhum contato cadastrado</p>
            </div> : client.contacts.map((contact, i) => <div key={contact.id} className="edit-client-contact-card">
                {contact.isPrimary && <div className="edit-client-primary-row">
                    <div className="edit-client-primary-dot" />
                    <span className="edit-client-primary-label">Contato Principal</span>
                  </div>}
                <Field label="Nome" defaultValue={contact.name} />
                <Field label="E-mail" defaultValue={contact.email} type="email" />
                <Field label="Telefone" defaultValue={contact.phone} />
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
  defaultValue,
  type = "text",
  mono = false
}) {
  return <div className="edit-client-field">
      <Label className="edit-client-label">
        {label}
      </Label>
      <Input type={type} defaultValue={defaultValue} className={`edit-client-input ${mono ? "edit-client-input--mono" : ""}`} />
    </div>;
}