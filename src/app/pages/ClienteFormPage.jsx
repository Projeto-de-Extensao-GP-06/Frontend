import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { clienteService, getClienteError } from "../services/clienteService";
import { maskCPF, maskCNPJ, maskPhone, maskCEP } from "../utils/masks";
import { useCepLookup } from "../hooks/useCepLookup";
import "../../styles/edit-client-page.css";

const empty = {
  type: "PF",
  name: "",
  document: "",
  rg: "",
  comoConheceu: "INDICACAO",
  statusClienteId: 1,
  address: {
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "SP",
    complemento: ""
  },
  contacts: [{ name: "", email: "", phone: "", profession: "" }]
};

const fromClient = (client) => ({
  type: client.type,
  name: client.name || "",
  document: client.cpf || client.cnpj || "",
  rg: client.rg || "",
  comoConheceu: typeof client.comoConheceu === 'string' ? client.comoConheceu : client.comoConheceu?.name() || "INDICACAO",
  statusClienteId: client.status?.id || 1,
  address: { ...empty.address, ...(client.address || {}) },
  contacts: client.contacts?.length
    ? client.contacts.map((c) => ({
        name: c.name || "",
        email: c.email || "",
        phone: c.phone || "",
        profession: c.profession || ""
      }))
    : [{ name: "", email: "", phone: "", profession: "" }]
});

export default function ClienteFormPage({ editing = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cepLookup = useCepLookup(form.address.cep);
  const sanitizedCep = form.address.cep.replace(/\D/g, "");
  const isCurrentCepLookup = cepLookup.requestedCep === sanitizedCep;
  const addressFilledByCep = cepLookup.data && isCurrentCepLookup;

  useEffect(() => {
    document.title = editing ? "SGPJ | Editar Cliente" : "SGPJ | Novo Cliente";
    if (!editing) return;
    clienteService
      .getById(id)
      .then((client) => setForm(fromClient(client)))
      .catch((e) => setError(getClienteError(e)))
      .finally(() => setLoading(false));
  }, [editing, id]);

  useEffect(() => {
    if (!cepLookup.data || !isCurrentCepLookup) return;

    const data = cepLookup.data;
    setAddress("logradouro", data.logradouro || "");
    setAddress("bairro", data.bairro || "");
    setAddress("cidade", data.localidade || "");
    setAddress("estado", data.uf || "SP");
  }, [cepLookup.data, isCurrentCepLookup]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setAddress = (field, value) => setForm((current) => ({ ...current, address: { ...current.address, [field]: value } }));
  const setContact = (index, field, value) => setForm((current) => ({
    ...current,
    contacts: current.contacts.map((contact, i) => (i === index ? { ...contact, [field]: value } : contact))
  }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const saved = editing ? await clienteService.update(id, form) : await clienteService.create(form);
      navigate(`/app/clientes/${saved.id}`);
    } catch (e) {
      setError(getClienteError(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="edit-client-page"><p>Carregando cliente...</p></div>;

  return (
    <div className="edit-client-page">
      <button onClick={() => navigate(editing ? `/app/clientes/${id}` : "/app/clientes")} className="edit-client-breadcrumb">
        <ArrowLeft size={14} /> Clientes
      </button>
      <div className="edit-client-header">
        <div className="edit-client-header-copy">
          <p className="edit-client-kicker">Clientes › {editing ? "Editar" : "Novo cliente"}</p>
          <h1 className="edit-client-title">{editing ? "Editar cliente" : "Novo cliente"}</h1>
        </div>
      </div>
      <form onSubmit={submit} className="edit-client-section">
        <h2>Dados do cliente</h2>
        <div className="edit-client-grid edit-client-grid--2">
          <Field
            label="Tipo"
            as="select"
            value={form.type}
            onChange={(e) => setField("type", e.target.value)}
          >
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </Field>
          <Field
            label={form.type === "PF" ? "CPF" : "CNPJ"}
            required
            value={form.document}
            onChange={(e) => setField("document", form.type === "PF" ? maskCPF(e.target.value) : maskCNPJ(e.target.value))}
          />
        </div>
        <Field label="Nome / Razão social" required value={form.name} onChange={(e) => setField("name", e.target.value)} />
        <div className="edit-client-grid edit-client-grid--2">
          <Field label="RG" value={form.rg} onChange={(e) => setField("rg", e.target.value)} />
          <Field
            label="Como conheceu"
            as="select"
            value={form.comoConheceu}
            onChange={(e) => setField("comoConheceu", e.target.value)}
          >
            <option value="INSTAGRAM">Instagram</option>
            <option value="SITE">Site Institucional</option>
            <option value="INDICACAO">Indicação</option>
            <option value="OUTROS">Outros</option>
          </Field>
        </div>
        <Field
          label="Status"
          as="select"
          value={form.statusClienteId}
          onChange={(e) => setField("statusClienteId", e.target.value)}
        >
          <option value="1">Ativo</option>
          <option value="2">Inativo</option>
        </Field>
        <h2>Endereço</h2>
        <div className="edit-client-grid edit-client-grid--2">
          <Field
            label="CEP"
            value={form.address.cep}
            onChange={(e) => setAddress("cep", maskCEP(e.target.value))}
          />
          <Field
            label="Estado"
            required
            value={form.address.estado}
            maxLength={2}
            onChange={(e) => setAddress("estado", e.target.value.toUpperCase())}
            disabled={addressFilledByCep}
          />
        </div>
        {cepLookup.loading && isCurrentCepLookup && <p className="edit-client-cep-status">Buscando endereço...</p>}
        {cepLookup.error && isCurrentCepLookup && <p className="edit-client-cep-status edit-client-cep-status--error">{cepLookup.error}</p>}
        <Field label="Logradouro" required value={form.address.logradouro} onChange={(e) => setAddress("logradouro", e.target.value)} disabled={addressFilledByCep} />
        <div className="edit-client-grid edit-client-grid--2">
          <Field label="Número" required value={form.address.numero} onChange={(e) => setAddress("numero", e.target.value)} />
          <Field label="Complemento" value={form.address.complemento} onChange={(e) => setAddress("complemento", e.target.value)} />
        </div>
        <Field label="Bairro" value={form.address.bairro} onChange={(e) => setAddress("bairro", e.target.value)} disabled={addressFilledByCep} />
        <Field label="Cidade" required value={form.address.cidade} onChange={(e) => setAddress("cidade", e.target.value)} disabled={addressFilledByCep} />
        <h2>Contatos</h2>
        {form.contacts.map((contact, i) => (
          <div key={i} className="edit-client-contact-card">
            <div className="edit-client-contact-card-header">
              <span className="edit-client-contact-card-label">Contato {i + 1}</span>
              {form.contacts.length > 1 && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) }))} className="edit-client-contact-remove">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <Field label="Nome" value={contact.name} onChange={(e) => setContact(i, "name", e.target.value)} />
            <Field label="E-mail" value={contact.email} onChange={(e) => setContact(i, "email", e.target.value)} type="email" />
            <Field label="Telefone" value={contact.phone} onChange={(e) => setContact(i, "phone", maskPhone(e.target.value))} />
            <Field label="Profissão" value={contact.profession} onChange={(e) => setContact(i, "profession", e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={() => setForm((f) => ({ ...f, contacts: [...f.contacts, { name: "", email: "", phone: "", profession: "" }] }))} className="edit-client-add-contact-button">
          <Plus size={16} /> Adicionar contato
        </button>
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        <div className="edit-client-actions">
          <button type="button" onClick={() => navigate(editing ? `/app/clientes/${id}` : "/app/clientes")} className="edit-client-button edit-client-button--outline">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="edit-client-button edit-client-button--primary">
            <Save size={15} /> {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, as = "input", children, disabled = false, ...props }) {
  const Component = as;
  return (
    <label className="edit-client-field">
      <span className="edit-client-label">{label}</span>
      {as === "select" ? (
        <select className="edit-client-input" disabled={disabled} {...props}>
          {children}
        </select>
      ) : (
        <Component className="edit-client-input" disabled={disabled} {...props}>
          {children}
        </Component>
      )}
    </label>
  );
}
